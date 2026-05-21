namespace Tab.Application.Abstractions;

public record IssuedTokenPair(
    string AccessToken,
    int ExpiresInSeconds,
    string RefreshToken,
    DateTimeOffset RefreshExpiresUtc);
