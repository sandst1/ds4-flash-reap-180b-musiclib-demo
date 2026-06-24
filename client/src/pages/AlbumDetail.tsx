import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAlbum, updateAlbum, deleteAlbum, getAlbumSongs } from '../api/client';

function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: '', cover_url: '', release_year: '' });

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([getAlbum(id), getAlbumSongs(id)])
      .then(([albumData, songsData]) => {
        setAlbum(albumData);
        setSongs(songsData);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

  function startEdit() {
    setForm({
      title: album.title,
      cover_url: album.cover_url || '',
      release_year: album.release_year || '',
    });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  function handleUpdate(e) {
    e.preventDefault();
    const payload = { ...form };
    if (payload.release_year === '') payload.release_year = null;
    updateAlbum(id, payload)
      .then(updated => { setAlbum(updated); setEditing(false); })
      .catch(err => setError(err.message));
  }

  function handleDelete() {
    if (!confirm('Delete this album and all its songs?')) return;
    deleteAlbum(id)
      .then(() => navigate(`/artists/${album.artist_id}`))
      .catch(err => setError(err.message));
  }

  function formatDuration(sec) {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  if (loading) return <p>Loading album...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!album) return <p>Album not found.</p>;

  return (
    <div>
      <Link to={`/artists/${album.artist_id}`} className="back-link">← Back to <strong>{album.artist_name}</strong></Link>

      {editing ? (
        <form onSubmit={handleUpdate}>
          <h2>Edit Album</h2>
          <div>
            <label>Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <label>Cover URL</label>
            <input
              value={form.cover_url}
              onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))}
            />
          </div>
          <div>
            <label>Release Year</label>
            <input
              type="number"
              value={form.release_year}
              onChange={e => setForm(f => ({ ...f, release_year: e.target.value }))}
            />
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={cancelEdit}>Cancel</button>
        </form>
      ) : (
        <>
          <h1>{album.title}</h1>
          {album.cover_url && <img src={album.cover_url} alt={album.title} />}
          {album.release_year && <p>Released: {album.release_year}</p>}
          <button onClick={startEdit}>Edit</button>
          <button onClick={handleDelete}>Delete</button>

          <h2>Songs</h2>
          {songs.length === 0 ? (
            <p>No songs yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {songs.map(song => (
                  <tr key={song.id}>
                    <td>{song.track_num || '—'}</td>
                    <td>{song.title}</td>
                    <td>{formatDuration(song.duration_sec)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export { AlbumDetail };
