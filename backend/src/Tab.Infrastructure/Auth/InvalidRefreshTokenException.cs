namespace Tab.Infrastructure.Auth;

public class InvalidRefreshTokenException : Exception
{
    public InvalidRefreshTokenException() : base("Refresh token is invalid, expired, or already used.") { }
}
