using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;
using DanceClassApp.Models;

namespace DanceClassApp.Services;

/// <summary>
/// Implements <see cref="ISpotifyAuthService"/> using MAUI's
/// <see cref="WebAuthenticator"/> for the browser redirect and
/// <see cref="SecureStorage"/> for token persistence.
///
/// Mirrors <c>spotifyAuthService.ts</c>. Replace <c>ClientId</c> with your
/// Spotify Developer Dashboard application client ID.
/// </summary>
public class SpotifyAuthService : ISpotifyAuthService
{
    // -------------------------------------------------------------------------
    // Configuration – replace with your Spotify Developer Dashboard Client ID.
    // -------------------------------------------------------------------------

    /// <summary>
    /// Spotify OAuth application Client ID.
    /// Set the SPOTIFY_CLIENT_ID environment variable or replace this value directly.
    /// </summary>
    public static string ClientId =>
        Environment.GetEnvironmentVariable("SPOTIFY_CLIENT_ID") ?? string.Empty;

    private static readonly string[] Scopes =
    [
        "user-read-email",
        "user-read-private",
        "streaming",
        "user-read-playback-state",
        "user-modify-playback-state",
        "playlist-read-private",
        "playlist-read-collaborative",
    ];

    private const string AuthEndpoint = "https://accounts.spotify.com/authorize";
    private const string TokenEndpoint = "https://accounts.spotify.com/api/token";
    private const string UserEndpoint = "https://api.spotify.com/v1/me";
    private const string SecureStoreKey = "spotify_token";

    // Redirect URI registered in the Spotify Developer Dashboard.
    // Must match the custom URI scheme declared in AndroidManifest.xml / Info.plist.
    private const string RedirectUri = "danceclassapp://callback";

    private readonly HttpClient _http;

    public SpotifyAuthService(HttpClient http)
    {
        _http = http;
    }

    // -------------------------------------------------------------------------
    // PKCE helpers
    // -------------------------------------------------------------------------

