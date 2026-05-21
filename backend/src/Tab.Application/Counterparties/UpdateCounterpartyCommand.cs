using MediatR;
using Tab.Api.Contracts.Counterparties;

namespace Tab.Application.Counterparties;

public record UpdateCounterpartyCommand(string Name, string? Note) : IRequest<CounterpartyResponse>;
