using DanceClassApp.Pages;

namespace DanceClassApp;

public partial class App : Application
{
    public App(IServiceProvider services)
    {
        InitializeComponent();

        // Start at the login page; AppShell will redirect to MainPage after authentication.
        MainPage = services.GetRequiredService<AppShell>();
    }
}
