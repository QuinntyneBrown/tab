using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Application.Abstractions;
using Tab.Application.Auth;

namespace Tab.Application.Loans;

public class DeleteLoanCommandHandler : IRequestHandler<DeleteLoanCommand, Unit>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;

    public DeleteLoanCommandHandler(ITabDbContext db, ICurrentUser user)
    {
        _db = db;
        _user = user;
    }

    public async Task<Unit> Handle(DeleteLoanCommand request, CancellationToken cancellationToken)
    {
        var loan = await _db.Loans.FirstOrDefaultAsync(l => l.Id == request.Id && l.UserId == _user.Id, cancellationToken)
            ?? throw new NotFoundException("Loan not found.");
        _db.Loans.Remove(loan);
        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
