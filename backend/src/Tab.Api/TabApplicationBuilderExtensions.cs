using Tab.Api.Middleware;

namespace Tab.Api;

public static class TabApplicationBuilderExtensions
{
    public static WebApplication UseTabPipeline(this WebApplication app)
    {
        app.UseMiddleware<CorrelationIdMiddleware>();
        app.UseMiddleware<SecurityHeadersMiddleware>();
        app.UseMiddleware<ExceptionHandlingMiddleware>();
        if (!app.Environment.IsDevelopment() && !string.Equals(app.Environment.EnvironmentName, "Testing", StringComparison.OrdinalIgnoreCase))
        {
            app.UseHttpsRedirection();
        }
        app.UseAuthentication();
        app.UseAuthorization();
        return app;
    }
}
