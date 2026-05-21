namespace Tab.Api.Contracts.Balance;

public class BalanceResponse
{
    public decimal Amount { get; set; }
    public DateTimeOffset AsOf { get; set; }
}
