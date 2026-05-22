using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Serilog.Context;

namespace Tab.Api.Middleware;

public class UserIdEnricherMiddleware
{
    private readonly RequestDelegate _next;

    public UserIdEnricherMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        var sub = context.User?.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(sub))
        {
            using (LogContext.PushProperty("UserId", sub))
            {
                await _next(context);
            }
        }
        else
        {
            await _next(context);
        }
    }
}
