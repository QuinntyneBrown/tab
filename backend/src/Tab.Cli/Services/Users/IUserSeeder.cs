namespace Tab.Cli.Services.Users;

public interface IUserSeeder
{
    Task<UserSeedResult> SeedAsync(CancellationToken cancellationToken);
}
