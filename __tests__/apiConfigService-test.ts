import { getApiBaseUrl, setApiBaseUrl, clearApiBaseUrl, buildUrl } from '../src/services/apiConfigService';
import * as SecureStore from 'expo-secure-store';

beforeEach(() => {
  jest.clearAllMocks();
  (SecureStore as { _reset?: () => void })._reset?.();
});

describe('getApiBaseUrl', () => {
  it('returns the default URL when nothing is stored', async () => {
    const url = await getApiBaseUrl();
    expect(url).toContain('://');
    expect(typeof url).toBe('string');
    expect(url.length).toBeGreaterThan(0);
  });

  it('returns a stored custom URL', async () => {
    await setApiBaseUrl('https://my-server.example.com/api');
    const url = await getApiBaseUrl();
    expect(url).toBe('https://my-server.example.com/api');
  });
});

describe('setApiBaseUrl', () => {
  it('strips trailing slashes from the URL', async () => {
    await setApiBaseUrl('https://my-server.example.com/api/');
    const url = await getApiBaseUrl();
    expect(url).toBe('https://my-server.example.com/api');
  });

  it('strips multiple trailing slashes', async () => {
    await setApiBaseUrl('https://my-server.example.com/api///');
    const url = await getApiBaseUrl();
    expect(url).toBe('https://my-server.example.com/api');
  });
});

describe('clearApiBaseUrl', () => {
  it('reverts to the default URL after clearing', async () => {
    await setApiBaseUrl('https://custom.example.com/api');
    await clearApiBaseUrl();
    const url = await getApiBaseUrl();
    // Must not be the custom URL anymore
    expect(url).not.toBe('https://custom.example.com/api');
  });
});

describe('buildUrl', () => {
  it('concatenates the base URL with the given path', async () => {
    await setApiBaseUrl('https://api.example.com');
    const url = await buildUrl('/songs');
    expect(url).toBe('https://api.example.com/songs');
  });

  it('works with the default base URL', async () => {
    const url = await buildUrl('/songs');
    expect(url).toMatch(/\/songs$/);
  });
});
