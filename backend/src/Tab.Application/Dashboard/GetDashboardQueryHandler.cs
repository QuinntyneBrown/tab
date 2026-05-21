using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Balance;
using Tab.Api.Contracts.Bills;
using Tab.Api.Contracts.Dashboard;
using Tab.Api.Contracts.Ledger;
using Tab.Application.Abstractions;
using Tab.Application.Bills;

namespace Tab.Application.Dashboard;

public class GetDashboardQueryHandler : IRequestHandler<GetDashboardQuery, DashboardResponse>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;
    private readonly TimeProvider _timeProvider;

    public GetDashboardQueryHandler(ITabDbContext db, ICurrentUser user, TimeProvider timeProvider)
    {
        _db = db;
        _user = user;
        _timeProvider = timeProvider;
    }

    public async Task<DashboardResponse> Handle(GetDashboardQuery request, CancellationToken cancellationToken)
    {
        var now = _timeProvider.GetUtcNow();
        var today = DateOnly.FromDateTime(now.UtcDateTime);
        var monthStart = new DateOnly(today.Year, today.Month, 1);
        var nextMonth = monthStart.AddMonths(1);

        var loans = await _db.Loans.AsNoTracking().Where(l => l.UserId == _user.Id).Select(l => new { l.Amount, l.Date }).ToListAsync(cancellationToken);
        var billPostings = await _db.BillPostings.AsNoTracking().Where(b => b.UserId == _user.Id).Select(b => new { b.ShareAmount, b.Date }).ToListAsync(cancellationToken);
        var payments = await _db.Payments.AsNoTracking().Where(p => p.UserId == _user.Id).Select(p => new { p.Amount, p.Date }).ToListAsync(cancellationToken);

        var loansTotal = loans.Sum(x => x.Amount);
        var billsTotal = billPostings.Sum(x => x.ShareAmount);
        var paymentsTotal = payments.Sum(x => x.Amount);

        var lent = loans.Where(l => l.Date >= monthStart && l.Date < nextMonth).Sum(l => l.Amount);
        var billShare = billPostings.Where(b => b.Date >= monthStart && b.Date < nextMonth).Sum(b => b.ShareAmount);
        var paidBack = payments.Where(p => p.Date >= monthStart && p.Date < nextMonth).Sum(p => p.Amount);

        var recent = await BuildRecentActivity(cancellationToken);

        var preferences = await _db.Preferences.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == _user.Id, cancellationToken);
        var reminderDays = preferences?.ReminderDays ?? 3;

        var activeBills = await _db.RecurringBills.AsNoTracking()
            .Where(b => b.UserId == _user.Id && b.ArchivedUtc == null)
            .ToListAsync(cancellationToken);

        BillResponse? upcoming = null;
        var bestDistance = int.MaxValue;
        foreach (var b in activeBills)
        {
            var dueDate = BillMath.ComputeNextDueDate(b.DueDay, today);
            var distance = dueDate.DayNumber - today.DayNumber;
            if (distance >= 0 && distance <= reminderDays && distance < bestDistance)
            {
                bestDistance = distance;
                upcoming = CreateBillCommandHandler.Map(b, _timeProvider);
            }
        }

        return new DashboardResponse
        {
            Balance = new BalanceResponse
            {
                Amount = loansTotal + billsTotal - paymentsTotal,
                AsOf = now
            },
            RecentActivity = recent,
            MonthlySummary = new MonthlySummary
            {
                Period = $"{today.Year:D4}-{today.Month:D2}",
                Lent = lent,
                Bills = billShare,
                PaidBack = paidBack,
                NetChange = lent + billShare - paidBack
            },
            UpcomingBill = upcoming
        };
    }

    private async Task<IReadOnlyList<LedgerEntryResponse>> BuildRecentActivity(CancellationToken ct)
    {
        var loans = await _db.Loans.AsNoTracking()
            .Where(l => l.UserId == _user.Id)
            .OrderByDescending(l => l.Date)
            .Take(6)
            .ToListAsync(ct);
        var bills = await _db.BillPostings.AsNoTracking()
            .Where(b => b.UserId == _user.Id)
            .OrderByDescending(b => b.Date)
            .Take(6)
            .ToListAsync(ct);
        var payments = await _db.Payments.AsNoTracking()
            .Where(p => p.UserId == _user.Id)
            .OrderByDescending(p => p.Date)
            .Take(6)
            .ToListAsync(ct);

        var billNames = await _db.RecurringBills.AsNoTracking()
            .Where(b => b.UserId == _user.Id)
            .ToDictionaryAsync(b => b.Id, b => b.Name, ct);

        var merged = loans.Select(l => new LedgerEntryResponse
        {
            Id = l.Id,
            Type = "loan",
            Date = l.Date,
            Description = l.Description,
            Amount = l.Amount,
            Method = l.Method,
            Note = l.Note
        }).Concat(bills.Select(b => new LedgerEntryResponse
        {
            Id = b.Id,
            Type = "bill",
            Date = b.Date,
            Description = $"{(billNames.TryGetValue(b.RecurringBillId, out var n) ? n : "Bill")} ({b.Period})",
            Amount = b.ShareAmount,
            TotalAmount = b.TotalAmount
        })).Concat(payments.Select(p => new LedgerEntryResponse
        {
            Id = p.Id,
            Type = "payment",
            Date = p.Date,
            Description = "Payment received",
            Amount = p.Amount,
            Method = p.Method,
            Note = p.Note
        }));

        return merged
            .OrderByDescending(e => e.Date)
            .ThenByDescending(e => e.Id)
            .Take(6)
            .ToList();
    }
}
