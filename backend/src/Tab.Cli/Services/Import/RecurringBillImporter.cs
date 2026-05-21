using System.Globalization;
using Tab.Application.Abstractions;
using Tab.Cli.IO;
using Tab.Domain.Entities;

namespace Tab.Cli.Services.Import;

public sealed class RecurringBillImporter : IDataImporter<RecurringBill>
{
    private readonly ITabDbContext _db;
    private readonly ICsvReader _csv;
    private readonly TimeProvider _time;

    public RecurringBillImporter(ITabDbContext db, ICsvReader csv, TimeProvider time)
    {
        _db = db;
        _csv = csv;
        _time = time;
    }

    public async Task<int> ImportAsync(string userEmail, FileInfo file, CancellationToken cancellationToken)
    {
        var (user, counterparty) = await UserContextResolver.ResolveAsync(_db, userEmail, cancellationToken);
        var now = _time.GetUtcNow();
        var rows = _csv.Read(file);
        int count = 0;
        foreach (var row in rows)
        {
            _db.RecurringBills.Add(new RecurringBill
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                CounterpartyId = counterparty.Id,
                Name = row["name"],
                Vendor = row.TryGetValue("vendor", out var v) && !string.IsNullOrWhiteSpace(v) ? v : null,
                ExpectedAmount = decimal.Parse(row["expected_amount"], CultureInfo.InvariantCulture),
                DueDay = int.Parse(row["due_day"], CultureInfo.InvariantCulture),
                SplitPercent = int.Parse(row["split_percent"], CultureInfo.InvariantCulture),
                CreatedUtc = now
            });
            count++;
        }
        await _db.SaveChangesAsync(cancellationToken);
        return count;
    }
}
