namespace DanceClassApp.Services;

/// <summary>
/// Manages the base URL used for all backend API calls.
/// Mirrors <c>apiConfigService.ts</c>.
/// </summary>
public interface IApiConfigService
{
    Task<string> GetApiBaseUrlAsync();
    Task SetApiBaseUrlAsync(string url);
    Task ClearApiBaseUrlAsync();
    Task<string> BuildUrlAsync(string path);
}
