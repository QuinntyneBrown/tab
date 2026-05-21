using MediatR;

namespace Tab.Application.Auth;

public record RegisterUserCommand(string Email, string Password) : IRequest<Guid>;
