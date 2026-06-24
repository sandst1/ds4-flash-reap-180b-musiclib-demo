import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../api/client.js', () => ({
  getAlbum: vi.fn(),
  updateAlbum: vi.fn(),
  deleteAlbum: vi.fn(),
  getAlbumSongs: vi.fn(),
}));

import { getAlbum, getAlbumSongs } from '../api/client';
import { AlbumDetail } from './AlbumDetail.jsx';

function renderIt(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/albums/${id}`]}>
      <Routes>
        <Route path="/albums/:id" element={<AlbumDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

const mockAlbum = { id: 1, title: 'Test Album', cover_url: 'http://cover.jpg', release_year: 2020, artist_id: 1, artist_name: 'Test Artist' };
const mockSongs = [
  { id: 1, title: 'Song One', track_num: 1, duration_sec: 120, album_id: 1 },
  { id: 2, title: 'Song Two', track_num: 2, duration_sec: null, album_id: 1 },
];

beforeEach(() => {
  vi.resetAllMocks();
});

describe('AlbumDetail', () => {
  it('shows loading state', () => {
    getAlbum.mockReturnValue(new Promise(() => {}));
    renderIt();
    expect(screen.getByText('Loading album...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    getAlbum.mockRejectedValue(new Error('Failed to load album'));
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Failed to load album')).toBeInTheDocument();
    });
  });

  it('shows not found when album is null', async () => {
    getAlbum.mockResolvedValue(null);
    getAlbumSongs.mockResolvedValue([]);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Album not found.')).toBeInTheDocument();
    });
  });

  it('renders album info and songs', async () => {
    getAlbum.mockResolvedValue(mockAlbum);
    getAlbumSongs.mockResolvedValue(mockSongs);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Test Album')).toBeInTheDocument();
    });
    expect(screen.getByText('Released: 2020')).toBeInTheDocument();
    expect(screen.getByText('Song One')).toBeInTheDocument();
    expect(screen.getByText('Song Two')).toBeInTheDocument();
    expect(screen.getByText('2:00')).toBeInTheDocument();
  });

  it('shows empty songs message', async () => {
    getAlbum.mockResolvedValue(mockAlbum);
    getAlbumSongs.mockResolvedValue([]);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('No songs yet.')).toBeInTheDocument();
    });
  });

  it('calls API with correct id', async () => {
    getAlbum.mockResolvedValue(mockAlbum);
    getAlbumSongs.mockResolvedValue([]);
    renderIt('42');
    await waitFor(() => {
      expect(getAlbum).toHaveBeenCalledWith('42');
      expect(getAlbumSongs).toHaveBeenCalledWith('42');
    });
  });

  it('renders back link with artist name', async () => {
    getAlbum.mockResolvedValue(mockAlbum);
    getAlbumSongs.mockResolvedValue([]);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText(/Test Artist/)).toBeInTheDocument();
    });
  });

  it('shows dash for missing duration', async () => {
    getAlbum.mockResolvedValue(mockAlbum);
    getAlbumSongs.mockResolvedValue(mockSongs);
    renderIt();
    await waitFor(() => {
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThan(0);
    });
  });
});
