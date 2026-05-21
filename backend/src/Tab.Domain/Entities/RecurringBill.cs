namespace Tab.Domain.Entities;

public class RecurringBill
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CounterpartyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Vendor { get; set; }
    public decimal ExpectedAmount { get; set; }
    public int DueDay { get; set; }
    public int SplitPercent { get; set; }
    public DateTimeOffset? ArchivedUtc { get; set; }
    public DateTimeOffset CreatedUtc { get; set; }
}
