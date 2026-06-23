import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getArtist, updateArtist, deleteArtist, getArtistAlbums, createAlbum, updateAlbum, deleteAlbum } from '../api/client.js';

function ArtistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', image_url: '' });
  const [albumForm, setAlbumForm] = useState({ title: '', cover_url: '', release_year: '' });
  const [albumEditing, setAlbumEditing] = useState(null);
  const [showAlbumForm, setShowAlbumForm] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([getArtist(id), getArtistAlbums(id)])
      .then(([artistData, albumsData]) => {
        setArtist(artistData);
        setAlbums(albumsData);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

  function startEdit() {
    setForm({
      name: artist.name,
      bio: artist.bio || '',
      image_url: artist.image_url || '',
    });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  function handleUpdate(e) {
    e.preventDefault();
    updateArtist(id, form)
      .then(updated => { setArtist(updated); setEditing(false); })
      .catch(err => setError(err.message));
  }

  function handleDelete() {
    if (!confirm('Delete this artist and all their albums/songs?')) return;
    deleteArtist(id)
      .then(() => navigate('/artists'))
      .catch(err => setError(err.message));
  }

  function openAlbumCreate() {
    setAlbumEditing(null);
    setAlbumForm({ title: '', cover_url: '', release_year: '' });
    setShowAlbumForm(true);
  }

  function openAlbumEdit(album) {
    setAlbumEditing(album);
    setAlbumForm({
      title: album.title,
      cover_url: album.cover_url || '',
      release_year: album.release_year || '',
    });
    setShowAlbumForm(true);
  }

  function closeAlbumForm() {
    setShowAlbumForm(false);
    setAlbumEditing(null);
    setAlbumForm({ title: '', cover_url: '', release_year: '' });
  }

  function handleAlbumSubmit(e) {
    e.preventDefault();
    const payload = { ...albumForm, artist_id: id };
    if (payload.release_year === '') payload.release_year = null;
    const promise = albumEditing
      ? updateAlbum(albumEditing.id, payload)
      : createAlbum(payload);
    promise
      .then(() => { closeAlbumForm(); load(); })
      .catch(err => setError(err.message));
  }

  function handleAlbumDelete(albumId) {
    if (!confirm('Delete this album and all its songs?')) return;
    deleteAlbum(albumId)
      .then(() => load())
      .catch(err => setError(err.message));
  }

  if (loading) return <p>Loading artist...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!artist) return <p>Artist not found.</p>;

  return (
    <div>
      <Link to="/artists">← Back to Artists</Link>

      {editing ? (
        <form onSubmit={handleUpdate}>
          <h2>Edit Artist</h2>
          <div>
            <label>Name *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label>Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            />
          </div>
          <div>
            <label>Image URL</label>
            <input
              value={form.image_url}
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
            />
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={cancelEdit}>Cancel</button>
        </form>
      ) : (
        <>
          <h1>{artist.name}</h1>
          {artist.image_url && <img src={artist.image_url} alt={artist.name} />}
          {artist.bio && <p>{artist.bio}</p>}
          <button onClick={startEdit}>Edit</button>
          <button onClick={handleDelete}>Delete</button>

          <h2>Albums</h2>
          <button onClick={openAlbumCreate}>Add Album</button>

          {showAlbumForm && (
            <form onSubmit={handleAlbumSubmit}>
              <h4>{albumEditing ? 'Edit Album' : 'New Album'}</h4>
              <div>
                <label>Title *</label>
                <input
                  value={albumForm.title}
                  onChange={e => setAlbumForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label>Cover URL</label>
                <input
                  value={albumForm.cover_url}
                  onChange={e => setAlbumForm(f => ({ ...f, cover_url: e.target.value }))}
                />
              </div>
              <div>
                <label>Release Year</label>
                <input
                  type="number"
                  value={albumForm.release_year}
                  onChange={e => setAlbumForm(f => ({ ...f, release_year: e.target.value }))}
                />
              </div>
              <button type="submit">{albumEditing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={closeAlbumForm}>Cancel</button>
            </form>
          )}

          {albums.length === 0 ? (
            <p>No albums yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
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
                    <td>{album.release_year || '—'}</td>
                    <td>
                      <button onClick={() => openAlbumEdit(album)}>Edit</button>
                      <button onClick={() => handleAlbumDelete(album.id)}>Delete</button>
                    </td>
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

export { ArtistDetail };
