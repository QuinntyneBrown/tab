using System.CommandLine;
using Microsoft.Extensions.DependencyInjection;
using Tab.Cli.Hosting;

namespace Tab.Cli;

public sealed class Program
{
    private Program() { }

    public static async Task<int> Main(string[] args)
    {
        using var host = CliHostBuilder.Build(args);
        var rootCommand = host.Services.GetRequiredService<RootCommandFactory>().Create();
        return await rootCommand.InvokeAsync(args);
    }
}
