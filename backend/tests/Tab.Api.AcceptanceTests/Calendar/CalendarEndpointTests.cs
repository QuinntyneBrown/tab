// Acceptance Test
// Traces to: L2-055
// Description: GET /api/v1/calendar — composite payload of posted entries +
// projected bill postings, with range validation and per-user isolation.
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Tab.Api.AcceptanceTests.Infrastructure;
using Tab.Api.Contracts.Calendar;

namespace Tab.Api.AcceptanceTests.Calendar;

public class CalendarEndpointTests : IClassFixture<TabApiFactory>
{
    private readonly TabApiFactory _factory;
    public CalendarEndpointTests(TabApiFactory factory) => _factory = factory;

    [Fact]
    public async Task EmptyAccount_ReturnsEmptyEntriesAndProjections()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "cal-empty@example.com", "Passcode!1");

        var resp = await client.GetAsync("/api/v1/calendar?from=2026-05-01&to=2026-05-31");
        resp.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = (await resp.Content.ReadFromJsonAsync<CalendarResponse>())!;
        body.Entries.Should().BeEmpty();
        body.Projections.Should().BeEmpty();
        body.From.Should().Be(new DateOnly(2026, 5, 1));
        body.To.Should().Be(new DateOnly(2026, 5, 31));
    }

    [Fact]
    public async Task MissingFrom_ReturnsValidationProblem()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "cal-missing-from@example.com", "Passcode!1");

        var resp = await client.GetAsync("/api/v1/calendar?to=2026-05-31");
        resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        resp.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
    }

    [Fact]
    public async Task MissingTo_ReturnsValidationProblem()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "cal-missing-to@example.com", "Passcode!1");

        var resp = await client.GetAsync("/api/v1/calendar?from=2026-05-01");
        resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task RangeExceeding366Days_ReturnsValidationProblem()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "cal-range@example.com", "Passcode!1");

        var resp = await client.GetAsync("/api/v1/calendar?from=2025-01-01&to=2026-06-01");
        resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();
        var resp = await client.GetAsync("/api/v1/calendar?from=2026-05-01&to=2026-05-31");
        resp.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UserA_DoesNotSeeUserBEntries()
    {
        var alice = await AuthenticatedClient.CreateAsync(_factory, "cal-alice@example.com", "Passcode!1");
        var bob = await AuthenticatedClient.CreateAsync(_factory, "cal-bob@example.com", "Passcode!1");

        await bob.PostAsJsonAsync("/api/v1/loans", new Tab.Api.Contracts.Loans.CreateLoanRequest
        {
            Amount = 75m,
            Date = new DateOnly(2026, 5, 10),
            Description = "Bob's loan"
        });

        var resp = await alice.GetAsync("/api/v1/calendar?from=2026-05-01&to=2026-05-31");
        resp.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = (await resp.Content.ReadFromJsonAsync<CalendarResponse>())!;
        body.Entries.Should().BeEmpty();
    }
}
