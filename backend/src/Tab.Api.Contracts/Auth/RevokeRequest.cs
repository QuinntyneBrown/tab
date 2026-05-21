using System.Text.Json.Serialization;

namespace Tab.Api.Contracts.Auth;

public class RevokeRequest
{
    [JsonPropertyName("refresh_token")]
    public string RefreshToken { get; set; } = string.Empty;
}
