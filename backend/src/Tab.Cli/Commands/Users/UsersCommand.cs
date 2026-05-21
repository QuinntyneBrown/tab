using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;

namespace Tab.Cli.Commands.Users;

public sealed class UsersCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public UsersCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var cmd = new Command("users", "User administration commands.");
        cmd.AddCommand(new UsersCreateCommand(_scopeFactory).Build());
        cmd.AddCommand(new UsersListCommand(_scopeFactory).Build());
        cmd.AddCommand(new UsersDeleteCommand(_scopeFactory).Build());
        cmd.AddCommand(new UsersResetPasscodeCommand(_scopeFactory).Build());
        cmd.AddCommand(new UsersSeedCommand(_scopeFactory).Build());
        return cmd;
    }
}
