import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { PlaybackState, Track } from '../types';
import PlaylistQueue from './PlaylistQueue';

const SPOTIFY_GREEN = '#1DB954';
const SKIP_BUTTON_COLOR = '#FF8C00';
const BPM_SEPARATOR = '  •  ';

interface SpotifyControlsProps {
  playbackState: PlaybackState;
  volume: number;
  currentTrack?: Track;
  playlistName?: string;
  trackNote?: string;
  tracks?: Track[];
  currentTrackIndex?: number;
  trackNotes?: Record<string, string>;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onVolumeChange: (value: number) => void;
  onTrackNoteChange?: (note: string) => void;
  onSelectTrack?: (index: number) => void;
}

export default function SpotifyControls({
  playbackState,
  volume,
  currentTrack,
  playlistName,
  trackNote,
  tracks,
  currentTrackIndex,
  trackNotes,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onVolumeChange,
  onTrackNoteChange,
  onSelectTrack,
}: SpotifyControlsProps) {
  const [queueVisible, setQueueVisible] = useState(false);

  const handleSelectTrack = (index: number) => {
    onSelectTrack?.(index);
    setQueueVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Spotify</Text>
        {tracks && tracks.length > 0 && (
          <TouchableOpacity
            onPress={() => setQueueVisible(true)}
            accessibilityLabel="Open queue"
            style={styles.queueButton}
          >
            <Text style={styles.queueIcon}>☰</Text>
          </TouchableOpacity>
        )}
      </View>
      {currentTrack && (
        <View style={styles.trackInfo}>
          <Text style={styles.trackName} numberOfLines={1}>{currentTrack.name}</Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {currentTrack.artist}
            {currentTrack.bpm != null ? `${BPM_SEPARATOR}${currentTrack.bpm} BPM` : ''}
          </Text>
        </View>
      )}
      {!currentTrack && playlistName && (
        <Text style={styles.playlistName} numberOfLines={1}>{playlistName}</Text>
      )}
      <View style={styles.controls}>
        <TouchableOpacity style={[styles.controlButton, styles.skipButton]} onPress={onPrevTrack} accessibilityLabel="Previous track">
          <Text style={styles.controlIcon}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, styles.playButton]} onPress={onTogglePlay} accessibilityLabel={playbackState === 'playing' ? 'Pause' : 'Play'}>
          <Text style={styles.playIcon}>{playbackState === 'playing' ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, styles.skipButton]} onPress={onNextTrack} accessibilityLabel="Next track">
          <Text style={styles.controlIcon}>⏭</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.volumeRow}>
        <Text style={styles.volumeLabel}>🔈</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={volume}
          onValueChange={onVolumeChange}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="rgba(255,255,255,0.4)"
          thumbTintColor="#fff"
          accessibilityLabel="Volume"
        />
        <Text style={styles.volumeLabel}>🔊</Text>
      </View>
      <TextInput
        style={styles.trackNoteInput}
        value={trackNote}
        onChangeText={onTrackNoteChange}
        placeholder="Anteckning om låt..."
        placeholderTextColor="rgba(255,255,255,0.5)"
        multiline
        accessibilityLabel="Track note"
      />
      {tracks && tracks.length > 0 && (
        <PlaylistQueue
          visible={queueVisible}
          tracks={tracks}
          currentTrackIndex={currentTrackIndex ?? 0}
          playlistName={playlistName ?? ''}
          trackNotes={trackNotes}
          onSelectTrack={handleSelectTrack}
          onClose={() => setQueueVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: SPOTIFY_GREEN,
    borderBottomWidth: 1,
    borderBottomColor: '#18a34a',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  queueButton: {
    padding: 4,
  },
  queueIcon: {
    color: '#fff',
    fontSize: 18,
    opacity: 0.85,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  trackName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  trackArtist: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 2,
  },
  playlistName: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 12,
  },
  controlButton: {
    padding: 8,
  },
  skipButton: {
    backgroundColor: SKIP_BUTTON_COLOR,
    borderRadius: 8,
    padding: 10,
  },
  controlIcon: {
    fontSize: 28,
    color: '#fff',
  },
  playButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 32,
    padding: 12,
  },
  playIcon: {
    fontSize: 28,
    color: '#fff',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeLabel: {
    fontSize: 16,
    color: '#fff',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  trackNoteInput: {
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 13,
    minHeight: 40,
  },
});
