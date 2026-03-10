import React from 'react';
import renderer, { act } from 'react-test-renderer';
import SpotifyLogin from '../src/components/SpotifyLogin';
import { SpotifyAuthState } from '../src/types';

describe('SpotifyLogin', () => {
  const onLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login button when unauthenticated', async () => {
    const authState: SpotifyAuthState = { status: 'unauthenticated' };
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<SpotifyLogin authState={authState} onLogin={onLogin} />);
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('Logga in med Spotify');
  });

  it('calls onLogin when the login button is pressed', async () => {
    const authState: SpotifyAuthState = { status: 'unauthenticated' };
    let instance: renderer.ReactTestRenderer;
    await act(async () => {
      instance = renderer.create(<SpotifyLogin authState={authState} onLogin={onLogin} />);
    });
    const button = instance!.root.findAll(
      (node) => node.props.accessibilityLabel === 'Logga in med Spotify',
    )[0];
    await act(async () => {
      button.props.onPress();
    });
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it('shows a loading indicator when status is loading', async () => {
    const authState: SpotifyAuthState = { status: 'loading' };
    let instance: renderer.ReactTestRenderer;
    await act(async () => {
      instance = renderer.create(<SpotifyLogin authState={authState} onLogin={onLogin} />);
    });
    // Button should be disabled
    const button = instance!.root.findAll(
      (node) => node.props.accessibilityLabel === 'Logga in med Spotify',
    )[0];
    expect(button.props.disabled).toBe(true);
  });

  it('displays the error message when status is error', async () => {
    const authState: SpotifyAuthState = {
      status: 'error',
      message: 'Inloggning misslyckades',
    };
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<SpotifyLogin authState={authState} onLogin={onLogin} />);
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('Inloggning misslyckades');
  });

  it('does not show an error box when status is unauthenticated', async () => {
    const authState: SpotifyAuthState = { status: 'unauthenticated' };
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<SpotifyLogin authState={authState} onLogin={onLogin} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).not.toContain('errorBox');
  });
});
