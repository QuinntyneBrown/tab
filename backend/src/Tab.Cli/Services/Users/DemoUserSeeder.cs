using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Tab.Application.Abstractions;
using Tab.Application.Auth;

namespace Tab.Cli.Services.Users;

public sealed class DemoUserSeeder : IUserSeeder
{
    private static readonly DemoUser[] Defaults =
    {
        new("admin@tab.local",  "Admin!2026"),
        new("quinn@tab.local",  "Quinn!2026"),
        new("demo@tab.local",   "Demo!2026"),
        // E2E primary fixture user (see e2e/fixtures/test-users.ts).
        new("quinntynebrown@gmail.com", "CorrectHorseBatteryStaple1!"),
        new("other.user@example.com",   "AnotherStrongPasscode2@"),
    };

    private readonly ITabDbContext _db;
    private readonly IMediator _mediator;
    private readonly ILogger<DemoUserSeeder> _logger;

    public DemoUserSeeder(ITabDbContext db, IMediator mediator, ILogger<DemoUserSeeder> logger)
    {
        _db = db;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<UserSeedResult> SeedAsync(CancellationToken cancellationToken)
    {
        int created = 0, existing = 0;
        foreach (var demo in Defaults)
        {
            var normalized = demo.Email.Trim().ToLowerInvariant();
            if (await _db.Users.AnyAsync(u => u.Email == normalized, cancellationToken))
            {
                existing++;
                continue;
            }
            await _mediator.Send(new RegisterUserCommand(demo.Email, demo.Passcode), cancellationToken);
            _logger.LogInformation("Created demo user <{Email}> with passcode '{Passcode}'.", demo.Email, demo.Passcode);
            created++;
        }
        return new UserSeedResult(created, existing);
    }
}
