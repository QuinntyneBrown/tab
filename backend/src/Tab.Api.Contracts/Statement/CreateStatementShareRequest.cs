namespace Tab.Api.Contracts.Statement;

public class CreateStatementShareRequest
{
    public DateOnly? From { get; set; }
    public DateOnly? To { get; set; }
}
