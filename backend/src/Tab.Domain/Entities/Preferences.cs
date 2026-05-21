namespace Tab.Domain.Entities;

public class Preferences
{
    public Guid UserId { get; set; }
    public string CurrencyCode { get; set; } = "CAD";
    public int DefaultSplitPercent { get; set; } = 50;
    public int ReminderDays { get; set; } = 3;
    public string StatementTone { get; set; } = "Neutral";
    public DateTimeOffset UpdatedUtc { get; set; }
}
