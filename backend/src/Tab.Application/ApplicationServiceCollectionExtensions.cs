using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Tab.Application.Common;

namespace Tab.Application;

public static class ApplicationServiceCollectionExtensions
{
    public static IServiceCollection AddTabApplication(this IServiceCollection services)
    {
        var assembly = typeof(ApplicationServiceCollectionExtensions).Assembly;
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);
            cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });
        services.AddValidatorsFromAssembly(assembly);
        return services;
    }
}
