import { NoteVersion } from '../types';

const NOTES_API_URL = 'https://din-backend-api.com/api/notes/version';

/**
 * Sends the current note content to the backend as a new version entry.
 * Only called when the content has changed since the last sync.
 */
export async function saveNoteVersion(markdownContent: string): Promise<void> {
  const payload: NoteVersion = {
    timestamp: new Date().toISOString(),
    markdownContent,
  };

  const response = await fetch(NOTES_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Server responded with status ${response.status}`);
  }
}
