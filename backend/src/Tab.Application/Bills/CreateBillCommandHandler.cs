using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Bills;
using Tab.Application.Abstractions;
using Tab.Application.Auth;
using Tab.Domain.Entities;

namespace Tab.Application.Bills;

public class CreateBillCommandHandler : IRequestHandler<CreateBillCommand, BillResponse>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;
    private readonly TimeProvider _timeProvider;

    public CreateBillCommandHandler(ITabDbContext db, ICurrentUser user, TimeProvider timeProvider)
    {
        _db = db;
        _user = user;
        _timeProvider = timeProvider;
    }

    public async Task<BillResponse> Handle(CreateBillCommand request, CancellationToken cancellationToken)
    {
        var cp = await _db.Counterparties.AsNoTracking().FirstOrDefaultAsync(c => c.UserId == _user.Id, cancellationToken)
            ?? throw new NotFoundException("Counterparty not found.");
        var bill = new RecurringBill
        {
            Id = Guid.NewGuid(),
            UserId = _user.Id,
            CounterpartyId = cp.Id,
            Name = request.Name.Trim(),
            Vendor = string.IsNullOrWhiteSpace(request.Vendor) ? null : request.Vendor.Trim(),
            ExpectedAmount = request.ExpectedAmount,
            DueDay = request.DueDay,
            SplitPercent = request.SplitPercent,
            CreatedUtc = _timeProvider.GetUtcNow()
        };
        _db.RecurringBills.Add(bill);
        await _db.SaveChangesAsync(cancellationToken);

        return Map(bill, _timeProvider);
    }

    internal static BillResponse Map(RecurringBill b, TimeProvider time) => new()
    {
        Id = b.Id,
        Name = b.Name,
        Vendor = b.Vendor,
        ExpectedAmount = b.ExpectedAmount,
        DueDay = b.DueDay,
        SplitPercent = b.SplitPercent,
        SharePreview = BillMath.ComputeShare(b.ExpectedAmount, b.SplitPercent),
        NextDueDate = BillMath.ComputeNextDueDate(b.DueDay, DateOnly.FromDateTime(time.GetUtcNow().UtcDateTime)),
        IsArchived = b.ArchivedUtc.HasValue
    };
}
