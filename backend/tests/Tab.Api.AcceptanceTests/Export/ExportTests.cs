// Acceptance Test
// Traces to: L2-022
// Description: CSV export contains header + one row per entry; comma fields are RFC 4180 quoted.
using FluentAssertions;
using System.Net.Http.Json;
using Tab.Api.AcceptanceTests.Infrastructure;
using Tab.Api.Contracts.Loans;

namespace Tab.Api.AcceptanceTests.Export;

public class ExportTests : IClassFixture<TabApiFactory>
{
    private readonly TabApiFactory _factory;
    public ExportTests(TabApiFactory factory) => _factory = factory;

    [Fact]
    public async Task Export_ContainsHeaderAndQuotesCommaFields()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "gail@example.com", "Passcode!1");
        await client.PostAsJsonAsync("/api/v1/loans", new CreateLoanRequest
        {
            Amount = 12.34m,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            Description = "Apples, Oranges, and \"Pears\""
        });
        await client.PostAsJsonAsync("/api/v1/loans", new CreateLoanRequest
        {
            Amount = 5m,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            Description = "Plain"
        });

        var resp = await client.GetAsync("/api/v1/export.csv");
        resp.IsSuccessStatusCode.Should().BeTrue();
        resp.Content.Headers.ContentType!.MediaType.Should().Be("text/csv");

        var csv = await resp.Content.ReadAsStringAsync();
        var lines = csv.Split("\r\n", StringSplitOptions.RemoveEmptyEntries);
        lines.First().Should().Be("date,type,description,total_amount,counterparty_share,method,note");
        lines.Should().HaveCount(3);
        csv.Should().Contain("\"Apples, Oranges, and \"\"Pears\"\"\"");
    }
}
