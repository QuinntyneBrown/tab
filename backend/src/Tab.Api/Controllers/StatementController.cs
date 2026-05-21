using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tab.Api.Contracts.Statement;
using Tab.Application.Statement;

namespace Tab.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/statement")]
public class StatementController : ControllerBase
{
    private readonly IMediator _mediator;
    public StatementController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<StatementResponse>> Get([FromQuery] DateOnly? from, [FromQuery] DateOnly? to, CancellationToken ct)
        => Ok(await _mediator.Send(new GetStatementQuery(from, to), ct));

    [HttpPost("share")]
    public async Task<ActionResult<StatementShareResponse>> Share([FromBody] CreateStatementShareRequest body, CancellationToken ct)
        => Ok(await _mediator.Send(new CreateStatementShareCommand(body.From, body.To), ct));
}
