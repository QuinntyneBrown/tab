using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;

namespace Tab.Cli.Commands.Export;

public sealed class ExportCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public ExportCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var cmd = new Command("export", "Export ledger data for a user to CSV or JSON files.");
        cmd.AddCommand(new ExportLoansCommand(_scopeFactory).Build());
        cmd.AddCommand(new ExportBillsCommand(_scopeFactory).Build());
        cmd.AddCommand(new ExportPaymentsCommand(_scopeFactory).Build());
        cmd.AddCommand(new ExportAllCommand(_scopeFactory).Build());
        return cmd;
    }
}
