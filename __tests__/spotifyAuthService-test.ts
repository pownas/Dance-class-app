import {
  generateCodeVerifier,
  generateCodeChallenge,
  buildAuthorizationUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  saveToken,
  getStoredToken,
  clearToken,
  getCurrentUser,
  logout,
  SPOTIFY_CLIENT_ID,
} from '../src/services/spotifyAuthService';
import { SpotifyToken } from '../src/types';

// The expo-secure-store mock lives in __mocks__/expo-secure-store/index.ts
import * as SecureStore from 'expo-secure-store';

beforeEach(() => {
  jest.clearAllMocks();
  // Clear the in-memory store of the mock
  (SecureStore as { _reset?: () => void })._reset?.();
});

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

describe('generateCodeVerifier', () => {
  it('returns a non-empty URL-safe base64 string', async () => {
    const verifier = await generateCodeVerifier();
    expect(typeof verifier).toBe('string');
    expect(verifier.length).toBeGreaterThan(0);
    // Must not contain +, /, or =
    expect(verifier).not.toMatch(/[+/=]/);
  });
});

describe('generateCodeChallenge', () => {
  it('returns a non-empty URL-safe base64 string derived from the verifier', async () => {
    const verifier = await generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    expect(typeof challenge).toBe('string');
    expect(challenge.length).toBeGreaterThan(0);
    expect(challenge).not.toMatch(/[+/=]/);
  });

  it('produces a different value than the verifier', async () => {
    const verifier = await generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    expect(challenge).not.toBe(verifier);
  });
});

// ---------------------------------------------------------------------------
// buildAuthorizationUrl
// ---------------------------------------------------------------------------

describe('buildAuthorizationUrl', () => {
  it('contains the correct base endpoint', () => {
    const url = buildAuthorizationUrl('dance-class-app://cb', 'abc123', 'state42');
    expect(url).toContain('https://accounts.spotify.com/authorize');
  });

  it('includes PKCE parameters', () => {
    const url = buildAuthorizationUrl('dance-class-app://cb', 'abc123', 'state42');
    expect(url).toContain('code_challenge_method=S256');
    expect(url).toContain('code_challenge=abc123');
    expect(url).toContain('response_type=code');
  });

  it('includes the redirect_uri and state', () => {
    const url = buildAuthorizationUrl('dance-class-app://cb', 'abc123', 'mystate');
    expect(url).toContain(encodeURIComponent('dance-class-app://cb'));
    expect(url).toContain('state=mystate');
  });
});

// ---------------------------------------------------------------------------
// exchangeCodeForToken
// ---------------------------------------------------------------------------

describe('exchangeCodeForToken', () => {
  it('returns a SpotifyToken on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'access_abc',
        refresh_token: 'refresh_xyz',
        expires_in: 3600,
        scope: 'streaming',
      }),
    }) as unknown as typeof fetch;

    const token = await exchangeCodeForToken('code123', 'verifier', 'dance-class-app://cb');
    expect(token.accessToken).toBe('access_abc');
    expect(token.refreshToken).toBe('refresh_xyz');
    expect(token.scope).toBe('streaming');
    expect(token.expiresAt).toBeGreaterThan(Date.now());
  });

  it('throws when the server returns a non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'invalid_grant',
    }) as unknown as typeof fetch;

    await expect(
      exchangeCodeForToken('bad_code', 'verifier', 'dance-class-app://cb'),
    ).rejects.toThrow('Token exchange failed (400)');
  });
});

// ---------------------------------------------------------------------------
// refreshAccessToken
// ---------------------------------------------------------------------------

