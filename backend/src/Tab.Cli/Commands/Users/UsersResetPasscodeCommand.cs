using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;
using Tab.Cli.Services.Users;

namespace Tab.Cli.Commands.Users;

public sealed class UsersResetPasscodeCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public UsersResetPasscodeCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var emailOption = new Option<string>("--email", "Email of the user.") { IsRequired = true };
        var passcodeOption = new Option<string>("--passcode", "New passcode.") { IsRequired = true };
        var cmd = new Command("reset-passcode", "Administrator backdoor: replace a user's passcode without their old one.")
        {
            emailOption, passcodeOption
        };
        cmd.SetHandler(async (string email, string passcode) =>
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var admin = scope.ServiceProvider.GetRequiredService<IUserAdministrator>();
            await admin.ResetPasscodeAsync(email, passcode, CancellationToken.None);
            Console.WriteLine($"Reset passcode for <{email}>.");
        }, emailOption, passcodeOption);
        return cmd;
    }
}
