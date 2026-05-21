using System.Globalization;
using System.Text;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Application.Abstractions;

namespace Tab.Application.Export;

public class ExportLedgerCsvQueryHandler : IRequestHandler<ExportLedgerCsvQuery, byte[]>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;

    public ExportLedgerCsvQueryHandler(ITabDbContext db, ICurrentUser user)
    {
        _db = db;
        _user = user;
    }

    public async Task<byte[]> Handle(ExportLedgerCsvQuery request, CancellationToken cancellationToken)
    {
        var loans = await _db.Loans.AsNoTracking().Where(l => l.UserId == _user.Id).ToListAsync(cancellationToken);
        var bills = await _db.BillPostings.AsNoTracking().Where(b => b.UserId == _user.Id).ToListAsync(cancellationToken);
        var billNames = await _db.RecurringBills.AsNoTracking().Where(b => b.UserId == _user.Id).ToDictionaryAsync(b => b.Id, b => b.Name, cancellationToken);
        var payments = await _db.Payments.AsNoTracking().Where(p => p.UserId == _user.Id).ToListAsync(cancellationToken);

        var sb = new StringBuilder();
        CsvWriter.AppendRow(sb, "date", "type", "description", "total_amount", "counterparty_share", "method", "note");

        var rows = new List<(DateOnly Date, string Type, string Description, string Total, string Share, string Method, string Note)>();
        rows.AddRange(loans.Select(l => (l.Date, "loan", l.Description, string.Empty, FormatDecimal(l.Amount), l.Method ?? string.Empty, l.Note ?? string.Empty)));
        rows.AddRange(bills.Select(b => (b.Date, "bill", $"{(billNames.TryGetValue(b.RecurringBillId, out var n) ? n : "Bill")} ({b.Period})", FormatDecimal(b.TotalAmount), FormatDecimal(b.ShareAmount), string.Empty, string.Empty)));
        rows.AddRange(payments.Select(p => (p.Date, "payment", "Payment received", string.Empty, FormatDecimal(p.Amount), p.Method ?? string.Empty, p.Note ?? string.Empty)));

        foreach (var row in rows.OrderBy(r => r.Date))
        {
            CsvWriter.AppendRow(sb, row.Date.ToString("yyyy-MM-dd"), row.Type, row.Description, row.Total, row.Share, row.Method, row.Note);
        }
        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static string FormatDecimal(decimal v) => v.ToString("0.00", CultureInfo.InvariantCulture);
}
