import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Layout } from './Layout.tsx';

function renderWithRouter(ui: ReactNode, url = '/') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      {ui}
    </MemoryRouter>,
  );
}

describe('Layout', () => {
  it('renders NavBar', () => {
    renderWithRouter(<Layout><p>child</p></Layout>);
    expect(document.querySelector('nav')).toBeInTheDocument();
  });

  it('renders children inside main', () => {
    renderWithRouter(<Layout><p data-testid="child">Hello</p></Layout>);
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('renders navbar brand link', () => {
    renderWithRouter(<Layout><p>child</p></Layout>);
    expect(screen.getByText('Music Library')).toBeInTheDocument();
  });
});
