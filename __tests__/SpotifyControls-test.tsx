import React from 'react';
import renderer, { act } from 'react-test-renderer';

import SpotifyControls from '../src/components/SpotifyControls';

describe('SpotifyControls', () => {
  const defaultProps = {
    playbackState: 'paused' as const,
    volume: 50,
    onTogglePlay: jest.fn(),
    onNextTrack: jest.fn(),
    onPrevTrack: jest.fn(),
    onVolumeChange: jest.fn(),
  };

  const mockTrack = { id: '1', name: 'West Coast Swing Mix Vol. 3', artist: 'WCS Collection', bpm: 118 };

  it('renders play icon when paused', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<SpotifyControls {...defaultProps} />);
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('▶');
  });

  it('renders pause icon when playing', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<SpotifyControls {...defaultProps} playbackState="playing" />);
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('⏸');
  });

  it('calls onTogglePlay when play button pressed', async () => {
    const onTogglePlay = jest.fn();
    let instance: renderer.ReactTestRenderer;
    await act(async () => {
      instance = renderer.create(
        <SpotifyControls {...defaultProps} onTogglePlay={onTogglePlay} />,
      );
    });
    const button = instance!.root.findAll(
      (node) => node.props.accessibilityLabel === 'Play',
    )[0];
    await act(async () => {
      button.props.onPress();
    });
    expect(onTogglePlay).toHaveBeenCalledTimes(1);
  });

  it('calls onPrevTrack and onNextTrack', async () => {
    const onPrevTrack = jest.fn();
    const onNextTrack = jest.fn();
    let instance: renderer.ReactTestRenderer;
    await act(async () => {
      instance = renderer.create(
        <SpotifyControls {...defaultProps} onPrevTrack={onPrevTrack} onNextTrack={onNextTrack} />,
      );
    });

    await act(async () => {
      instance!.root
        .findAll((node) => node.props.accessibilityLabel === 'Previous track')[0]
        .props.onPress();
    });
    expect(onPrevTrack).toHaveBeenCalledTimes(1);

    await act(async () => {
      instance!.root
        .findAll((node) => node.props.accessibilityLabel === 'Next track')[0]
        .props.onPress();
    });
    expect(onNextTrack).toHaveBeenCalledTimes(1);
  });

  it('displays current track name and artist when provided', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <SpotifyControls {...defaultProps} currentTrack={mockTrack} />,
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('West Coast Swing Mix Vol. 3');
    expect(json).toContain('WCS Collection');
  });

  it('displays playlist name when no current track is provided', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <SpotifyControls {...defaultProps} playlistName="Dance Music Playlist" />,
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('Dance Music Playlist');
  });

  it('displays BPM in the artist row when track has bpm', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <SpotifyControls {...defaultProps} currentTrack={mockTrack} />,
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('118 BPM');
  });

  it('renders track note input with provided value', async () => {
    let instance: renderer.ReactTestRenderer;
    await act(async () => {
      instance = renderer.create(
        <SpotifyControls {...defaultProps} currentTrack={mockTrack} trackNote="Bra tempo för uppvärmning" />,
      );
    });
    const input = instance!.root.findAll(
      (node) => node.props.accessibilityLabel === 'Track note',
    )[0];
    expect(input.props.value).toBe('Bra tempo för uppvärmning');
  });

  it('calls onTrackNoteChange when track note input changes', async () => {
    const onTrackNoteChange = jest.fn();
    let instance: renderer.ReactTestRenderer;
    await act(async () => {
      instance = renderer.create(
        <SpotifyControls
          {...defaultProps}
          currentTrack={mockTrack}
          trackNote=""
          onTrackNoteChange={onTrackNoteChange}
        />,
      );
    });
    const input = instance!.root.findAll(
      (node) => node.props.accessibilityLabel === 'Track note',
    )[0];
    await act(async () => {
      input.props.onChangeText('Ny anteckning');
    });
    expect(onTrackNoteChange).toHaveBeenCalledWith('Ny anteckning');
  });

  it('renders queue button when tracks are provided', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <SpotifyControls
          {...defaultProps}
          currentTrack={mockTrack}
          tracks={[mockTrack]}
          currentTrackIndex={0}
        />,
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('☰');
  });

  it('calls onSkipBack10 when skip-back button pressed', async () => {
    const onSkipBack10 = jest.fn();
    let instance: renderer.ReactTestRenderer;
    await act(async () => {
      instance = renderer.create(
        <SpotifyControls {...defaultProps} onSkipBack10={onSkipBack10} />,
      );
    });
    await act(async () => {
      instance!.root
        .findAll((node) => node.props.accessibilityLabel === 'Skip back 10 seconds')[0]
        .props.onPress();
    });
    expect(onSkipBack10).toHaveBeenCalledTimes(1);
  });

  it('calls onSkipForward10 when skip-forward button pressed', async () => {
    const onSkipForward10 = jest.fn();
    let instance: renderer.ReactTestRenderer;
    await act(async () => {
      instance = renderer.create(
        <SpotifyControls {...defaultProps} onSkipForward10={onSkipForward10} />,
      );
    });
    await act(async () => {
      instance!.root
        .findAll((node) => node.props.accessibilityLabel === 'Skip forward 10 seconds')[0]
        .props.onPress();
    });
    expect(onSkipForward10).toHaveBeenCalledTimes(1);
  });

  it('renders song progress slider when songDuration is provided', async () => {
    let instance: renderer.ReactTestRenderer;
    await act(async () => {
      instance = renderer.create(
        <SpotifyControls {...defaultProps} songProgress={30} songDuration={180} />,
      );
    });
    const progressSlider = instance!.root.findAll(
      (node) => node.props.accessibilityLabel === 'Song progress',
    );
    expect(progressSlider.length).toBeGreaterThan(0);
    expect(progressSlider[0].props.value).toBe(30);
  });

  it('does not render song progress slider when songDuration is not provided', async () => {
    let instance: renderer.ReactTestRenderer;
    await act(async () => {
      instance = renderer.create(<SpotifyControls {...defaultProps} />);
    });
    const progressSlider = instance!.root.findAll(
      (node) => node.props.accessibilityLabel === 'Song progress',
    );
    expect(progressSlider.length).toBe(0);
  });

  it('calls onSeek when song progress slider value changes', async () => {
    const onSeek = jest.fn();
    let instance: renderer.ReactTestRenderer;
    await act(async () => {
      instance = renderer.create(
        <SpotifyControls {...defaultProps} songProgress={0} songDuration={180} onSeek={onSeek} />,
      );
    });
    const progressSlider = instance!.root.findAll(
      (node) => node.props.accessibilityLabel === 'Song progress',
    )[0];
    await act(async () => {
      progressSlider.props.onValueChange(50);
    });
    expect(onSeek).toHaveBeenCalledWith(50);
  });


  it('does not render queue button when no tracks are provided', async () => {
    let instance: renderer.ReactTestRenderer;
    await act(async () => {
      instance = renderer.create(
        <SpotifyControls {...defaultProps} />,
      );
    });
    const queueBtn = instance!.root.findAll(
      (node) => node.props.accessibilityLabel === 'Open queue',
    );
    expect(queueBtn.length).toBe(0);
  });
});
