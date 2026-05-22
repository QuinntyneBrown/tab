using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tab.Application.Abstractions;
using Tab.Infrastructure.Auth;
using Tab.Infrastructure.Persistence;

namespace Tab.Infrastructure;

public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddTabInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Tab")
            ?? "Server=(localdb)\\MSSQLLocalDB;Database=Tab;Trusted_Connection=True;Encrypt=False";

        var provider = configuration["Database:Provider"] ?? "SqlServer";
        services.AddDbContext<TabDbContext>(options =>
        {
            if (string.Equals(provider, "Sqlite", StringComparison.OrdinalIgnoreCase))
            {
                options.UseSqlite(connectionString);
            }
            else
            {
                options.UseSqlServer(connectionString);
            }
        });
        services.AddScoped<ITabDbContext>(sp => sp.GetRequiredService<TabDbContext>());

        services.AddSingleton(TimeProvider.System);

        services.Configure<PasswordHashingOptions>(configuration.GetSection(PasswordHashingOptions.SectionName));
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        services.AddSingleton<RsaKeyProvider>();
        services.AddSingleton<IJwtIssuer, RsaJwtIssuer>();
        services.AddSingleton<IPasswordHasher, Argon2idPasswordHasher>();
        services.AddScoped<ITokenService, TokenService>();
        return services;
    }
}
