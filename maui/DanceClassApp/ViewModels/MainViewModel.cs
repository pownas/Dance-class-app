using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using DanceClassApp.Models;
using DanceClassApp.Services;

namespace DanceClassApp.ViewModels;

/// <summary>
/// ViewModel for the main screen.
/// Manages Spotify playback state, playlist navigation, per-track notes, and the
/// Markdown notes editor with auto-save – mirroring <c>App.tsx</c>.
/// </summary>
[QueryProperty(nameof(AuthenticatedUser), nameof(AuthenticatedUser))]
[QueryProperty(nameof(AuthToken), nameof(AuthToken))]
public partial class MainViewModel : BaseViewModel
{
    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    private const string InitialNotes =
        "# Danskurs Vecka 1\n\n" +
        "- Uppvärmning 10 min\n" +
        "- Koreografi del 1\n" +
        "- Repetition av steg från förra veckan\n\n" +
        "## WCS Steg 1\n\n" +
        "1. Starta med grundsteget\n" +
        "2. Lägg till arm-styling\n";

    private const int SongDurationSeconds = 180;
    private const double Skip10SecondsPercent = (10.0 / SongDurationSeconds) * 100.0;
    private static readonly TimeSpan AutoSaveInterval = TimeSpan.FromMinutes(3);

    // -------------------------------------------------------------------------
    // Demo playlist (mirrors DEMO_PLAYLIST in App.tsx)
    // -------------------------------------------------------------------------

    public static readonly Playlist DemoPlaylist = new()
    {
        Name = "WCS Danskurs Spellista",
        Tracks =
        [
            new() { Id = "1",  Name = "West Coast Swing Mix Vol. 1",  Artist = "WCS Collection",         Bpm = 102 },
            new() { Id = "2",  Name = "West Coast Swing Mix Vol. 2",  Artist = "WCS Collection",         Bpm = 110 },
            new() { Id = "3",  Name = "West Coast Swing Mix Vol. 3",  Artist = "WCS Collection",         Bpm = 118 },
            new() { Id = "4",  Name = "Boogie Wonderland",            Artist = "Earth, Wind & Fire",     Bpm = 119 },
            new() { Id = "5",  Name = "Ain't Nobody",                 Artist = "Chaka Khan",             Bpm = 111 },
            new() { Id = "6",  Name = "Blinding Lights",              Artist = "The Weeknd",             Bpm = 171 },
            new() { Id = "7",  Name = "Levitating",                   Artist = "Dua Lipa",               Bpm = 103 },
            new() { Id = "8",  Name = "Uptown Funk",                  Artist = "Bruno Mars",             Bpm = 115 },
            new() { Id = "9",  Name = "Shape of You",                 Artist = "Ed Sheeran",             Bpm = 96  },
            new() { Id = "10", Name = "Happy",                        Artist = "Pharrell Williams",      Bpm = 160 },
            new() { Id = "11", Name = "Thinking Out Loud",            Artist = "Ed Sheeran",             Bpm = 79  },
            new() { Id = "12", Name = "Can't Stop the Feeling!",      Artist = "Justin Timberlake",      Bpm = 113 },
            new() { Id = "13", Name = "Treasure",                     Artist = "Bruno Mars",             Bpm = 116 },
            new() { Id = "14", Name = "September",                    Artist = "Earth, Wind & Fire",     Bpm = 126 },
            new() { Id = "15", Name = "I Wanna Dance with Somebody",  Artist = "Whitney Houston",        Bpm = 119 },
            new() { Id = "16", Name = "Signed, Sealed, Delivered",    Artist = "Stevie Wonder",          Bpm = 113 },
            new() { Id = "17", Name = "Let's Groove",                 Artist = "Earth, Wind & Fire",     Bpm = 123 },
            new() { Id = "18", Name = "Superstition",                 Artist = "Stevie Wonder",          Bpm = 101 },
            new() { Id = "19", Name = "Kiss",                         Artist = "Prince",                 Bpm = 111 },
            new() { Id = "20", Name = "Lovely Day",                   Artist = "Bill Withers",           Bpm = 98  },
            new() { Id = "21", Name = "Smooth",                       Artist = "Santana ft. Rob Thomas", Bpm = 116 },
            new() { Id = "22", Name = "Use Somebody",                 Artist = "Kings of Leon",          Bpm = 135 },
            new() { Id = "23", Name = "Locked Out of Heaven",         Artist = "Bruno Mars",             Bpm = 144 },
            new() { Id = "24", Name = "Cake by the Ocean",            Artist = "DNCE",                   Bpm = 119 },
            new() { Id = "25", Name = "Sugar",                        Artist = "Maroon 5",               Bpm = 120 },
            new() { Id = "26", Name = "Shut Up and Dance",            Artist = "Walk the Moon",          Bpm = 128 },
            new() { Id = "27", Name = "Don't Stop Me Now",            Artist = "Queen",                  Bpm = 156 },
            new() { Id = "28", Name = "Finesse",                      Artist = "Bruno Mars ft. Cardi B", Bpm = 105 },
            new() { Id = "29", Name = "Get Lucky",                    Artist = "Daft Punk ft. Pharrell", Bpm = 116 },
            new() { Id = "30", Name = "Redbone",                      Artist = "Childish Gambino",       Bpm = 81  },
        ],
    };