describe('refreshAccessToken', () => {
  it('returns a new SpotifyToken with updated access token', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'new_access',
        expires_in: 3600,
        scope: 'streaming',
        // no refresh_token — should reuse the old one
      }),
    }) as unknown as typeof fetch;

    const oldToken: SpotifyToken = {
      accessToken: 'old_access',
      refreshToken: 'old_refresh',
      expiresAt: Date.now() - 1000,
      scope: 'streaming',
    };

    const token = await refreshAccessToken(oldToken.refreshToken);
    expect(token.accessToken).toBe('new_access');
    expect(token.refreshToken).toBe('old_refresh'); // preserved
  });

  it('throws when the refresh endpoint returns an error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'token_expired',
    }) as unknown as typeof fetch;

    await expect(refreshAccessToken('bad_refresh')).rejects.toThrow(
      'Token refresh failed (401)',
    );
  });
});

// ---------------------------------------------------------------------------
// Secure token storage
// ---------------------------------------------------------------------------

describe('saveToken / getStoredToken / clearToken', () => {
  const mockToken: SpotifyToken = {
    accessToken: 'access_test',
    refreshToken: 'refresh_test',
    expiresAt: Date.now() + 3_600_000,
    scope: 'streaming',
  };

  it('stores and retrieves a token', async () => {
    await saveToken(mockToken);
    const retrieved = await getStoredToken();
    expect(retrieved).toEqual(mockToken);
  });

  it('returns null when nothing is stored', async () => {
    const result = await getStoredToken();
    expect(result).toBeNull();
  });

  it('clears the stored token', async () => {
    await saveToken(mockToken);
    await clearToken();
    const result = await getStoredToken();
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getCurrentUser
// ---------------------------------------------------------------------------

describe('getCurrentUser', () => {
  const validToken: SpotifyToken = {
    accessToken: 'valid_access',
    refreshToken: 'valid_refresh',
    expiresAt: Date.now() + 3_600_000, // valid for 1 hour
    scope: 'user-read-email',
  };

  it('returns user profile when token is valid', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'user123',
        display_name: 'Dance Teacher',
        email: 'teacher@example.com',
        images: [{ url: 'https://example.com/avatar.jpg' }],
      }),
    }) as unknown as typeof fetch;

    const { user } = await getCurrentUser(validToken);
    expect(user.id).toBe('user123');
    expect(user.displayName).toBe('Dance Teacher');
    expect(user.email).toBe('teacher@example.com');
    expect(user.imageUrl).toBe('https://example.com/avatar.jpg');
  });

  it('refreshes expired token before fetching profile', async () => {
    const expiredToken: SpotifyToken = {
      ...validToken,
      expiresAt: Date.now() - 1000, // already expired
    };

    let callCount = 0;
    global.fetch = jest.fn(async (url: RequestInfo | URL) => {
      callCount++;
      if (String(url).includes('token')) {
        // refresh call
        return {
          ok: true,
          json: async () => ({
            access_token: 'refreshed_access',
            expires_in: 3600,
            scope: 'streaming',
          }),
        };
      }
      // user profile call
      return {
        ok: true,
        json: async () => ({
          id: 'user_refreshed',
          display_name: 'Refreshed User',
          email: 'refreshed@example.com',
          images: [],
        }),
      };
    }) as unknown as typeof fetch;

    const { user, token } = await getCurrentUser(expiredToken);
    expect(token.accessToken).toBe('refreshed_access');
    expect(user.id).toBe('user_refreshed');
    expect(callCount).toBe(2); // refresh + profile
  });

  it('throws when profile fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
    }) as unknown as typeof fetch;

    await expect(getCurrentUser(validToken)).rejects.toThrow(
      'Failed to fetch user profile (403)',
    );
  });
});

// ---------------------------------------------------------------------------
// logout
// ---------------------------------------------------------------------------

describe('logout', () => {
  it('clears the stored token', async () => {
    const token: SpotifyToken = {
      accessToken: 'a',
      refreshToken: 'r',
      expiresAt: Date.now() + 10000,
      scope: 's',
    };
    await saveToken(token);
    await logout();
    const result = await getStoredToken();
    expect(result).toBeNull();
  });
});
