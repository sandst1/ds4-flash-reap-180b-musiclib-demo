import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NavBar } from './NavBar.tsx';

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <NavBar />
    </MemoryRouter>,
  );
}

describe('NavBar', () => {
  it('renders brand link', () => {
    renderAt('/');
    expect(screen.getByText('Music Library')).toBeInTheDocument();
  });

  it('renders all nav links', () => {
    renderAt('/');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Artists')).toBeInTheDocument();
    expect(screen.getByText('Albums')).toBeInTheDocument();
    expect(screen.getByText('Songs')).toBeInTheDocument();
    expect(screen.getByText('Playlists')).toBeInTheDocument();
  });

  it('highlights Dashboard link at /', () => {
    renderAt('/');
    const link = screen.getByText('Dashboard');
    expect(link).toHaveClass('active');
  });

  it('highlights Artists link at /artists', () => {
    renderAt('/artists');
    expect(screen.getByText('Artists')).toHaveClass('active');
    expect(screen.getByText('Dashboard')).not.toHaveClass('active');
  });

  it('highlights Albums link at /albums', () => {
    renderAt('/albums');
    expect(screen.getByText('Albums')).toHaveClass('active');
    expect(screen.getByText('Dashboard')).not.toHaveClass('active');
  });

  it('highlights Songs link at /songs', () => {
    renderAt('/songs');
    expect(screen.getByText('Songs')).toHaveClass('active');
    expect(screen.getByText('Dashboard')).not.toHaveClass('active');
  });

  it('highlights Playlists link at /playlists', () => {
    renderAt('/playlists');
    expect(screen.getByText('Playlists')).toHaveClass('active');
    expect(screen.getByText('Dashboard')).not.toHaveClass('active');
  });
});
