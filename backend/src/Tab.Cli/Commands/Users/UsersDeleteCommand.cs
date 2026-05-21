using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;
using Tab.Cli.Services.Users;

namespace Tab.Cli.Commands.Users;

public sealed class UsersDeleteCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public UsersDeleteCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var emailOption = new Option<string>("--email", "Email of the user to delete.") { IsRequired = true };
        var forceOption = new Option<bool>("--force", "Required confirmation. Cascades through all ledger rows owned by the user.");
        var cmd = new Command("delete", "Delete a user and every ledger row owned by them. DESTRUCTIVE.")
        {
            emailOption, forceOption
        };
        cmd.SetHandler(async (string email, bool force) =>
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var admin = scope.ServiceProvider.GetRequiredService<IUserAdministrator>();
            var removed = await admin.DeleteAsync(email, force, CancellationToken.None);
            Console.WriteLine(removed
                ? $"Deleted user <{email}> and all associated data."
                : $"No user matched <{email}> (or --force missing).");
        }, emailOption, forceOption);
        return cmd;
    }
}
