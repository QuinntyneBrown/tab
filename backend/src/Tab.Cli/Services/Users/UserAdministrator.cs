using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Tab.Application.Abstractions;
using Tab.Application.Auth;
using Tab.Domain.Entities;

namespace Tab.Cli.Services.Users;

public sealed class UserAdministrator : IUserAdministrator
{
    private readonly ITabDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IMediator _mediator;
    private readonly ILogger<UserAdministrator> _logger;

    public UserAdministrator(ITabDbContext db, IPasswordHasher hasher, IMediator mediator, ILogger<UserAdministrator> logger)
    {
        _db = db;
        _hasher = hasher;
        _mediator = mediator;
        _logger = logger;
    }

    public Task<Guid> CreateAsync(string email, string passcode, CancellationToken cancellationToken)
        => _mediator.Send(new RegisterUserCommand(email, passcode), cancellationToken);

    public async Task<IReadOnlyList<User>> ListAsync(CancellationToken cancellationToken)
        => await _db.Users.OrderBy(u => u.Email).ToListAsync(cancellationToken);

    public async Task<bool> DeleteAsync(string email, bool force, CancellationToken cancellationToken)
    {
        if (!force)
        {
            _logger.LogWarning("Refusing to delete <{Email}>: pass --force to confirm.", email);
            return false;
        }
        var normalized = email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalized, cancellationToken);
        if (user is null) return false;

        _db.Loans.RemoveRange(_db.Loans.Where(l => l.UserId == user.Id));
        _db.BillPostings.RemoveRange(_db.BillPostings.Where(p => p.UserId == user.Id));
        _db.RecurringBills.RemoveRange(_db.RecurringBills.Where(b => b.UserId == user.Id));
        _db.Payments.RemoveRange(_db.Payments.Where(p => p.UserId == user.Id));
        _db.StatementShares.RemoveRange(_db.StatementShares.Where(s => s.UserId == user.Id));
        _db.RefreshTokens.RemoveRange(_db.RefreshTokens.Where(r => r.UserId == user.Id));
        _db.Preferences.RemoveRange(_db.Preferences.Where(p => p.UserId == user.Id));
        _db.Counterparties.RemoveRange(_db.Counterparties.Where(c => c.UserId == user.Id));
        _db.Users.Remove(user);

        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task ResetPasscodeAsync(string email, string newPasscode, CancellationToken cancellationToken)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalized, cancellationToken)
            ?? throw new InvalidOperationException($"User <{email}> not found.");
        user.PasswordHash = _hasher.Hash(newPasscode);
        _db.RefreshTokens.RemoveRange(_db.RefreshTokens.Where(r => r.UserId == user.Id));
        await _db.SaveChangesAsync(cancellationToken);
    }
}
