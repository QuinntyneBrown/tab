namespace Tab.Infrastructure.Auth;

public class JwtOptions
{
    public const string SectionName = "Jwt";
    public string Issuer { get; set; } = "tab.local";
    public string Audience { get; set; } = "tab.api";
    public int AccessTokenLifetimeMinutes { get; set; } = 30;
    public int RefreshTokenLifetimeDays { get; set; } = 14;
    public int ClockSkewSeconds { get; set; } = 30;
    public string RsaPrivateKeyPem { get; set; } = string.Empty;
    public string RsaPublicKeyPem { get; set; } = string.Empty;
}
