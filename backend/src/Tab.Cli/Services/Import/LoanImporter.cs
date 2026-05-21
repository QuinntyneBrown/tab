using System.Globalization;
using Tab.Application.Abstractions;
using Tab.Cli.IO;
using Tab.Domain.Entities;

namespace Tab.Cli.Services.Import;

public sealed class LoanImporter : IDataImporter<Loan>
{
    private readonly ITabDbContext _db;
    private readonly ICsvReader _csv;
    private readonly TimeProvider _time;

    public LoanImporter(ITabDbContext db, ICsvReader csv, TimeProvider time)
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
            _db.Loans.Add(new Loan
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                CounterpartyId = counterparty.Id,
                Date = DateOnly.Parse(row["date"], CultureInfo.InvariantCulture),
                Amount = decimal.Parse(row["amount"], CultureInfo.InvariantCulture),
                Description = row["description"],
                Method = row.TryGetValue("method", out var m) ? NullIfEmpty(m) : null,
                Note = row.TryGetValue("note", out var n) ? NullIfEmpty(n) : null,
                CreatedUtc = now
            });
            count++;
        }
        await _db.SaveChangesAsync(cancellationToken);
        return count;
    }

    private static string? NullIfEmpty(string s) => string.IsNullOrWhiteSpace(s) ? null : s;
}
