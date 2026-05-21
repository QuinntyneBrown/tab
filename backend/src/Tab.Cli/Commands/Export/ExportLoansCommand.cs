using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;
using Tab.Cli.Services.Export;
using Tab.Domain.Entities;

namespace Tab.Cli.Commands.Export;

public sealed class ExportLoansCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public ExportLoansCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var emailOption = new Option<string>("--user", "Email of the owning user.") { IsRequired = true };
        var fileOption = new Option<FileInfo>("--file", "Destination CSV path.") { IsRequired = true };
        var cmd = new Command("loans", "Export every loan entry for a user as CSV.")
        {
            emailOption, fileOption
        };
        cmd.SetHandler(async (string email, FileInfo file) =>
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            var exporter = scope.ServiceProvider.GetRequiredService<IDataExporter<Loan>>();
            var n = await exporter.ExportAsync(email, file, CancellationToken.None);
            Console.WriteLine($"Exported {n} loan(s) for <{email}> → {file.FullName}.");
        }, emailOption, fileOption);
        return cmd;
    }
}
