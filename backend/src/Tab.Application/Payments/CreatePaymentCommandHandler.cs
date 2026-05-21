using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Payments;
using Tab.Application.Abstractions;
using Tab.Application.Auth;
using Tab.Domain.Entities;

namespace Tab.Application.Payments;

public class CreatePaymentCommandHandler : IRequestHandler<CreatePaymentCommand, PaymentResponse>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;
    private readonly TimeProvider _timeProvider;

    public CreatePaymentCommandHandler(ITabDbContext db, ICurrentUser user, TimeProvider timeProvider)
    {
        _db = db;
        _user = user;
        _timeProvider = timeProvider;
    }

    public async Task<PaymentResponse> Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
    {
        var cp = await _db.Counterparties.AsNoTracking().FirstOrDefaultAsync(c => c.UserId == _user.Id, cancellationToken)
            ?? throw new NotFoundException("Counterparty not found.");
        var payment = new PaymentIn
        {
            Id = Guid.NewGuid(),
            UserId = _user.Id,
            CounterpartyId = cp.Id,
            Amount = request.Amount,
            Date = request.Date ?? DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime),
            Method = string.IsNullOrWhiteSpace(request.Method) ? null : request.Method.Trim(),
            Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim(),
            CreatedUtc = _timeProvider.GetUtcNow()
        };
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync(cancellationToken);

        return new PaymentResponse
        {
            Id = payment.Id,
            Amount = payment.Amount,
            Date = payment.Date,
            Method = payment.Method,
            Note = payment.Note
        };
    }
}
