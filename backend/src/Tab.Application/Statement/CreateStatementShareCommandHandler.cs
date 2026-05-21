using System.Security.Cryptography;
using System.Text;
using MediatR;
using Tab.Api.Contracts.Statement;
using Tab.Application.Abstractions;
using Tab.Domain.Entities;

namespace Tab.Application.Statement;

public class CreateStatementShareCommandHandler : IRequestHandler<CreateStatementShareCommand, StatementShareResponse>
{
    private readonly ITabDbContext _db;
    private readonly ICurrentUser _user;
    private readonly TimeProvider _timeProvider;

    public CreateStatementShareCommandHandler(ITabDbContext db, ICurrentUser user, TimeProvider timeProvider)
    {
        _db = db;
        _user = user;
        _timeProvider = timeProvider;
    }

    public async Task<StatementShareResponse> Handle(CreateStatementShareCommand request, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(_timeProvider.GetUtcNow().UtcDateTime);
        var to = request.To ?? today;
        var from = request.From ?? await StatementBuilder.ResolveFromAsync(_db, _user.Id, new DateOnly(today.Year, today.Month, 1), cancellationToken);

        var raw = RandomToken();
        var hash = Sha256Hex(raw);
        var expires = _timeProvider.GetUtcNow().AddDays(14);

        _db.StatementShares.Add(new StatementShare
        {
            Id = Guid.NewGuid(),
            UserId = _user.Id,
            FromDate = from,
            ToDate = to,
            TokenHash = hash,
            ExpiresUtc = expires,
            CreatedUtc = _timeProvider.GetUtcNow()
        });
        await _db.SaveChangesAsync(cancellationToken);

        return new StatementShareResponse
        {
            Token = raw,
            Url = $"/share/{raw}",
            ExpiresUtc = expires
        };
    }

    private static string RandomToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    internal static string Sha256Hex(string raw)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(raw));
        return Convert.ToHexString(hash);
    }
}
