namespace Tab.Api.Contracts.Ledger;

public class LedgerEntryResponse
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal? TotalAmount { get; set; }
    public string? Method { get; set; }
    public string? Note { get; set; }
}
