using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Ledger;
using Tab.Application.Abstractions;

namespace Tab.Application.Ledger;

public class ListLedgerQueryHandler : IRequestHandler<ListLedgerQuery, IReadOnlyList<LedgerEntryResponse>>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;

    public ListLedgerQueryHandler(ITabDbContext db, ICurrentUser user)
    {
        _db = db;
        _user = user;
    }

    public async Task<IReadOnlyList<LedgerEntryResponse>> Handle(ListLedgerQuery request, CancellationToken cancellationToken)
    {
        DateOnly? from = null, toExclusive = null;
        if (!string.IsNullOrWhiteSpace(request.Month) && DateOnly.TryParseExact(request.Month + "-01", "yyyy-MM-dd", out var monthStart))
        {
            from = monthStart;
            toExclusive = monthStart.AddMonths(1);
        }

        var includeLoans = request.Type is null or "loan";
        var includeBills = request.Type is null or "bill";
        var includePayments = request.Type is null or "payment";

        var entries = new List<LedgerEntryResponse>();

        if (includeLoans)
        {
            var q = _db.Loans.AsNoTracking().Where(l => l.UserId == _user.Id);
            if (from is not null) q = q.Where(l => l.Date >= from && l.Date < toExclusive);
            entries.AddRange((await q.ToListAsync(cancellationToken)).Select(l => new LedgerEntryResponse
            {
                Id = l.Id,
                Type = "loan",
                Date = l.Date,
                Description = l.Description,
                Amount = l.Amount,
                TotalAmount = null,
                Method = l.Method,
                Note = l.Note
            }));
        }

        if (includeBills)
        {
            var q = _db.BillPostings.AsNoTracking().Where(b => b.UserId == _user.Id);
            if (from is not null) q = q.Where(b => b.Date >= from && b.Date < toExclusive);
            var billLookup = await _db.RecurringBills.AsNoTracking()
                .Where(b => b.UserId == _user.Id)
                .ToDictionaryAsync(b => b.Id, b => b.Name, cancellationToken);
            entries.AddRange((await q.ToListAsync(cancellationToken)).Select(p => new LedgerEntryResponse
            {
                Id = p.Id,
                Type = "bill",
                Date = p.Date,
                Description = $"{(billLookup.TryGetValue(p.RecurringBillId, out var n) ? n : "Bill")} ({p.Period})",
                Amount = p.ShareAmount,
                TotalAmount = p.TotalAmount
            }));
        }

        if (includePayments)
        {
            var q = _db.Payments.AsNoTracking().Where(p => p.UserId == _user.Id);
            if (from is not null) q = q.Where(p => p.Date >= from && p.Date < toExclusive);
            entries.AddRange((await q.ToListAsync(cancellationToken)).Select(p => new LedgerEntryResponse
            {
                Id = p.Id,
                Type = "payment",
                Date = p.Date,
                Description = "Payment received",
                Amount = p.Amount,
                Method = p.Method,
                Note = p.Note
            }));
        }

        return entries
            .OrderByDescending(e => e.Date)
            .ThenByDescending(e => e.Id)
            .ToList();
    }
}
