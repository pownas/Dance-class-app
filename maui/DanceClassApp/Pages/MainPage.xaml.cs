using DanceClassApp.Models;
using DanceClassApp.ViewModels;

namespace DanceClassApp.Pages;

public partial class MainPage : ContentPage
{
    private readonly MainViewModel _vm;

    public MainPage(MainViewModel viewModel)
    {
        InitializeComponent();
        _vm = viewModel;
        BindingContext = _vm;
    }

    // -------------------------------------------------------------------------
    // Lifecycle
    // -------------------------------------------------------------------------

    protected override void OnAppearing()
    {
        base.OnAppearing();
        _vm.StartTimers();
    }

    protected override void OnDisappearing()
    {
        base.OnDisappearing();
        _vm.StopTimers();
    }

    // -------------------------------------------------------------------------
    // Notes editor event – forward text changes to ViewModel
    // (Editor.TextChanged instead of two-way binding to avoid cursor-jump issues)
    // -------------------------------------------------------------------------

    private void OnNotesTextChanged(object sender, TextChangedEventArgs e)
    {
        _vm.OnNotesChanged(e.NewTextValue);
    }

    // -------------------------------------------------------------------------
    // Track note editor event
    // -------------------------------------------------------------------------

    private void OnTrackNoteTextChanged(object sender, TextChangedEventArgs e)
    {
        _vm.OnTrackNoteChanged(e.NewTextValue);
    }

    // -------------------------------------------------------------------------
    // Progress slider – forward seek to ViewModel
    // -------------------------------------------------------------------------

    private void OnProgressSliderValueChanged(object sender, ValueChangedEventArgs e)
    {
        _vm.SeekCommand.Execute(e.NewValue);
    }

    // -------------------------------------------------------------------------
    // Queue overlay
    // -------------------------------------------------------------------------

    private void OnQueueButtonClicked(object sender, EventArgs e)
    {
        QueueOverlay.IsVisible = true;
    }

    private void OnQueueCloseClicked(object sender, EventArgs e)
    {
        QueueOverlay.IsVisible = false;
    }

    private void OnTrackTapped(object sender, TappedEventArgs e)
    {
        if (sender is not Grid grid) return;
        if (grid.BindingContext is not Track track) return;

        var index = _vm.Tracks.ToList().IndexOf(track);
        if (index >= 0)
            _vm.SelectTrackCommand.Execute(index);

        QueueOverlay.IsVisible = false;
    }
}
