using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Tab.Application.Abstractions;

namespace Tab.Infrastructure.Auth;

public class RsaJwtIssuer : IJwtIssuer
{
    private readonly JwtOptions _options;
    private readonly RsaKeyProvider _keys;
    private readonly TimeProvider _timeProvider;

    public RsaJwtIssuer(IOptions<JwtOptions> options, RsaKeyProvider keys, TimeProvider timeProvider)
    {
        _options = options.Value;
        _keys = keys;
        _timeProvider = timeProvider;
    }

    public AccessTokenResult IssueAccessToken(Guid userId, string email)
    {
        var now = _timeProvider.GetUtcNow();
        var expires = now.AddMinutes(_options.AccessTokenLifetimeMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
        };

        var key = new RsaSecurityKey(_keys.Rsa) { KeyId = "tab-rsa-1" };
        var signing = new SigningCredentials(key, SecurityAlgorithms.RsaSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: now.UtcDateTime,
            expires: expires.UtcDateTime,
            signingCredentials: signing);

        var handler = new JwtSecurityTokenHandler();
        var encoded = handler.WriteToken(token);
        return new AccessTokenResult(encoded, expires, _options.AccessTokenLifetimeMinutes * 60);
    }
}
