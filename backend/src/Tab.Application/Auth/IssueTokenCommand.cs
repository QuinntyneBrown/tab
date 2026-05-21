using MediatR;
using Tab.Api.Contracts.Auth;

namespace Tab.Application.Auth;

public record IssueTokenCommand(string Email, string Password) : IRequest<TokenResponse>;
