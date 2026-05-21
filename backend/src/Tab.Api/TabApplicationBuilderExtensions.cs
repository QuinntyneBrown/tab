namespace Tab.Api;

public static class TabApplicationBuilderExtensions
{
    public static WebApplication UseTabPipeline(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }
        app.UseAuthorization();
        return app;
    }
}
