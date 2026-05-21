using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;
using Tab.Cli.Services.Import;
using Tab.Domain.Entities;

namespace Tab.Cli.Commands.Import;

public sealed class ImportBillsCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public ImportBillsCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var emailOption = new Option<string>("--user", "Email of the owning user.") { IsRequired = true };
        var fileOption = new Option<FileInfo>("--file", "Path to the CSV file.") { IsRequired = true };
        var cmd = new Command("bills", "Import recurring bill definitions from a CSV file.")
        {
            emailOption, fileOption
        };
        cmd.SetHandler(async (string email, FileInfo file) =>
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var importer = scope.ServiceProvider.GetRequiredService<IDataImporter<RecurringBill>>();
            var n = await importer.ImportAsync(email, file, CancellationToken.None);
            Console.WriteLine($"Imported {n} bill definition(s) for <{email}> from {file.Name}.");
        }, emailOption, fileOption);
        return cmd;
    }
}
