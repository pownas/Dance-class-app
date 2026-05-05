using System.Net.Http.Json;
using DanceClassApp.Models;

namespace DanceClassApp.Services;

/// <summary>
/// Implements <see cref="ISongsService"/> using <see cref="HttpClient"/>.
/// Mirrors <c>songsService.ts</c>.
/// </summary>
public class SongsService : ISongsService
{
    private readonly HttpClient _http;
    private readonly IApiConfigService _apiConfig;

    public SongsService(HttpClient http, IApiConfigService apiConfig)
    {
        _http = http;
        _apiConfig = apiConfig;
    }

    public async Task<IReadOnlyList<Song>> GetSongsAsync()
    {
        var url = await _apiConfig.BuildUrlAsync("/songs");
        var result = await _http.GetFromJsonAsync<List<Song>>(url);
        return result ?? [];
    }

    public async Task<Song> GetSongAsync(string id)
    {
        var url = await _apiConfig.BuildUrlAsync($"/songs/{Uri.EscapeDataString(id)}");
        return await _http.GetFromJsonAsync<Song>(url)
               ?? throw new HttpRequestException($"Song {id} not found");
    }

    public async Task<Song> CreateSongAsync(SongInput song)
    {
        var url = await _apiConfig.BuildUrlAsync("/songs");
        var response = await _http.PostAsJsonAsync(url, song);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<Song>()
               ?? throw new HttpRequestException("Failed to deserialize created song");
    }

    public async Task<Song> UpdateSongAsync(string id, SongInput song)
    {
        var url = await _apiConfig.BuildUrlAsync($"/songs/{Uri.EscapeDataString(id)}");
        var response = await _http.PutAsJsonAsync(url, song);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<Song>()
               ?? throw new HttpRequestException("Failed to deserialize updated song");
    }

    public async Task DeleteSongAsync(string id)
    {
        var url = await _apiConfig.BuildUrlAsync($"/songs/{Uri.EscapeDataString(id)}");
        var response = await _http.DeleteAsync(url);
        response.EnsureSuccessStatusCode();
    }
}
