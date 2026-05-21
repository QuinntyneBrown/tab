namespace Tab.Domain.Entities;

public class PaymentIn
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CounterpartyId { get; set; }
    public decimal Amount { get; set; }
    public DateOnly Date { get; set; }
    public string? Method { get; set; }
    public string? Note { get; set; }
    public DateTimeOffset CreatedUtc { get; set; }
}
