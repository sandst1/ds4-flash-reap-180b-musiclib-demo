import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlaylists, createPlaylist, updatePlaylist, deletePlaylist } from '../api/client';

function PlaylistsList() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  function load() {
    setLoading(true);
    setError(null);
    getPlaylists()
      .then(data => setPlaylists(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '' });
    setShowForm(true);
  }

  function openEdit(playlist) {
    setEditing(playlist);
    setForm({ name: playlist.name, description: playlist.description || '' });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', description: '' });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const promise = editing
      ? updatePlaylist(editing.id, form)
      : createPlaylist(form);
    promise
      .then(() => { closeForm(); load(); })
      .catch(err => setError(err.message));
  }

  function handleDelete(id) {
    if (!confirm('Delete this playlist?')) return;
    deletePlaylist(id)
      .then(() => load())
      .catch(err => setError(err.message));
  }

  if (loading) return <p>Loading playlists...</p>;

  return (
    <div>
      <h1>Playlists</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={openCreate}>Create Playlist</button>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <h3>{editing ? 'Edit Playlist' : 'New Playlist'}</h3>
          <div>
            <label>Name *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <button type="submit">{editing ? 'Update' : 'Create'}</button>
          <button type="button" onClick={closeForm}>Cancel</button>
        </form>
      )}

      {playlists.length === 0 ? (
        <p>No playlists yet. Create one!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {playlists.map(playlist => (
              <tr key={playlist.id}>
                <td>
                  <Link to={`/playlists/${playlist.id}`}>{playlist.name}</Link>
                </td>
                <td>{playlist.description || '—'}</td>
                <td>
                  <button onClick={() => openEdit(playlist)}>Edit</button>
                  <button onClick={() => handleDelete(playlist.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export { PlaylistsList };
