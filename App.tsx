import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import SpotifyControls from './src/components/SpotifyControls';
import NotesEditor from './src/components/NotesEditor';
import { saveNoteVersion } from './src/services/notesService';
import { PlaybackState, Playlist } from './src/types';

const INITIAL_NOTES = '# Danskurs Vecka 1\n\n- Uppvärmning 10 min\n- Koreografi del 1\n- Repetition av steg från förra veckan\n\n## WCS Steg 1\n\n1. Starta med grundsteget\n2. Lägg till arm-styling\n';
const AUTOSAVE_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes
const SONG_DURATION = 180; // seconds, demo duration for progress simulation
const SKIP_10_SECONDS_PERCENT = (10 / SONG_DURATION) * 100;

const DEMO_PLAYLIST: Playlist = {
  name: 'WCS Danskurs Spellista',
  tracks: [
    { id: '1', name: 'West Coast Swing Mix Vol. 1', artist: 'WCS Collection', bpm: 102 },
    { id: '2', name: 'West Coast Swing Mix Vol. 2', artist: 'WCS Collection', bpm: 110 },
    { id: '3', name: 'West Coast Swing Mix Vol. 3', artist: 'WCS Collection', bpm: 118 },
    { id: '4', name: 'Boogie Wonderland', artist: 'Earth, Wind & Fire', bpm: 119 },
    { id: '5', name: "Ain't Nobody", artist: 'Chaka Khan', bpm: 111 },
    { id: '6', name: 'Blinding Lights', artist: 'The Weeknd', bpm: 171 },
    { id: '7', name: 'Levitating', artist: 'Dua Lipa', bpm: 103 },
    { id: '8', name: 'Uptown Funk', artist: 'Bruno Mars', bpm: 115 },
    { id: '9', name: 'Shape of You', artist: 'Ed Sheeran', bpm: 96 },
    { id: '10', name: 'Happy', artist: 'Pharrell Williams', bpm: 160 },
    { id: '11', name: 'Thinking Out Loud', artist: 'Ed Sheeran', bpm: 79 },
    { id: '12', name: "Can't Stop the Feeling!", artist: 'Justin Timberlake', bpm: 113 },
    { id: '13', name: 'Treasure', artist: 'Bruno Mars', bpm: 116 },
    { id: '14', name: 'September', artist: 'Earth, Wind & Fire', bpm: 126 },
    { id: '15', name: 'I Wanna Dance with Somebody', artist: 'Whitney Houston', bpm: 119 },
    { id: '16', name: 'Signed, Sealed, Delivered', artist: 'Stevie Wonder', bpm: 113 },
    { id: '17', name: "Let's Groove", artist: 'Earth, Wind & Fire', bpm: 123 },
    { id: '18', name: 'Superstition', artist: 'Stevie Wonder', bpm: 101 },
    { id: '19', name: 'Kiss', artist: 'Prince', bpm: 111 },
    { id: '20', name: 'Lovely Day', artist: 'Bill Withers', bpm: 98 },
    { id: '21', name: 'Smooth', artist: 'Santana ft. Rob Thomas', bpm: 116 },
    { id: '22', name: 'Use Somebody', artist: 'Kings of Leon', bpm: 135 },
    { id: '23', name: 'Locked Out of Heaven', artist: 'Bruno Mars', bpm: 144 },
    { id: '24', name: 'Cake by the Ocean', artist: 'DNCE', bpm: 119 },
    { id: '25', name: 'Sugar', artist: 'Maroon 5', bpm: 120 },
    { id: '26', name: 'Shut Up and Dance', artist: 'Walk the Moon', bpm: 128 },
    { id: '27', name: "Don't Stop Me Now", artist: 'Queen', bpm: 156 },
    { id: '28', name: 'Finesse', artist: 'Bruno Mars ft. Cardi B', bpm: 105 },
    { id: '29', name: 'Get Lucky', artist: 'Daft Punk ft. Pharrell', bpm: 116 },
    { id: '30', name: 'Redbone', artist: 'Childish Gambino', bpm: 81 },
  ],
};

export default function App() {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('paused');
  const [volume, setVolume] = useState(70);
  const [syncStatus, setSyncStatus] = useState<'saved' | 'pending' | 'error'>('saved');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [trackNotes, setTrackNotes] = useState<Record<string, string>>({});
  const [songProgress, setSongProgress] = useState(0);

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

  // Advance song progress every second when playing; auto-advance track at end
  useEffect(() => {
    if (playbackState !== 'playing') return;
    const interval = setInterval(() => {
      setSongProgress(prev => {
        const next = prev + (100 / SONG_DURATION);
        if (next >= 100) {
          setCurrentTrackIndex(i => (i + 1) % DEMO_PLAYLIST.tracks.length);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [playbackState]);

  // Reset progress when track changes
  useEffect(() => {
    setSongProgress(0);
  }, [currentTrackIndex]);

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

  const handleSeek = (value: number) => {
    setSongProgress(value);
  };

  const handleSkipBack10 = () => {
    setSongProgress(prev => Math.max(0, prev - SKIP_10_SECONDS_PERCENT));
  };

  const handleSkipForward10 = () => {
    setSongProgress(prev => Math.min(100, prev + SKIP_10_SECONDS_PERCENT));
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
        trackNotes={trackNotes}
        songProgress={songProgress}
        songDuration={SONG_DURATION}
        onTogglePlay={handleTogglePlay}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onVolumeChange={handleVolumeChange}
        onTrackNoteChange={handleTrackNoteChange}
        onSelectTrack={handleSelectTrack}
        onSeek={handleSeek}
        onSkipBack10={handleSkipBack10}
        onSkipForward10={handleSkipForward10}
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
