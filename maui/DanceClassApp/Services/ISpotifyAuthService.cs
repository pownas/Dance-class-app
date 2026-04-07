using DanceClassApp.Models;

namespace DanceClassApp.Services;

/// <summary>
/// Manages the Spotify OAuth 2.0 PKCE authentication lifecycle.
/// Mirrors <c>spotifyAuthService.ts</c>.
/// </summary>
public interface ISpotifyAuthService
{
    /// <summary>
    /// Starts the OAuth 2.0 PKCE authorization flow using MAUI's
    /// <see cref="WebAuthenticator"/>.
    /// </summary>
    Task<(SpotifyUser User, SpotifyToken Token)> LoginAsync();

    /// <summary>Fetches or refreshes the Spotify user profile.</summary>
    Task<(SpotifyUser User, SpotifyToken Token)> GetCurrentUserAsync(SpotifyToken token);

    /// <summary>Uses the refresh token to obtain a new access token.</summary>
    Task<SpotifyToken> RefreshAccessTokenAsync(string refreshToken);

    /// <summary>Persists the token bundle in device secure storage.</summary>
    Task SaveTokenAsync(SpotifyToken token);

    /// <summary>Retrieves the stored token bundle, or null if none exists.</summary>
    Task<SpotifyToken?> GetStoredTokenAsync();

    /// <summary>Removes the stored token from secure storage (logout).</summary>
    Task ClearTokenAsync();
}
