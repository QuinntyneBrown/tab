using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Bills;
using Tab.Application.Abstractions;
using Tab.Application.Auth;

namespace Tab.Application.Bills;

public class UpdateBillCommandHandler : IRequestHandler<UpdateBillCommand, BillResponse>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;
    private readonly TimeProvider _timeProvider;

    public UpdateBillCommandHandler(ITabDbContext db, ICurrentUser user, TimeProvider timeProvider)
    {
        _db = db;
        _user = user;
        _timeProvider = timeProvider;
    }

    public async Task<BillResponse> Handle(UpdateBillCommand request, CancellationToken cancellationToken)
    {
        var bill = await _db.RecurringBills.FirstOrDefaultAsync(b => b.Id == request.Id && b.UserId == _user.Id, cancellationToken)
            ?? throw new NotFoundException("Bill not found.");
        bill.Name = request.Name.Trim();
        bill.Vendor = string.IsNullOrWhiteSpace(request.Vendor) ? null : request.Vendor.Trim();
        bill.ExpectedAmount = request.ExpectedAmount;
        bill.DueDay = request.DueDay;
        bill.SplitPercent = request.SplitPercent;
        await _db.SaveChangesAsync(cancellationToken);

        return CreateBillCommandHandler.Map(bill, _timeProvider);
    }
}
