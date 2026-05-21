// Integration Test
// Traces to: L2-025, L2-047, L2-048
// Description: TabDbContext schema applies cleanly and persists a User + Counterparty round-trip.
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Tab.Domain.Entities;
using Tab.Infrastructure.Persistence;

namespace Tab.Infrastructure.IntegrationTests;

public class TabDbContextSchemaTests
{
    [Fact]
    public async Task SchemaCreates_And_RoundTripsUserAndCounterparty()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<TabDbContext>()
            .UseSqlite(connection)
            .Options;

        await using (var ctx = new TabDbContext(options))
        {
            await ctx.Database.EnsureCreatedAsync();

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = "user@example.com",
                PasswordHash = "hash",
                CreatedUtc = DateTimeOffset.UtcNow
            };
            var cp = new Counterparty
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Name = "Raymond",
                CreatedUtc = DateTimeOffset.UtcNow
            };

            ctx.Users.Add(user);
            ctx.Counterparties.Add(cp);
            await ctx.SaveChangesAsync(CancellationToken.None);
        }

        await using (var ctx = new TabDbContext(options))
        {
            var users = await ctx.Users.AsNoTracking().ToListAsync();
            var cps = await ctx.Counterparties.AsNoTracking().ToListAsync();

            users.Should().ContainSingle(u => u.Email == "user@example.com");
            cps.Should().ContainSingle(c => c.Name == "Raymond");
            cps.Single().UserId.Should().Be(users.Single().Id);
        }
    }

    [Fact]
    public async Task Migration_Creates_UniqueIndex_OnCounterpartyUserId()
    {
        var migrationFile = Path.Combine(
            AppContext.BaseDirectory, "..", "..", "..", "..", "..",
            "src", "Tab.Infrastructure", "Persistence", "Migrations");
        Directory.Exists(migrationFile).Should().BeTrue();
        var initial = Directory.GetFiles(migrationFile, "*_Initial.cs")
            .First(f => !f.EndsWith(".Designer.cs"));
        var contents = await File.ReadAllTextAsync(initial);
        contents.Should().Contain("name: \"IX_Counterparties_UserId\"");
        contents.Should().Contain("unique: true");
    }
}
