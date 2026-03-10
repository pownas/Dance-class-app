import { useCallback, useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { SpotifyAuthState, SpotifyToken } from '../types';
import {
  buildAuthorizationUrl,
  clearToken,
  exchangeCodeForToken,
  generateCodeChallenge,
  generateCodeVerifier,
  getCurrentUser,
  getStoredToken,
  isSpotifyConfigured,
  logout as serviceLogout,
  refreshAccessToken,
  saveToken,
} from '../services/spotifyAuthService';

/**
 * Builds the redirect URI for the current platform using expo-auth-session.
 */
export function getRedirectUri(): string {
  return AuthSession.makeRedirectUri({ scheme: 'dance-class-app' });
}

/**
 * Hook that manages the full Spotify OAuth 2.0 PKCE lifecycle:
 *   - Restores an existing session from secure storage on mount
 *   - Provides `login()` to start the OAuth flow
 *   - Provides `logout()` to clear the session
 *   - Automatically refreshes expired tokens
 */
export function useSpotifyAuth() {
  const [authState, setAuthState] = useState<SpotifyAuthState>({ status: 'unauthenticated' });

  // -------------------------------------------------------------------------
  // Restore session on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setAuthState({ status: 'loading' });
      try {
        const stored = await getStoredToken();
        if (!stored) {
          if (!cancelled) setAuthState({ status: 'unauthenticated' });
          return;
        }

        // Refresh if expired
        let token: SpotifyToken = stored;
        if (Date.now() >= token.expiresAt - 30_000) {
          token = await refreshAccessToken(token.refreshToken);
          await saveToken(token);
        }

        const { user, token: freshToken } = await getCurrentUser(token);
        if (!cancelled) {
          setAuthState({ status: 'authenticated', user, token: freshToken });
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[SpotifyAuth] Failed to restore session:', err);
          await clearToken();
          setAuthState({ status: 'unauthenticated' });
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // -------------------------------------------------------------------------
  // Login
  // -------------------------------------------------------------------------
  const login = useCallback(async () => {
    if (!isSpotifyConfigured()) {
      setAuthState({
        status: 'error',
        message: 'Spotify Client ID is not configured. Set EXPO_PUBLIC_SPOTIFY_CLIENT_ID.',
      });
      return;
    }

    setAuthState({ status: 'loading' });
    try {
      const redirectUri = getRedirectUri();
      const codeVerifier = await generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = await generateCodeVerifier(); // random state param

      const url = buildAuthorizationUrl(redirectUri, codeChallenge, state);
      const result = await AuthSession.openAuthSessionAsync(url, redirectUri);

      if (result.type !== 'success') {
        setAuthState({ status: 'unauthenticated' });
        return;
      }

      const params = new URLSearchParams(new URL(result.url).search);
      const returnedState = params.get('state');
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        throw new Error(`Spotify auth error: ${error}`);
      }

      if (returnedState !== state) {
        throw new Error('OAuth state mismatch – possible CSRF attack');
      }

      if (!code) {
        throw new Error('No authorization code received');
      }

      const token = await exchangeCodeForToken(code, codeVerifier, redirectUri);
      await saveToken(token);

      const { user, token: freshToken } = await getCurrentUser(token);
      setAuthState({ status: 'authenticated', user, token: freshToken });
    } catch (err) {
      console.error('[SpotifyAuth] Login failed:', err);
      const message = err instanceof Error ? err.message : 'Okänt fel vid inloggning';
      setAuthState({ status: 'error', message });
    }
  }, []);

  // -------------------------------------------------------------------------
  // Logout
  // -------------------------------------------------------------------------
  const logout = useCallback(async () => {
    await serviceLogout();
    setAuthState({ status: 'unauthenticated' });
  }, []);

  return { authState, login, logout };
}
