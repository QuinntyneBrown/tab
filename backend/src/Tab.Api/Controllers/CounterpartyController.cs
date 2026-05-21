using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tab.Api.Contracts.Counterparties;
using Tab.Application.Counterparties;

namespace Tab.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/counterparty")]
public class CounterpartyController : ControllerBase
{
    private readonly IMediator _mediator;

    public CounterpartyController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<CounterpartyResponse>> Get(CancellationToken ct)
        => Ok(await _mediator.Send(new GetCounterpartyQuery(), ct));

    [HttpPut]
    public async Task<ActionResult<CounterpartyResponse>> Update([FromBody] UpdateCounterpartyRequest body, CancellationToken ct)
        => Ok(await _mediator.Send(new UpdateCounterpartyCommand(body.Name, body.Note), ct));
}
