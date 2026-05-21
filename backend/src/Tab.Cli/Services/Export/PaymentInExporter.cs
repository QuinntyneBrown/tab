using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Tab.Application.Abstractions;
using Tab.Cli.IO;
using Tab.Domain.Entities;

namespace Tab.Cli.Services.Export;

public sealed class PaymentInExporter : IDataExporter<PaymentIn>
{
    private readonly ITabDbContext _db;
    private readonly ICsvWriter _csv;

    public PaymentInExporter(ITabDbContext db, ICsvWriter csv)
    {
        _db = db;
        _csv = csv;
    }

    public async Task<int> ExportAsync(string userEmail, FileInfo file, CancellationToken cancellationToken)
    {
        var user = await ExportUserResolver.ResolveAsync(_db, userEmail, cancellationToken);
        var payments = await _db.Payments
            .Where(p => p.UserId == user.Id)
            .OrderBy(p => p.Date)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var headers = new[] { "date", "amount", "method", "note" };
        var rows = payments.Select(p => (IReadOnlyList<string?>)new[]
        {
            p.Date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            p.Amount.ToString("0.00", CultureInfo.InvariantCulture),
            p.Method,
            p.Note
        });
        _csv.Write(file, headers, rows);
        return payments.Count;
    }
}
