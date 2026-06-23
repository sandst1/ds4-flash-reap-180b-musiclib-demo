const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Artists
export function getArtists() {
  return request('/artists');
}

export function getArtist(id) {
  return request(`/artists/${id}`);
}

export function createArtist(data) {
  return request('/artists', { method: 'POST', body: JSON.stringify(data) });
}

export function updateArtist(id, data) {
  return request(`/artists/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteArtist(id) {
  return request(`/artists/${id}`, { method: 'DELETE' });
}

export function getArtistAlbums(id) {
  return request(`/artists/${id}/albums`);
}

// Albums
export function getAlbums(artistId) {
  const qs = artistId ? `?artist_id=${artistId}` : '';
  return request(`/albums${qs}`);
}

export function getAlbum(id) {
  return request(`/albums/${id}`);
}

export function createAlbum(data) {
  return request('/albums', { method: 'POST', body: JSON.stringify(data) });
}

export function updateAlbum(id, data) {
  return request(`/albums/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteAlbum(id) {
  return request(`/albums/${id}`, { method: 'DELETE' });
}

export function getAlbumSongs(id) {
  return request(`/albums/${id}/songs`);
}

// Songs
export function getSongs(albumId) {
  const qs = albumId ? `?album_id=${albumId}` : '';
  return request(`/songs${qs}`);
}

export function getSong(id) {
  return request(`/songs/${id}`);
}

export function createSong(data) {
  return request('/songs', { method: 'POST', body: JSON.stringify(data) });
}

export function updateSong(id, data) {
  return request(`/songs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteSong(id) {
  return request(`/songs/${id}`, { method: 'DELETE' });
}

// Playlists
export function getPlaylists() {
  return request('/playlists');
}

export function getPlaylist(id) {
  return request(`/playlists/${id}`);
}

export function createPlaylist(data) {
  return request('/playlists', { method: 'POST', body: JSON.stringify(data) });
}

export function updatePlaylist(id, data) {
  return request(`/playlists/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deletePlaylist(id) {
  return request(`/playlists/${id}`, { method: 'DELETE' });
}

// Playlist Songs
export function getPlaylistSongs(id) {
  return request(`/playlists/${id}/songs`);
}

export function addSongToPlaylist(playlistId, songId) {
  return request(`/playlists/${playlistId}/songs`, {
    method: 'POST',
    body: JSON.stringify({ song_id: songId }),
  });
}

export function removeSongFromPlaylist(playlistId, songId) {
  return request(`/playlists/${playlistId}/songs/${songId}`, {
    method: 'DELETE',
  });
}

export function reorderPlaylistSongs(playlistId, songIds) {
  return request(`/playlists/${playlistId}/songs/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ song_ids: songIds }),
  });
}
