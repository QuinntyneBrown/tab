using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tab.Api.Contracts.Payments;
using Tab.Application.Payments;

namespace Tab.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PaymentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<PaymentResponse>> Create([FromBody] CreatePaymentRequest body, CancellationToken ct)
    {
        var resp = await _mediator.Send(new CreatePaymentCommand(body.Amount, body.Date, body.Method, body.Note), ct);
        return Created(string.Empty, resp);
    }
}
