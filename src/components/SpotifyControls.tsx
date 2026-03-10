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
const PLAY_BUTTON_SIZE = 64;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface SpotifyControlsProps {
  playbackState: PlaybackState;
  volume: number;
  currentTrack?: Track;
  playlistName?: string;
  trackNote?: string;
  tracks?: Track[];
  currentTrackIndex?: number;
  trackNotes?: Record<string, string>;
  songProgress?: number;
  songDuration?: number;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onVolumeChange: (value: number) => void;
  onTrackNoteChange?: (note: string) => void;
  onSelectTrack?: (index: number) => void;
  onSeek?: (value: number) => void;
  onSkipBack10?: () => void;
  onSkipForward10?: () => void;
  onLogout?: () => void;
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
  songProgress,
  songDuration,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onVolumeChange,
  onTrackNoteChange,
  onSelectTrack,
  onSeek,
  onSkipBack10,
  onSkipForward10,
  onLogout,
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
        <View style={styles.headerActions}>
          {tracks && tracks.length > 0 && (
            <TouchableOpacity
              onPress={() => setQueueVisible(true)}
              accessibilityLabel="Open queue"
              style={styles.queueButton}
            >
              <Text style={styles.queueIcon}>☰</Text>
            </TouchableOpacity>
          )}
          {onLogout && (
            <TouchableOpacity
              onPress={onLogout}
              accessibilityLabel="Logga ut från Spotify"
              style={styles.logoutButton}
            >
              <Text style={styles.logoutIcon}>⏏</Text>
            </TouchableOpacity>
          )}
        </View>
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
      {songDuration != null && songDuration > 0 && (
        <View style={styles.progressRow}>
          <Text style={styles.progressTime}>
            {formatTime(((songProgress ?? 0) / 100) * songDuration)}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={songProgress ?? 0}
            onValueChange={onSeek}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="rgba(255,255,255,0.4)"
            thumbTintColor="#fff"
            accessibilityLabel="Song progress"
          />
          <Text style={styles.progressTime}>{formatTime(songDuration)}</Text>
        </View>
      )}
      <View style={styles.controls}>
        <TouchableOpacity style={[styles.controlButton, styles.skipButton]} onPress={onPrevTrack} accessibilityLabel="Previous track">
          <Text style={styles.controlIcon}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, styles.skipButton]} onPress={onSkipBack10} accessibilityLabel="Skip back 10 seconds">
          <Text style={styles.skipSecondIcon}>−10</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButton} onPress={onTogglePlay} accessibilityLabel={playbackState === 'playing' ? 'Pause' : 'Play'}>
          <Text style={styles.playIcon}>{playbackState === 'playing' ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, styles.skipButton]} onPress={onSkipForward10} accessibilityLabel="Skip forward 10 seconds">
          <Text style={styles.skipSecondIcon}>+10</Text>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  logoutButton: {
    padding: 4,
  },
  logoutIcon: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.7,
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
    gap: 12,
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
  skipSecondIcon: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  playButton: {
    backgroundColor: '#fff',
    borderRadius: PLAY_BUTTON_SIZE / 2,
    width: PLAY_BUTTON_SIZE,
    height: PLAY_BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  playIcon: {
    fontSize: 30,
    color: SPOTIFY_GREEN,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTime: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    minWidth: 32,
    textAlign: 'center',
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
