// Debug helper (will be removed)
using System.Net.Http.Json;
using FluentAssertions;
using Tab.Api.AcceptanceTests.Infrastructure;
using Tab.Api.Contracts.Loans;

namespace Tab.Api.AcceptanceTests.Balance;

public class DebugBalance : IClassFixture<TabApiFactory>
{
    private readonly TabApiFactory _factory;
    public DebugBalance(TabApiFactory factory) => _factory = factory;

    [Fact]
    public async Task Balance_Debug_ShowsError()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "debug@example.com", "Passcode!1");
        await client.PostAsJsonAsync("/api/v1/loans", new CreateLoanRequest
        {
            Amount = 5m, Date = DateOnly.FromDateTime(DateTime.UtcNow), Description = "x"
        });
        var resp = await client.GetAsync("/api/v1/balance");
        var body = await resp.Content.ReadAsStringAsync();
        Assert.True(resp.IsSuccessStatusCode, $"status={resp.StatusCode} body={body}");
    }
}
