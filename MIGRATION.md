# Migrering till .NET MAUI

> **Är det möjligt?** Ja – .NET MAUI är ett utmärkt val för en korsplattformsapp
> riktad mot iOS och Android från en enda kodbas.
> Den nuvarande React Native + Expo-appen fungerar *redan* på båda plattformarna,
> men MAUI erbjuder djupare integrering med native .NET-ekosystemet, starkare
> typsäkerhet och en väl etablerad MVVM-arkitektur.

---

## Nuläge (React Native + Expo)

| Egenskap | Värde |
|----------|-------|
| Ramverk | React Native 0.83 via Expo SDK 55 |
| Språk | TypeScript |
| Plattformar | iOS, Android, Web |
| Arkitektur | Komponentbaserad (React-komponenter + Hooks) |
| Autentisering | OAuth 2.0 PKCE via `expo-auth-session` |
| Säker lagring | `expo-secure-store` |
| HTTP | Webbläsarens inbyggda `fetch` |
| Testramverk | Jest + jest-expo |

---

## Föreslaget mål (.NET MAUI)

| Egenskap | Värde |
|----------|-------|
| Ramverk | .NET MAUI (.NET 9) |
| Språk | C# 13 |
| Plattformar | iOS 15+, Android API 24+ |
| Arkitektur | MVVM med CommunityToolkit.Mvvm |
| Autentisering | OAuth 2.0 PKCE via `WebAuthenticator` (MAUI Essentials) |
| Säker lagring | `SecureStorage` (MAUI Essentials) |
| HTTP | `HttpClient` via `IHttpClientFactory` |
| Testramverk | xUnit + bunit / Moq |

---

## Filer skapade i denna PR

```
maui/
├── DanceClassApp.sln
└── DanceClassApp/
    ├── DanceClassApp.csproj
    ├── MauiProgram.cs
    ├── App.xaml / .cs
    ├── AppShell.xaml / .cs
    ├── Models/            NoteVersion, Song, Playlist, CourseText, SpotifyAuth
    ├── Services/          ApiConfig, Notes, Songs, CourseTexts, SpotifyAuth
    ├── ViewModels/        Base, Login, Main
    ├── Pages/             LoginPage, MainPage
    └── Resources/Styles/  Colors.xaml, Styles.xaml
```

---

## Mappning: React Native → .NET MAUI

| React Native-fil | MAUI-motsvarighet |
|-----------------|-------------------|
| `src/types/index.ts` | `Models/*.cs` |
| `src/services/apiConfigService.ts` | `Services/ApiConfigService.cs` |
| `src/services/notesService.ts` | `Services/NotesService.cs` |
| `src/services/songsService.ts` | `Services/SongsService.cs` |
| `src/services/courseTextsService.ts` | `Services/CourseTextsService.cs` |
| `src/services/spotifyAuthService.ts` | `Services/SpotifyAuthService.cs` |
| `src/hooks/useSpotifyAuth.ts` | `ViewModels/LoginViewModel.cs` + `MainViewModel.cs` |
| `src/components/SpotifyLogin.tsx` | `Pages/LoginPage.xaml` + `ViewModels/LoginViewModel.cs` |
| `src/components/SpotifyControls.tsx` | `Pages/MainPage.xaml` (övre del) + `ViewModels/MainViewModel.cs` |
| `src/components/NotesEditor.tsx` | `Pages/MainPage.xaml` (nedre del) + `ViewModels/MainViewModel.cs` |
| `src/components/PlaylistQueue.tsx` | Inbäddad overlay i `MainPage.xaml` |
| `App.tsx` (state-logik) | `ViewModels/MainViewModel.cs` |

---

## Vägval och rekommendationer

### 1. Behålla React Native eller migrera?

**Behåll React Native om:**
- Teamet är bekvämt med JavaScript/TypeScript och React.
- Webstöd behövs (MAUI stöder inte webbläsare i dagsläget).
- Snabb iteration med hot reload är avgörande.
- Appen är redan i drift och migrationskostnaden är hög.

**Migrera till MAUI om:**
- Teamet föredrar C# och .NET.
- Djup native-integration behövs (t.ex. Bluetooth, avancerat kamera-API).
- Delade backend-bibliotek i .NET ska återanvändas i mobilappen.
- Starkt typade XAML-vyer och kompileringsfelsökning efterfrågas.

### 2. Stegvis migrering (rekommenderad strategi)

En *big-bang*-migrering (skriv om allt på en gång) riskerar långa stilleståndstider.
En stegvis strategi minimerar risken:

