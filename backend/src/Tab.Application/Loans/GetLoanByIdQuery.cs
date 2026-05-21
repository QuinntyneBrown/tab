using MediatR;
using Tab.Api.Contracts.Loans;

namespace Tab.Application.Loans;

public record GetLoanByIdQuery(Guid Id) : IRequest<LoanResponse>;
