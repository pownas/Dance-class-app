import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { SpotifyToken, SpotifyUser } from '../types';

// ---------------------------------------------------------------------------
// Configuration – replace CLIENT_ID with your Spotify Developer Dashboard ID
// ---------------------------------------------------------------------------
export const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? '';

export const SPOTIFY_SCOPES = [
  'user-read-email',
  'user-read-private',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
].join(' ');

const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SPOTIFY_USER_ENDPOINT = 'https://api.spotify.com/v1/me';

const SECURE_STORE_KEY = 'spotify_token';

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

/**
 * Generates a cryptographically random code verifier (43-128 chars, URL-safe).
 */
export async function generateCodeVerifier(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  // Base64url-encode without padding
  return Buffer.from(randomBytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Derives a code challenge from a code verifier using SHA-256.
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );
  // Convert standard Base64 to Base64url
  return digest
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// ---------------------------------------------------------------------------
// Authorization URL
// ---------------------------------------------------------------------------

/**
 * Builds the Spotify OAuth 2.0 PKCE authorization URL.
 */
export function buildAuthorizationUrl(
  redirectUri: string,
  codeChallenge: string,
  state: string,
): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SPOTIFY_SCOPES,
    redirect_uri: redirectUri,
    state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });
  return `${SPOTIFY_AUTH_ENDPOINT}?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Token exchange
// ---------------------------------------------------------------------------

/**
 * Exchanges an authorization code for an access + refresh token pair.
 */
export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<SpotifyToken> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: SPOTIFY_CLIENT_ID,
    code_verifier: codeVerifier,
  });

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed (${response.status}): ${text}`);
  }

  const data = await response.json() as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };
}

// ---------------------------------------------------------------------------
// Token refresh
// ---------------------------------------------------------------------------

/**
 * Uses a refresh token to obtain a new access token.
 */
export async function refreshAccessToken(refreshToken: string): Promise<SpotifyToken> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: SPOTIFY_CLIENT_ID,
  });

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token refresh failed (${response.status}): ${text}`);
  }

  const data = await response.json() as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
  };

  return {
    accessToken: data.access_token,
    // Spotify may or may not return a new refresh token
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };
}

// ---------------------------------------------------------------------------
// Secure token storage
// ---------------------------------------------------------------------------

/**
 * Persists the token bundle in device secure storage.
 */
export async function saveToken(token: SpotifyToken): Promise<void> {
  await SecureStore.setItemAsync(SECURE_STORE_KEY, JSON.stringify(token));
}

/**
 * Retrieves the stored token bundle, or null if none exists.
 */
export async function getStoredToken(): Promise<SpotifyToken | null> {
  const raw = await SecureStore.getItemAsync(SECURE_STORE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as SpotifyToken;
}

/**
 * Removes the stored token from secure storage.
 */
export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
}

// ---------------------------------------------------------------------------
// User profile
// ---------------------------------------------------------------------------

/**
 * Fetches the Spotify profile for the authenticated user.
 * Automatically refreshes the token if it has expired.
 */
export async function getCurrentUser(token: SpotifyToken): Promise<{ user: SpotifyUser; token: SpotifyToken }> {
  let activeToken = token;

  // Refresh if the access token is expired (with a 30-second buffer)
  if (Date.now() >= activeToken.expiresAt - 30_000) {
    activeToken = await refreshAccessToken(activeToken.refreshToken);
    await saveToken(activeToken);
  }

  const response = await fetch(SPOTIFY_USER_ENDPOINT, {
    headers: { Authorization: `Bearer ${activeToken.accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile (${response.status})`);
  }

  const data = await response.json() as {
    id: string;
    display_name: string;
    email: string;
    images?: Array<{ url: string }>;
  };

  const user: SpotifyUser = {
    id: data.id,
    displayName: data.display_name,
    email: data.email,
    imageUrl: data.images?.[0]?.url,
  };

  return { user, token: activeToken };
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

/**
 * Clears all locally stored Spotify credentials.
 */
export async function logout(): Promise<void> {
  await clearToken();
}
