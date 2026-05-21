using Microsoft.EntityFrameworkCore;
using Tab.Application.Abstractions;
using Tab.Domain.Entities;

namespace Tab.Cli.Services.Export;

public static class ExportUserResolver
{
    public static async Task<User> ResolveAsync(ITabDbContext db, string email, CancellationToken ct)
    {
        var normalized = email.Trim().ToLowerInvariant();
        return await db.Users.FirstOrDefaultAsync(u => u.Email == normalized, ct)
            ?? throw new InvalidOperationException($"User <{email}> not found.");
    }
}
