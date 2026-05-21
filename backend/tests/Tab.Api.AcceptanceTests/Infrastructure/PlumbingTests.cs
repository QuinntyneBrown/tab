// Acceptance Test
// Traces to: L2-024, L2-034, L2-046
// Description: Correlation IDs, security headers, and Problem Details errors flow through the pipeline.
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Tab.Api.Contracts.Auth;

namespace Tab.Api.AcceptanceTests.Infrastructure;

public class PlumbingTests : IClassFixture<TabApiFactory>
{
    private readonly TabApiFactory _factory;

    public PlumbingTests(TabApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task EveryResponse_Includes_CorrelationId_Header()
    {
        var client = _factory.CreateClient();
        var resp = await client.GetAsync("/api/v1/me");
        resp.Headers.TryGetValues("X-Correlation-Id", out var values).Should().BeTrue();
        values!.Single().Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Response_Echoes_ProvidedCorrelationId()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Correlation-Id", "abc-123");
        var resp = await client.GetAsync("/api/v1/me");
        resp.Headers.GetValues("X-Correlation-Id").Single().Should().Be("abc-123");
    }

    [Fact]
    public async Task Response_Includes_SecurityHeaders()
    {
        var client = _factory.CreateClient();
        var resp = await client.GetAsync("/api/v1/me");
        resp.Headers.GetValues("Strict-Transport-Security").Single().Should().Contain("max-age=31536000");
        resp.Headers.GetValues("X-Content-Type-Options").Single().Should().Be("nosniff");
        resp.Headers.GetValues("Referrer-Policy").Single().Should().Be("strict-origin-when-cross-origin");
        resp.Headers.GetValues("Content-Security-Policy").Single().Should().Contain("default-src 'none'");
    }

    [Fact]
    public async Task InvalidCredentials_Returns_ProblemDetails_With_TraceId()
    {
        var client = _factory.CreateClient();
        var resp = await client.PostAsJsonAsync("/api/v1/oauth/token", new TokenRequest
        {
            GrantType = "password",
            Email = "missing@example.com",
            Password = "x"
        });
        resp.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        resp.Content.Headers.ContentType!.MediaType.Should().Be("application/problem+json");
        var body = await resp.Content.ReadAsStringAsync();
        body.Should().Contain("traceId");
    }
}
