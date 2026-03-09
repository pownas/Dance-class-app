export interface NoteVersion {
  timestamp: string;
  markdownContent: string;
}

export type PlaybackState = 'playing' | 'paused';

export interface Track {
  id: string;
  name: string;
  artist: string;
}

export interface Playlist {
  name: string;
  tracks: Track[];
}
