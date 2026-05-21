namespace Tab.Api.Contracts.Counterparties;

public class UpdateCounterpartyRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Note { get; set; }
}
