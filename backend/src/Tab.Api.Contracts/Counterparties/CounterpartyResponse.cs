namespace Tab.Api.Contracts.Counterparties;

public class CounterpartyResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Note { get; set; }
}
