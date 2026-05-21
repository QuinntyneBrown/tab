// Acceptance Test
// Traces to: L2-011, L2-012, L2-013, L2-014, L2-015
// Description: Recurring bills CRUD; mark-paid posts share; second posting same period → 409; edits don't backdate.
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Tab.Api.AcceptanceTests.Infrastructure;
using Tab.Api.Contracts.Bills;

namespace Tab.Api.AcceptanceTests.Bills;

public class BillsTests : IClassFixture<TabApiFactory>
{
    private readonly TabApiFactory _factory;
    public BillsTests(TabApiFactory factory) => _factory = factory;

    [Fact]
    public async Task CreateBill_AppearsInList_WithComputedFields()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "rae@example.com", "Passcode!1");
        var resp = await client.PostAsJsonAsync("/api/v1/bills", new CreateBillRequest
        {
            Name = "Hydro",
            ExpectedAmount = 168m,
            DueDay = 15,
            SplitPercent = 50
        });
        resp.StatusCode.Should().Be(HttpStatusCode.Created);

        var list = await client.GetFromJsonAsync<List<BillResponse>>("/api/v1/bills");
        list!.Single().SharePreview.Should().Be(84m);
        list.Single().NextDueDate.Day.Should().Be(15);
    }

    [Fact]
    public async Task CreateBill_RejectsSplit100()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "sam@example.com", "Passcode!1");
        var resp = await client.PostAsJsonAsync("/api/v1/bills", new CreateBillRequest
        {
            Name = "Bad", ExpectedAmount = 100m, DueDay = 15, SplitPercent = 100
        });
        resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await resp.Content.ReadAsStringAsync()).Should().Contain("between 1 and 99");
    }

    [Fact]
    public async Task MarkPaidInFull_PostsHalf()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "tess@example.com", "Passcode!1");
        var bill = await CreateBill(client, "Hydro", 168m, 50);

        var post = await client.PostAsJsonAsync($"/api/v1/bills/{bill.Id}/postings", new CreateBillPostingRequest
        {
            Period = "2026-05"
        });
        post.StatusCode.Should().Be(HttpStatusCode.Created);
        var posting = (await post.Content.ReadFromJsonAsync<BillPostingResponse>())!;
        posting.ShareAmount.Should().Be(84m);
        posting.TotalAmount.Should().Be(168m);
    }

    [Fact]
    public async Task MarkPaidInFull_DuplicatePeriod_Returns409()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "uli@example.com", "Passcode!1");
        var bill = await CreateBill(client, "Hydro", 168m, 50);

        var first = await client.PostAsJsonAsync($"/api/v1/bills/{bill.Id}/postings", new CreateBillPostingRequest { Period = "2026-04" });
        first.StatusCode.Should().Be(HttpStatusCode.Created);

        var second = await client.PostAsJsonAsync($"/api/v1/bills/{bill.Id}/postings", new CreateBillPostingRequest { Period = "2026-04" });
        second.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task LogThisMonth_WithActualAmount_PostsShareOfActual()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "vic@example.com", "Passcode!1");
        var bill = await CreateBill(client, "Hydro", 168m, 50);

        var post = await client.PostAsJsonAsync($"/api/v1/bills/{bill.Id}/postings", new CreateBillPostingRequest
        {
            Period = "2026-03",
            ActualTotal = 156.84m
        });
        post.StatusCode.Should().Be(HttpStatusCode.Created);
        var posting = (await post.Content.ReadFromJsonAsync<BillPostingResponse>())!;
        posting.ShareAmount.Should().Be(78.42m);
        posting.TotalAmount.Should().Be(156.84m);
    }

    [Fact]
    public async Task EditBillSplit_DoesNotChangeExistingPostings()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "wes@example.com", "Passcode!1");
        var bill = await CreateBill(client, "Hydro", 81m, 50);

        var first = await client.PostAsJsonAsync($"/api/v1/bills/{bill.Id}/postings", new CreateBillPostingRequest { Period = "2026-04" });
        var firstPosting = (await first.Content.ReadFromJsonAsync<BillPostingResponse>())!;
        firstPosting.ShareAmount.Should().Be(40.50m);

        var put = await client.PutAsJsonAsync($"/api/v1/bills/{bill.Id}", new UpdateBillRequest
        {
            Name = "Hydro", ExpectedAmount = 81m, DueDay = 15, SplitPercent = 60
        });
        put.StatusCode.Should().Be(HttpStatusCode.OK);

        // Future period uses 60%
        var second = await client.PostAsJsonAsync($"/api/v1/bills/{bill.Id}/postings", new CreateBillPostingRequest { Period = "2026-05" });
        var secondPosting = (await second.Content.ReadFromJsonAsync<BillPostingResponse>())!;
        secondPosting.ShareAmount.Should().Be(Math.Round(81m * 0.60m, 2, MidpointRounding.AwayFromZero));

        // First posting unchanged
        var list = await client.GetFromJsonAsync<List<Tab.Api.Contracts.Ledger.LedgerEntryResponse>>("/api/v1/loans?type=bill");
        list!.Single(e => e.Id == firstPosting.Id).Amount.Should().Be(40.50m);
    }

    [Fact]
    public async Task ArchiveBill_HidesFromList_PreservesHistory()
    {
        var client = await AuthenticatedClient.CreateAsync(_factory, "xan@example.com", "Passcode!1");
        var bill = await CreateBill(client, "Hydro", 80m, 50);
        await client.PostAsJsonAsync($"/api/v1/bills/{bill.Id}/postings", new CreateBillPostingRequest { Period = "2026-04" });

        var del = await client.DeleteAsync($"/api/v1/bills/{bill.Id}");
        del.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var list = await client.GetFromJsonAsync<List<BillResponse>>("/api/v1/bills");
        list!.Should().BeEmpty();

        var ledger = await client.GetFromJsonAsync<List<Tab.Api.Contracts.Ledger.LedgerEntryResponse>>("/api/v1/loans?type=bill");
        ledger!.Should().HaveCount(1);
    }

    private static async Task<BillResponse> CreateBill(HttpClient client, string name, decimal expected, int splitPercent)
    {
        var resp = await client.PostAsJsonAsync("/api/v1/bills", new CreateBillRequest
        {
            Name = name,
            ExpectedAmount = expected,
            DueDay = 15,
            SplitPercent = splitPercent
        });
        resp.EnsureSuccessStatusCode();
        return (await resp.Content.ReadFromJsonAsync<BillResponse>())!;
    }
}
