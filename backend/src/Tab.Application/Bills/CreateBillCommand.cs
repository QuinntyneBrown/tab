using MediatR;
using Tab.Api.Contracts.Bills;

namespace Tab.Application.Bills;

public record CreateBillCommand(
    string Name,
    string? Vendor,
    decimal ExpectedAmount,
    int DueDay,
    int SplitPercent) : IRequest<BillResponse>;
