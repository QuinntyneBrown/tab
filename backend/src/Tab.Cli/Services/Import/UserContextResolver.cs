using Microsoft.EntityFrameworkCore;
using Tab.Application.Abstractions;
using Tab.Domain.Entities;

namespace Tab.Cli.Services.Import;

public static class UserContextResolver
{
    public static async Task<(User User, Counterparty Counterparty)> ResolveAsync(ITabDbContext db, string email, CancellationToken ct)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == normalized, ct)
            ?? throw new InvalidOperationException($"User <{email}> not found. Create them first with `users create`.");
        var counterparty = await db.Counterparties.FirstOrDefaultAsync(c => c.UserId == user.Id, ct)
            ?? throw new InvalidOperationException("Counterparty missing for user.");
        return (user, counterparty);
    }
}
