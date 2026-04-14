using CommunityToolkit.Maui;
using DanceClassApp.Services;
using DanceClassApp.ViewModels;
using DanceClassApp.Pages;

namespace DanceClassApp;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();

        builder
            .UseMauiApp<App>()
            .UseMauiCommunityToolkit()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
            });

        // ---------- Services ----------
        builder.Services.AddSingleton<IApiConfigService, ApiConfigService>();
        builder.Services.AddSingleton<INotesService, NotesService>();
        builder.Services.AddSingleton<ISongsService, SongsService>();
        builder.Services.AddSingleton<ICourseTextsService, CourseTextsService>();
        builder.Services.AddSingleton<ISpotifyAuthService, SpotifyAuthService>();

        // HttpClient via factory so each service gets its own named client
        builder.Services.AddHttpClient();

        // ---------- ViewModels ----------
        builder.Services.AddTransient<LoginViewModel>();
        builder.Services.AddTransient<MainViewModel>();

        // ---------- Pages ----------
        builder.Services.AddTransient<LoginPage>();
        builder.Services.AddTransient<MainPage>();

        return builder.Build();
    }
}
