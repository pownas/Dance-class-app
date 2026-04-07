# .NET MAUI – Dance Class App

This directory contains the **.NET MAUI** port of the Dance Class App.
It targets **iOS 15+** and **Android API 24+** from a single C# codebase.

## Project structure

```
maui/
├── DanceClassApp.sln
└── DanceClassApp/
    ├── DanceClassApp.csproj       # MAUI project (iOS + Android targets)
    ├── MauiProgram.cs             # Dependency-injection bootstrap
    ├── App.xaml / App.xaml.cs     # Application class
    ├── AppShell.xaml / .cs        # Shell navigation (login → main)
    ├── Models/
    │   ├── NoteVersion.cs         # ↔ NoteVersion (TS)
    │   ├── Song.cs                # ↔ Song / SongInput (TS)
    │   ├── Playlist.cs            # ↔ Track / Playlist (TS)
    │   ├── CourseText.cs          # ↔ CourseText / CourseTextInput (TS)
    │   └── SpotifyAuth.cs         # ↔ SpotifyToken / SpotifyUser / SpotifyAuthState (TS)
    ├── Services/
    │   ├── IApiConfigService.cs / ApiConfigService.cs   # ↔ apiConfigService.ts
    │   ├── INotesService.cs / NotesService.cs           # ↔ notesService.ts
    │   ├── ISongsService.cs / SongsService.cs           # ↔ songsService.ts
    │   ├── ICourseTextsService.cs / CourseTextsService.cs # ↔ courseTextsService.ts
    │   └── ISpotifyAuthService.cs / SpotifyAuthService.cs # ↔ spotifyAuthService.ts
    ├── ViewModels/
    │   ├── BaseViewModel.cs       # INotifyPropertyChanged base
    │   ├── LoginViewModel.cs      # ↔ useSpotifyAuth.ts + SpotifyLogin.tsx
    │   └── MainViewModel.cs       # ↔ App.tsx state + SpotifyControls.tsx
    ├── Pages/
    │   ├── LoginPage.xaml / .cs   # ↔ SpotifyLogin.tsx
    │   └── MainPage.xaml / .cs    # ↔ SpotifyControls.tsx + NotesEditor.tsx
    └── Resources/
        ├── Styles/
        │   ├── Colors.xaml        # Brand colours (SpotifyGreen, etc.)
        │   └── Styles.xaml        # Implicit + named XAML styles
        ├── Images/                # App icon + splash screen (add your own)
        ├── Fonts/                 # OpenSans fonts (add your own)
        └── Raw/                   # Bundled raw assets (if any)
```

## Prerequisites

| Tool | Version |
|------|---------|
| [.NET SDK](https://dotnet.microsoft.com/download) | 9.0 or later |
| [.NET MAUI workload](https://learn.microsoft.com/dotnet/maui/get-started/installation) | latest |
| Xcode (macOS only, for iOS) | 15+ |
| Android SDK | API 24+ |

### Install the MAUI workload

```bash
dotnet workload install maui
```

## Getting started

```bash
cd maui

# Restore NuGet packages
dotnet restore DanceClassApp.sln

# Run on Android emulator
dotnet build -t:Run -f net9.0-android DanceClassApp/DanceClassApp.csproj

# Run on iOS simulator (macOS only)
dotnet build -t:Run -f net9.0-ios DanceClassApp/DanceClassApp.csproj
```

## Configuration

### Spotify Client ID

Set the `SPOTIFY_CLIENT_ID` environment variable **before** building, or
hard-code it directly in `Services/SpotifyAuthService.cs`:

```bash
export SPOTIFY_CLIENT_ID=your_client_id_here
```

Register `danceclassapp://callback` as a redirect URI in the
[Spotify Developer Dashboard](https://developer.spotify.com/dashboard).

You also need to add the custom URI scheme to each platform:

**Android** – `Platforms/Android/AndroidManifest.xml`:

```xml
<activity android:name="microsoft.maui.authentication.WebAuthenticatorCallbackActivity" ...>
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="danceclassapp" android:host="callback" />
    </intent-filter>
</activity>
```

**iOS** – `Platforms/iOS/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>DanceClassApp</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>danceclassapp</string>
        </array>
    </dict>
</array>
```

### Backend API URL

The default backend URL is `https://din-backend-api.com/api` (same as the
React Native app). Override it with:

```bash
export DANCE_APP_API_BASE_URL=https://your-backend.example.com/api
```

or update it at runtime via `IApiConfigService.SetApiBaseUrlAsync()`.
