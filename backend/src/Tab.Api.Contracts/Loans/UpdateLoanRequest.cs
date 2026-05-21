namespace Tab.Api.Contracts.Loans;

public class UpdateLoanRequest
{
    public decimal Amount { get; set; }
    public DateOnly Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Method { get; set; }
    public string? Note { get; set; }
}
