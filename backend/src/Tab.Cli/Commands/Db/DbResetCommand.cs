using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;
using Tab.Cli.Services.Db;

namespace Tab.Cli.Commands.Db;

public sealed class DbResetCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public DbResetCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var forceOption = new Option<bool>("--force", "Required confirmation. Without it the command refuses to run.");
        var cmd = new Command("reset", "Drop and recreate the database. DESTRUCTIVE.")
        {
            forceOption
        };
        cmd.SetHandler(async (bool force) =>
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var resetter = scope.ServiceProvider.GetRequiredService<IDatabaseResetter>();
            await resetter.ResetAsync(force, CancellationToken.None);
        }, forceOption);
        return cmd;
    }
}
