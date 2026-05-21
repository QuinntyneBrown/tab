using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;
using Tab.Cli.Services.Import;
using Tab.Domain.Entities;

namespace Tab.Cli.Commands.Import;

public sealed class ImportLoansCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public ImportLoansCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var emailOption = new Option<string>("--user", "Email of the owning user.") { IsRequired = true };
        var fileOption = new Option<FileInfo>("--file", "Path to the CSV file.") { IsRequired = true };
        var cmd = new Command("loans", "Import loan entries from a CSV file.")
        {
            emailOption, fileOption
        };
        cmd.SetHandler(async (string email, FileInfo file) =>
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var importer = scope.ServiceProvider.GetRequiredService<IDataImporter<Loan>>();
            var n = await importer.ImportAsync(email, file, CancellationToken.None);
            Console.WriteLine($"Imported {n} loan(s) for <{email}> from {file.Name}.");
        }, emailOption, fileOption);
        return cmd;
    }
}
