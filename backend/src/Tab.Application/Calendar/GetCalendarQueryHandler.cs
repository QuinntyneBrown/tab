using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Calendar;
using Tab.Application.Abstractions;
using Tab.Application.Bills;

namespace Tab.Application.Calendar;

public class GetCalendarQueryHandler : IRequestHandler<GetCalendarQuery, CalendarResponse>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;

    public GetCalendarQueryHandler(ITabDbContext db, ICurrentUser user)
    {
        _db = db;
        _user = user;
    }

    public async Task<CalendarResponse> Handle(GetCalendarQuery request, CancellationToken cancellationToken)
    {
        var from = request.From!.Value;
        var to = request.To!.Value;

        var loans = await _db.Loans.AsNoTracking()
            .Where(l => l.UserId == _user.Id && l.Date >= from && l.Date <= to)
            .Select(l => new CalendarEntry
            {
                Id = l.Id,
                Type = "loan",
                Date = l.Date,
                Description = l.Description,
                Amount = l.Amount,
                Meta = l.Method ?? string.Empty
            })
            .ToListAsync(cancellationToken);

        var billPostings = await _db.BillPostings.AsNoTracking()
            .Where(b => b.UserId == _user.Id && b.Date >= from && b.Date <= to)
            .Join(
                _db.RecurringBills.AsNoTracking(),
                b => b.RecurringBillId,
                rb => rb.Id,
                (b, rb) => new CalendarEntry
                {
                    Id = b.Id,
                    Type = "bill",
                    Date = b.Date,
                    Description = rb.Name,
                    Amount = b.ShareAmount,
                    Meta = rb.Vendor ?? string.Empty,
                    SplitPercent = rb.SplitPercent
                })
            .ToListAsync(cancellationToken);

        var payments = await _db.Payments.AsNoTracking()
            .Where(p => p.UserId == _user.Id && p.Date >= from && p.Date <= to)
            .Select(p => new CalendarEntry
            {
                Id = p.Id,
                Type = "payment",
                Date = p.Date,
                Description = "Payment received",
                Amount = p.Amount,
                Meta = p.Method ?? string.Empty
            })
            .ToListAsync(cancellationToken);

        var entries = loans
            .Concat(billPostings)
            .Concat(payments)
            .OrderBy(e => e.Date)
            .ThenBy(e => TypeRank(e.Type))
            .ThenBy(e => e.Id)
            .ToList();

        var projections = await BuildProjectionsAsync(from, to, cancellationToken);

        return new CalendarResponse
        {
            From = from,
            To = to,
            Entries = entries,
            Projections = projections
        };
    }

    private async Task<IReadOnlyList<CalendarProjection>> BuildProjectionsAsync(
        DateOnly from, DateOnly to, CancellationToken ct)
    {
        var activeBills = await _db.RecurringBills.AsNoTracking()
            .Where(b => b.UserId == _user.Id && b.ArchivedUtc == null)
            .ToListAsync(ct);

        if (activeBills.Count == 0) return Array.Empty<CalendarProjection>();

        var postedPeriods = await _db.BillPostings.AsNoTracking()
            .Where(p => p.UserId == _user.Id)
            .Select(p => new { p.RecurringBillId, p.Period })
            .ToListAsync(ct);

        var postedSet = postedPeriods
            .Select(p => (p.RecurringBillId, p.Period))
            .ToHashSet();

        var projections = new List<CalendarProjection>();
        foreach (var bill in activeBills)
        {
            foreach (var dueDate in EnumerateDueDates(bill.DueDay, from, to))
            {
                var period = $"{dueDate.Year:D4}-{dueDate.Month:D2}";
                if (postedSet.Contains((bill.Id, period))) continue;

                projections.Add(new CalendarProjection
                {
                    BillId = bill.Id,
                    Date = dueDate,
                    BillName = bill.Name,
                    ExpectedAmount = bill.ExpectedAmount,
                    CounterpartyShare = BillMath.ComputeShare(bill.ExpectedAmount, bill.SplitPercent)
                });
            }
        }
        return projections
            .OrderBy(p => p.Date)
            .ThenBy(p => p.BillName)
            .ToList();
    }

    private static IEnumerable<DateOnly> EnumerateDueDates(int dueDay, DateOnly from, DateOnly to)
    {
        var year = from.Year;
        var month = from.Month;
        while (true)
        {
            var clamped = Math.Min(dueDay, DateTime.DaysInMonth(year, month));
            var due = new DateOnly(year, month, clamped);
            if (due > to) yield break;
            if (due >= from) yield return due;
            if (month == 12) { month = 1; year++; } else { month++; }
        }
    }

    private static int TypeRank(string type) => type switch
    {
        "loan" => 0,
        "bill" => 1,
        "payment" => 2,
        _ => 3
    };
}
