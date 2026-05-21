using MediatR;
using Microsoft.AspNetCore.Mvc;
using Tab.Api.Contracts.Auth;
using Tab.Application.Auth;

namespace Tab.Api.Controllers;

[ApiController]
[Route("api/v1/oauth")]
public class OAuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public OAuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("token")]
    public async Task<ActionResult<TokenResponse>> Token([FromBody] TokenRequest request, CancellationToken ct)
    {
        var response = request.GrantType switch
        {
            "password" => await _mediator.Send(new IssueTokenCommand(request.Email ?? string.Empty, request.Password ?? string.Empty), ct),
            "refresh_token" => await _mediator.Send(new RefreshTokenCommand(request.RefreshToken ?? string.Empty), ct),
            _ => null
        };
        return response is null
            ? BadRequest(new { error = "unsupported_grant_type" })
            : Ok(response);
    }

    [HttpPost("revoke")]
    public async Task<IActionResult> Revoke([FromBody] RevokeRequest request, CancellationToken ct)
    {
        await _mediator.Send(new RevokeTokenCommand(request.RefreshToken ?? string.Empty), ct);
        return NoContent();
    }

    [HttpPost("register")]
    public async Task<ActionResult<TokenResponse>> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        await _mediator.Send(new RegisterUserCommand(request.Email, request.Password), ct);
        var tokens = await _mediator.Send(new IssueTokenCommand(request.Email, request.Password), ct);
        return Ok(tokens);
    }
}
