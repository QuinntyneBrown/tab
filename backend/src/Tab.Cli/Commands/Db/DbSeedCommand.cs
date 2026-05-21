using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;
using Tab.Cli.Services.Db;

namespace Tab.Cli.Commands.Db;

public sealed class DbSeedCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public DbSeedCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var emailOption = new Option<string>("--user", "Email of the user to attach seeded ledger data to.")
        {
            IsRequired = true
        };
        var cmd = new Command("seed", "Seed the database with a representative ledger for a single user.")
        {
            emailOption
        };
        cmd.SetHandler(async (string email) =>
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var seeder = scope.ServiceProvider.GetRequiredService<IDatabaseSeeder>();
            await seeder.SeedAsync(email, CancellationToken.None);
        }, emailOption);
        return cmd;
    }
}
