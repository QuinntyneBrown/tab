// Acceptance Test
// Traces to: L2-025
// Description: /oauth/token returns 429 when 6th request from the same IP within 5 minutes hits, even across different accounts.
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Tab.Api.AcceptanceTests.Infrastructure;
using Tab.Api.Contracts.Auth;

namespace Tab.Api.AcceptanceTests.Auth;

public class RateLimitIpTests : IClassFixture<TabApiFactory>
{
    private readonly TabApiFactory _factory;

    public RateLimitIpTests(TabApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task SixthAttempt_FromSameIpAcrossAccounts_Returns429()
    {
        var client = _factory.CreateClient();

        for (var i = 0; i < 5; i++)
        {
            var email = $"ip-ratelimit-{i}@example.com";
            await Register(client, email, "Correct!1");
            var attempt = await client.PostAsJsonAsync("/api/v1/oauth/token", new TokenRequest
            {
                GrantType = "password",
                Email = email,
                Password = "Wrong!1"
            });
            attempt.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        var newEmail = "ip-ratelimit-overflow@example.com";
        await Register(client, newEmail, "Correct!1");
        var sixth = await client.PostAsJsonAsync("/api/v1/oauth/token", new TokenRequest
        {
            GrantType = "password",
            Email = newEmail,
            Password = "Correct!1"
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
