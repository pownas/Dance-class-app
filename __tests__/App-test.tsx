import React from 'react';
import renderer, { act } from 'react-test-renderer';

import App from '../App';

describe('App', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<App />);
    });
    expect(tree!.toJSON()).toBeTruthy();
  });
});
