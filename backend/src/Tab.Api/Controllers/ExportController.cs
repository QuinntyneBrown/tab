using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tab.Application.Export;

namespace Tab.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1")]
public class ExportController : ControllerBase
{
    private readonly IMediator _mediator;
    public ExportController(IMediator mediator) => _mediator = mediator;

    [HttpGet("export.csv")]
    public async Task<IActionResult> Export(CancellationToken ct)
    {
        var bytes = await _mediator.Send(new ExportLedgerCsvQuery(), ct);
        var filename = $"tab-statement-{DateTime.UtcNow:yyyy-MM-dd}.csv";
        Response.Headers.ContentDisposition = $"attachment; filename=\"{filename}\"";
        return File(bytes, "text/csv; charset=utf-8");
    }
}
