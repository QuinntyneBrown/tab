using MediatR;
using Tab.Api.Contracts.Bills;

namespace Tab.Application.Bills;

public record UpdateBillCommand(
    Guid Id,
    string Name,
    string? Vendor,
    decimal ExpectedAmount,
    int DueDay,
    int SplitPercent) : IRequest<BillResponse>;
