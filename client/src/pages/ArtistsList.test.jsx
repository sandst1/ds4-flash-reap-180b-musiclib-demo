import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../api/client.js', () => ({
  getArtists: vi.fn(),
  createArtist: vi.fn(),
  updateArtist: vi.fn(),
  deleteArtist: vi.fn(),
}));

import { getArtists } from '../api/client.js';
import { ArtistsList } from './ArtistsList.jsx';

function renderIt() {
  return render(
    <MemoryRouter>
      <ArtistsList />
    </MemoryRouter>,
  );
}

const mockArtists = [
  { id: 1, name: 'Artist One', bio: 'First bio', image_url: null },
  { id: 2, name: 'Artist Two', bio: null, image_url: 'http://img.jpg' },
];

beforeEach(() => {
  vi.resetAllMocks();
});

describe('ArtistsList', () => {
  it('shows loading state', () => {
    getArtists.mockReturnValue(new Promise(() => {}));
    renderIt();
    expect(screen.getByText('Loading artists...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    getArtists.mockRejectedValue(new Error('Failed to load'));
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });

  it('shows empty message when no artists', async () => {
    getArtists.mockResolvedValue([]);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('No artists yet. Create one!')).toBeInTheDocument();
    });
  });

  it('renders artist table with data', async () => {
    getArtists.mockResolvedValue(mockArtists);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Artist One')).toBeInTheDocument();
      expect(screen.getByText('Artist Two')).toBeInTheDocument();
    });
    expect(screen.getByText('First bio')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Artists')).toBeInTheDocument();
  });

  it('renders create button', async () => {
    getArtists.mockResolvedValue([]);
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Create Artist')).toBeInTheDocument();
    });
  });
});
