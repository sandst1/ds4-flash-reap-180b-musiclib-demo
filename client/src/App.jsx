import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { ArtistsList } from './pages/ArtistsList.tsx';
import { ArtistDetail } from './pages/ArtistDetail.tsx';
import { AlbumDetail } from './pages/AlbumDetail.tsx';
import { AlbumsList } from './pages/AlbumsList.tsx';
import { SongsList } from './pages/SongsList.tsx';
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
          <Route path="/albums" element={<AlbumsList />} />
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
