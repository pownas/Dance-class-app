using System.Net.Http.Json;
using DanceClassApp.Models;

namespace DanceClassApp.Services;

/// <summary>
/// Implements <see cref="INotesService"/> using <see cref="HttpClient"/>.
/// Mirrors <c>notesService.ts</c>.
/// </summary>
public class NotesService : INotesService
{
    private readonly HttpClient _http;
    private readonly IApiConfigService _apiConfig;

    public NotesService(HttpClient http, IApiConfigService apiConfig)
    {
        _http = http;
        _apiConfig = apiConfig;
    }

    /// <inheritdoc />
    public async Task SaveNoteVersionAsync(string markdownContent)
    {
        var url = await _apiConfig.BuildUrlAsync("/notes/version");

        var payload = new NoteVersion
        {
            Timestamp = DateTimeOffset.UtcNow.ToString("o"),
            MarkdownContent = markdownContent,
        };

        var response = await _http.PostAsJsonAsync(url, payload);

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException(
                $"Server responded with status {(int)response.StatusCode}");
        }
    }
}
