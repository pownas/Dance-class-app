import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import SpotifyControls from './src/components/SpotifyControls';
import NotesEditor from './src/components/NotesEditor';
import { saveNoteVersion } from './src/services/notesService';
import { PlaybackState } from './src/types';

const INITIAL_NOTES = '# Danskurs Vecka 1\n\n- Uppvärmning 10 min\n- Koreografi del 1\n- Repetition av steg från förra veckan\n\n## WCS Steg 1\n\n1. Starta med grundsteget\n2. Lägg till arm-styling\n';
const AUTOSAVE_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes

export default function App() {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('paused');
  const [volume, setVolume] = useState(70);
  const [syncStatus, setSyncStatus] = useState<'saved' | 'pending' | 'error'>('saved');

  const lastSyncedNotesRef = useRef(INITIAL_NOTES);

  const syncToBackend = useCallback(async (currentNotes: string) => {
    if (currentNotes === lastSyncedNotesRef.current) return;

    try {
      await saveNoteVersion(currentNotes);
      lastSyncedNotesRef.current = currentNotes;
      setSyncStatus('saved');
    } catch (error) {
      console.error('Kunde inte synka till backend:', error);
      setSyncStatus('error');
      Alert.alert(
        'Synkfel',
        'Versionshistoriken kunde inte sparas. Kontrollera din internetanslutning.',
        [{ text: 'OK' }],
      );
    }
  }, []);

  // Autosave every 3 minutes if notes have changed
  useEffect(() => {
    const interval = setInterval(() => {
      syncToBackend(notes);
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [notes, syncToBackend]);

  const handleNotesChange = (text: string) => {
    setNotes(text);
    if (text !== lastSyncedNotesRef.current) {
      setSyncStatus('pending');
    } else {
      setSyncStatus('saved');
    }
  };

  // Spotify control handlers (stubs — wire up Spotify SDK here)
  const handleTogglePlay = () => {
    setPlaybackState((prev) => (prev === 'playing' ? 'paused' : 'playing'));
  };

  const handleNextTrack = () => {
    // TODO: integrate Spotify App Remote SDK or Spotify Web API
    console.log('Next track');
  };

  const handlePrevTrack = () => {
    // TODO: integrate Spotify App Remote SDK or Spotify Web API
    console.log('Previous track');
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    // TODO: pass volume to Spotify SDK
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <SpotifyControls
        playbackState={playbackState}
        volume={volume}
        onTogglePlay={handleTogglePlay}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onVolumeChange={handleVolumeChange}
      />
      <NotesEditor
        value={notes}
        onChangeText={handleNotesChange}
        syncStatus={syncStatus}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
