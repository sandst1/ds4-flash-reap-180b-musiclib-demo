import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../api/client.js', () => ({
  getArtist: vi.fn(),
  updateArtist: vi.fn(),
  deleteArtist: vi.fn(),
  getArtistAlbums: vi.fn(),
  createAlbum: vi.fn(),
  updateAlbum: vi.fn(),
  deleteAlbum: vi.fn(),
}));

import { getArtist, getArtistAlbums } from '../api/client.js';
import { ArtistDetail } from './ArtistDetail.jsx';

function renderIt(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/artists/${id}`]}>
      <Routes>
        <Route path="/artists/:id" element={<ArtistDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

const mockArtist = { id: 1, name: 'Test Artist', bio: 'A great artist', image_url: 'http://img.jpg' };
const mockAlbums = [
  { id: 1, title: 'Album One', release_year: 2020, cover_url: null },
  { id: 2, title: 'Album Two', release_year: null, cover_url: 'http://cover.jpg' },
];

beforeEach(() => {
  vi.resetAllMocks();
});

describe('ArtistDetail', () => {
  it('shows loading state', () => {
    getArtist.mockReturnValue(new Promise(() => {}));
    renderIt();
    expect(screen.getByText('Loading artist...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    getArtist.mockRejectedValue(new Error('Failed to load artist'));
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Failed to load artist')).toBeInTheDocument();
    });
  });

  it('shows not found when artist is null', async () => {
    getArtist.mockResolvedValue(null);
    getArtistAlbums.mockResolvedValue([]);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Artist not found.')).toBeInTheDocument();
    });
  });

  it('renders artist info and albums', async () => {
    getArtist.mockResolvedValue(mockArtist);
    getArtistAlbums.mockResolvedValue(mockAlbums);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
    });
    expect(screen.getByText('A great artist')).toBeInTheDocument();
    expect(screen.getByText('Album One')).toBeInTheDocument();
    expect(screen.getByText('Album Two')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
  });

  it('shows empty albums message', async () => {
    getArtist.mockResolvedValue(mockArtist);
    getArtistAlbums.mockResolvedValue([]);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('No albums yet.')).toBeInTheDocument();
    });
  });

  it('calls API with correct id', async () => {
    getArtist.mockResolvedValue(mockArtist);
    getArtistAlbums.mockResolvedValue([]);
    renderIt('42');
    await waitFor(() => {
      expect(getArtist).toHaveBeenCalledWith('42');
      expect(getArtistAlbums).toHaveBeenCalledWith('42');
    });
  });

  it('renders back link', async () => {
    getArtist.mockResolvedValue(mockArtist);
    getArtistAlbums.mockResolvedValue([]);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('← Back to Artists')).toBeInTheDocument();
    });
  });
});
