import { NavBar } from './NavBar.jsx';

function Layout({ children }) {
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
