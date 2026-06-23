import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getPlaylist, updatePlaylist, deletePlaylist,
  addSongToPlaylist, removeSongFromPlaylist, reorderPlaylistSongs,
  getSongs,
} from '../api/client.js';

function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [addSongId, setAddSongId] = useState('');

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([getPlaylist(id), getSongs()])
      .then(([playlistData, allSongsData]) => {
        setPlaylist(playlistData);
        setSongs(playlistData.songs || []);
        setAllSongs(allSongsData);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

  function startEdit() {
    setForm({
      name: playlist.name,
      description: playlist.description || '',
    });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  function handleUpdate(e) {
    e.preventDefault();
    updatePlaylist(id, form)
      .then(updated => { setPlaylist(updated); setEditing(false); })
      .catch(err => setError(err.message));
  }

  function handleDelete() {
    if (!confirm('Delete this playlist?')) return;
    deletePlaylist(id)
      .then(() => navigate('/playlists'))
      .catch(err => setError(err.message));
  }

  function handleAddSong(e) {
    e.preventDefault();
    if (!addSongId) return;
    addSongToPlaylist(id, Number(addSongId))
      .then(() => { setAddSongId(''); load(); })
      .catch(err => setError(err.message));
  }

  function handleRemoveSong(songId) {
    if (!confirm('Remove this song from the playlist?')) return;
    removeSongFromPlaylist(id, songId)
      .then(() => load())
      .catch(err => setError(err.message));
  }

  function handleMoveUp(songId) {
    const ids = songs.map(s => s.id);
    const idx = ids.indexOf(songId);
    if (idx <= 0) return;
    const newOrder = [...ids];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    reorderPlaylistSongs(id, newOrder)
      .then(updatedSongs => { setSongs(updatedSongs); })
      .catch(err => setError(err.message));
  }

  function handleMoveDown(songId) {
    const ids = songs.map(s => s.id);
    const idx = ids.indexOf(songId);
    if (idx < 0 || idx >= songs.length - 1) return;
    const newOrder = songs.map(s => s.id);
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    reorderPlaylistSongs(id, newOrder)
      .then(updatedSongs => { setSongs(updatedSongs); })
      .catch(err => setError(err.message));
  }

  function formatDuration(sec) {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  const songsInPlaylist = new Set(songs.map(s => s.id));
  const availableSongs = allSongs.filter(s => !songsInPlaylist.has(s.id));

  if (loading) return <p>Loading playlist...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!playlist) return <p>Playlist not found.</p>;

  return (
    <div>
      <Link to="/playlists">← Back to Playlists</Link>

      {editing ? (
        <form onSubmit={handleUpdate}>
          <h2>Edit Playlist</h2>
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
          <button type="submit">Save</button>
          <button type="button" onClick={cancelEdit}>Cancel</button>
        </form>
      ) : (
        <>
          <h1>{playlist.name}</h1>
          {playlist.description && <p>{playlist.description}</p>}
          <button onClick={startEdit}>Edit</button>
          <button onClick={handleDelete}>Delete</button>

          <h2>Songs ({songs.length})</h2>

          <form onSubmit={handleAddSong}>
            <label>Add Song</label>
            <select
              value={addSongId}
              onChange={e => setAddSongId(e.target.value)}
            >
              <option value="">— Select a song —</option>
              {availableSongs.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            <button type="submit" disabled={!addSongId}>Add</button>
          </form>

          {songs.length === 0 ? (
            <p>No songs in this playlist yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song, i) => (
                  <tr key={song.id}>
                    <td>{i + 1}</td>
                    <td>{song.title}</td>
                    <td>{formatDuration(song.duration_sec)}</td>
                    <td>
                      <button
                        onClick={() => handleMoveUp(song.id)}
                        disabled={i === 0}
                      >
                        Up
                      </button>
                      <button
                        onClick={() => handleMoveDown(song.id)}
                        disabled={i === songs.length - 1}
                      >
                        Down
                      </button>
                      <button onClick={() => handleRemoveSong(song.id)}>Remove</button>
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

export { PlaylistDetail };
