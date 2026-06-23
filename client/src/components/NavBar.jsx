import { Link, useLocation } from 'react-router-dom';

function NavBar() {
  const location = useLocation();
  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/artists', label: 'Artists' },
    { to: '/albums', label: 'Albums' },
    { to: '/songs', label: 'Songs' },
    { to: '/playlists', label: 'Playlists' },
  ];

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Music Library</Link>
      <div className="navbar-links">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={location.pathname === link.to ? 'nav-link active' : 'nav-link'}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export { NavBar };
