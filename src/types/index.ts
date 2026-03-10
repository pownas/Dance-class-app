export interface NoteVersion {
  timestamp: string;
  markdownContent: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm?: number;
  notes?: string;
}

export interface SongInput {
  title: string;
  artist: string;
  bpm?: number;
  notes?: string;
}

export interface CourseText {
  id: string;
  title: string;
  content: string;
  tags?: string[];
}

export interface CourseTextInput {
  title: string;
  content: string;
  tags?: string[];
}

export interface ApiError {
  error: string;
  details?: string;
}

export type PlaybackState = 'playing' | 'paused';

export interface Track {
  id: string;
  name: string;
  artist: string;
  bpm?: number;
}

export interface Playlist {
  name: string;
  tracks: Track[];
}

export interface SpotifyToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp (ms) when access token expires
  scope: string;
}

export interface SpotifyUser {
  id: string;
  displayName: string;
  email: string;
  imageUrl?: string;
}

export type SpotifyAuthState =
  | { status: 'unauthenticated' }
  | { status: 'loading' }
  | { status: 'authenticated'; user: SpotifyUser; token: SpotifyToken }
  | { status: 'error'; message: string };
