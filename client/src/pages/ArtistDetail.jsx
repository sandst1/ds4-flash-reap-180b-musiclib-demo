import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getArtist, updateArtist, deleteArtist, getArtistAlbums } from '../api/client.js';

function ArtistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', image_url: '' });

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
          {albums.length === 0 ? (
            <p>No albums yet.</p>
          ) : (
            <ul>
              {albums.map(album => (
                <li key={album.id}>
                  <Link to={`/albums/${album.id}`}>{album.title}</Link>
                  {album.release_year && <span> ({album.release_year})</span>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export { ArtistDetail };
