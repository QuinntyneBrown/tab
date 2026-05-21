namespace Tab.Api.Contracts.Dashboard;

public class MonthlySummary
{
    public string Period { get; set; } = string.Empty;
    public decimal Lent { get; set; }
    public decimal Bills { get; set; }
    public decimal PaidBack { get; set; }
    public decimal NetChange { get; set; }
}
