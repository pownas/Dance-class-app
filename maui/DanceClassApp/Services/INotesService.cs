namespace DanceClassApp.Services;

/// <summary>
/// Saves note versions to the backend REST API.
/// Mirrors <c>notesService.ts</c>.
/// </summary>
public interface INotesService
{
    /// <summary>
    /// POSTs a new version of the note to <c>POST /notes/version</c>.
    /// Only call when the content has changed since the last sync.
    /// </summary>
    Task SaveNoteVersionAsync(string markdownContent);
}
