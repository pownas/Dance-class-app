import { saveNoteVersion } from '../src/services/notesService';

describe('notesService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('POSTs to the notes version endpoint with correct payload', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch as unknown as typeof fetch;

    const testContent = '# Test\n\nSome notes here.';
    await saveNoteVersion(testContent);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/notes/version');
    expect(options.method).toBe('POST');

    const body = JSON.parse(options.body as string) as { markdownContent: string; timestamp: string };
    expect(body.markdownContent).toBe(testContent);
    expect(typeof body.timestamp).toBe('string');
  });

  it('throws when the server returns a non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    await expect(saveNoteVersion('some notes')).rejects.toThrow('Server responded with status 500');
  });

  it('propagates network errors', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as unknown as typeof fetch;

    await expect(saveNoteVersion('notes')).rejects.toThrow('Network error');
  });
});
