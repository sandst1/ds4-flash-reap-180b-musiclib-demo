import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAlbums, getArtists, createAlbum, updateAlbum, deleteAlbum } from '../api/client';

function AlbumsList() {
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ artist_id: '', title: '', cover_url: '', release_year: '' });

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([getAlbums(), getArtists()])
      .then(([albumsData, artistsData]) => {
        setAlbums(albumsData);
        setArtists(artistsData);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ artist_id: artists.length > 0 ? artists[0].id : '', title: '', cover_url: '', release_year: '' });
    setShowForm(true);
  }

  function openEdit(album) {
    setEditing(album);
    setForm({
      artist_id: album.artist_id,
      title: album.title,
      cover_url: album.cover_url || '',
      release_year: album.release_year || '',
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm({ artist_id: '', title: '', cover_url: '', release_year: '' });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      artist_id: Number(form.artist_id),
      release_year: form.release_year === '' ? null : Number(form.release_year),
    };
    const promise = editing
      ? updateAlbum(editing.id, payload)
      : createAlbum(payload);
    promise
      .then(() => { closeForm(); load(); })
      .catch(err => setError(err.message));
  }

  function handleDelete(id) {
    if (!confirm('Delete this album and all its songs?')) return;
    deleteAlbum(id)
      .then(() => load())
      .catch(err => setError(err.message));
  }

  const artistMap = Object.fromEntries(artists.map(a => [a.id, a.name]));

  if (loading) return <p>Loading albums...</p>;

  return (
    <div>
      <h1>Albums</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={openCreate}>Create Album</button>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <h3>{editing ? 'Edit Album' : 'New Album'}</h3>
          <div>
            <label>Artist *</label>
            <select
              value={form.artist_id}
              onChange={e => setForm(f => ({ ...f, artist_id: e.target.value }))}
              required
            >
              {artists.length === 0 && <option value="">No artists available</option>}
              {artists.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
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
              min="1900"
              max="2099"
              value={form.release_year}
              onChange={e => setForm(f => ({ ...f, release_year: e.target.value }))}
            />
          </div>
          <button type="submit">{editing ? 'Update' : 'Create'}</button>
          <button type="button" onClick={closeForm}>Cancel</button>
        </form>
      )}

      {albums.length === 0 ? (
        <p>No albums yet. Create one!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Artist</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {albums.map(album => (
              <tr key={album.id}>
                <td>
                  <Link to={`/albums/${album.id}`}>{album.title}</Link>
                </td>
                <td>
                  <Link to={`/artists/${album.artist_id}`}>{artistMap[album.artist_id] || '—'}</Link>
                </td>
                <td>{album.release_year || '—'}</td>
                <td>
                  <button onClick={() => openEdit(album)}>Edit</button>
                  <button onClick={() => handleDelete(album.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export { AlbumsList };
