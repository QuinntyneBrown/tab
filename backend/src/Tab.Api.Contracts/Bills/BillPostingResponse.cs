namespace Tab.Api.Contracts.Bills;

public class BillPostingResponse
{
    public Guid Id { get; set; }
    public Guid RecurringBillId { get; set; }
    public string Period { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal ShareAmount { get; set; }
}
