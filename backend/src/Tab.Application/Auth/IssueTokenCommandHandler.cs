using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Api.Contracts.Auth;
using Tab.Application.Abstractions;

namespace Tab.Application.Auth;

public class IssueTokenCommandHandler : IRequestHandler<IssueTokenCommand, TokenResponse>
{
    private readonly ITabDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly ITokenService _tokens;

    public IssueTokenCommandHandler(ITabDbContext db, IPasswordHasher hasher, ITokenService tokens)
    {
        _db = db;
        _hasher = hasher;
        _tokens = tokens;
    }

    public async Task<TokenResponse> Handle(IssueTokenCommand request, CancellationToken cancellationToken)
    {
        var normalized = (request.Email ?? string.Empty).Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalized, cancellationToken)
            ?? throw new InvalidCredentialsException();

        if (!_hasher.Verify(request.Password, user.PasswordHash))
        {
            throw new InvalidCredentialsException();
        }

        var pair = await _tokens.IssueAsync(user, cancellationToken);
        return new TokenResponse
        {
            AccessToken = pair.AccessToken,
            ExpiresIn = pair.ExpiresInSeconds,
            RefreshToken = pair.RefreshToken,
            TokenType = "Bearer"
        };
    }
}
