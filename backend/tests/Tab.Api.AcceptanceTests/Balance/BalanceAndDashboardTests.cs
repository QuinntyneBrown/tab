// Acceptance Test
// Traces to: L2-016, L2-017, L2-018
// Description: Balance = loans + bill share − payments; dashboard returns composite payload.
using System.Net.Http.Json;
using FluentAssertions;
using Tab.Api.AcceptanceTests.Infrastructure;
using Tab.Api.Contracts.Balance;
using Tab.Api.Contracts.Bills;
using Tab.Api.Contracts.Dashboard;
using Tab.Api.Contracts.Loans;
using Tab.Api.Contracts.Payments;

namespace Tab.Api.AcceptanceTests.Balance;

public class BalanceAndDashboardTests : IClassFixture<TabApiFactory>
{
    private readonly TabApiFactory _factory;
    public BalanceAndDashboardTests(TabApiFactory factory) => _factory = factory;

    [Fact]
    public async Task Balance_CombinesLoansBillsAndPayments()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "yara@example.com", "Passcode!1");

        await client.PostAsJsonAsync("/api/v1/loans", new CreateLoanRequest
        {
            Amount = 505m, Date = DateOnly.FromDateTime(DateTime.UtcNow), Description = "Bulk loans"
        });

        var bill = await CreateBill(client, "Hydro", 1759m, 50);
        var posting = await client.PostAsJsonAsync($"/api/v1/bills/{bill.Id}/postings", new CreateBillPostingRequest
        {
            Period = "2026-04", ActualTotal = 1759m
        });
        posting.EnsureSuccessStatusCode();

        await client.PostAsJsonAsync("/api/v1/payments", new CreatePaymentRequest
        {
            Amount = 100m, Date = DateOnly.FromDateTime(DateTime.UtcNow)
        });

        var balance = await client.GetFromJsonAsync<BalanceResponse>("/api/v1/balance");
        balance!.Amount.Should().Be(1284.50m);
    }

    [Fact]
    public async Task Payment_GreaterThanBalance_GoesNegativeWithoutError()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "zoe@example.com", "Passcode!1");
        await client.PostAsJsonAsync("/api/v1/loans", new CreateLoanRequest
        {
            Amount = 20m, Date = DateOnly.FromDateTime(DateTime.UtcNow), Description = "Small"
        });
        var p = await client.PostAsJsonAsync("/api/v1/payments", new CreatePaymentRequest { Amount = 100m });
        p.EnsureSuccessStatusCode();
        var balance = await client.GetFromJsonAsync<BalanceResponse>("/api/v1/balance");
        balance!.Amount.Should().Be(-80m);
    }

    [Fact]
    public async Task Dashboard_ReturnsCompositePayload()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "amber@example.com", "Passcode!1");
        await client.PostAsJsonAsync("/api/v1/loans", new CreateLoanRequest
        {
            Amount = 50m, Date = DateOnly.FromDateTime(DateTime.UtcNow), Description = "Snack run"
        });
        var dashboard = await client.GetFromJsonAsync<DashboardResponse>("/api/v1/dashboard");
        dashboard!.Balance.Amount.Should().Be(50m);
        dashboard.RecentActivity.Should().ContainSingle();
        dashboard.MonthlySummary.Lent.Should().Be(50m);
    }

    [Fact]
    public async Task EmptyAccount_DashboardShowsZeros()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "barb@example.com", "Passcode!1");
        var dashboard = await client.GetFromJsonAsync<DashboardResponse>("/api/v1/dashboard");
        dashboard!.Balance.Amount.Should().Be(0m);
        dashboard.RecentActivity.Should().BeEmpty();
        dashboard.MonthlySummary.NetChange.Should().Be(0m);
        dashboard.UpcomingBill.Should().BeNull();
    }

    private static async Task<BillResponse> CreateBill(HttpClient client, string name, decimal expected, int splitPercent)
    {
        var resp = await client.PostAsJsonAsync("/api/v1/bills", new CreateBillRequest
        {
            Name = name, ExpectedAmount = expected, DueDay = 15, SplitPercent = splitPercent
        });
        resp.EnsureSuccessStatusCode();
        return (await resp.Content.ReadFromJsonAsync<BillResponse>())!;
    }
}
