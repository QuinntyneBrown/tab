namespace Tab.Cli.Models;

public sealed class PaymentInCsvRow
{
    public string Date { get; set; } = string.Empty;
    public string Amount { get; set; } = string.Empty;
    public string? Method { get; set; }
    public string? Note { get; set; }
}
