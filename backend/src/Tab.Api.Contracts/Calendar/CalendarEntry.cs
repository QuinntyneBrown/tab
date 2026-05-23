namespace Tab.Api.Contracts.Calendar;

public class CalendarEntry
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    /// <summary>
    /// Vendor for `bill` rows (e.g. "Bell"), method for `loan`/`payment` rows
    /// (e.g. "Cash", "e-Transfer"). Empty for entries that lack it.
    /// </summary>
    public string Meta { get; set; } = string.Empty;
    /// <summary>Split percentage for `bill` rows (1–99). Zero for other types.</summary>
    public int SplitPercent { get; set; }
}
