namespace Tab.Api.Contracts.UserPreferences;

public class PreferencesResponse
{
    public string CurrencyCode { get; set; } = "CAD";
    public int DefaultSplitPercent { get; set; } = 50;
    public int ReminderDays { get; set; } = 3;
}
