import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ArtistsList } from './pages/ArtistsList.jsx';
import { ArtistDetail } from './pages/ArtistDetail.jsx';
import { AlbumDetail } from './pages/AlbumDetail.jsx';
import { SongsList } from './pages/SongsList.jsx';
import { PlaylistsList } from './pages/PlaylistsList.jsx';
import { PlaylistDetail } from './pages/PlaylistDetail.jsx';

function Home() {
  return (
    <div>
      <h1>Music Library</h1>
      <ul>
        <li><Link to="/artists">Artists</Link></li>
        <li><Link to="/albums">Albums</Link></li>
        <li><Link to="/songs">Songs</Link></li>
        <li><Link to="/playlists">Playlists</Link></li>
      </ul>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/artists" element={<ArtistsList />} />
        <Route path="/artists/:id" element={<ArtistDetail />} />
        <Route path="/albums/:id" element={<AlbumDetail />} />
        <Route path="/songs" element={<SongsList />} />
        <Route path="/playlists" element={<PlaylistsList />} />
        <Route path="/playlists/:id" element={<PlaylistDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export { App };
