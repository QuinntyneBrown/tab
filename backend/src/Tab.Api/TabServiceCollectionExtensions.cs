using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Tab.Api.Auth;
using Tab.Application;
using Tab.Application.Abstractions;
using Tab.Infrastructure;
using Tab.Infrastructure.Auth;

namespace Tab.Api;

public static class TabServiceCollectionExtensions
{
    public static IServiceCollection AddTabServices(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        services.AddControllers();
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddTabApplication();
        services.AddTabInfrastructure(configuration);
        services.AddTabAuthentication();
        services.AddAuthorization();
        return services;
    }

    private static IServiceCollection AddTabAuthentication(this IServiceCollection services)
    {
        JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                var sp = services.BuildServiceProvider();
                var jwt = sp.GetRequiredService<IOptions<JwtOptions>>().Value;
                var keys = sp.GetRequiredService<RsaKeyProvider>();

                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidIssuer = jwt.Issuer,
                    ValidAudience = jwt.Audience,
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new RsaSecurityKey(keys.Rsa) { KeyId = "tab-rsa-1" },
                    ClockSkew = TimeSpan.FromSeconds(jwt.ClockSkewSeconds),
                    NameClaimType = JwtRegisteredClaimNames.Sub
                };
            });
        return services;
    }
}
