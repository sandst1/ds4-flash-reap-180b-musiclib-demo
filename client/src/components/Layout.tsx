import { type ReactNode } from 'react';
import { NavBar } from './NavBar.tsx';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="app-layout">
      <NavBar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export { Layout };
