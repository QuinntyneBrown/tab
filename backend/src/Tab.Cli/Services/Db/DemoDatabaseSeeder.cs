using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Tab.Application.Abstractions;
using Tab.Domain.Entities;

namespace Tab.Cli.Services.Db;

/// <summary>
/// Seeds a fixed, mock-faithful ledger for the named user so visual parity
/// tests can run against the same data the mocks in `docs/mocks/*.html`
/// already pin. Re-running on a user that already has data is a no-op for
/// each entry (idempotent by description+date for loans, by (bill,period)
/// for postings, etc.).
/// </summary>
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

        // Counterparty: docs/mocks/calendar*.html refer to "Ray" / "Payment from Ray".
        // Visual parity requires the lede string to match exactly.
        if (counterparty.Name != "Ray")
        {
            counterparty.Name = "Ray";
        }

        // Recurring bills — expected amounts chosen so 50% splits land on the
        // exact $ figures the mocks render.
        var streaming = await UpsertBillAsync(user.Id, counterparty.Id, "Streaming bundle", "Netflix + Spotify", expected: 32.00m, dueDay: 3, split: 50, now, cancellationToken);
        var internet = await UpsertBillAsync(user.Id, counterparty.Id, "Internet", "Bell", expected: 81.00m, dueDay: 12, split: 50, now, cancellationToken);
        var heat = await UpsertBillAsync(user.Id, counterparty.Id, "Heat", "Enbridge", expected: 62.00m, dueDay: 15, split: 50, now, cancellationToken);
        var hydro = await UpsertBillAsync(user.Id, counterparty.Id, "Hydro", "Toronto Hydro", expected: 168.00m, dueDay: 18, split: 50, now, cancellationToken);
        // Phone plan — intentionally NOT posted for 2026-05 so the calendar
        // shows it as a projected chip on May 28 (matches docs/mocks/calendar.html).
        _ = await UpsertBillAsync(user.Id, counterparty.Id, "Phone plan", "Freedom", expected: 55.00m, dueDay: 28, split: 50, now, cancellationToken);

        // May 2026 bill postings — dates and shares match docs/mocks/calendar.html.
        await UpsertPostingAsync(user.Id, counterparty.Id, streaming, period: "2026-05", date: new DateOnly(2026, 5, 3), total: 32.00m, share: 16.00m, now, cancellationToken);
        await UpsertPostingAsync(user.Id, counterparty.Id, internet, period: "2026-05", date: new DateOnly(2026, 5, 12), total: 81.00m, share: 40.50m, now, cancellationToken);
        await UpsertPostingAsync(user.Id, counterparty.Id, heat, period: "2026-05", date: new DateOnly(2026, 5, 15), total: 62.00m, share: 31.00m, now, cancellationToken);
        await UpsertPostingAsync(user.Id, counterparty.Id, hydro, period: "2026-05", date: new DateOnly(2026, 5, 18), total: 168.00m, share: 84.00m, now, cancellationToken);

        // Loans — dates and amounts match the chips rendered in docs/mocks/calendar.html.
        await UpsertLoanAsync(user.Id, counterparty.Id, date: new DateOnly(2026, 5, 5),  amount: 120.00m, description: "Groceries", method: "Cash", now, cancellationToken);
        await UpsertLoanAsync(user.Id, counterparty.Id, date: new DateOnly(2026, 5, 14), amount: 42.10m,  description: "Pharmacy",  method: "Debit", now, cancellationToken);
        // May 15 cluster (mock shows three chips + a "+1 more" affordance).
        await UpsertLoanAsync(user.Id, counterparty.Id, date: new DateOnly(2026, 5, 15), amount: 58.20m, description: "Groceries", method: "Cash", now, cancellationToken);
        await UpsertLoanAsync(user.Id, counterparty.Id, date: new DateOnly(2026, 5, 15), amount: 48.00m, description: "Gas",       method: "Card", now, cancellationToken);
        await UpsertLoanAsync(user.Id, counterparty.Id, date: new DateOnly(2026, 5, 15), amount: 11.00m, description: "Coffee run", method: "Card", now, cancellationToken);
        // Today.
        await UpsertLoanAsync(user.Id, counterparty.Id, date: new DateOnly(2026, 5, 22), amount: 28.40m, description: "Lunch", method: "Cash", now, cancellationToken);

        // Payment in — Ray paid back $100 on May 8 (mock chip "−$100.00").
        await UpsertPaymentAsync(user.Id, counterparty.Id, date: new DateOnly(2026, 5, 8), amount: 100.00m, method: "e-Transfer", now, cancellationToken);

        await _db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Seeded mock-faithful ledger for <{Email}>: counterparty=\"Ray\", 5 bills + 4 postings, 6 loans, 1 payment.", normalized);
    }

    private async Task<RecurringBill> UpsertBillAsync(Guid userId, Guid counterpartyId, string name, string vendor, decimal expected, int dueDay, int split, DateTimeOffset now, CancellationToken ct)
    {
        var bill = await _db.RecurringBills.FirstOrDefaultAsync(b => b.UserId == userId && b.Name == name, ct);
        if (bill is null)
        {
            bill = new RecurringBill
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CounterpartyId = counterpartyId,
                Name = name,
                Vendor = vendor,
                ExpectedAmount = expected,
                DueDay = dueDay,
                SplitPercent = split,
                CreatedUtc = now,
            };
            _db.RecurringBills.Add(bill);
        }
        return bill;
    }

    private async Task UpsertPostingAsync(Guid userId, Guid counterpartyId, RecurringBill bill, string period, DateOnly date, decimal total, decimal share, DateTimeOffset now, CancellationToken ct)
    {
        // EF cannot find the bill by Id until SaveChanges is called on a brand
        // new entity, but we don't need the round trip — duplicate-detection
        // works against the in-memory change tracker too.
        var exists = await _db.BillPostings.AnyAsync(p => p.UserId == userId && p.RecurringBillId == bill.Id && p.Period == period, ct);
        if (exists) return;
        _db.BillPostings.Add(new BillPosting
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CounterpartyId = counterpartyId,
            RecurringBillId = bill.Id,
            Period = period,
            TotalAmount = total,
            ShareAmount = share,
            Date = date,
            CreatedUtc = now,
        });
    }

    private async Task UpsertLoanAsync(Guid userId, Guid counterpartyId, DateOnly date, decimal amount, string description, string method, DateTimeOffset now, CancellationToken ct)
    {
        var exists = await _db.Loans.AnyAsync(l => l.UserId == userId && l.Date == date && l.Description == description && l.Amount == amount, ct);
        if (exists) return;
        _db.Loans.Add(new Loan
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CounterpartyId = counterpartyId,
            Amount = amount,
            Date = date,
            Description = description,
            Method = method,
            CreatedUtc = now,
        });
    }

    private async Task UpsertPaymentAsync(Guid userId, Guid counterpartyId, DateOnly date, decimal amount, string method, DateTimeOffset now, CancellationToken ct)
    {
        var exists = await _db.Payments.AnyAsync(p => p.UserId == userId && p.Date == date && p.Amount == amount, ct);
        if (exists) return;
        _db.Payments.Add(new PaymentIn
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CounterpartyId = counterpartyId,
            Amount = amount,
            Date = date,
            Method = method,
            CreatedUtc = now,
        });
    }
}
