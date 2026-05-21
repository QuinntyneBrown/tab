namespace Tab.Application.Abstractions;

public interface IJwtIssuer
{
    AccessTokenResult IssueAccessToken(Guid userId, string email);
}
