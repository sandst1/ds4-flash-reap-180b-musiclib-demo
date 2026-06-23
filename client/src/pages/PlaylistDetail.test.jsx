import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../api/client.js', () => ({
  getPlaylist: vi.fn(),
  updatePlaylist: vi.fn(),
  deletePlaylist: vi.fn(),
  addSongToPlaylist: vi.fn(),
  removeSongFromPlaylist: vi.fn(),
  reorderPlaylistSongs: vi.fn(),
  getSongs: vi.fn(),
}));

import { getPlaylist, getSongs, reorderPlaylistSongs } from '../api/client.js';
import { PlaylistDetail } from './PlaylistDetail.jsx';

function renderIt(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/playlists/${id}`]}>
      <Routes>
        <Route path="/playlists/:id" element={<PlaylistDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

const mockSongs = [
  { id: 1, title: 'Song A', duration_sec: 120, album_title: 'Album' },
  { id: 2, title: 'Song B', duration_sec: 180, album_title: 'Album' },
  { id: 3, title: 'Song C', duration_sec: 240, album_title: 'Album' },
];

const mockPlaylist = {
  id: 1,
  name: 'Test Playlist',
  description: 'A test playlist',
  songs: [...mockSongs],
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('PlaylistDetail', () => {
  it('shows loading state', () => {
    getPlaylist.mockReturnValue(new Promise(() => {}));
    renderIt();
    expect(screen.getByText('Loading playlist...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    getPlaylist.mockRejectedValue(new Error('Failed to load playlist'));
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Failed to load playlist')).toBeInTheDocument();
    });
  });

  it('shows error when playlist data is missing songs', async () => {
    getPlaylist.mockResolvedValue({ id: 1, name: 'Test' });
    getSongs.mockResolvedValue([]);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  it('renders playlist info and songs', async () => {
    getPlaylist.mockResolvedValue(mockPlaylist);
    getSongs.mockResolvedValue(mockSongs);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Test Playlist')).toBeInTheDocument();
    });
    expect(screen.getByText('A test playlist')).toBeInTheDocument();
    expect(screen.getByText('Song A')).toBeInTheDocument();
    expect(screen.getByText('Song B')).toBeInTheDocument();
    expect(screen.getByText('Song C')).toBeInTheDocument();
  });

  it('shows song count', async () => {
    getPlaylist.mockResolvedValue(mockPlaylist);
    getSongs.mockResolvedValue(mockSongs);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText(/Songs \(3\)/)).toBeInTheDocument();
    });
  });

  it('shows empty songs message', async () => {
    getPlaylist.mockResolvedValue({ ...mockPlaylist, songs: [] });
    getSongs.mockResolvedValue(mockSongs);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('No songs in this playlist yet.')).toBeInTheDocument();
    });
  });

  it('calls API with correct id', async () => {
    getPlaylist.mockResolvedValue(mockPlaylist);
    getSongs.mockResolvedValue(mockSongs);
    renderIt('42');
    await waitFor(() => {
      expect(getPlaylist).toHaveBeenCalledWith('42');
      expect(getSongs).toHaveBeenCalled();
    });
  });

  it('renders back link', async () => {
    getPlaylist.mockResolvedValue(mockPlaylist);
    getSongs.mockResolvedValue(mockSongs);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('← Back to Playlists')).toBeInTheDocument();
    });
  });

  describe('reorder', () => {
    it('moves a song up', async () => {
      getPlaylist.mockResolvedValue(mockPlaylist);
      getSongs.mockResolvedValue(mockSongs);
      reorderPlaylistSongs.mockResolvedValue([]);
      renderIt();

      await waitFor(() => {
        expect(screen.getByText('Song A')).toBeInTheDocument();
      });

      const upButtons = screen.getAllByText('Up');
      fireEvent.click(upButtons[1]);

      await waitFor(() => {
        expect(reorderPlaylistSongs).toHaveBeenCalledWith('1', [2, 1, 3]);
      });
    });

    it('moves a song down', async () => {
      getPlaylist.mockResolvedValue(mockPlaylist);
      getSongs.mockResolvedValue(mockSongs);
      reorderPlaylistSongs.mockResolvedValue([]);
      renderIt();

      await waitFor(() => {
        expect(screen.getByText('Song A')).toBeInTheDocument();
      });

      const downButtons = screen.getAllByText('Down');
      fireEvent.click(downButtons[0]);

      await waitFor(() => {
        expect(reorderPlaylistSongs).toHaveBeenCalledWith('1', [2, 1, 3]);
      });
    });

    it('disables Up button on first song', async () => {
      getPlaylist.mockResolvedValue(mockPlaylist);
      getSongs.mockResolvedValue(mockSongs);
      renderIt();

      await waitFor(() => {
        expect(screen.getByText('Song A')).toBeInTheDocument();
      });

      const upButtons = screen.getAllByText('Up');
      expect(upButtons[0]).toBeDisabled();
      expect(upButtons[1]).not.toBeDisabled();
    });

    it('disables Down button on last song', async () => {
      getPlaylist.mockResolvedValue(mockPlaylist);
      getSongs.mockResolvedValue(mockSongs);
      renderIt();

      await waitFor(() => {
        expect(screen.getByText('Song A')).toBeInTheDocument();
      });

      const downButtons = screen.getAllByText('Down');
      expect(downButtons[downButtons.length - 1]).toBeDisabled();
      expect(downButtons[0]).not.toBeDisabled();
    });
  });
});
