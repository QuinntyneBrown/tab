using Tab.Api;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddTabServices(builder.Configuration, builder.Environment);

var app = builder.Build();
app.UseTabPipeline();
app.MapControllers();

await app.RunAsync();

namespace Tab.Api
{
    public partial class Program;
}
