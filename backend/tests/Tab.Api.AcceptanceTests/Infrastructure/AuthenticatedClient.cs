using System.Net.Http.Headers;
using System.Net.Http.Json;
using Tab.Api.Contracts.Auth;

namespace Tab.Api.AcceptanceTests.Infrastructure;

public static class AuthenticatedClient
{
    public static async Task<HttpClient> CreateAsync(TabApiFactory factory, string email, string password)
    {
        var client = factory.CreateClient();
        var resp = await client.PostAsJsonAsync("/api/v1/oauth/register", new RegisterRequest
        {
            Email = email,
            Password = password
        });
        resp.EnsureSuccessStatusCode();
        var tokens = (await resp.Content.ReadFromJsonAsync<TokenResponse>())!;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        return client;
    }
}
