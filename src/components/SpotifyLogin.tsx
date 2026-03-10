import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SpotifyAuthState } from '../types';

const SPOTIFY_GREEN = '#1DB954';
const SPOTIFY_BLACK = '#191414';

interface SpotifyLoginProps {
  authState: SpotifyAuthState;
  onLogin: () => void;
}

export default function SpotifyLogin({ authState, onLogin }: SpotifyLoginProps) {
  const isLoading = authState.status === 'loading';
  const errorMessage = authState.status === 'error' ? authState.message : null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>🎵</Text>
        <Text style={styles.title}>Dance Class App</Text>
        <Text style={styles.subtitle}>
          Logga in med Spotify för att spela upp musik under dina danslektioner.
        </Text>

        {errorMessage && (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={onLogin}
          disabled={isLoading}
          accessibilityLabel="Logga in med Spotify"
          accessibilityRole="button"
        >
          {isLoading ? (
            <ActivityIndicator color={SPOTIFY_BLACK} />
          ) : (
            <Text style={styles.loginButtonText}>Logga in med Spotify</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Du behöver ett Spotify-konto för att använda den här funktionen.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPOTIFY_BLACK,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 80, 80, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 80, 80, 0.4)',
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 13,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: SPOTIFY_GREEN,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 48,
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: SPOTIFY_BLACK,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  disclaimer: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
