using MediatR;
using Tab.Api.Contracts.Counterparties;

namespace Tab.Application.Counterparties;

public record GetCounterpartyQuery : IRequest<CounterpartyResponse>;
