using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Time.Testing;
using Tab.Infrastructure.Persistence;

namespace Tab.Api.AcceptanceTests.Infrastructure;

public class TabApiFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection;
    public FakeTimeProvider Time { get; } = new(new DateTimeOffset(2026, 5, 21, 12, 0, 0, TimeSpan.Zero));

    public TabApiFactory()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            var dbDescriptor = services.Single(d => d.ServiceType == typeof(DbContextOptions<TabDbContext>));
            services.Remove(dbDescriptor);
            services.AddDbContext<TabDbContext>(opt => opt.UseSqlite(_connection));

            var clockDescriptors = services.Where(d => d.ServiceType == typeof(TimeProvider)).ToList();
            foreach (var d in clockDescriptors) services.Remove(d);
            services.AddSingleton<TimeProvider>(Time);

            using var scope = services.BuildServiceProvider().CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<TabDbContext>();
            db.Database.EnsureCreated();
        });
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _connection.Dispose();
        }
        base.Dispose(disposing);
    }
}
