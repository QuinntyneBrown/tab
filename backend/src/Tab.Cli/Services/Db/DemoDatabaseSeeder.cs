using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Tab.Application.Abstractions;
using Tab.Domain.Entities;

namespace Tab.Cli.Services.Db;

public sealed class DemoDatabaseSeeder : IDatabaseSeeder
{
    private readonly ITabDbContext _db;
    private readonly TimeProvider _time;
    private readonly ILogger<DemoDatabaseSeeder> _logger;

    public DemoDatabaseSeeder(ITabDbContext db, TimeProvider time, ILogger<DemoDatabaseSeeder> logger)
    {
        _db = db;
        _time = time;
        _logger = logger;
    }

    public async Task SeedAsync(string email, CancellationToken cancellationToken)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalized, cancellationToken)
            ?? throw new InvalidOperationException($"User <{email}> not found. Create them first with `users create`.");
        var counterparty = await _db.Counterparties.FirstOrDefaultAsync(c => c.UserId == user.Id, cancellationToken)
            ?? throw new InvalidOperationException("Counterparty missing for user. The schema invariant is violated; investigate.");

        var now = _time.GetUtcNow();
        var today = DateOnly.FromDateTime(now.UtcDateTime);

        _db.Loans.Add(new Loan { Id = Guid.NewGuid(), UserId = user.Id, CounterpartyId = counterparty.Id, Amount = 120.00m, Date = today.AddDays(-3), Description = "Groceries — Loblaws", Method = "Cash", CreatedUtc = now });
        _db.Loans.Add(new Loan { Id = Guid.NewGuid(), UserId = user.Id, CounterpartyId = counterparty.Id, Amount = 40.00m, Date = today.AddDays(-24), Description = "Bus fare", Method = "Cash", CreatedUtc = now });
        _db.Loans.Add(new Loan { Id = Guid.NewGuid(), UserId = user.Id, CounterpartyId = counterparty.Id, Amount = 300.00m, Date = today.AddDays(-54), Description = "Rent help", CreatedUtc = now });
        _db.Loans.Add(new Loan { Id = Guid.NewGuid(), UserId = user.Id, CounterpartyId = counterparty.Id, Amount = 45.00m, Date = today.AddDays(-70), Description = "Medication", CreatedUtc = now });

        var hydro = new RecurringBill { Id = Guid.NewGuid(), UserId = user.Id, CounterpartyId = counterparty.Id, Name = "Hydro", Vendor = "Toronto Hydro", ExpectedAmount = 168.00m, DueDay = 15, SplitPercent = 50, CreatedUtc = now };
        var internet = new RecurringBill { Id = Guid.NewGuid(), UserId = user.Id, CounterpartyId = counterparty.Id, Name = "Internet", Vendor = "Bell", ExpectedAmount = 81.00m, DueDay = 3, SplitPercent = 50, CreatedUtc = now };
        _db.RecurringBills.Add(hydro);
        _db.RecurringBills.Add(internet);

        _db.BillPostings.Add(new BillPosting { Id = Guid.NewGuid(), UserId = user.Id, CounterpartyId = counterparty.Id, RecurringBillId = hydro.Id, Period = today.AddDays(-19).ToString("yyyy-MM"), TotalAmount = 156.84m, ShareAmount = 78.42m, Date = today.AddDays(-19), CreatedUtc = now });
        _db.BillPostings.Add(new BillPosting { Id = Guid.NewGuid(), UserId = user.Id, CounterpartyId = counterparty.Id, RecurringBillId = internet.Id, Period = today.AddDays(-48).ToString("yyyy-MM"), TotalAmount = 81.00m, ShareAmount = 40.50m, Date = today.AddDays(-48), CreatedUtc = now });

        _db.Payments.Add(new PaymentIn { Id = Guid.NewGuid(), UserId = user.Id, CounterpartyId = counterparty.Id, Amount = 100.00m, Date = today.AddDays(-37), Method = "e-transfer", CreatedUtc = now });

        await _db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Seeded demo ledger for <{Email}>: 4 loans, 2 bills + 2 postings, 1 payment.", normalized);
    }
}
