using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Statement;
using Tab.Application.Abstractions;

namespace Tab.Application.Statement;

public class GetSharedStatementQueryHandler : IRequestHandler<GetSharedStatementQuery, StatementResponse?>
{
    private readonly ITabDbContext _db;
    private readonly TimeProvider _timeProvider;

    public GetSharedStatementQueryHandler(ITabDbContext db, TimeProvider timeProvider)
    {
        _db = db;
        _timeProvider = timeProvider;
    }

    public async Task<StatementResponse?> Handle(GetSharedStatementQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Token)) return null;
        var hash = CreateStatementShareCommandHandler.Sha256Hex(request.Token);
        var share = await _db.StatementShares.AsNoTracking().FirstOrDefaultAsync(s => s.TokenHash == hash, cancellationToken);
        if (share is null || share.ExpiresUtc <= _timeProvider.GetUtcNow())
        {
            return null;
        }
        return await StatementBuilder.BuildAsync(_db, share.UserId, share.FromDate, share.ToDate, cancellationToken);
    }
}