```
Steg 1 – Parallell utveckling (denna PR)
  ├── Skapa MAUI-projektet vid sidan om React Native-appen.
  ├── Implementera modeller, tjänster och ViewModels.
  └── Verifiera att backend-API:t fungerar från MAUI.

Steg 2 – Feature parity
  ├── Komplettera Spotify-integration (WebAuthenticator-flöde, token-refresh).
  ├── Lägg till plattformsspecifika filer (AndroidManifest, Info.plist).
  └── Skriv xUnit-tester för ViewModels och tjänster.

Steg 3 – Testning och buggrättning
  ├── Kör på fysiska enheter (iOS + Android).
  ├── Genomför UX-granskning (responsivitet, tillgänglighet).
  └── Åtgärda plattformsspecifika skillnader.

Steg 4 – Lansering och avveckling
  ├── Publicera MAUI-appen i App Store / Google Play.
  ├── Övervaka krascher och feedback.
  └── Avveckla React Native-appen när MAUI-appen är stabil.
```

### 3. Spotify-integration

MAUI saknar en direkt motsvarighet till `expo-auth-session`, men
**`WebAuthenticator`** (ingår i MAUI Essentials) hanterar OAuth-flödet
med PKCE på ett likvärdigt sätt:

```csharp
var result = await WebAuthenticator.Default.AuthenticateAsync(
    new Uri(authUrl), new Uri("danceclassapp://callback"));
```

Den anpassade URI-schemat (`danceclassapp://`) måste registreras i
`AndroidManifest.xml` och `Info.plist` (se `maui/README.md`).

För Spotify **Web Playback SDK** (direktströmning i webbläsaren) finns
inget officiellt MAUI-stöd. Alternativ:
- **Spotify App Remote SDK** – kräver Spotify-appen installerad; bäst för volym
  och playback-kontroll.
- **Spotify Web API** – server-side kontroll via REST; kräver en aktiv
  Premium-prenumeration.

### 4. Säker lagring

| React Native | .NET MAUI |
|---|---|
| `expo-secure-store` (iOS Keychain / Android Keystore) | `SecureStorage` (iOS Keychain / Android Keystore) |

Beteendet är i princip identiskt – båda API:erna lagrar data krypterat med
plattformens inbyggda nyckellagringstjänst.

### 5. Bakgrundstimers

React Native använder `setInterval` för autospar och låtframsteg.
MAUI-appen använder `IDispatcherTimer` (som körs på UI-tråden) för att undvika
trådproblem med XAML-bindningar.

### 6. Testning

Rekommenderade testbibliotek för MAUI:

| Bibliotek | Syfte |
|-----------|-------|
| `xUnit` | Enhetstester |
| `Moq` | Mocking av tjänster |
| `CommunityToolkit.Maui.UnitTests` | MAUI-specifika testhjälpare |
| `Appium` / `XCUITest` / `Espresso` | UI-automationstester |

ViewModel-tester är särskilt värdefulla eftersom all affärslogik är isolerad
i `LoginViewModel` och `MainViewModel`.

---

## Vad återstår för ett fullständigt produktionssystem?

- [ ] Platformspecifika filer: `Platforms/Android/` och `Platforms/iOS/`
      (AndroidManifest.xml, Info.plist, MainActivity.cs, AppDelegate.cs)
- [ ] Appikon och splash-skärm (ersätt platshållarna i `Resources/Images/`)
- [ ] OpenSans-typsnitt (ladda ner och lägg i `Resources/Fonts/`)
- [ ] xUnit-tester för ViewModels och tjänster
- [ ] Spotify App Remote SDK eller Web API för faktisk uppspelning
- [ ] Tillgänglighetstest (VoiceOver / TalkBack)
- [ ] CI/CD-pipeline (GitHub Actions med MAUI build-action)
- [ ] Publicering till App Store och Google Play

---

## Resurser

- [.NET MAUI dokumentation](https://learn.microsoft.com/dotnet/maui/)
- [CommunityToolkit.Mvvm](https://learn.microsoft.com/dotnet/communitytoolkit/mvvm/)
- [CommunityToolkit.Maui](https://learn.microsoft.com/dotnet/communitytoolkit/maui/)
- [WebAuthenticator i MAUI](https://learn.microsoft.com/dotnet/maui/platform-integration/communication/authentication)
- [SecureStorage i MAUI](https://learn.microsoft.com/dotnet/maui/platform-integration/storage/secure-storage)
- [Spotify OAuth 2.0 PKCE](https://developer.spotify.com/documentation/general/guides/authorization/code-flow/)
