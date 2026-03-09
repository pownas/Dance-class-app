import React from 'react';
import renderer, { act } from 'react-test-renderer';

import PlaylistQueue from '../src/components/PlaylistQueue';

describe('PlaylistQueue', () => {
  const mockTracks = [
    { id: '1', name: 'Track A', artist: 'Artist A', bpm: 100 },
    { id: '2', name: 'Track B', artist: 'Artist B', bpm: 120 },
    { id: '3', name: 'Track C', artist: 'Artist C' },
  ];

  const defaultProps = {
    visible: true,
    tracks: mockTracks,
    currentTrackIndex: 0,
    playlistName: 'Test Playlist',
    onSelectTrack: jest.fn(),
    onClose: jest.fn(),
  };

  it('renders all tracks in the playlist', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<PlaylistQueue {...defaultProps} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Track A');
    expect(json).toContain('Track B');
    expect(json).toContain('Track C');
  });

  it('displays playlist name as header', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<PlaylistQueue {...defaultProps} />);
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('Test Playlist');
  });

  it('highlights the current track with a music note icon', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<PlaylistQueue {...defaultProps} currentTrackIndex={1} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    // Track B is current - should have ♪ icon
    expect(json).toContain('♪');
  });

  it('shows BPM for tracks that have it', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<PlaylistQueue {...defaultProps} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('100 BPM');
    expect(json).toContain('120 BPM');
  });

  it('calls onSelectTrack with the correct index when a track is tapped', async () => {
    const onSelectTrack = jest.fn();
    let instance: renderer.ReactTestRenderer;
    await act(async () => {
      instance = renderer.create(
        <PlaylistQueue {...defaultProps} onSelectTrack={onSelectTrack} />,
      );
    });
    const trackButton = instance!.root.findAll(
      (node) => node.props.accessibilityLabel === 'Play Track B',
    )[0];
    await act(async () => {
      trackButton.props.onPress();
    });
    expect(onSelectTrack).toHaveBeenCalledWith(1);
  });

  it('calls onClose when close button is pressed', async () => {
    const onClose = jest.fn();
    let instance: renderer.ReactTestRenderer;
    await act(async () => {
      instance = renderer.create(
        <PlaylistQueue {...defaultProps} onClose={onClose} />,
      );
    });
    const closeButton = instance!.root.findAll(
      (node) => node.props.accessibilityLabel === 'Close queue',
    )[0];
    await act(async () => {
      closeButton.props.onPress();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
