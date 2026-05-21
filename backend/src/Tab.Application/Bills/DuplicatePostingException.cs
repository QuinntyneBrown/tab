namespace Tab.Application.Auth;

public class DuplicatePostingException : Exception
{
    public DuplicatePostingException() : base("Period already recorded for this bill.") { }
}
