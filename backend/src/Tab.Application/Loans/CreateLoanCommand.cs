using MediatR;
using Tab.Api.Contracts.Loans;

namespace Tab.Application.Loans;

public record CreateLoanCommand(
    decimal Amount,
    DateOnly Date,
    string Description,
    string? Method,
    string? Note) : IRequest<LoanResponse>;
