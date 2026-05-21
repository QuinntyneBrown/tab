using MediatR;

namespace Tab.Application.Auth;

public record RevokeTokenCommand(string RefreshToken) : IRequest<Unit>;
