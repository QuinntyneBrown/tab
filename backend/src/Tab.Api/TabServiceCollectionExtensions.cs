using System.IdentityModel.Tokens.Jwt;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Tab.Api.Auth;
using Tab.Application;
using Tab.Application.Abstractions;
using Tab.Infrastructure;
using Tab.Infrastructure.Auth;

namespace Tab.Api;

public static class TabServiceCollectionExtensions
{
    public const string TokenIpPolicy = "token-by-ip";
    public const string TokenAccountPolicy = "token-by-account";

    public static IServiceCollection AddTabServices(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        services.AddControllers();
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddTabApplication();
        services.AddTabInfrastructure(configuration);
        services.AddTabAuthentication();
        services.AddAuthorization();
        services.AddTabRateLimiting();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "Tab API", Version = "v1" });
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header
            });
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
                    Array.Empty<string>()
                }
            });
        });
        return services;
    }

    private static IServiceCollection AddTabAuthentication(this IServiceCollection services)
    {
        JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer();

        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<IOptions<JwtOptions>, RsaKeyProvider>((options, jwtOptions, keys) =>
            {
                var jwt = jwtOptions.Value;
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

    private static IServiceCollection AddTabRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = (context, _) =>
            {
                context.HttpContext.Response.Headers["Retry-After"] = "300";
                return ValueTask.CompletedTask;
            };

            options.AddPolicy(TokenIpPolicy, http =>
            {
                var ip = http.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 10,
                    Window = TimeSpan.FromMinutes(5),
                    QueueLimit = 0
                });
            });

            options.AddPolicy(TokenAccountPolicy, http =>
            {
                http.Request.EnableBuffering();
                http.Request.Body.Position = 0;
                using var reader = new StreamReader(http.Request.Body, leaveOpen: true);
                var body = reader.ReadToEndAsync().GetAwaiter().GetResult();
                http.Request.Body.Position = 0;
                var email = ExtractEmail(body);
                var key = $"acct:{email.Trim().ToLowerInvariant()}";
                return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 5,
                    Window = TimeSpan.FromMinutes(5),
                    QueueLimit = 0
                });
            });
        });
        return services;
    }

    private static string ExtractEmail(string body)
    {
        if (string.IsNullOrWhiteSpace(body)) return string.Empty;
        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("email", out var email) && email.ValueKind == System.Text.Json.JsonValueKind.String)
            {
                return email.GetString() ?? string.Empty;
            }
        }
        catch
        {
        }
        return string.Empty;
    }
}
