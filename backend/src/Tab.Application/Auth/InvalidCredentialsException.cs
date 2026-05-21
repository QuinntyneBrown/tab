namespace Tab.Application.Auth;

public class InvalidCredentialsException : Exception
{
    public InvalidCredentialsException() : base("Email or passcode is incorrect.") { }
}
