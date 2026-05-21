using MediatR;
using Tab.Api.Contracts.Bills;

namespace Tab.Application.Bills;

public record ListBillsQuery(bool IncludeArchived = false) : IRequest<IReadOnlyList<BillResponse>>;
