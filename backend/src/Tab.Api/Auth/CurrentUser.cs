using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Tab.Application.Abstractions;

namespace Tab.Api.Auth;

public class CurrentUser : ICurrentUser
{
    public CurrentUser(IHttpContextAccessor accessor)
    {
        var principal = accessor.HttpContext?.User;
        if (principal?.Identity?.IsAuthenticated == true)
        {
            var sub = principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(sub, out var id))
            {
                Id = id;
                IsAuthenticated = true;
            }
        }
    }

    public Guid Id { get; }
    public bool IsAuthenticated { get; }
}
