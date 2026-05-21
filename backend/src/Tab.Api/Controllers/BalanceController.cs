using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tab.Api.Contracts.Balance;
using Tab.Application.Balance;

namespace Tab.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/balance")]
public class BalanceController : ControllerBase
{
    private readonly IMediator _mediator;
    public BalanceController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<BalanceResponse>> Get(CancellationToken ct)
        => Ok(await _mediator.Send(new GetBalanceQuery(), ct));
}
