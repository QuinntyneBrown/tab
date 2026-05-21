using MediatR;

namespace Tab.Application.Loans;

public record DeleteLoanCommand(Guid Id) : IRequest<Unit>;
