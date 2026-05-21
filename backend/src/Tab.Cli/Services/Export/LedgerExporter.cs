using Microsoft.EntityFrameworkCore;
using Tab.Application.Abstractions;
using Tab.Cli.IO;
using Tab.Cli.Models;

namespace Tab.Cli.Services.Export;

public sealed class LedgerExporter : ILedgerExporter
{
    private readonly ITabDbContext _db;
    private readonly IJsonFileSerializer _json;
    private readonly TimeProvider _time;

    public LedgerExporter(ITabDbContext db, IJsonFileSerializer json, TimeProvider time)
    {
        _db = db;
        _json = json;
        _time = time;
    }

    public async Task<LedgerExportResult> ExportAsync(string userEmail, FileInfo file, CancellationToken cancellationToken)
    {
        var user = await ExportUserResolver.ResolveAsync(_db, userEmail, cancellationToken);
        var loans = await _db.Loans.Where(l => l.UserId == user.Id).OrderBy(l => l.Date).AsNoTracking().ToListAsync(cancellationToken);
        var bills = await _db.RecurringBills.Where(b => b.UserId == user.Id).OrderBy(b => b.Name).AsNoTracking().ToListAsync(cancellationToken);
        var payments = await _db.Payments.Where(p => p.UserId == user.Id).OrderBy(p => p.Date).AsNoTracking().ToListAsync(cancellationToken);

        var payload = new LedgerExportPayload
        {
            UserEmail = user.Email,
            ExportedUtc = _time.GetUtcNow(),
            Loans = loans,
            Bills = bills,
            Payments = payments
        };
        _json.Write(file, payload);
        return new LedgerExportResult(loans.Count, bills.Count, payments.Count);
    }
}
