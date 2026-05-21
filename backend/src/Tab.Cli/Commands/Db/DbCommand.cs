using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;

namespace Tab.Cli.Commands.Db;

public sealed class DbCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public DbCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var cmd = new Command("db", "Database administration commands.");
        cmd.AddCommand(new DbMigrateCommand(_scopeFactory).Build());
        cmd.AddCommand(new DbResetCommand(_scopeFactory).Build());
        cmd.AddCommand(new DbSeedCommand(_scopeFactory).Build());
        return cmd;
    }
}
