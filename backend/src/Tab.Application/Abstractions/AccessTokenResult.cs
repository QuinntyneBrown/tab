namespace Tab.Application.Abstractions;

public record AccessTokenResult(string Token, DateTimeOffset ExpiresUtc, int ExpiresInSeconds);
