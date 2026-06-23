import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../api/client.js';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStats()
      .then(data => setStats(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!stats) return null;

  const cards = [
    { label: 'Artists', count: stats.artists, to: '/artists' },
    { label: 'Albums', count: stats.albums, to: '/artists' },
    { label: 'Songs', count: stats.songs, to: '/songs' },
    { label: 'Playlists', count: stats.playlists, to: '/playlists' },
  ];

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        {cards.map(card => (
          <Link key={card.label} to={card.to} className="stat-card">
            <span className="stat-count">{card.count}</span>
            <span className="stat-label">{card.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export { Dashboard };
