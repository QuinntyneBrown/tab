using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Tab.Application.Abstractions;
using Tab.Cli.IO;
using Tab.Domain.Entities;

namespace Tab.Cli.Services.Export;

public sealed class RecurringBillExporter : IDataExporter<RecurringBill>
{
    private readonly ITabDbContext _db;
    private readonly ICsvWriter _csv;

    public RecurringBillExporter(ITabDbContext db, ICsvWriter csv)
    {
        _db = db;
        _csv = csv;
    }

    public async Task<int> ExportAsync(string userEmail, FileInfo file, CancellationToken cancellationToken)
    {
        var user = await ExportUserResolver.ResolveAsync(_db, userEmail, cancellationToken);
        var bills = await _db.RecurringBills
            .Where(b => b.UserId == user.Id)
            .OrderBy(b => b.Name)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var headers = new[] { "name", "vendor", "expected_amount", "due_day", "split_percent" };
        var rows = bills.Select(b => (IReadOnlyList<string?>)new[]
        {
            b.Name,
            b.Vendor,
            b.ExpectedAmount.ToString("0.00", CultureInfo.InvariantCulture),
            b.DueDay.ToString(CultureInfo.InvariantCulture),
            b.SplitPercent.ToString(CultureInfo.InvariantCulture)
        });
        _csv.Write(file, headers, rows);
        return bills.Count;
    }
}
