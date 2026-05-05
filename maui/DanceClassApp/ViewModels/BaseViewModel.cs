using CommunityToolkit.Mvvm.ComponentModel;

namespace DanceClassApp.ViewModels;

/// <summary>
/// Base class for all ViewModels.
/// Provides <see cref="IsBusy"/> and <see cref="Title"/> properties via
/// the CommunityToolkit.Mvvm source generator.
/// </summary>
public abstract partial class BaseViewModel : ObservableObject
{
    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(IsNotBusy))]
    private bool _isBusy;

    [ObservableProperty]
    private string _title = string.Empty;

    public bool IsNotBusy => !IsBusy;
}
