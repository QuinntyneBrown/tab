using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Tab.Cli.Hosting;

public static class CliHostBuilder
{
    public static IHost Build(string[] args)
    {
        var builder = Host.CreateApplicationBuilder(args);
        builder.Configuration.AddJsonFile("appsettings.json", optional: true);
        builder.Configuration.AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true);
        builder.Configuration.AddUserSecrets<Program>(optional: true);
        builder.Configuration.AddEnvironmentVariables(prefix: "TAB_");

        builder.Services.AddTabCli(builder.Configuration);

        return builder.Build();
    }
}
