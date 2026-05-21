using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;
using Tab.Cli.Services.Users;

namespace Tab.Cli.Commands.Users;

public sealed class UsersSeedCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public UsersSeedCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var cmd = new Command("seed", "Seed a known set of demo users (idempotent).");
        cmd.SetHandler(async () =>
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var seeder = scope.ServiceProvider.GetRequiredService<IUserSeeder>();
            var result = await seeder.SeedAsync(CancellationToken.None);
            Console.WriteLine($"Seeded {result.Created} new user(s); {result.Existing} already existed.");
        });
        return cmd;
    }
}
