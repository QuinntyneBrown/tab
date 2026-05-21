namespace Tab.Cli.Services.Db;

public interface IDatabaseSeeder
{
    Task SeedAsync(string email, CancellationToken cancellationToken);
}
