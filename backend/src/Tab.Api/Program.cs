using Microsoft.EntityFrameworkCore;
using Tab.Api;
using Tab.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddTabServices(builder.Configuration, builder.Environment);

var app = builder.Build();
app.UseTabPipeline();
app.MapControllers();

if (string.Equals(builder.Configuration["Database:Provider"], "Sqlite", StringComparison.OrdinalIgnoreCase))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<TabDbContext>();
    await db.Database.EnsureCreatedAsync();
}

await app.RunAsync();

namespace Tab.Api
{
    public partial class Program;
}