    // -------------------------------------------------------------------------
    // Dependencies
    // -------------------------------------------------------------------------

    private readonly INotesService _notesService;
    private readonly ISpotifyAuthService _authService;

    // -------------------------------------------------------------------------
    // Observable state
    // -------------------------------------------------------------------------

    [ObservableProperty]
    private SpotifyUser? _authenticatedUser;

    [ObservableProperty]
    private SpotifyToken? _authToken;

    [ObservableProperty]
    private string _notes = InitialNotes;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(IsPlaying))]
    private bool _isPlaybackPlaying;

    [ObservableProperty]
    private double _volume = 70;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(SyncStatusLabel), nameof(SyncStatusColor))]
    private SyncStatusKind _syncStatus = SyncStatusKind.Saved;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(CurrentTrack), nameof(CurrentTrackNote))]
    private int _currentTrackIndex;

    [ObservableProperty]
    private double _songProgress;

    // Per-track notes, keyed by track ID
    private readonly Dictionary<string, string> _trackNotes = new();

    // Tracks the last-synced notes content to detect changes
    private string _lastSyncedNotes = InitialNotes;

    // Timer for song progress simulation
    private IDispatcherTimer? _progressTimer;

    // Timer for auto-saving notes
    private IDispatcherTimer? _autoSaveTimer;

    // -------------------------------------------------------------------------
    // Computed properties
    // -------------------------------------------------------------------------

    public bool IsPlaying => IsPlaybackPlaying;

    public string PlayButtonText => IsPlaying ? "⏸" : "▶";

    public Track? CurrentTrack =>
        DemoPlaylist.Tracks.Count > 0 ? DemoPlaylist.Tracks[CurrentTrackIndex] : null;

    public string CurrentTrackNote =>
        CurrentTrack is not null && _trackNotes.TryGetValue(CurrentTrack.Id, out var note)
            ? note
            : string.Empty;

    public string SyncStatusLabel => SyncStatus switch
    {
        SyncStatusKind.Saved   => "✓ Sparad",
        SyncStatusKind.Pending => "● Ej sparad",
        SyncStatusKind.Error   => "✕ Synkfel",
        _                      => string.Empty,
    };

    public Color SyncStatusColor => SyncStatus switch
    {
        SyncStatusKind.Saved   => Color.FromArgb("#4caf50"),
        SyncStatusKind.Pending => Color.FromArgb("#ff9800"),
        SyncStatusKind.Error   => Color.FromArgb("#f44336"),
        _                      => Colors.Transparent,
    };

    public string FormattedElapsed =>
        FormatTime((SongProgress / 100.0) * SongDurationSeconds);

    public string FormattedDuration =>
        FormatTime(SongDurationSeconds);

    public IReadOnlyList<Track> Tracks => DemoPlaylist.Tracks;

    public string PlaylistName => DemoPlaylist.Name;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    public MainViewModel(INotesService notesService, ISpotifyAuthService authService)
    {
        _notesService = notesService;
        _authService = authService;
    }

    // -------------------------------------------------------------------------
    // Lifecycle
    // -------------------------------------------------------------------------

    /// <summary>Called from <c>MainPage.OnAppearing</c>.</summary>
    public void StartTimers()
    {
        StartAutoSaveTimer();
        // Progress timer only starts when the user presses Play.
    }

    /// <summary>Called from <c>MainPage.OnDisappearing</c>.</summary>
    public void StopTimers()
    {
        _progressTimer?.Stop();
        _autoSaveTimer?.Stop();
    }

    // -------------------------------------------------------------------------
    // Notes commands
    // -------------------------------------------------------------------------

    /// <summary>Called whenever the editor text changes.</summary>
    public void UpdateNotes(string text)
    {
        Notes = text;
        SyncStatus = text != _lastSyncedNotes ? SyncStatusKind.Pending : SyncStatusKind.Saved;
    }

    // -------------------------------------------------------------------------
    // Track-note command
    // -------------------------------------------------------------------------

    public void OnTrackNoteChanged(string note)
    {
        if (CurrentTrack is null) return;
        _trackNotes[CurrentTrack.Id] = note;
        OnPropertyChanged(nameof(CurrentTrackNote));
    }

    // -------------------------------------------------------------------------
    // Playback commands
    // -------------------------------------------------------------------------

    [RelayCommand]
    private void TogglePlay()
    {
        IsPlaybackPlaying = !IsPlaybackPlaying;
        OnPropertyChanged(nameof(PlayButtonText));

        if (IsPlaybackPlaying)
            StartProgressTimer();
        else
            _progressTimer?.Stop();
    }

    [RelayCommand]
    private void NextTrack()
    {
        CurrentTrackIndex = (CurrentTrackIndex + 1) % DemoPlaylist.Tracks.Count;
        SongProgress = 0;
    }

    [RelayCommand]
    private void PrevTrack()
    {
        CurrentTrackIndex =
            (CurrentTrackIndex - 1 + DemoPlaylist.Tracks.Count) % DemoPlaylist.Tracks.Count;
        SongProgress = 0;
    }

    [RelayCommand]
    private void SelectTrack(int index)
    {
        CurrentTrackIndex = index;
        SongProgress = 0;
    }

    [RelayCommand]
    private void SkipBack10()
    {
        SongProgress = Math.Max(0, SongProgress - Skip10SecondsPercent);
        OnPropertyChanged(nameof(FormattedElapsed));
    }

    [RelayCommand]
    private void SkipForward10()
    {
        SongProgress = Math.Min(100, SongProgress + Skip10SecondsPercent);
        OnPropertyChanged(nameof(FormattedElapsed));
    }

    [RelayCommand]
    private void Seek(double value)
    {
        SongProgress = value;
        OnPropertyChanged(nameof(FormattedElapsed));
    }

    // -------------------------------------------------------------------------
    // Logout command
    // -------------------------------------------------------------------------

    [RelayCommand]
    private async Task LogoutAsync()
    {
        StopTimers();
        await _authService.ClearTokenAsync();
        await Shell.Current.GoToAsync($"//{nameof(Pages.LoginPage)}", animate: true);
    }

    // -------------------------------------------------------------------------
    // Timers (internal helpers)
    // -------------------------------------------------------------------------

    private void StartProgressTimer()
    {
        _progressTimer ??= Application.Current!.Dispatcher.CreateTimer();
        _progressTimer.Interval = TimeSpan.FromSeconds(1);
        _progressTimer.Tick += OnProgressTick;
        _progressTimer.Start();
    }

    private void OnProgressTick(object? sender, EventArgs e)
    {
        var next = SongProgress + (100.0 / SongDurationSeconds);
        if (next >= 100)
        {
            NextTrack();
            SongProgress = 0;
        }
        else
        {
            SongProgress = next;
        }
        OnPropertyChanged(nameof(FormattedElapsed));
    }

    private void StartAutoSaveTimer()
    {
        _autoSaveTimer ??= Application.Current!.Dispatcher.CreateTimer();
        _autoSaveTimer.Interval = AutoSaveInterval;
        _autoSaveTimer.Tick += OnAutoSaveTick;
        _autoSaveTimer.Start();
    }

    private async void OnAutoSaveTick(object? sender, EventArgs e)
    {
        await SyncToBackendAsync(Notes);
    }

    private async Task SyncToBackendAsync(string currentNotes)
    {
        if (currentNotes == _lastSyncedNotes) return;

        try
        {
            await _notesService.SaveNoteVersionAsync(currentNotes);
            _lastSyncedNotes = currentNotes;
            SyncStatus = SyncStatusKind.Saved;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[Notes] Sync failed: {ex.Message}");
            SyncStatus = SyncStatusKind.Error;
            await Shell.Current.DisplayAlert(
                "Synkfel",
                "Versionshistoriken kunde inte sparas. Kontrollera din internetanslutning.",
                "OK");
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private static string FormatTime(double totalSeconds)
    {
        var s = (int)Math.Floor(totalSeconds);
        var m = s / 60;
        var ss = s % 60;
        return $"{m}:{ss:D2}";
    }
}

/// <summary>Mirror of the <c>syncStatus</c> type in <c>NotesEditor.tsx</c>.</summary>
public enum SyncStatusKind { Saved, Pending, Error }
