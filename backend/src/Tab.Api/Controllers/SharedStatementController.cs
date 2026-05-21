using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tab.Api.Contracts.Statement;
using Tab.Application.Statement;

namespace Tab.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/v1/shared")]
public class SharedStatementController : ControllerBase
{
    private static readonly object PublicNotice = new { message = "This statement is no longer available" };
    private readonly IMediator _mediator;
    public SharedStatementController(IMediator mediator) => _mediator = mediator;

    [HttpGet("{token}")]
    public async Task<ActionResult<StatementResponse>> Get(string token, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetSharedStatementQuery(token), ct);
        return result is null ? NotFound(PublicNotice) : Ok(result);
    }
}
