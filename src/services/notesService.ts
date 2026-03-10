import { NoteVersion } from '../types';
import { buildUrl } from './apiConfigService';

/**
 * Sends the current note content to the backend as a new version entry.
 * Only called when the content has changed since the last sync.
 */
export async function saveNoteVersion(markdownContent: string): Promise<void> {
  const payload: NoteVersion = {
    timestamp: new Date().toISOString(),
    markdownContent,
  };

  const url = await buildUrl('/notes/version');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Server responded with status ${response.status}`);
  }
}
