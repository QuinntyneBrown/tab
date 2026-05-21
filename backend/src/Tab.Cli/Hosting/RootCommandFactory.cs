using System.CommandLine;
using Tab.Cli.Abstractions;

namespace Tab.Cli.Hosting;

public sealed class RootCommandFactory
{
    private readonly IEnumerable<ICliCommand> _topLevelCommands;

    public RootCommandFactory(IEnumerable<ICliCommand> topLevelCommands)
    {
        _topLevelCommands = topLevelCommands;
    }

    public RootCommand Create()
    {
        var root = new RootCommand("tab — administrator CLI for the tab ledger application.");
        foreach (var c in _topLevelCommands)
        {
            root.AddCommand(c.Build());
        }
        return root;
    }
}
