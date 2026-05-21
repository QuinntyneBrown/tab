using Tab.Domain.Entities;

namespace Tab.Application.Abstractions;

public interface ITokenService
{
    Task<IssuedTokenPair> IssueAsync(User user, CancellationToken cancellationToken);
    Task<IssuedTokenPair> RotateAsync(string refreshToken, CancellationToken cancellationToken);
    Task<bool> RevokeAsync(string refreshToken, CancellationToken cancellationToken);
}
