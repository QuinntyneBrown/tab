// Acceptance Test
// Traces to: L2-005, L2-007, L2-009, L2-010, L2-023
// Description: Loans CRUD with per-user isolation and validation.
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Tab.Api.AcceptanceTests.Infrastructure;
using Tab.Api.Contracts.Ledger;
using Tab.Api.Contracts.Loans;

namespace Tab.Api.AcceptanceTests.Loans;

public class LoansTests : IClassFixture<TabApiFactory>
{
    private readonly TabApiFactory _factory;
    public LoansTests(TabApiFactory factory) => _factory = factory;

    [Fact]
    public async Task CreateLoan_PersistsAndListIncludesIt()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "kate@example.com", "Passcode!1");
        var create = await client.PostAsJsonAsync("/api/v1/loans", new CreateLoanRequest
        {
            Amount = 120m,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            Description = "Groceries",
            Method = "Cash"
        });
        create.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = (await create.Content.ReadFromJsonAsync<LoanResponse>())!;
        created.Amount.Should().Be(120m);

        var list = await client.GetFromJsonAsync<List<LedgerEntryResponse>>("/api/v1/loans");
        list!.Should().ContainSingle(e => e.Id == created.Id && e.Type == "loan");
    }

    [Fact]
    public async Task CreateLoan_RejectsNegativeAmount()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "luc@example.com", "Passcode!1");
        var create = await client.PostAsJsonAsync("/api/v1/loans", new CreateLoanRequest
        {
            Amount = -1m,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            Description = "Bad"
        });
        create.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var body = await create.Content.ReadAsStringAsync();
        body.Should().Contain("Amount");
        body.Should().Contain("greater than 0");
    }

    [Fact]
    public async Task CreateLoan_RejectsFutureDate()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "mia@example.com", "Passcode!1");
        var create = await client.PostAsJsonAsync("/api/v1/loans", new CreateLoanRequest
        {
            Amount = 10m,
            Date = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(30),
            Description = "Future"
        });
        create.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateLoan_ChangesAmount()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "nina@example.com", "Passcode!1");
        var created = await CreateLoan(client, 50m, "Snacks");

        var resp = await client.PutAsJsonAsync($"/api/v1/loans/{created.Id}", new UpdateLoanRequest
        {
            Amount = 75m,
            Date = created.Date,
            Description = created.Description
        });
        resp.StatusCode.Should().Be(HttpStatusCode.OK);

        var refetch = await client.GetFromJsonAsync<LoanResponse>($"/api/v1/loans/{created.Id}");
        refetch!.Amount.Should().Be(75m);
    }

    [Fact]
    public async Task DeleteLoan_RemovesFromList()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "olly@example.com", "Passcode!1");
        var created = await CreateLoan(client, 25m, "Coffee");

        var del = await client.DeleteAsync($"/api/v1/loans/{created.Id}");
        del.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var get = await client.GetAsync($"/api/v1/loans/{created.Id}");
        get.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CrossUser_Loan_Returns404()
    {
        var alice = await AuthenticatedClient.CreateAsync(_factory, "pam@example.com", "Passcode!1");
        var bob = await AuthenticatedClient.CreateAsync(_factory, "quincy@example.com", "Passcode!1");

        var aliceLoan = await CreateLoan(alice, 99m, "Alice loan");
        var resp = await bob.GetAsync($"/api/v1/loans/{aliceLoan.Id}");
        resp.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    private static async Task<LoanResponse> CreateLoan(HttpClient client, decimal amount, string description)
    {
        var resp = await client.PostAsJsonAsync("/api/v1/loans", new CreateLoanRequest
        {
            Amount = amount,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            Description = description
        });
        resp.EnsureSuccessStatusCode();
        return (await resp.Content.ReadFromJsonAsync<LoanResponse>())!;
    }
}
