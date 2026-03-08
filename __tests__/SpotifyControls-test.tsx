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
});
