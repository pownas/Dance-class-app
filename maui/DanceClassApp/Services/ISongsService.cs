using DanceClassApp.Models;

namespace DanceClassApp.Services;

/// <summary>
/// CRUD operations for songs stored in the backend.
/// Mirrors <c>songsService.ts</c>.
/// </summary>
public interface ISongsService
{
    Task<IReadOnlyList<Song>> GetSongsAsync();
    Task<Song> GetSongAsync(string id);
    Task<Song> CreateSongAsync(SongInput song);
    Task<Song> UpdateSongAsync(string id, SongInput song);
    Task DeleteSongAsync(string id);
}
