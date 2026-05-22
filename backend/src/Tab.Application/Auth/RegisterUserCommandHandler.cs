using MediatR;
using Microsoft.EntityFrameworkCore;
using Tab.Application.Abstractions;
using Tab.Domain.Entities;

namespace Tab.Application.Auth;

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, Guid>
{
    private readonly ITabDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly TimeProvider _timeProvider;

    public RegisterUserCommandHandler(ITabDbContext db, IPasswordHasher hasher, TimeProvider timeProvider)
    {
        _db = db;
        _hasher = hasher;
        _timeProvider = timeProvider;
    }

    public async Task<Guid> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        var normalized = (request.Email ?? string.Empty).Trim().ToLowerInvariant();
        var now = _timeProvider.GetUtcNow();

        if (await _db.Users.AnyAsync(u => u.Email == normalized, cancellationToken))
        {
            throw new EmailAlreadyRegisteredException();
        }

        var userId = Guid.NewGuid();
        _db.Users.Add(new User
        {
            Id = userId,
            Email = normalized,
            PasswordHash = _hasher.Hash(request.Password),
            CreatedUtc = now
        });
        _db.Counterparties.Add(new Counterparty
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = "Counterparty",
            CreatedUtc = now
        });
        _db.Preferences.Add(new Preferences
        {
            UserId = userId,
            CurrencyCode = "CAD",
            DefaultSplitPercent = 50,
            ReminderDays = 3,
            UpdatedUtc = now
        });
        await _db.SaveChangesAsync(cancellationToken);
        return userId;
    }
}
