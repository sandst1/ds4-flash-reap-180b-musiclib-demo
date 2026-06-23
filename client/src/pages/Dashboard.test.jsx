import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../api/client.js', () => ({
  getStats: vi.fn(),
}));

import { getStats } from '../api/client.js';
import { Dashboard } from './Dashboard.jsx';

function renderIt() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('Dashboard', () => {
  it('shows loading state', () => {
    getStats.mockReturnValue(new Promise(() => {}));
    renderIt();
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    getStats.mockRejectedValue(new Error('Failed to load stats'));
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Failed to load stats')).toBeInTheDocument();
      expect(screen.getByText('Failed to load stats')).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    });
  });

  it('renders stat cards with counts', async () => {
    getStats.mockResolvedValue({ artists: 3, albums: 5, songs: 10, playlists: 2 });
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
    expect(screen.getByText('Artists')).toBeInTheDocument();
    expect(screen.getByText('Albums')).toBeInTheDocument();
    expect(screen.getByText('Songs')).toBeInTheDocument();
    expect(screen.getByText('Playlists')).toBeInTheDocument();
  });

  it('renders heading', async () => {
    getStats.mockResolvedValue({ artists: 0, albums: 0, songs: 0, playlists: 0 });
    renderIt();
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});
