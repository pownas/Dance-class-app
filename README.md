# Dance Class App

A cross-platform mobile app for dance teachers and choreographers, combining **Spotify music controls** and **Markdown notes** in a single, focused view — so you never have to switch apps mid-class.

Built with **React Native + Expo** for iOS & Android from a single codebase.

---

## Features

- 🎵 **Spotify Controls** — Previous, Play/Pause, Next, and a Volume slider in a persistent top bar
- 📝 **Markdown Notes** — Full-screen scrollable text editor with Markdown support for class plans and choreography notes
- 💾 **Version History** — Auto-saves notes to a REST backend every 3 minutes (only when content has changed), storing timestamped versions you can roll back to

---

## Project Structure

```
Dance-class-app/
├── App.tsx                        # Root component — wires everything together
├── index.ts                       # Expo entry point
├── app.json                       # Expo configuration
├── src/
│   ├── components/
│   │   ├── SpotifyControls.tsx    # Playback controls + volume slider
│   │   └── NotesEditor.tsx        # Markdown text editor with sync status
│   ├── services/
│   │   └── notesService.ts        # Backend sync (POST /api/notes/version)
│   └── types/
│       └── index.ts               # Shared TypeScript types
└── __tests__/                     # Jest unit tests
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [Expo Go](https://expo.dev/client) app on your device (for quick testing)

### Install

```bash
npm install
```

### Run

```bash
# Start the Metro bundler (scan QR code with Expo Go)
npm start

# Open directly on Android emulator
npm run android

# Open directly on iOS simulator (requires macOS)
npm run ios

# Open in web browser
npm run web
```

### Test

```bash
npm test
```

---

## Spotify Integration

The Spotify control buttons are currently stubs. To activate real playback control, integrate one of:

- **Spotify App Remote SDK** — recommended for volume control and native playback (requires native configuration with `npx expo prebuild`)
- **Spotify Web API** — controls playback via a server, requires OAuth 2.0 sign-in

Wire the SDK calls into `App.tsx` handlers (`handleTogglePlay`, `handleNextTrack`, `handlePrevTrack`, `handleVolumeChange`).

---

## Backend (Version History)

The app POSTs to `POST /api/notes/version` every 3 minutes when notes have changed:

```json
{
  "timestamp": "2026-03-06T08:26:31.000Z",
  "markdownContent": "# WCS Steg 1\n..."
}
```

Set up a backend (e.g. Node.js/Express + PostgreSQL or MongoDB) with this endpoint linked to a user ID to enable full version history and rollback.

Update the `NOTES_API_URL` constant in `src/services/notesService.ts` to point to your backend.