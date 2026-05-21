using Tab.Application.Abstractions;
using Tab.Cli.IO;
using Tab.Cli.Models;

namespace Tab.Cli.Services.Import;

public sealed class LedgerImporter : ILedgerImporter
{
    private readonly ITabDbContext _db;
    private readonly IJsonFileSerializer _json;
    private readonly TimeProvider _time;

    public LedgerImporter(ITabDbContext db, IJsonFileSerializer json, TimeProvider time)
    {
        _db = db;
        _json = json;
        _time = time;
    }

    public async Task<LedgerImportResult> ImportAsync(string userEmail, FileInfo file, CancellationToken cancellationToken)
    {
        var payload = _json.Read<LedgerExportPayload>(file);
        var (user, counterparty) = await UserContextResolver.ResolveAsync(_db, userEmail, cancellationToken);
        var now = _time.GetUtcNow();

        foreach (var loan in payload.Loans)
        {
            loan.Id = Guid.NewGuid();
            loan.UserId = user.Id;
            loan.CounterpartyId = counterparty.Id;
            loan.CreatedUtc = now;
            _db.Loans.Add(loan);
        }
        foreach (var bill in payload.Bills)
        {
            bill.Id = Guid.NewGuid();
            bill.UserId = user.Id;
            bill.CounterpartyId = counterparty.Id;
            bill.CreatedUtc = now;
            _db.RecurringBills.Add(bill);
        }
        foreach (var payment in payload.Payments)
        {
            payment.Id = Guid.NewGuid();
            payment.UserId = user.Id;
            payment.CounterpartyId = counterparty.Id;
            payment.CreatedUtc = now;
            _db.Payments.Add(payment);
        }
        await _db.SaveChangesAsync(cancellationToken);
        return new LedgerImportResult(payload.Loans.Count, payload.Bills.Count, payload.Payments.Count);
    }
}
