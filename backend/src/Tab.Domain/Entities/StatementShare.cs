namespace Tab.Domain.Entities;

public class StatementShare
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateOnly FromDate { get; set; }
    public DateOnly ToDate { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTimeOffset ExpiresUtc { get; set; }
    public DateTimeOffset CreatedUtc { get; set; }
}
