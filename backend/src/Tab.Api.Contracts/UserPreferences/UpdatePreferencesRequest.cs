namespace Tab.Api.Contracts.UserPreferences;

public class UpdatePreferencesRequest
{
    public string CurrencyCode { get; set; } = "CAD";
    public int DefaultSplitPercent { get; set; } = 50;
    public int ReminderDays { get; set; } = 3;
}
