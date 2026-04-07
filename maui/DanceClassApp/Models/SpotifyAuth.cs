namespace DanceClassApp.Models;

/// <summary>
/// The OAuth 2.0 token bundle returned by Spotify after authentication.
/// Mirrors the <c>SpotifyToken</c> TypeScript interface.
/// </summary>
public class SpotifyToken
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>Unix timestamp (milliseconds) when the access token expires.</summary>
    public long ExpiresAt { get; set; }

    public string Scope { get; set; } = string.Empty;

    /// <summary>Returns true if the access token has expired (with a 30-second buffer).</summary>
    public bool IsExpired =>
        DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() >= ExpiresAt - 30_000;
}

/// <summary>
/// Spotify profile for the authenticated user.
/// Mirrors the <c>SpotifyUser</c> TypeScript interface.
/// </summary>
public class SpotifyUser
{
    public string Id { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}

/// <summary>
/// Represents the current Spotify authentication state.
/// Mirrors the <c>SpotifyAuthState</c> discriminated union in TypeScript.
/// </summary>
public abstract class SpotifyAuthState
{
    private SpotifyAuthState() { }

    public sealed class Unauthenticated : SpotifyAuthState { }
    public sealed class Loading : SpotifyAuthState { }

    public sealed class Authenticated : SpotifyAuthState
    {
        public SpotifyUser User { get; }
        public SpotifyToken Token { get; }
        public Authenticated(SpotifyUser user, SpotifyToken token)
        {
            User = user;
            Token = token;
        }
    }

    public sealed class Error : SpotifyAuthState
    {
        public string Message { get; }
        public Error(string message) { Message = message; }
    }
}
