import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { Track } from '../types';

const SPOTIFY_GREEN = '#1DB954';

interface PlaylistQueueProps {
  visible: boolean;
  tracks: Track[];
  currentTrackIndex: number;
  playlistName: string;
  trackNotes?: Record<string, string>;
  onSelectTrack: (index: number) => void;
  onClose: () => void;
}

export default function PlaylistQueue({
  visible,
  tracks,
  currentTrackIndex,
  playlistName,
  trackNotes,
  onSelectTrack,
  onClose,
}: PlaylistQueueProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{playlistName}</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close queue" style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionLabel}>Spellista</Text>
          <ScrollView style={styles.trackList}>
            {tracks.map((track, index) => {
              const isActive = index === currentTrackIndex;
              const note = trackNotes?.[track.id];
              return (
                <TouchableOpacity
                  key={track.id}
                  style={[styles.trackRow, isActive && styles.activeTrackRow]}
                  onPress={() => onSelectTrack(index)}
                  accessibilityLabel={`Play ${track.name}`}
                  accessibilityState={{ selected: isActive }}
                >
                  <View style={styles.trackNumberContainer}>
                    {isActive ? (
                      <Text style={styles.nowPlayingIcon}>♪</Text>
                    ) : (
                      <Text style={styles.trackNumber}>{index + 1}</Text>
                    )}
                  </View>
                  <View style={styles.trackDetails}>
                    <Text
                      style={[styles.trackName, isActive && styles.activeTrackName]}
                      numberOfLines={1}
                    >
                      {track.artist} — {track.name}
                    </Text>
                    <Text style={styles.trackMeta} numberOfLines={1}>
                      {track.bpm != null ? `${track.bpm} BPM` : ''}
                      {note ? `  •  ${note}` : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#282828',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flex: 1,
    marginTop: 40,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  trackList: {
    paddingHorizontal: 12,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTrackRow: {
    backgroundColor: 'rgba(29, 185, 84, 0.15)',
  },
  trackNumberContainer: {
    width: 32,
    alignItems: 'center',
  },
  trackNumber: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  nowPlayingIcon: {
    color: SPOTIFY_GREEN,
    fontSize: 16,
    fontWeight: '700',
  },
  trackDetails: {
    flex: 1,
    marginLeft: 8,
  },
  trackName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  activeTrackName: {
    color: SPOTIFY_GREEN,
  },
  trackMeta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
});
