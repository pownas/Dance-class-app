import React from 'react';
import renderer, { act } from 'react-test-renderer';

import NotesEditor from '../src/components/NotesEditor';

describe('NotesEditor', () => {
  it('renders with initial text', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <NotesEditor
          value="# Test Notes"
          onChangeText={jest.fn()}
          syncStatus="saved"
        />,
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('Test Notes');
  });

  it('shows saved status label', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <NotesEditor value="" onChangeText={jest.fn()} syncStatus="saved" />,
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('Sparad');
  });

  it('shows pending status label', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <NotesEditor value="" onChangeText={jest.fn()} syncStatus="pending" />,
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('Ej sparad');
  });

  it('shows error status label', async () => {
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <NotesEditor value="" onChangeText={jest.fn()} syncStatus="error" />,
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('Synkfel');
  });
});
