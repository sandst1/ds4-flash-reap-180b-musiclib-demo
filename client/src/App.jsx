import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { ArtistsList } from './pages/ArtistsList.jsx';
import { ArtistDetail } from './pages/ArtistDetail.jsx';
import { AlbumDetail } from './pages/AlbumDetail.jsx';
import { SongsList } from './pages/SongsList.jsx';
import { PlaylistsList } from './pages/PlaylistsList.jsx';
import { PlaylistDetail } from './pages/PlaylistDetail.jsx';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/artists" element={<ArtistsList />} />
          <Route path="/artists/:id" element={<ArtistDetail />} />
          <Route path="/albums/:id" element={<AlbumDetail />} />
          <Route path="/songs" element={<SongsList />} />
          <Route path="/playlists" element={<PlaylistsList />} />
          <Route path="/playlists/:id" element={<PlaylistDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export { App };
