namespace Tab.Api.Contracts.Payments;

public class CreatePaymentRequest
{
    public decimal Amount { get; set; }
    public DateOnly? Date { get; set; }
    public string? Method { get; set; }
    public string? Note { get; set; }
}
