namespace Tab.Cli.Services.Db;

public interface IDatabaseMigrator
{
    Task MigrateAsync(CancellationToken cancellationToken);
}
