namespace Tab.Domain.Entities;

public class BillPosting
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CounterpartyId { get; set; }
    public Guid RecurringBillId { get; set; }
    public string Period { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal ShareAmount { get; set; }
    public DateOnly Date { get; set; }
    public DateTimeOffset CreatedUtc { get; set; }
}
