import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSongs, createSong, updateSong, deleteSong, getAlbums } from '../api/client';

function SongsList() {
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ album_id: '', title: '', track_num: '', duration_sec: '', file_path: '' });

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([getSongs(), getAlbums()])
      .then(([songsData, albumsData]) => {
        setSongs(songsData);
        setAlbums(albumsData);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ album_id: albums.length > 0 ? albums[0].id : '', title: '', track_num: '', duration_sec: '', file_path: '' });
    setShowForm(true);
  }

  function openEdit(song) {
    setEditing(song);
    setForm({
      album_id: song.album_id,
      title: song.title,
      track_num: song.track_num || '',
      duration_sec: song.duration_sec || '',
      file_path: song.file_path || '',
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm({ album_id: '', title: '', track_num: '', duration_sec: '', file_path: '' });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      album_id: Number(form.album_id),
      track_num: form.track_num === '' ? null : Number(form.track_num),
      duration_sec: form.duration_sec === '' ? null : Number(form.duration_sec),
    };
    const promise = editing
      ? updateSong(editing.id, payload)
      : createSong(payload);
    promise
      .then(() => { closeForm(); load(); })
      .catch(err => setError(err.message));
  }

  function handleDelete(id) {
    if (!confirm('Delete this song?')) return;
    deleteSong(id)
      .then(() => load())
      .catch(err => setError(err.message));
  }

  function formatDuration(sec) {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  if (loading) return <p>Loading songs...</p>;

  return (
    <div>
      <h1>Songs</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={openCreate}>Create Song</button>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <h3>{editing ? 'Edit Song' : 'New Song'}</h3>
          <div>
            <label>Album *</label>
            <select
              value={form.album_id}
              onChange={e => setForm(f => ({ ...f, album_id: e.target.value }))}
              required
            >
              {albums.length === 0 && <option value="">No albums available</option>}
              {albums.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
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
            <label>Track #</label>
            <input
              type="number"
              min="1"
              value={form.track_num}
              onChange={e => setForm(f => ({ ...f, track_num: e.target.value }))}
            />
          </div>
          <div>
            <label>Duration (seconds)</label>
            <input
              type="number"
              min="0"
              value={form.duration_sec}
              onChange={e => setForm(f => ({ ...f, duration_sec: e.target.value }))}
            />
          </div>
          <div>
            <label>File Path</label>
            <input
              value={form.file_path}
              onChange={e => setForm(f => ({ ...f, file_path: e.target.value }))}
            />
          </div>
          <button type="submit">{editing ? 'Update' : 'Create'}</button>
          <button type="button" onClick={closeForm}>Cancel</button>
        </form>
      )}

      {songs.length === 0 ? (
        <p>No songs yet. Create one!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Duration</th>
              <th>Album</th>
              <th>File</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {songs.map(song => (
              <tr key={song.id}>
                <td>{song.track_num || '—'}</td>
                <td>{song.title}</td>
                <td>{formatDuration(song.duration_sec)}</td>
                <td>
                  <Link to={`/albums/${song.album_id}`}>{song.album_title}</Link>
                </td>
                <td>{song.file_path || '—'}</td>
                <td>
                  <button onClick={() => openEdit(song)}>Edit</button>
                  <button onClick={() => handleDelete(song.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export { SongsList };
