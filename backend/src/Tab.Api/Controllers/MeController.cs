using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tab.Application.Abstractions;

namespace Tab.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/me")]
public class MeController : ControllerBase
{
    private readonly ICurrentUser _currentUser;
    private readonly ITabDbContext _db;

    public MeController(ICurrentUser currentUser, ITabDbContext db)
    {
        _currentUser = currentUser;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var u = await _db.Users.AsNoTracking()
            .Where(x => x.Id == _currentUser.Id)
            .Select(x => new { x.Id, x.Email })
            .FirstOrDefaultAsync(ct);
        if (u is null) return Unauthorized();
        // Display name defaults to the email's local part (before the @) until
        // the User entity gains a separate display-name column.
        var atIdx = u.Email.IndexOf('@');
        var displayName = atIdx > 0 ? Title(u.Email.Substring(0, atIdx)) : u.Email;
        return Ok(new { id = u.Id, email = u.Email, displayName });
    }

    private static string Title(string s)
    {
        // "quinntynebrown" → "Quinntyne Brown" isn't recoverable; we just
        // capitalise the local part so it reads as a name rather than the raw
        // email handle in greetings and avatar initials.
        if (string.IsNullOrEmpty(s)) return s;
        return char.ToUpperInvariant(s[0]) + s.Substring(1);
    }
}
