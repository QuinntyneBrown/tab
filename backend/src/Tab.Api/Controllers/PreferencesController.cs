using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tab.Api.Contracts.UserPreferences;
using Tab.Application.UserPreferences;

namespace Tab.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/preferences")]
public class PreferencesController : ControllerBase
{
    private readonly IMediator _mediator;

    public PreferencesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PreferencesResponse>> Get(CancellationToken ct)
        => Ok(await _mediator.Send(new GetPreferencesQuery(), ct));

    [HttpPut]
    public async Task<ActionResult<PreferencesResponse>> Update([FromBody] UpdatePreferencesRequest body, CancellationToken ct)
        => Ok(await _mediator.Send(new UpdatePreferencesCommand(body.CurrencyCode, body.DefaultSplitPercent, body.ReminderDays, body.StatementTone), ct));
}
