namespace DanceClassApp.Models;

/// <summary>
/// A course text (e.g. choreography description or lesson plan) stored in the backend.
/// Mirrors the <c>CourseText</c> TypeScript interface.
/// </summary>
public class CourseText
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public IReadOnlyList<string>? Tags { get; set; }
}

/// <summary>Payload used when creating or updating a <see cref="CourseText"/>.</summary>
public class CourseTextInput
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public IReadOnlyList<string>? Tags { get; set; }
}
