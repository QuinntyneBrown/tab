using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Tab.Application;

public static class ApplicationServiceCollectionExtensions
{
    public static IServiceCollection AddTabApplication(this IServiceCollection services)
    {
        var assembly = typeof(ApplicationServiceCollectionExtensions).Assembly;
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));
        services.AddValidatorsFromAssembly(assembly);
        return services;
    }
}
