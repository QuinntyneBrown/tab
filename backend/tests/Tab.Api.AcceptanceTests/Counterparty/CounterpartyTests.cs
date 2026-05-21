// Acceptance Test
// Traces to: L2-006
// Description: Default counterparty exists post-signup, can be renamed, and rejects empty names.
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Tab.Api.AcceptanceTests.Infrastructure;
using Tab.Api.Contracts.Counterparties;

namespace Tab.Api.AcceptanceTests.Counterparty;

public class CounterpartyTests : IClassFixture<TabApiFactory>
{
    private readonly TabApiFactory _factory;

    public CounterpartyTests(TabApiFactory factory) => _factory = factory;

    [Fact]
    public async Task DefaultCounterparty_ExistsAfterRegister()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "eve@example.com", "Passcode!1");
        var resp = await client.GetAsync("/api/v1/counterparty");
        resp.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await resp.Content.ReadFromJsonAsync<CounterpartyResponse>();
        body!.Name.Should().Be("Counterparty");
    }

    [Fact]
    public async Task RenameCounterparty_Persists()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "frank@example.com", "Passcode!1");
        var resp = await client.PutAsJsonAsync("/api/v1/counterparty", new UpdateCounterpartyRequest { Name = "Raymond Brown" });
        resp.StatusCode.Should().Be(HttpStatusCode.OK);

        var refetch = await client.GetFromJsonAsync<CounterpartyResponse>("/api/v1/counterparty");
        refetch!.Name.Should().Be("Raymond Brown");
    }

    [Fact]
    public async Task RenameCounterparty_RejectsEmpty()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "gina@example.com", "Passcode!1");
        var resp = await client.PutAsJsonAsync("/api/v1/counterparty", new UpdateCounterpartyRequest { Name = "" });
        resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        resp.Content.Headers.ContentType!.MediaType.Should().Be("application/problem+json");
    }
}
