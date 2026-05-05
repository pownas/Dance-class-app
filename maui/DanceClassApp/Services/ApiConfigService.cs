namespace DanceClassApp.Services;

/// <summary>
/// Implements <see cref="IApiConfigService"/> using MAUI's <see cref="SecureStorage"/>
/// for persisting a custom backend URL, mirroring <c>apiConfigService.ts</c>.
/// </summary>
public class ApiConfigService : IApiConfigService
{
    private const string ApiBaseUrlKey = "dance_app_api_base_url";

    private static readonly string DefaultApiBaseUrl =
        Environment.GetEnvironmentVariable("DANCE_APP_API_BASE_URL")
        ?? "https://din-backend-api.com/api";

    public async Task<string> GetApiBaseUrlAsync()
    {
        var stored = await SecureStorage.GetAsync(ApiBaseUrlKey);
        return stored ?? DefaultApiBaseUrl;
    }

    public async Task SetApiBaseUrlAsync(string url)
    {
        var normalised = url.TrimEnd('/');
        await SecureStorage.SetAsync(ApiBaseUrlKey, normalised);
    }

    public Task ClearApiBaseUrlAsync()
    {
        SecureStorage.Remove(ApiBaseUrlKey);
        return Task.CompletedTask;
    }

    public async Task<string> BuildUrlAsync(string path)
    {
        var baseUrl = await GetApiBaseUrlAsync();
        return $"{baseUrl}{path}";
    }
}
