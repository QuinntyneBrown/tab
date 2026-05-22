// Acceptance Test
// Traces to: L2-021
// Description: Preferences can be read and updated; validation rejects bad inputs.
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Tab.Api.AcceptanceTests.Infrastructure;
using Tab.Api.Contracts.UserPreferences;

namespace Tab.Api.AcceptanceTests.UserPreferences;

public class PreferencesTests : IClassFixture<TabApiFactory>
{
    private readonly TabApiFactory _factory;
    public PreferencesTests(TabApiFactory factory) => _factory = factory;

    [Fact]
    public async Task DefaultPreferences_ExistAfterRegister()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "henry@example.com", "Passcode!1");
        var prefs = await client.GetFromJsonAsync<PreferencesResponse>("/api/v1/preferences");
        prefs!.CurrencyCode.Should().Be("CAD");
        prefs.DefaultSplitPercent.Should().Be(50);
        prefs.ReminderDays.Should().Be(3);
    }

    [Fact]
    public async Task UpdatePreferences_Persists()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "ivy@example.com", "Passcode!1");
        var resp = await client.PutAsJsonAsync("/api/v1/preferences", new UpdatePreferencesRequest
        {
            CurrencyCode = "USD",
            DefaultSplitPercent = 60,
            ReminderDays = 7
        });
        resp.StatusCode.Should().Be(HttpStatusCode.OK);

        var prefs = await client.GetFromJsonAsync<PreferencesResponse>("/api/v1/preferences");
        prefs!.CurrencyCode.Should().Be("USD");
        prefs.DefaultSplitPercent.Should().Be(60);
        prefs.ReminderDays.Should().Be(7);
    }

    [Fact]
    public async Task UpdatePreferences_RejectsInvalidCurrency()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "jack@example.com", "Passcode!1");
        var resp = await client.PutAsJsonAsync("/api/v1/preferences", new UpdatePreferencesRequest
        {
            CurrencyCode = "usd",
            DefaultSplitPercent = 50,
            ReminderDays = 3
        });
        resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
