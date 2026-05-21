using Tab.Domain.Entities;

namespace Tab.Cli.Services.Users;

public interface IUserAdministrator
{
    Task<Guid> CreateAsync(string email, string passcode, CancellationToken cancellationToken);
    Task<IReadOnlyList<User>> ListAsync(CancellationToken cancellationToken);
    Task<bool> DeleteAsync(string email, bool force, CancellationToken cancellationToken);
    Task ResetPasscodeAsync(string email, string newPasscode, CancellationToken cancellationToken);
}
