import React from 'react';
import renderer, { act } from 'react-test-renderer';

import PlaylistQueue from '../src/components/PlaylistQueue';

describe('PlaylistQueue', () => {
  const mockTracks = [
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
  ];

  const defaultProps = {
    visible: true,
    tracks: mockTracks,
    currentTrackIndex: 0,
    playlistName: 'WCS Danskurs Spellista',
    onSelectTrack: jest.fn(),
    onClose: jest.fn(),
  };

  it('renders all 30 tracks in the playlist', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<PlaylistQueue {...defaultProps} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('WCS Collection');
    expect(json).toContain('Boogie Wonderland');
    expect(json).toContain('Redbone');
    expect(json).toContain('Childish Gambino');
    // Verify a track from the middle of the list
    expect(json).toContain('Whitney Houston');
    expect(json).toContain('I Wanna Dance with Somebody');
  });

  it('displays playlist name as header', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<PlaylistQueue {...defaultProps} />);
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('WCS Danskurs Spellista');
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
    expect(json).toContain('102 BPM');
    expect(json).toContain('119 BPM');
  });

  it('shows per-track notes when trackNotes are provided', async () => {
    let tree: renderer.ReactTestRenderer;
    const trackNotes = { '4': 'Bra uppvärmningslåt', '15': 'Favorit!' };
    await act(async () => {
      tree = renderer.create(<PlaylistQueue {...defaultProps} trackNotes={trackNotes} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Bra uppvärmningslåt');
    expect(json).toContain('Favorit!');
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
      (node) => node.props.accessibilityLabel === 'Play West Coast Swing Mix Vol. 2',
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
