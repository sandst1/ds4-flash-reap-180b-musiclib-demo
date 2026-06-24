import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArtists, createArtist, updateArtist, deleteArtist } from '../api/client';

function ArtistsList() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', bio: '', image_url: '' });

  function load() {
    setLoading(true);
    setError(null);
    getArtists()
      .then(data => setArtists(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', bio: '', image_url: '' });
    setShowForm(true);
  }

  function openEdit(artist) {
    setEditing(artist);
    setForm({ name: artist.name, bio: artist.bio || '', image_url: artist.image_url || '' });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', bio: '', image_url: '' });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const promise = editing
      ? updateArtist(editing.id, form)
      : createArtist(form);
    promise
      .then(() => { closeForm(); load(); })
      .catch(err => setError(err.message));
  }

  function handleDelete(id) {
    if (!confirm('Delete this artist and all their albums/songs?')) return;
    deleteArtist(id)
      .then(() => load())
      .catch(err => setError(err.message));
  }

  if (loading) return <p>Loading artists...</p>;

  return (
    <div>
      <h1>Artists</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={openCreate}>Create Artist</button>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <h3>{editing ? 'Edit Artist' : 'New Artist'}</h3>
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
          <button type="submit">{editing ? 'Update' : 'Create'}</button>
          <button type="button" onClick={closeForm}>Cancel</button>
        </form>
      )}

      {artists.length === 0 ? (
        <p>No artists yet. Create one!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Bio</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {artists.map(artist => (
              <tr key={artist.id}>
                <td>
                  <Link to={`/artists/${artist.id}`}>{artist.name}</Link>
                </td>
                <td>{artist.bio || '—'}</td>
                <td>
                  <button onClick={() => openEdit(artist)}>Edit</button>
                  <button onClick={() => handleDelete(artist.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export { ArtistsList };
