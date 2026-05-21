using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;
using Tab.Cli.Services.Export;

namespace Tab.Cli.Commands.Export;

public sealed class ExportAllCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public ExportAllCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var emailOption = new Option<string>("--user", "Email of the owning user.") { IsRequired = true };
        var fileOption = new Option<FileInfo>("--file", "Destination JSON path.") { IsRequired = true };
        var cmd = new Command("all", "Export a full ledger snapshot (loans + bills + payments) for a user as JSON.")
        {
            emailOption, fileOption
        };
        cmd.SetHandler(async (string email, FileInfo file) =>
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var exporter = scope.ServiceProvider.GetRequiredService<ILedgerExporter>();
            var result = await exporter.ExportAsync(email, file, CancellationToken.None);
            Console.WriteLine($"Exported {result.Loans} loans, {result.Bills} bills, {result.Payments} payments for <{email}> → {file.FullName}.");
        }, emailOption, fileOption);
        return cmd;
    }
}
