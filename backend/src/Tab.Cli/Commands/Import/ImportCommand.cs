using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Abstractions;

namespace Tab.Cli.Commands.Import;

public sealed class ImportCommand : ICliCommand
{
    private readonly IServiceScopeFactory _scopeFactory;

    public ImportCommand(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public Command Build()
    {
        var cmd = new Command("import", "Import ledger data from CSV or JSON files into a user's ledger.");
        cmd.AddCommand(new ImportLoansCommand(_scopeFactory).Build());
        cmd.AddCommand(new ImportBillsCommand(_scopeFactory).Build());
        cmd.AddCommand(new ImportPaymentsCommand(_scopeFactory).Build());
        cmd.AddCommand(new ImportAllCommand(_scopeFactory).Build());
        return cmd;
    }
}
