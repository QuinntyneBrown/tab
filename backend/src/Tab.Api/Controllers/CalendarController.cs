using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tab.Api.Contracts.Calendar;
using Tab.Application.Calendar;

namespace Tab.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/calendar")]
public class CalendarController : ControllerBase
{
    private readonly IMediator _mediator;
    public CalendarController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<CalendarResponse>> Get([FromQuery] GetCalendarQuery query, CancellationToken ct)
        => Ok(await _mediator.Send(query, ct));
}
