using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;
using Tab.Cli.Services.Users;

namespace Tab.Cli.Commands.Users;

public sealed class UsersCreateCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public UsersCreateCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var emailOption = new Option<string>("--email", "Email address.") { IsRequired = true };
        var passcodeOption = new Option<string>("--passcode", "Initial passcode.") { IsRequired = true };
        var cmd = new Command("create", "Create a new user. Bypasses front-end registration flow.")
        {
            emailOption, passcodeOption
        };
        cmd.SetHandler(async (string email, string passcode) =>
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var admin = scope.ServiceProvider.GetRequiredService<IUserAdministrator>();
            var id = await admin.CreateAsync(email, passcode, CancellationToken.None);
            Console.WriteLine($"Created user {id} <{email}>.");
        }, emailOption, passcodeOption);
        return cmd;
    }
}
