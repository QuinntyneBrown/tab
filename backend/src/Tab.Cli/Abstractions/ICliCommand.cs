using System.CommandLine;

namespace Tab.Cli.Abstractions;

public interface ICliCommand
{
    Command Build();
}
