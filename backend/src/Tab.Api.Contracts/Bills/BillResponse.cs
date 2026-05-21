namespace Tab.Api.Contracts.Bills;

public class BillResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Vendor { get; set; }
    public decimal ExpectedAmount { get; set; }
    public int DueDay { get; set; }
    public int SplitPercent { get; set; }
    public decimal SharePreview { get; set; }
    public DateOnly NextDueDate { get; set; }
    public bool IsArchived { get; set; }
}
