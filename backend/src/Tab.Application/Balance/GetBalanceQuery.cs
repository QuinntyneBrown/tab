using MediatR;
using Tab.Api.Contracts.Balance;

namespace Tab.Application.Balance;

public record GetBalanceQuery : IRequest<BalanceResponse>;
