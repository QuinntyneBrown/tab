using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Tab.Infrastructure.Persistence;

namespace Tab.Cli.Services.Db;

public sealed class DatabaseResetter : IDatabaseResetter
{
    private readonly TabDbContext _db;
    private readonly ILogger<DatabaseResetter> _logger;

    public DatabaseResetter(TabDbContext db, ILogger<DatabaseResetter> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task ResetAsync(bool force, CancellationToken cancellationToken)
    {
        if (!force)
        {
            _logger.LogWarning("Refusing to reset: pass --force to confirm.");
            return;
        }
        _logger.LogWarning("Dropping database...");
        await _db.Database.EnsureDeletedAsync(cancellationToken);
        _logger.LogInformation("Recreating database from migrations...");
        await _db.Database.MigrateAsync(cancellationToken);
        _logger.LogInformation("Database reset complete.");
    }
}
