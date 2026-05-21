namespace Tab.Cli.Models;

public sealed class LoanCsvRow
{
    public string Date { get; set; } = string.Empty;
    public string Amount { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Method { get; set; }
    public string? Note { get; set; }
}
