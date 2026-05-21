namespace Tab.Cli.Models;

public sealed class RecurringBillCsvRow
{
    public string Name { get; set; } = string.Empty;
    public string? Vendor { get; set; }
    public string ExpectedAmount { get; set; } = string.Empty;
    public string DueDay { get; set; } = string.Empty;
    public string SplitPercent { get; set; } = string.Empty;
}
