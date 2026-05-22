using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Tab.Infrastructure.Persistence;

namespace Tab.Cli.Services.Db;

public sealed class DatabaseMigrator : IDatabaseMigrator
{
    private readonly TabDbContext _db;
    private readonly ILogger<DatabaseMigrator> _logger;

    public DatabaseMigrator(TabDbContext db, ILogger<DatabaseMigrator> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task MigrateAsync(CancellationToken cancellationToken)
    {
        if (_db.Database.IsSqlite())
        {
            _logger.LogInformation("Sqlite provider detected; using EnsureCreatedAsync.");
            await _db.Database.EnsureCreatedAsync(cancellationToken);
            return;
        }

        var pending = (await _db.Database.GetPendingMigrationsAsync(cancellationToken)).ToList();
        if (pending.Count == 0)
        {
            _logger.LogInformation("Database is already up to date. No pending migrations.");
            return;
        }
        _logger.LogInformation("Applying {Count} pending migration(s): {Migrations}", pending.Count, string.Join(", ", pending));
        await _db.Database.MigrateAsync(cancellationToken);
        _logger.LogInformation("Database migrated to head.");
    }
}
