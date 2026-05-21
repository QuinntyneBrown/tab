using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Balance;
using Tab.Application.Abstractions;

namespace Tab.Application.Balance;

public class GetBalanceQueryHandler : IRequestHandler<GetBalanceQuery, BalanceResponse>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;
    private readonly TimeProvider _timeProvider;

    public GetBalanceQueryHandler(ITabDbContext db, ICurrentUser user, TimeProvider timeProvider)
    {
        _db = db;
        _user = user;
        _timeProvider = timeProvider;
    }

    public async Task<BalanceResponse> Handle(GetBalanceQuery request, CancellationToken cancellationToken)
    {
        var loans = await _db.Loans.AsNoTracking().Where(l => l.UserId == _user.Id).SumAsync(l => (decimal?)l.Amount, cancellationToken) ?? 0m;
        var bills = await _db.BillPostings.AsNoTracking().Where(b => b.UserId == _user.Id).SumAsync(b => (decimal?)b.ShareAmount, cancellationToken) ?? 0m;
        var payments = await _db.Payments.AsNoTracking().Where(p => p.UserId == _user.Id).SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0m;

        return new BalanceResponse
        {
            Amount = loans + bills - payments,
            AsOf = _timeProvider.GetUtcNow()
        };
    }
}
