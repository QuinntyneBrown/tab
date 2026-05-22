// Acceptance Test
// Traces to: L2-025
// Description: /oauth/token returns 429 with Retry-After after 5 failed attempts on the same account within 5 minutes.
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Tab.Api.AcceptanceTests.Infrastructure;
using Tab.Api.Contracts.Auth;

namespace Tab.Api.AcceptanceTests.Auth;

public class RateLimitAccountTests : IClassFixture<TabApiFactory>
{
    private readonly TabApiFactory _factory;

    public RateLimitAccountTests(TabApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task SixthFailedAttempt_OnSameAccount_Returns429WithRetryAfter()
    {
        var client = _factory.CreateClient();
        var email = "ratelimit-acct@example.com";
        await Register(client, email, "Correct!1");

        for (var i = 0; i < 5; i++)
        {
            var attempt = await client.PostAsJsonAsync("/api/v1/oauth/token", new TokenRequest
            {
                GrantType = "password",
                Email = email,
                Password = "Wrong!1"
            });
            attempt.StatusCode.Should().Be(HttpStatusCode.Unauthorized, $"attempt {i + 1} should be unauthorized");
        }

        var sixth = await client.PostAsJsonAsync("/api/v1/oauth/token", new TokenRequest
        {
            GrantType = "password",
            Email = email,
            Password = "Wrong!1"
        });
        sixth.StatusCode.Should().Be(HttpStatusCode.TooManyRequests);
        sixth.Headers.Contains("Retry-After").Should().BeTrue();
    }

    private static async Task Register(HttpClient client, string email, string password)
    {
        var resp = await client.PostAsJsonAsync("/api/v1/oauth/register", new RegisterRequest
        {
            Email = email,
            Password = password
        });
        resp.EnsureSuccessStatusCode();
    }
}
