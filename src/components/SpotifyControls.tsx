import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { PlaybackState } from '../types';

interface SpotifyControlsProps {
  playbackState: PlaybackState;
  volume: number;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onVolumeChange: (value: number) => void;
}

export default function SpotifyControls({
  playbackState,
  volume,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onVolumeChange,
}: SpotifyControlsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spotify</Text>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={onPrevTrack} accessibilityLabel="Previous track">
          <Text style={styles.controlIcon}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, styles.playButton]} onPress={onTogglePlay} accessibilityLabel={playbackState === 'playing' ? 'Pause' : 'Play'}>
          <Text style={styles.playIcon}>{playbackState === 'playing' ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={onNextTrack} accessibilityLabel="Next track">
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1DB954',
    borderBottomWidth: 1,
    borderBottomColor: '#18a34a',
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    opacity: 0.85,
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
});
