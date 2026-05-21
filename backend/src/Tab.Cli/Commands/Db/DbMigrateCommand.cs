using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;
using Tab.Cli.Services.Db;

namespace Tab.Cli.Commands.Db;

public sealed class DbMigrateCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public DbMigrateCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var cmd = new Command("migrate", "Apply all pending EF Core migrations to the configured database.");
        cmd.SetHandler(async () =>
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var migrator = scope.ServiceProvider.GetRequiredService<IDatabaseMigrator>();
            await migrator.MigrateAsync(CancellationToken.None);
        });
        return cmd;
    }
}
