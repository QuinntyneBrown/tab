using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Tab.Application.Abstractions;
using Tab.Domain.Entities;
using Tab.Infrastructure.Persistence;

namespace Tab.Infrastructure.Auth;

public class TokenService : ITokenService
{
    private readonly TabDbContext _db;
    private readonly IJwtIssuer _jwtIssuer;
    private readonly TimeProvider _timeProvider;
    private readonly JwtOptions _jwt;

    public TokenService(TabDbContext db, IJwtIssuer jwtIssuer, TimeProvider timeProvider, IOptions<JwtOptions> jwt)
    {
        _db = db;
        _jwtIssuer = jwtIssuer;
        _timeProvider = timeProvider;
        _jwt = jwt.Value;
    }

    public async Task<IssuedTokenPair> IssueAsync(User user, CancellationToken cancellationToken)
    {
        var access = _jwtIssuer.IssueAccessToken(user.Id, user.Email);
        var (raw, hash) = MintRefresh();
        var now = _timeProvider.GetUtcNow();
        var expires = now.AddDays(_jwt.RefreshTokenLifetimeDays);

        _db.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = hash,
            IssuedUtc = now,
            ExpiresUtc = expires
        });
        await _db.SaveChangesAsync(cancellationToken);

        return new IssuedTokenPair(access.Token, access.ExpiresInSeconds, raw, expires);
    }

    public async Task<IssuedTokenPair> RotateAsync(string refreshToken, CancellationToken cancellationToken)
    {
        var hash = HashRefresh(refreshToken);
        var existing = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash, cancellationToken)
            ?? throw new InvalidRefreshTokenException();

        var now = _timeProvider.GetUtcNow();
        if (existing.RevokedUtc is not null || existing.ExpiresUtc <= now)
        {
            throw new InvalidRefreshTokenException();
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == existing.UserId, cancellationToken)
            ?? throw new InvalidRefreshTokenException();

        var access = _jwtIssuer.IssueAccessToken(user.Id, user.Email);
        var (rawNext, hashNext) = MintRefresh();
        var expires = now.AddDays(_jwt.RefreshTokenLifetimeDays);

        var replacement = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = hashNext,
            IssuedUtc = now,
            ExpiresUtc = expires
        };
        _db.RefreshTokens.Add(replacement);
        existing.RevokedUtc = now;
        existing.ReplacedById = replacement.Id;

        await _db.SaveChangesAsync(cancellationToken);
        return new IssuedTokenPair(access.Token, access.ExpiresInSeconds, rawNext, expires);
    }

    public async Task<bool> RevokeAsync(string refreshToken, CancellationToken cancellationToken)
    {
        var hash = HashRefresh(refreshToken);
        var existing = await _db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);
        if (existing is null || existing.RevokedUtc is not null)
        {
            return false;
        }
        existing.RevokedUtc = _timeProvider.GetUtcNow();
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static (string raw, string hash) MintRefresh()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        var raw = Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        var hash = HashRefresh(raw);
        return (raw, hash);
    }

    private static string HashRefresh(string raw)
    {
        var hash = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(raw));
        return Convert.ToHexString(hash);
    }
}
