namespace DanceClassApp.Models;

/// <summary>
/// A single track in a playlist.
/// Mirrors the <c>Track</c> TypeScript interface.
/// </summary>
public class Track
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Artist { get; set; } = string.Empty;
    public int? Bpm { get; set; }
}

/// <summary>
/// A named playlist containing an ordered list of tracks.
/// Mirrors the <c>Playlist</c> TypeScript interface.
/// </summary>
public class Playlist
{
    public string Name { get; set; } = string.Empty;
    public IReadOnlyList<Track> Tracks { get; set; } = [];
}
