using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;
using Tab.Cli.Services.Users;

namespace Tab.Cli.Commands.Users;

public sealed class UsersListCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public UsersListCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var cmd = new Command("list", "List every user in the database.");
        cmd.SetHandler(async () =>
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var admin = scope.ServiceProvider.GetRequiredService<IUserAdministrator>();
            var users = await admin.ListAsync(CancellationToken.None);
            Console.WriteLine($"{users.Count} user(s).");
            foreach (var u in users)
            {
                Console.WriteLine($"  {u.Id}  {u.Email}  (created {u.CreatedUtc:yyyy-MM-dd})");
            }
        });
        return cmd;
    }
}
