namespace DanceClassApp;

public partial class AppShell : Shell
{
    public AppShell()
    {
        InitializeComponent();

        // Register named routes so ViewModels can navigate programmatically.
        Routing.RegisterRoute(nameof(Pages.LoginPage), typeof(Pages.LoginPage));
        Routing.RegisterRoute(nameof(Pages.MainPage), typeof(Pages.MainPage));
    }
}
