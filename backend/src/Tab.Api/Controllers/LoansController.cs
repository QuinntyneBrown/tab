using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tab.Api.Contracts.Ledger;
using Tab.Api.Contracts.Loans;
using Tab.Application.Ledger;
using Tab.Application.Loans;

namespace Tab.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/loans")]
public class LoansController : ControllerBase
{
    private readonly IMediator _mediator;

    public LoansController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<LedgerEntryResponse>>> List([FromQuery] string? month, [FromQuery] string? type, CancellationToken ct)
        => Ok(await _mediator.Send(new ListLedgerQuery(month, type), ct));

    [HttpPost]
    public async Task<ActionResult<LoanResponse>> Create([FromBody] CreateLoanRequest body, CancellationToken ct)
    {
        var response = await _mediator.Send(
            new CreateLoanCommand(body.Amount, body.Date, body.Description, body.Method, body.Note), ct);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<LoanResponse>> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetLoanByIdQuery(id), ct));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<LoanResponse>> Update(Guid id, [FromBody] UpdateLoanRequest body, CancellationToken ct)
        => Ok(await _mediator.Send(
            new UpdateLoanCommand(id, body.Amount, body.Date, body.Description, body.Method, body.Note), ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteLoanCommand(id), ct);
        return NoContent();
    }
}
