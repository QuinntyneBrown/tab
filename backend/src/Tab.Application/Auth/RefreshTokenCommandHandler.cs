using MediatR;
using Tab.Api.Contracts.Auth;
using Tab.Application.Abstractions;

namespace Tab.Application.Auth;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, TokenResponse>
{
    private readonly ITokenService _tokens;

    public RefreshTokenCommandHandler(ITokenService tokens)
    {
        _tokens = tokens;
    }

    public async Task<TokenResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var pair = await _tokens.RotateAsync(request.RefreshToken, cancellationToken);
        return new TokenResponse
        {
            AccessToken = pair.AccessToken,
            ExpiresIn = pair.ExpiresInSeconds,
            RefreshToken = pair.RefreshToken,
            TokenType = "Bearer"
        };
    }
}
