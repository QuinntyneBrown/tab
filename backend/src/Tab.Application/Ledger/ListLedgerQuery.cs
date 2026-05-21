using MediatR;
using Tab.Api.Contracts.Ledger;

namespace Tab.Application.Ledger;

public record ListLedgerQuery(string? Month, string? Type) : IRequest<IReadOnlyList<LedgerEntryResponse>>;
