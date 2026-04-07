using System.Net.Http.Json;
using DanceClassApp.Models;

namespace DanceClassApp.Services;

/// <summary>
/// Implements <see cref="ICourseTextsService"/> using <see cref="HttpClient"/>.
/// Mirrors <c>courseTextsService.ts</c>.
/// </summary>
public class CourseTextsService : ICourseTextsService
{
    private readonly HttpClient _http;
    private readonly IApiConfigService _apiConfig;

    public CourseTextsService(HttpClient http, IApiConfigService apiConfig)
    {
        _http = http;
        _apiConfig = apiConfig;
    }

    public async Task<IReadOnlyList<CourseText>> GetCourseTextsAsync()
    {
        var url = await _apiConfig.BuildUrlAsync("/course-texts");
        var result = await _http.GetFromJsonAsync<List<CourseText>>(url);
        return result ?? [];
    }

    public async Task<CourseText> GetCourseTextAsync(string id)
    {
        var url = await _apiConfig.BuildUrlAsync($"/course-texts/{Uri.EscapeDataString(id)}");
        return await _http.GetFromJsonAsync<CourseText>(url)
               ?? throw new HttpRequestException($"Course text {id} not found");
    }

    public async Task<CourseText> CreateCourseTextAsync(CourseTextInput input)
    {
        var url = await _apiConfig.BuildUrlAsync("/course-texts");
        var response = await _http.PostAsJsonAsync(url, input);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<CourseText>()
               ?? throw new HttpRequestException("Failed to deserialize created course text");
    }

    public async Task<CourseText> UpdateCourseTextAsync(string id, CourseTextInput input)
    {
        var url = await _apiConfig.BuildUrlAsync($"/course-texts/{Uri.EscapeDataString(id)}");
        var response = await _http.PutAsJsonAsync(url, input);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<CourseText>()
               ?? throw new HttpRequestException("Failed to deserialize updated course text");
    }

    public async Task DeleteCourseTextAsync(string id)
    {
        var url = await _apiConfig.BuildUrlAsync($"/course-texts/{Uri.EscapeDataString(id)}");
        var response = await _http.DeleteAsync(url);
        response.EnsureSuccessStatusCode();
    }
}
