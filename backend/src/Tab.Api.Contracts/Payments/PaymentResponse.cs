namespace Tab.Api.Contracts.Payments;

public class PaymentResponse
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public DateOnly Date { get; set; }
    public string? Method { get; set; }
    public string? Note { get; set; }
}
