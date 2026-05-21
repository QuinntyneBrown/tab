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
        var loanAmounts = await _db.Loans.AsNoTracking().Where(l => l.UserId == _user.Id).Select(l => l.Amount).ToListAsync(cancellationToken);
        var billAmounts = await _db.BillPostings.AsNoTracking().Where(b => b.UserId == _user.Id).Select(b => b.ShareAmount).ToListAsync(cancellationToken);
        var paymentAmounts = await _db.Payments.AsNoTracking().Where(p => p.UserId == _user.Id).Select(p => p.Amount).ToListAsync(cancellationToken);

        return new BalanceResponse
        {
            Amount = loanAmounts.Sum() + billAmounts.Sum() - paymentAmounts.Sum(),
            AsOf = _timeProvider.GetUtcNow()
        };
    }
}
