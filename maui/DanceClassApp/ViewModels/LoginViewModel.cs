using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using DanceClassApp.Models;
using DanceClassApp.Services;

namespace DanceClassApp.ViewModels;

/// <summary>
/// ViewModel for the Spotify login screen.
/// Mirrors the auth state management in <c>useSpotifyAuth.ts</c> and
/// the <c>SpotifyLogin</c> React component.
/// </summary>
public partial class LoginViewModel : BaseViewModel
{
    private readonly ISpotifyAuthService _authService;

    [ObservableProperty]
    private string _errorMessage = string.Empty;

    [ObservableProperty]
    private bool _hasError;

    public LoginViewModel(ISpotifyAuthService authService)
    {
        _authService = authService;
        Title = "Dance Class App";
    }

    /// <summary>
    /// Attempts to restore a previously stored Spotify session.
    /// Call this from <c>LoginPage.OnAppearing</c>.
    /// </summary>
    public async Task TryRestoreSessionAsync()
    {
        IsBusy = true;
        HasError = false;
        try
        {
            var stored = await _authService.GetStoredTokenAsync();
            if (stored is null) return;

            var (user, token) = await _authService.GetCurrentUserAsync(stored);
            await _authService.SaveTokenAsync(token);
            await NavigateToMainAsync(user, token);
        }
        catch (Exception ex)
        {
            // Session restore failed – silently clear the token and stay on login.
            System.Diagnostics.Debug.WriteLine($"[SpotifyAuth] Session restore failed: {ex.Message}");
            await _authService.ClearTokenAsync();
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand(CanExecute = nameof(IsNotBusy))]
    private async Task LoginAsync()
    {
        IsBusy = true;
        HasError = false;
        ErrorMessage = string.Empty;

        try
        {
            var (user, token) = await _authService.LoginAsync();
            await NavigateToMainAsync(user, token);
        }
        catch (Exception ex)
        {
            HasError = true;
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsBusy = false;
        }
    }

    private static async Task NavigateToMainAsync(SpotifyUser user, SpotifyToken token)
    {
        // Pass the authenticated user/token to MainPage via query parameters.
        var parameters = new Dictionary<string, object>
        {
            [nameof(MainViewModel.AuthenticatedUser)] = user,
            [nameof(MainViewModel.AuthToken)] = token,
        };
        await Shell.Current.GoToAsync($"//{nameof(Pages.MainPage)}", animate: true, parameters);
    }
}
