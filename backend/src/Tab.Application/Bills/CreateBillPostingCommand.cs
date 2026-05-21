using MediatR;
using Tab.Api.Contracts.Bills;

namespace Tab.Application.Bills;

public record CreateBillPostingCommand(
    Guid BillId,
    string Period,
    DateOnly? Date,
    decimal? ActualTotal) : IRequest<BillPostingResponse>;
