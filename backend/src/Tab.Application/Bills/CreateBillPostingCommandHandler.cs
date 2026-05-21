using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Bills;
using Tab.Application.Abstractions;
using Tab.Application.Auth;
using Tab.Domain.Entities;

namespace Tab.Application.Bills;

public class CreateBillPostingCommandHandler : IRequestHandler<CreateBillPostingCommand, BillPostingResponse>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;
    private readonly TimeProvider _timeProvider;

    public CreateBillPostingCommandHandler(ITabDbContext db, ICurrentUser user, TimeProvider timeProvider)
    {
        _db = db;
        _user = user;
        _timeProvider = timeProvider;
    }

    public async Task<BillPostingResponse> Handle(CreateBillPostingCommand request, CancellationToken cancellationToken)
    {
        var bill = await _db.RecurringBills.AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == request.BillId && b.UserId == _user.Id, cancellationToken)
            ?? throw new NotFoundException("Bill not found.");

        if (bill.ArchivedUtc is not null)
        {
            throw new NotFoundException("Bill is archived.");
        }

        var existing = await _db.BillPostings.AsNoTracking()
            .AnyAsync(p => p.RecurringBillId == bill.Id && p.Period == request.Period, cancellationToken);
        if (existing)
        {
            throw new DuplicatePostingException();
        }

        var total = request.ActualTotal ?? bill.ExpectedAmount;
        var share = BillMath.ComputeShare(total, bill.SplitPercent);
        var date = request.Date ?? DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime);

        var posting = new BillPosting
        {
            Id = Guid.NewGuid(),
            UserId = _user.Id,
            CounterpartyId = bill.CounterpartyId,
            RecurringBillId = bill.Id,
            Period = request.Period,
            TotalAmount = total,
            ShareAmount = share,
            Date = date,
            CreatedUtc = _timeProvider.GetUtcNow()
        };
        _db.BillPostings.Add(posting);
        await _db.SaveChangesAsync(cancellationToken);

        return new BillPostingResponse
        {
            Id = posting.Id,
            RecurringBillId = posting.RecurringBillId,
            Period = posting.Period,
            Date = posting.Date,
            TotalAmount = posting.TotalAmount,
            ShareAmount = posting.ShareAmount
        };
    }
}
