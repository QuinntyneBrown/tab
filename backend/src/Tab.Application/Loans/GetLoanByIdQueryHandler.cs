using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Loans;
using Tab.Application.Abstractions;
using Tab.Application.Auth;

namespace Tab.Application.Loans;

public class GetLoanByIdQueryHandler : IRequestHandler<GetLoanByIdQuery, LoanResponse>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;

    public GetLoanByIdQueryHandler(ITabDbContext db, ICurrentUser user)
    {
        _db = db;
        _user = user;
    }

    public async Task<LoanResponse> Handle(GetLoanByIdQuery request, CancellationToken cancellationToken)
    {
        var loan = await _db.Loans.AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == request.Id && l.UserId == _user.Id, cancellationToken)
            ?? throw new NotFoundException("Loan not found.");
        return CreateLoanCommandHandler.Map(loan);
    }
}
