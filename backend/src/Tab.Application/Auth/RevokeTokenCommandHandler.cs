using MediatR;
using Tab.Application.Abstractions;

namespace Tab.Application.Auth;

public class RevokeTokenCommandHandler : IRequestHandler<RevokeTokenCommand, Unit>
{
    private readonly ITokenService _tokens;

    public RevokeTokenCommandHandler(ITokenService tokens)
    {
        _tokens = tokens;
    }

    public async Task<Unit> Handle(RevokeTokenCommand request, CancellationToken cancellationToken)
    {
        await _tokens.RevokeAsync(request.RefreshToken, cancellationToken);
        return Unit.Value;
    }
}
