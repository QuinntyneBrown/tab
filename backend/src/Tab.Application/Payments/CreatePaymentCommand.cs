using MediatR;
using Tab.Api.Contracts.Payments;

namespace Tab.Application.Payments;

public record CreatePaymentCommand(
    decimal Amount,
    DateOnly? Date,
    string? Method,
    string? Note) : IRequest<PaymentResponse>;
