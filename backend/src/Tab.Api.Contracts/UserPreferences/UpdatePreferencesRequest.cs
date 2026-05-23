using System.Text.Json.Serialization;

namespace Tab.Api.Contracts.UserPreferences;

public class UpdatePreferencesRequest
{
    [JsonPropertyName("currency")]
    public string CurrencyCode { get; set; } = "CAD";

    [JsonPropertyName("defaultSplitPercent")]
    public int DefaultSplitPercent { get; set; } = 50;

    [JsonPropertyName("reminderLeadDays")]
    public int ReminderDays { get; set; } = 3;
}
