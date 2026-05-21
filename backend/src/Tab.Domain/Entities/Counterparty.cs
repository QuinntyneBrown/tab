namespace Tab.Domain.Entities;

public class Counterparty
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = "Counterparty";
    public string? Note { get; set; }
    public DateTimeOffset CreatedUtc { get; set; }
}
