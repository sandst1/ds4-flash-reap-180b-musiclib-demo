import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../api/client.js', () => ({
  getSongs: vi.fn(),
  getAlbums: vi.fn(),
  createSong: vi.fn(),
  updateSong: vi.fn(),
  deleteSong: vi.fn(),
}));

import { getSongs, getAlbums } from '../api/client';
import { SongsList } from './SongsList.jsx';

function renderIt() {
  return render(
    <MemoryRouter>
      <SongsList />
    </MemoryRouter>,
  );
}

const mockSongs = [
  { id: 1, title: 'Song One', track_num: 1, duration_sec: 120, album_id: 1, album_title: 'Album A', file_path: '/path/to/song.mp3' },
  { id: 2, title: 'Song Two', track_num: null, duration_sec: null, album_id: 1, album_title: 'Album A', file_path: null },
];

const mockAlbums = [
  { id: 1, title: 'Album A' },
];

beforeEach(() => {
  vi.resetAllMocks();
});

describe('SongsList', () => {
  it('shows loading state', () => {
    getSongs.mockReturnValue(new Promise(() => {}));
    renderIt();
    expect(screen.getByText('Loading songs...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    getSongs.mockRejectedValue(new Error('Failed to load'));
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });

  it('shows empty message when no songs', async () => {
    getSongs.mockResolvedValue([]);
    getAlbums.mockResolvedValue([]);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('No songs yet. Create one!')).toBeInTheDocument();
    });
  });

  it('renders song table with data', async () => {
    getSongs.mockResolvedValue(mockSongs);
    getAlbums.mockResolvedValue(mockAlbums);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Song One')).toBeInTheDocument();
      expect(screen.getByText('Song Two')).toBeInTheDocument();
    });
    expect(screen.getByText('2:00')).toBeInTheDocument();
    expect(screen.getByText('/path/to/song.mp3')).toBeInTheDocument();
    expect(screen.getByText('Songs')).toBeInTheDocument();
  });

  it('renders create button', async () => {
    getSongs.mockResolvedValue([]);
    getAlbums.mockResolvedValue([]);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Create Song')).toBeInTheDocument();
    });
  });
});
