using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tab.Api.Contracts.Bills;
using Tab.Application.Bills;

namespace Tab.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/bills")]
public class BillsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BillsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BillResponse>>> List(CancellationToken ct)
        => Ok(await _mediator.Send(new ListBillsQuery(), ct));

    [HttpPost]
    public async Task<ActionResult<BillResponse>> Create([FromBody] CreateBillRequest body, CancellationToken ct)
    {
        var bill = await _mediator.Send(
            new CreateBillCommand(body.Name, body.Vendor, body.ExpectedAmount, body.DueDay, body.SplitPercent), ct);
        return CreatedAtAction(nameof(List), null, bill);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BillResponse>> Update(Guid id, [FromBody] UpdateBillRequest body, CancellationToken ct)
        => Ok(await _mediator.Send(
            new UpdateBillCommand(id, body.Name, body.Vendor, body.ExpectedAmount, body.DueDay, body.SplitPercent), ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new ArchiveBillCommand(id), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/postings")]
    public async Task<ActionResult<BillPostingResponse>> Post(Guid id, [FromBody] CreateBillPostingRequest body, CancellationToken ct)
    {
        var resp = await _mediator.Send(
            new CreateBillPostingCommand(id, body.Period, body.Date, body.ActualTotal), ct);
        return Created(string.Empty, resp);
    }
}
