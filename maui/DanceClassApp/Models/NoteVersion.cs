namespace DanceClassApp.Models;

/// <summary>
/// A timestamped snapshot of the user's Markdown notes, sent to the backend for version history.
/// Mirrors the <c>NoteVersion</c> TypeScript interface.
/// </summary>
public class NoteVersion
{
    /// <summary>ISO-8601 timestamp (UTC) when this version was created.</summary>
    public string Timestamp { get; set; } = string.Empty;

    /// <summary>Full Markdown content of the note at this point in time.</summary>
    public string MarkdownContent { get; set; } = string.Empty;
}
