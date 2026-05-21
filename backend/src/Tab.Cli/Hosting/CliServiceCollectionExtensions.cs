using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tab.Application;
using Tab.Cli.Abstractions;
using Tab.Cli.Commands.Db;
using Tab.Cli.Commands.Export;
using Tab.Cli.Commands.Import;
using Tab.Cli.Commands.Users;
using Tab.Cli.IO;
using Tab.Cli.Services.Db;
using Tab.Cli.Services.Export;
using Tab.Cli.Services.Import;
using Tab.Cli.Services.Users;
using Tab.Infrastructure;

namespace Tab.Cli.Hosting;

public static class CliServiceCollectionExtensions
{
    public static IServiceCollection AddTabCli(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddTabApplication();
        services.AddTabInfrastructure(configuration);

        // IO
        services.AddSingleton<ICsvReader, CsvReader>();
        services.AddSingleton<ICsvWriter, CsvWriter>();
        services.AddSingleton<IJsonFileSerializer, JsonFileSerializer>();

        // Domain services (scoped so they share ITabDbContext)
        services.AddScoped<IDatabaseMigrator, DatabaseMigrator>();
        services.AddScoped<IDatabaseResetter, DatabaseResetter>();
        services.AddScoped<IDatabaseSeeder, DemoDatabaseSeeder>();
        services.AddScoped<IUserAdministrator, UserAdministrator>();
        services.AddScoped<IUserSeeder, DemoUserSeeder>();
        services.AddScoped<IDataImporter<Domain.Entities.Loan>, LoanImporter>();
        services.AddScoped<IDataImporter<Domain.Entities.RecurringBill>, RecurringBillImporter>();
        services.AddScoped<IDataImporter<Domain.Entities.PaymentIn>, PaymentInImporter>();
        services.AddScoped<ILedgerImporter, LedgerImporter>();
        services.AddScoped<IDataExporter<Domain.Entities.Loan>, LoanExporter>();
        services.AddScoped<IDataExporter<Domain.Entities.RecurringBill>, RecurringBillExporter>();
        services.AddScoped<IDataExporter<Domain.Entities.PaymentIn>, PaymentInExporter>();
        services.AddScoped<ILedgerExporter, LedgerExporter>();

        // Commands — singletons; each handler opens its own scope.
        services.AddSingleton<RootCommandFactory>();
        services.AddSingleton<ICliCommand, DbCommand>();
        services.AddSingleton<ICliCommand, UsersCommand>();
        services.AddSingleton<ICliCommand, ImportCommand>();
        services.AddSingleton<ICliCommand, ExportCommand>();

        return services;
    }
}
