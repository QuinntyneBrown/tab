using MediatR;
using Tab.Api.Contracts.Statement;
using Tab.Application.Abstractions;

namespace Tab.Application.Statement;

public class GetStatementQueryHandler : IRequestHandler<GetStatementQuery, StatementResponse>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;
    private readonly TimeProvider _timeProvider;

    public GetStatementQueryHandler(ITabDbContext db, ICurrentUser user, TimeProvider timeProvider)
    {
        _db = db;
        _user = user;
        _timeProvider = timeProvider;
    }

    public async Task<StatementResponse> Handle(GetStatementQuery request, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime);
        var to = request.To ?? today;
        var from = request.From ?? await StatementBuilder.ResolveFromAsync(_db, _user.Id, new DateOnly(today.Year, today.Month, 1), cancellationToken);
        return await StatementBuilder.BuildAsync(_db, _user.Id, from, to, cancellationToken);
    }
}
