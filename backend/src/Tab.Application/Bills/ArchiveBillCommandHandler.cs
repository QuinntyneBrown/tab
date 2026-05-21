using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Application.Abstractions;
using Tab.Application.Auth;

namespace Tab.Application.Bills;

public class ArchiveBillCommandHandler : IRequestHandler<ArchiveBillCommand, Unit>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;
    private readonly TimeProvider _timeProvider;

    public ArchiveBillCommandHandler(ITabDbContext db, ICurrentUser user, TimeProvider timeProvider)
    {
        _db = db;
        _user = user;
        _timeProvider = timeProvider;
    }

    public async Task<Unit> Handle(ArchiveBillCommand request, CancellationToken cancellationToken)
    {
        var bill = await _db.RecurringBills.FirstOrDefaultAsync(b => b.Id == request.Id && b.UserId == _user.Id, cancellationToken)
            ?? throw new NotFoundException("Bill not found.");
        if (bill.ArchivedUtc is null)
        {
            bill.ArchivedUtc = _timeProvider.GetUtcNow();
            await _db.SaveChangesAsync(cancellationToken);
        }
        return Unit.Value;
    }
}
