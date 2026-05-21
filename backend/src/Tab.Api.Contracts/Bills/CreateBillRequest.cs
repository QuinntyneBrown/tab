namespace Tab.Api.Contracts.Bills;

public class CreateBillRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Vendor { get; set; }
    public decimal ExpectedAmount { get; set; }
    public int DueDay { get; set; }
    public int SplitPercent { get; set; }
}
