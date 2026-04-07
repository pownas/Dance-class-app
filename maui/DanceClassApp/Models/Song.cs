namespace DanceClassApp.Models;

/// <summary>
/// A song stored in the backend.
/// Mirrors the <c>Song</c> and <c>SongInput</c> TypeScript interfaces.
/// </summary>
public class Song
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Artist { get; set; } = string.Empty;
    public int? Bpm { get; set; }
    public string? Notes { get; set; }
}

/// <summary>Payload used when creating or updating a <see cref="Song"/>.</summary>
public class SongInput
{
    public string Title { get; set; } = string.Empty;
    public string Artist { get; set; } = string.Empty;
    public int? Bpm { get; set; }
    public string? Notes { get; set; }
}
