using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;
using Tab.Cli.Services.Import;

namespace Tab.Cli.Commands.Import;

public sealed class ImportAllCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public ImportAllCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var emailOption = new Option<string>("--user", "Email of the owning user.") { IsRequired = true };
        var fileOption = new Option<FileInfo>("--file", "Path to a JSON ledger payload produced by `export all`.") { IsRequired = true };
        var cmd = new Command("all", "Import a full ledger snapshot (loans + bills + payments) from a JSON payload.")
        {
            emailOption, fileOption
        };
        cmd.SetHandler(async (string email, FileInfo file) =>
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var importer = scope.ServiceProvider.GetRequiredService<ILedgerImporter>();
            var result = await importer.ImportAsync(email, file, CancellationToken.None);
            Console.WriteLine($"Imported {result.Loans} loans, {result.Bills} bills, {result.Payments} payments for <{email}>.");
        }, emailOption, fileOption);
        return cmd;
    }
}
