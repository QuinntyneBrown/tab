using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Counterparties;
using Tab.Application.Abstractions;
using Tab.Application.Auth;

namespace Tab.Application.Counterparties;

public class UpdateCounterpartyCommandHandler : IRequestHandler<UpdateCounterpartyCommand, CounterpartyResponse>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;

    public UpdateCounterpartyCommandHandler(ITabDbContext db, ICurrentUser user)
    {
        _db = db;
        _user = user;
    }

    public async Task<CounterpartyResponse> Handle(UpdateCounterpartyCommand request, CancellationToken cancellationToken)
    {
        var cp = await _db.Counterparties.FirstOrDefaultAsync(c => c.UserId == _user.Id, cancellationToken)
            ?? throw new NotFoundException("Counterparty not found.");
        cp.Name = request.Name.Trim();
        cp.Note = request.Note?.Trim();
        await _db.SaveChangesAsync(cancellationToken);
        return new CounterpartyResponse { Id = cp.Id, Name = cp.Name, Note = cp.Note };
    }
}
