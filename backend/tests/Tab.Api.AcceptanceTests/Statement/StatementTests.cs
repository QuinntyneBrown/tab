// Acceptance Test
// Traces to: L2-019, L2-020
// Description: Statement renders rolling totals; share link is 14-day expiring and anonymous-readable.
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Tab.Api.AcceptanceTests.Infrastructure;
using Tab.Api.Contracts.Loans;
using Tab.Api.Contracts.Payments;
using Tab.Api.Contracts.Statement;

namespace Tab.Api.AcceptanceTests.Statement;

public class StatementTests : IDisposable
{
    private readonly TabApiFactory _factory = new();
    public void Dispose() => _factory.Dispose();

    [Fact]
    public async Task Statement_RollingTotals_MatchBalance()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "cathy@example.com", "Passcode!1");
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        await client.PostAsJsonAsync("/api/v1/loans", new CreateLoanRequest { Amount = 100m, Date = today.AddDays(-3), Description = "L1" });
        await client.PostAsJsonAsync("/api/v1/loans", new CreateLoanRequest { Amount = 50m, Date = today.AddDays(-2), Description = "L2" });
        await client.PostAsJsonAsync("/api/v1/payments", new CreatePaymentRequest { Amount = 30m, Date = today.AddDays(-1) });

        var statement = await client.GetFromJsonAsync<StatementResponse>("/api/v1/statement");
        statement!.Lines.Should().HaveCount(3);
        statement.BalanceOwing.Should().Be(120m);
        statement.Lines.Last().RunningBalance.Should().Be(120m);
    }

    [Fact]
    public async Task ShareLink_AnonymousReadable_Within14Days()
    {
        var owner = await AuthenticatedClient.CreateAsync(_factory, "dora@example.com", "Passcode!1");
        await owner.PostAsJsonAsync("/api/v1/loans", new CreateLoanRequest
        {
            Amount = 25m, Date = DateOnly.FromDateTime(DateTime.UtcNow), Description = "Shared"
        });
        var share = await owner.PostAsJsonAsync("/api/v1/statement/share", new CreateStatementShareRequest());
        share.StatusCode.Should().Be(HttpStatusCode.OK);
        var info = (await share.Content.ReadFromJsonAsync<StatementShareResponse>())!;
        info.Token.Should().NotBeNullOrEmpty();

        var anon = _factory.CreateClient();
        var statement = await anon.GetFromJsonAsync<StatementResponse>($"/api/v1/shared/{info.Token}");
        statement!.Lines.Should().ContainSingle();
    }

    [Fact]
    public async Task ShareLink_AfterExpiry_Returns404()
    {
        var owner = await AuthenticatedClient.CreateAsync(_factory, "edie@example.com", "Passcode!1");
        await owner.PostAsJsonAsync("/api/v1/loans", new CreateLoanRequest
        {
            Amount = 25m, Date = DateOnly.FromDateTime(DateTime.UtcNow), Description = "Shared"
        });
        var share = await owner.PostAsJsonAsync("/api/v1/statement/share", new CreateStatementShareRequest());
        var info = (await share.Content.ReadFromJsonAsync<StatementShareResponse>())!;

        _factory.Time.Advance(TimeSpan.FromDays(15));

        var anon = _factory.CreateClient();
        var resp = await anon.GetAsync($"/api/v1/shared/{info.Token}");
        resp.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var body = await resp.Content.ReadAsStringAsync();
        body.Should().Contain("This statement is no longer available");
    }

    [Fact]
    public async Task SharedStatement_DoesNotRequireAuth()
    {
        var owner = await AuthenticatedClient.CreateAsync(_factory, "fern@example.com", "Passcode!1");
        var share = await owner.PostAsJsonAsync("/api/v1/statement/share", new CreateStatementShareRequest());
        var info = (await share.Content.ReadFromJsonAsync<StatementShareResponse>())!;

        var anon = _factory.CreateClient();
        var resp = await anon.GetAsync($"/api/v1/shared/{info.Token}");
        resp.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
