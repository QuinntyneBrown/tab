using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Loans;
using Tab.Application.Abstractions;
using Tab.Application.Auth;
using Tab.Domain.Entities;

namespace Tab.Application.Loans;

public class CreateLoanCommandHandler : IRequestHandler<CreateLoanCommand, LoanResponse>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;
    private readonly TimeProvider _timeProvider;

    public CreateLoanCommandHandler(ITabDbContext db, ICurrentUser user, TimeProvider timeProvider)
    {
        _db = db;
        _user = user;
        _timeProvider = timeProvider;
    }

    public async Task<LoanResponse> Handle(CreateLoanCommand request, CancellationToken cancellationToken)
    {
        var cp = await _db.Counterparties.AsNoTracking()
            .FirstOrDefaultAsync(c => c.UserId == _user.Id, cancellationToken)
            ?? throw new NotFoundException("Counterparty not found.");

        var loan = new Loan
        {
            Id = Guid.NewGuid(),
            UserId = _user.Id,
            CounterpartyId = cp.Id,
            Amount = request.Amount,
            Date = request.Date,
            Description = request.Description.Trim(),
            Method = string.IsNullOrWhiteSpace(request.Method) ? null : request.Method.Trim(),
            Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim(),
            CreatedUtc = _timeProvider.GetUtcNow()
        };
        _db.Loans.Add(loan);
        await _db.SaveChangesAsync(cancellationToken);

        return Map(loan);
    }

    internal static LoanResponse Map(Loan l) => new()
    {
        Id = l.Id,
        Amount = l.Amount,
        Date = l.Date,
        Description = l.Description,
        Method = l.Method,
        Note = l.Note
    };
}
