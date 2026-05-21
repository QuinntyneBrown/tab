using MediatR;
using Tab.Api.Contracts.Auth;

namespace Tab.Application.Auth;

public record RefreshTokenCommand(string RefreshToken) : IRequest<TokenResponse>;
