using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Loans;
using Tab.Application.Abstractions;
using Tab.Application.Auth;

namespace Tab.Application.Loans;

public class UpdateLoanCommandHandler : IRequestHandler<UpdateLoanCommand, LoanResponse>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;

    public UpdateLoanCommandHandler(ITabDbContext db, ICurrentUser user)
    {
        _db = db;
        _user = user;
    }

    public async Task<LoanResponse> Handle(UpdateLoanCommand request, CancellationToken cancellationToken)
    {
        var loan = await _db.Loans.FirstOrDefaultAsync(l => l.Id == request.Id && l.UserId == _user.Id, cancellationToken)
            ?? throw new NotFoundException("Loan not found.");

        loan.Amount = request.Amount;
        loan.Date = request.Date;
        loan.Description = request.Description.Trim();
        loan.Method = string.IsNullOrWhiteSpace(request.Method) ? null : request.Method.Trim();
        loan.Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim();
        await _db.SaveChangesAsync(cancellationToken);

        return CreateLoanCommandHandler.Map(loan);
    }
}
