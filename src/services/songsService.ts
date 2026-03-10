import { Song, SongInput } from '../types';
import { buildUrl } from './apiConfigService';

/**
 * Fetches the full list of songs from the backend.
 */
export async function getSongs(): Promise<Song[]> {
  const url = await buildUrl('/songs');
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch songs (${response.status})`);
  }
  return response.json() as Promise<Song[]>;
}

/**
 * Fetches a single song by its ID.
 */
export async function getSong(id: string): Promise<Song> {
  const url = await buildUrl(`/songs/${encodeURIComponent(id)}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch song ${id} (${response.status})`);
  }
  return response.json() as Promise<Song>;
}

/**
 * Creates a new song and returns the created resource including its server-assigned ID.
 */
export async function createSong(song: SongInput): Promise<Song> {
  const url = await buildUrl('/songs');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(song),
  });
  if (!response.ok) {
    throw new Error(`Failed to create song (${response.status})`);
  }
  return response.json() as Promise<Song>;
}

/**
 * Replaces an existing song with the supplied data.
 */
export async function updateSong(id: string, song: SongInput): Promise<Song> {
  const url = await buildUrl(`/songs/${encodeURIComponent(id)}`);
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(song),
  });
  if (!response.ok) {
    throw new Error(`Failed to update song ${id} (${response.status})`);
  }
  return response.json() as Promise<Song>;
}

/**
 * Deletes a song by ID.
 */
export async function deleteSong(id: string): Promise<void> {
  const url = await buildUrl(`/songs/${encodeURIComponent(id)}`);
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`Failed to delete song ${id} (${response.status})`);
  }
}
