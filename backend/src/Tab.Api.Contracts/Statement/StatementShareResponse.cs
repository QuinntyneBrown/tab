namespace Tab.Api.Contracts.Statement;

public class StatementShareResponse
{
    public string Token { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public DateTimeOffset ExpiresUtc { get; set; }
}
