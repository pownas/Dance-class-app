import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import SpotifyControls from './src/components/SpotifyControls';
import NotesEditor from './src/components/NotesEditor';
import { saveNoteVersion } from './src/services/notesService';
import { PlaybackState, Playlist } from './src/types';

const INITIAL_NOTES = '# Danskurs Vecka 1\n\n- Uppvärmning 10 min\n- Koreografi del 1\n- Repetition av steg från förra veckan\n\n## WCS Steg 1\n\n1. Starta med grundsteget\n2. Lägg till arm-styling\n';
const AUTOSAVE_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes

const DEMO_PLAYLIST: Playlist = {
  name: 'Dance Music Playlist',
  tracks: [
    { id: '1', name: 'West Coast Swing Mix Vol. 1', artist: 'WCS Collection', bpm: 102 },
    { id: '2', name: 'West Coast Swing Mix Vol. 2', artist: 'WCS Collection', bpm: 110 },
    { id: '3', name: 'West Coast Swing Mix Vol. 3', artist: 'WCS Collection', bpm: 118 },
    { id: '4', name: 'Boogie Wonderland', artist: 'Earth, Wind & Fire', bpm: 119 },
    { id: '5', name: "Ain't Nobody", artist: 'Chaka Khan', bpm: 111 },
  ],
};

export default function App() {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('paused');
  const [volume, setVolume] = useState(70);
  const [syncStatus, setSyncStatus] = useState<'saved' | 'pending' | 'error'>('saved');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [trackNotes, setTrackNotes] = useState<Record<string, string>>({});

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

  // Spotify control handlers
  const handleTogglePlay = () => {
    setPlaybackState((prev) => (prev === 'playing' ? 'paused' : 'playing'));
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % DEMO_PLAYLIST.tracks.length);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + DEMO_PLAYLIST.tracks.length) % DEMO_PLAYLIST.tracks.length);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
  };

  const handleTrackNoteChange = (note: string) => {
    const trackId = DEMO_PLAYLIST.tracks[currentTrackIndex].id;
    setTrackNotes((prev) => ({ ...prev, [trackId]: note }));
  };

  const handleSelectTrack = (index: number) => {
    setCurrentTrackIndex(index);
  };

  const currentTrack = DEMO_PLAYLIST.tracks[currentTrackIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <SpotifyControls
        playbackState={playbackState}
        volume={volume}
        currentTrack={currentTrack}
        playlistName={DEMO_PLAYLIST.name}
        trackNote={trackNotes[currentTrack.id] ?? ''}
        tracks={DEMO_PLAYLIST.tracks}
        currentTrackIndex={currentTrackIndex}
        onTogglePlay={handleTogglePlay}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onVolumeChange={handleVolumeChange}
        onTrackNoteChange={handleTrackNoteChange}
        onSelectTrack={handleSelectTrack}
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
