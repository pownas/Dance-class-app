using DanceClassApp.ViewModels;

namespace DanceClassApp.Pages;

public partial class LoginPage : ContentPage
{
    private readonly LoginViewModel _vm;

    public LoginPage(LoginViewModel viewModel)
    {
        InitializeComponent();
        _vm = viewModel;
        BindingContext = _vm;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        // Attempt to restore a previously authenticated Spotify session.
        await _vm.TryRestoreSessionAsync();
    }
}
