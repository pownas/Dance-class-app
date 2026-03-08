export interface NoteVersion {
  timestamp: string;
  markdownContent: string;
}

export type PlaybackState = 'playing' | 'paused';