    private static string GenerateCodeVerifier()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }

    private static string GenerateCodeChallenge(string verifier)
    {
        var bytes = SHA256.HashData(Encoding.ASCII.GetBytes(verifier));
        return Convert.ToBase64String(bytes)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }

    // -------------------------------------------------------------------------
    // Login
    // -------------------------------------------------------------------------

    /// <inheritdoc />
    public async Task<(SpotifyUser User, SpotifyToken Token)> LoginAsync()
    {
        if (string.IsNullOrWhiteSpace(ClientId))
            throw new InvalidOperationException(
                "Spotify Client ID is not configured. Set the SPOTIFY_CLIENT_ID environment variable.");

        var verifier = GenerateCodeVerifier();
        var challenge = GenerateCodeChallenge(verifier);
        var state = GenerateCodeVerifier(); // random CSRF state

        var authUrl = BuildAuthorizationUrl(challenge, state);
        var callbackUri = new Uri(RedirectUri);

        // Opens the system browser and waits for the callback deep-link.
        var result = await WebAuthenticator.Default.AuthenticateAsync(
            new Uri(authUrl), callbackUri);

        if (!result.Properties.TryGetValue("code", out var code) || string.IsNullOrEmpty(code))
            throw new InvalidOperationException("No authorization code received from Spotify.");

        if (result.Properties.TryGetValue("state", out var returnedState)
            && returnedState != state)
            throw new InvalidOperationException("OAuth state mismatch – possible CSRF attack.");

        if (result.Properties.TryGetValue("error", out var error) && !string.IsNullOrEmpty(error))
            throw new InvalidOperationException($"Spotify auth error: {error}");

        var token = await ExchangeCodeForTokenAsync(code, verifier);
        await SaveTokenAsync(token);

        var (user, freshToken) = await GetCurrentUserAsync(token);
        return (user, freshToken);
    }

    private string BuildAuthorizationUrl(string codeChallenge, string state)
    {
        var scopeStr = string.Join(' ', Scopes);
        var query = new Dictionary<string, string>
        {
            ["response_type"] = "code",
            ["client_id"] = ClientId,
            ["scope"] = scopeStr,
            ["redirect_uri"] = RedirectUri,
            ["state"] = state,
            ["code_challenge_method"] = "S256",
            ["code_challenge"] = codeChallenge,
        };

        var queryString = string.Join("&",
            query.Select(kv =>
                $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}"));

        return $"{AuthEndpoint}?{queryString}";
    }

    // -------------------------------------------------------------------------
    // Token exchange
    // -------------------------------------------------------------------------

    private async Task<SpotifyToken> ExchangeCodeForTokenAsync(string code, string codeVerifier)
    {
        var body = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = code,
            ["redirect_uri"] = RedirectUri,
            ["client_id"] = ClientId,
            ["code_verifier"] = codeVerifier,
        });

        var response = await _http.PostAsync(TokenEndpoint, body);
        if (!response.IsSuccessStatusCode)
        {
            var text = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException(
                $"Token exchange failed ({(int)response.StatusCode}): {text}");
        }

        var data = await response.Content.ReadFromJsonAsync<SpotifyTokenResponse>()
                   ?? throw new HttpRequestException("Failed to deserialize token response");

        return ToSpotifyToken(data);
    }

    // -------------------------------------------------------------------------
    // Token refresh
    // -------------------------------------------------------------------------

    /// <inheritdoc />
    public async Task<SpotifyToken> RefreshAccessTokenAsync(string refreshToken)
    {
        var body = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "refresh_token",
            ["refresh_token"] = refreshToken,
            ["client_id"] = ClientId,
        });

        var response = await _http.PostAsync(TokenEndpoint, body);
        if (!response.IsSuccessStatusCode)
        {
            var text = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException(
                $"Token refresh failed ({(int)response.StatusCode}): {text}");
        }

        var data = await response.Content.ReadFromJsonAsync<SpotifyTokenResponse>()
                   ?? throw new HttpRequestException("Failed to deserialize token response");

        // Spotify may or may not return a new refresh token
        if (string.IsNullOrEmpty(data.RefreshToken))
            data.RefreshToken = refreshToken;

        return ToSpotifyToken(data);
    }

    private static SpotifyToken ToSpotifyToken(SpotifyTokenResponse data) => new()
    {
        AccessToken = data.AccessToken,
        RefreshToken = data.RefreshToken ?? string.Empty,
        ExpiresAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() + data.ExpiresIn * 1_000L,
        Scope = data.Scope ?? string.Empty,
    };

    // -------------------------------------------------------------------------
    // User profile
    // -------------------------------------------------------------------------

    /// <inheritdoc />
    public async Task<(SpotifyUser User, SpotifyToken Token)> GetCurrentUserAsync(SpotifyToken token)
    {
        var activeToken = token;

        if (activeToken.IsExpired)
        {
            activeToken = await RefreshAccessTokenAsync(activeToken.RefreshToken);
            await SaveTokenAsync(activeToken);
        }

        using var request = new HttpRequestMessage(HttpMethod.Get, UserEndpoint);
        request.Headers.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", activeToken.AccessToken);

        var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException(
                $"Failed to fetch user profile ({(int)response.StatusCode})");

        var data = await response.Content.ReadFromJsonAsync<SpotifyUserResponse>()
                   ?? throw new HttpRequestException("Failed to deserialize user profile");

        var user = new SpotifyUser
        {
            Id = data.Id,
            DisplayName = data.DisplayName,
            Email = data.Email,
            ImageUrl = data.Images?.FirstOrDefault()?.Url,
        };

        return (user, activeToken);
    }

    // -------------------------------------------------------------------------
    // Secure token storage
    // -------------------------------------------------------------------------

    /// <inheritdoc />
    public async Task SaveTokenAsync(SpotifyToken token)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(token);
        await SecureStorage.SetAsync(SecureStoreKey, json);
    }

    /// <inheritdoc />
    public async Task<SpotifyToken?> GetStoredTokenAsync()
    {
        var raw = await SecureStorage.GetAsync(SecureStoreKey);
        if (string.IsNullOrEmpty(raw)) return null;
        return System.Text.Json.JsonSerializer.Deserialize<SpotifyToken>(raw);
    }

    /// <inheritdoc />
    public Task ClearTokenAsync()
    {
        SecureStorage.Remove(SecureStoreKey);
        return Task.CompletedTask;
    }

    // -------------------------------------------------------------------------
    // Internal JSON DTOs
    // -------------------------------------------------------------------------

    private sealed class SpotifyTokenResponse
    {
        [JsonPropertyName("access_token")]  public string AccessToken { get; set; } = string.Empty;
        [JsonPropertyName("refresh_token")] public string? RefreshToken { get; set; }
        [JsonPropertyName("expires_in")]    public int ExpiresIn { get; set; }
        [JsonPropertyName("scope")]         public string? Scope { get; set; }
    }

    private sealed class SpotifyUserResponse
    {
        [JsonPropertyName("id")]           public string Id { get; set; } = string.Empty;
        [JsonPropertyName("display_name")] public string DisplayName { get; set; } = string.Empty;
        [JsonPropertyName("email")]        public string Email { get; set; } = string.Empty;
        [JsonPropertyName("images")]       public SpotifyImage[]? Images { get; set; }
    }

    private sealed class SpotifyImage
    {
        [JsonPropertyName("url")] public string Url { get; set; } = string.Empty;
    }
}
