// Performance smoke (L2-026).
// Traces to: L2-026, L2-027
// Description: Hammers /api/v1/dashboard and /api/v1/loans?month=YYYY-MM after seeding 10k entries.
// Asserts p95 ≤ 300 ms for both. Run via `./backend/build.ps1 perf` (requires the API + DB running).

using System.Net.Http.Headers;
using System.Net.Http.Json;
using NBomber.CSharp;
using NBomber.Http.CSharp;

var apiBase = Environment.GetEnvironmentVariable("TAB_PERF_API") ?? "http://localhost:5147";
var email = Environment.GetEnvironmentVariable("TAB_PERF_USER") ?? "perf@tab.local";
var passcode = Environment.GetEnvironmentVariable("TAB_PERF_PASSCODE") ?? "Perf!2026";

using var http = new HttpClient { BaseAddress = new Uri(apiBase) };

await EnsureRegistered(http, email, passcode);
var token = await SignIn(http, email, passcode);
http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

await SeedLoansIfNeeded(http, target: 10_000);

var dashboardScenario = Scenario.Create("dashboard_p95", async _ =>
    {
        var req = Http.CreateRequest("GET", $"{apiBase}/api/v1/dashboard")
            .WithHeader("Authorization", $"Bearer {token}");
        return await Http.Send(http, req);
    })
    .WithoutWarmUp()
    .WithLoadSimulations(Simulation.KeepConstant(copies: 1, during: TimeSpan.FromSeconds(30)));

var loansScenario = Scenario.Create("loans_p95", async _ =>
    {
        var month = DateTime.UtcNow.ToString("yyyy-MM");
        var req = Http.CreateRequest("GET", $"{apiBase}/api/v1/loans?month={month}")
            .WithHeader("Authorization", $"Bearer {token}");
        return await Http.Send(http, req);
    })
    .WithoutWarmUp()
    .WithLoadSimulations(Simulation.KeepConstant(copies: 1, during: TimeSpan.FromSeconds(30)));

var stats = NBomberRunner
    .RegisterScenarios(dashboardScenario, loansScenario)
    .Run();

var failed = false;
foreach (var sc in stats.ScenarioStats)
{
    var p95 = sc.Ok.Latency.Percent95;
    Console.WriteLine($"{sc.ScenarioName}: p95 = {p95:F1} ms");
    if (p95 > 300) { failed = true; }
}
if (failed)
{
    Console.Error.WriteLine("PERF FAIL: at least one scenario exceeded 300 ms p95.");
    Environment.Exit(2);
}

static async Task EnsureRegistered(HttpClient http, string email, string passcode)
{
    var resp = await http.PostAsJsonAsync("/api/v1/oauth/register", new { email, password = passcode });
    // 200/201 = created; 4xx = already exists or other — sign-in will tell us.
    _ = resp;
}

static async Task<string> SignIn(HttpClient http, string email, string passcode)
{
    var resp = await http.PostAsJsonAsync("/api/v1/oauth/token", new
    {
        grantType = "password",
        email,
        password = passcode
    });
    resp.EnsureSuccessStatusCode();
    var doc = await resp.Content.ReadFromJsonAsync<TokenEnvelope>()
        ?? throw new InvalidOperationException("token response was null");
    return doc.AccessToken;
}

static async Task SeedLoansIfNeeded(HttpClient http, int target)
{
    var existing = await http.GetFromJsonAsync<List<object>>("/api/v1/loans")
        ?? new List<object>();
    if (existing.Count >= target) return;

    var toCreate = target - existing.Count;
    Console.WriteLine($"Seeding {toCreate} loans (existing={existing.Count})...");
    var rng = new Random(42);
    var today = DateOnly.FromDateTime(DateTime.UtcNow);
    for (var i = 0; i < toCreate; i++)
    {
        var dayOffset = rng.Next(0, 365);
        var amount = Math.Round((decimal)(rng.NextDouble() * 200 + 5), 2);
        var resp = await http.PostAsJsonAsync("/api/v1/loans", new
        {
            amount,
            date = today.AddDays(-dayOffset),
            description = $"perf-{i}",
            method = "Cash"
        });
        resp.EnsureSuccessStatusCode();
        if (i % 500 == 0) Console.WriteLine($"  seeded {i}/{toCreate}");
    }
}

internal sealed class TokenEnvelope
{
    [System.Text.Json.Serialization.JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;
    [System.Text.Json.Serialization.JsonPropertyName("token_type")]
    public string TokenType { get; set; } = string.Empty;
    [System.Text.Json.Serialization.JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }
    [System.Text.Json.Serialization.JsonPropertyName("refresh_token")]
    public string RefreshToken { get; set; } = string.Empty;
}
