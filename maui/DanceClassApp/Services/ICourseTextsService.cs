using DanceClassApp.Models;

namespace DanceClassApp.Services;

/// <summary>
/// CRUD operations for course texts stored in the backend.
/// Mirrors <c>courseTextsService.ts</c>.
/// </summary>
public interface ICourseTextsService
{
    Task<IReadOnlyList<CourseText>> GetCourseTextsAsync();
    Task<CourseText> GetCourseTextAsync(string id);
    Task<CourseText> CreateCourseTextAsync(CourseTextInput input);
    Task<CourseText> UpdateCourseTextAsync(string id, CourseTextInput input);
    Task DeleteCourseTextAsync(string id);
}
