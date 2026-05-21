using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Counterparties;
using Tab.Application.Abstractions;
using Tab.Application.Auth;

namespace Tab.Application.Counterparties;

public class GetCounterpartyQueryHandler : IRequestHandler<GetCounterpartyQuery, CounterpartyResponse>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;

    public GetCounterpartyQueryHandler(ITabDbContext db, ICurrentUser user)
    {
        _db = db;
        _user = user;
    }

    public async Task<CounterpartyResponse> Handle(GetCounterpartyQuery request, CancellationToken cancellationToken)
    {
        var cp = await _db.Counterparties.AsNoTracking().FirstOrDefaultAsync(c => c.UserId == _user.Id, cancellationToken)
            ?? throw new NotFoundException("Counterparty not found.");
        return new CounterpartyResponse { Id = cp.Id, Name = cp.Name, Note = cp.Note };
    }
}
