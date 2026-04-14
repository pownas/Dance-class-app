namespace DanceClassApp;

public partial class App : Application
{
    private readonly IServiceProvider _services;

    public App(IServiceProvider services)
    {
        _services = services;
        InitializeComponent();
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        // Start at the login page; AppShell will redirect to MainPage after authentication.
        return new Window(_services.GetRequiredService<AppShell>());
    }
}
