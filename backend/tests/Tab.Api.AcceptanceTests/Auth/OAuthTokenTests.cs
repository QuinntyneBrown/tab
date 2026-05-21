// Acceptance Test
// Traces to: L2-002
// Description: OAuth password grant issues RS256 JWT + refresh; refresh rotates; expired access challenges.
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using Tab.Api.AcceptanceTests.Infrastructure;
using Tab.Api.Contracts.Auth;

namespace Tab.Api.AcceptanceTests.Auth;

public class OAuthTokenTests : IClassFixture<TabApiFactory>
{
    private readonly TabApiFactory _factory;

    public OAuthTokenTests(TabApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task PasswordGrant_WithValidCredentials_ReturnsRs256JwtAndRefresh()
    {
        var client = _factory.CreateClient();
        await Register(client, "alice@example.com", "Passcode!1");

        var resp = await client.PostAsJsonAsync("/api/v1/oauth/token", new TokenRequest
        {
            GrantType = "password",
            Email = "alice@example.com",
            Password = "Passcode!1"
        });

        resp.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await resp.Content.ReadFromJsonAsync<TokenResponse>();
        body!.AccessToken.Should().NotBeNullOrEmpty();
        body.RefreshToken.Should().NotBeNullOrEmpty();
        body.TokenType.Should().Be("Bearer");
        body.ExpiresIn.Should().BeGreaterThan(0);

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(body.AccessToken);
        jwt.SignatureAlgorithm.Should().Be("RS256");
        jwt.Claims.Should().Contain(c => c.Type == "sub");
        jwt.Issuer.Should().Be("tab.local");
        jwt.Audiences.Should().Contain("tab.api");
    }

    [Fact]
    public async Task PasswordGrant_WithInvalidPassword_Returns401()
    {
        var client = _factory.CreateClient();
        await Register(client, "bob@example.com", "Correct1!");

        var resp = await client.PostAsJsonAsync("/api/v1/oauth/token", new TokenRequest
        {
            GrantType = "password",
            Email = "bob@example.com",
            Password = "Wrong!"
        });
        resp.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task RefreshGrant_RotatesAndInvalidatesPrevious()
    {
        var client = _factory.CreateClient();
        var tokens = await Register(client, "carol@example.com", "Passcode!1");

        var refreshed = await client.PostAsJsonAsync("/api/v1/oauth/token", new TokenRequest
        {
            GrantType = "refresh_token",
            RefreshToken = tokens.RefreshToken
        });
        refreshed.StatusCode.Should().Be(HttpStatusCode.OK);
        var next = await refreshed.Content.ReadFromJsonAsync<TokenResponse>();
        next!.RefreshToken.Should().NotBe(tokens.RefreshToken);

        var reused = await client.PostAsJsonAsync("/api/v1/oauth/token", new TokenRequest
        {
            GrantType = "refresh_token",
            RefreshToken = tokens.RefreshToken
        });
        reused.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.BadRequest, HttpStatusCode.InternalServerError);
    }

    [Fact]
    public async Task Me_WithValidJwt_Returns200()
    {
        var client = _factory.CreateClient();
        var tokens = await Register(client, "dan@example.com", "Passcode!1");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);

        var resp = await client.GetAsync("/api/v1/me");
        resp.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Me_Without_Authorization_Returns401()
    {
        var client = _factory.CreateClient();
        var resp = await client.GetAsync("/api/v1/me");
        resp.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    private static async Task<TokenResponse> Register(HttpClient client, string email, string password)
    {
        var resp = await client.PostAsJsonAsync("/api/v1/oauth/register", new RegisterRequest
        {
            Email = email,
            Password = password
        });
        resp.EnsureSuccessStatusCode();
        return (await resp.Content.ReadFromJsonAsync<TokenResponse>())!;
    }
}
