import {
  getSongs,
  getSong,
  createSong,
  updateSong,
  deleteSong,
} from '../src/services/songsService';
import * as SecureStore from 'expo-secure-store';

beforeEach(() => {
  jest.clearAllMocks();
  (SecureStore as { _reset?: () => void })._reset?.();
});

const mockSong = { id: '1', title: 'Boogie Wonderland', artist: 'Earth, Wind & Fire', bpm: 119 };
const mockSongInput = { title: 'Boogie Wonderland', artist: 'Earth, Wind & Fire', bpm: 119 };

// ---------------------------------------------------------------------------
// getSongs
// ---------------------------------------------------------------------------
describe('getSongs', () => {
  it('GETs /songs and returns song array', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [mockSong],
    }) as unknown as typeof fetch;

    const songs = await getSongs();
    expect(songs).toEqual([mockSong]);
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toMatch(/\/songs$/);
    expect((global.fetch as jest.Mock).mock.calls[0][1]).toBeUndefined();
  });

  it('throws on non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
    await expect(getSongs()).rejects.toThrow('Failed to fetch songs (500)');
  });
});

// ---------------------------------------------------------------------------
// getSong
// ---------------------------------------------------------------------------
describe('getSong', () => {
  it('GETs /songs/:id and returns the song', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSong,
    }) as unknown as typeof fetch;

    const song = await getSong('1');
    expect(song).toEqual(mockSong);
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toMatch(/\/songs\/1$/);
  });

  it('throws on not-found response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;
    await expect(getSong('unknown')).rejects.toThrow('Failed to fetch song unknown (404)');
  });
});

// ---------------------------------------------------------------------------
// createSong
// ---------------------------------------------------------------------------
describe('createSong', () => {
  it('POSTs to /songs with correct payload and returns created song', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ...mockSongInput, id: '42' }),
    }) as unknown as typeof fetch;

    const song = await createSong(mockSongInput);
    expect(song.id).toBe('42');
    expect(song.title).toBe(mockSongInput.title);

    const [url, opts] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/songs$/);
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body as string)).toMatchObject(mockSongInput);
  });

  it('throws on bad-request response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400 }) as unknown as typeof fetch;
    await expect(createSong(mockSongInput)).rejects.toThrow('Failed to create song (400)');
  });
});

// ---------------------------------------------------------------------------
// updateSong
// ---------------------------------------------------------------------------
describe('updateSong', () => {
  it('PUTs to /songs/:id with correct payload and returns updated song', async () => {
    const updated = { ...mockSong, bpm: 120 };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => updated,
    }) as unknown as typeof fetch;

    const song = await updateSong('1', { ...mockSongInput, bpm: 120 });
    expect(song.bpm).toBe(120);

    const [url, opts] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/songs\/1$/);
    expect(opts.method).toBe('PUT');
  });

  it('throws on not-found response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;
    await expect(updateSong('missing', mockSongInput)).rejects.toThrow('Failed to update song missing (404)');
  });
});

// ---------------------------------------------------------------------------
// deleteSong
// ---------------------------------------------------------------------------
describe('deleteSong', () => {
  it('DELETEs /songs/:id', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;

    await deleteSong('1');

    const [url, opts] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/songs\/1$/);
    expect(opts.method).toBe('DELETE');
  });

  it('throws on not-found response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;
    await expect(deleteSong('ghost')).rejects.toThrow('Failed to delete song ghost (404)');
  });
});
