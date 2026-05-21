namespace Tab.Api.Contracts.Statement;

public class StatementResponse
{
    public DateOnly From { get; set; }
    public DateOnly To { get; set; }
    public IReadOnlyList<StatementLine> Lines { get; set; } = Array.Empty<StatementLine>();
    public decimal LoansTotal { get; set; }
    public decimal BillsTotal { get; set; }
    public decimal PaymentsTotal { get; set; }
    public decimal BalanceOwing { get; set; }
}
