namespace Tab.Cli.Services.Db;

public interface IDatabaseResetter
{
    Task ResetAsync(bool force, CancellationToken cancellationToken);
}
