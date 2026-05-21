using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Bills;
using Tab.Application.Abstractions;

namespace Tab.Application.Bills;

public class ListBillsQueryHandler : IRequestHandler<ListBillsQuery, IReadOnlyList<BillResponse>>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;
    private readonly TimeProvider _timeProvider;

    public ListBillsQueryHandler(ITabDbContext db, ICurrentUser user, TimeProvider timeProvider)
    {
        _db = db;
        _user = user;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<BillResponse>> Handle(ListBillsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.RecurringBills.AsNoTracking().Where(b => b.UserId == _user.Id);
        if (!request.IncludeArchived)
        {
            query = query.Where(b => b.ArchivedUtc == null);
        }
        var bills = await query.OrderBy(b => b.Name).ToListAsync(cancellationToken);
        return bills.Select(b => CreateBillCommandHandler.Map(b, _timeProvider)).ToList();
    }
}
