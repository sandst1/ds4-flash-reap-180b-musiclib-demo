import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../api/client.js', () => ({
  getPlaylists: vi.fn(),
  createPlaylist: vi.fn(),
  updatePlaylist: vi.fn(),
  deletePlaylist: vi.fn(),
}));

import { getPlaylists } from '../api/client';
import { PlaylistsList } from './PlaylistsList.jsx';

function renderIt() {
  return render(
    <MemoryRouter>
      <PlaylistsList />
    </MemoryRouter>,
  );
}

const mockPlaylists = [
  { id: 1, name: 'Playlist One', description: 'First playlist' },
  { id: 2, name: 'Playlist Two', description: null },
];

beforeEach(() => {
  vi.resetAllMocks();
});

describe('PlaylistsList', () => {
  it('shows loading state', () => {
    getPlaylists.mockReturnValue(new Promise(() => {}));
    renderIt();
    expect(screen.getByText('Loading playlists...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    getPlaylists.mockRejectedValue(new Error('Failed to load'));
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });

  it('shows empty message when no playlists', async () => {
    getPlaylists.mockResolvedValue([]);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('No playlists yet. Create one!')).toBeInTheDocument();
    });
  });

  it('renders playlist table with data', async () => {
    getPlaylists.mockResolvedValue(mockPlaylists);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Playlist One')).toBeInTheDocument();
      expect(screen.getByText('Playlist Two')).toBeInTheDocument();
    });
    expect(screen.getByText('First playlist')).toBeInTheDocument();
    expect(screen.getByText('Playlists')).toBeInTheDocument();
  });

  it('renders create button', async () => {
    getPlaylists.mockResolvedValue([]);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Create Playlist')).toBeInTheDocument();
    });
  });
});
