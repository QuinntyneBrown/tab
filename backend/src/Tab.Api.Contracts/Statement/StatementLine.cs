namespace Tab.Api.Contracts.Statement;

public class StatementLine
{
    public DateOnly Date { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal? TotalAmount { get; set; }
    public decimal Amount { get; set; }
    public decimal RunningBalance { get; set; }
}
