import type {
  Artist, ArtistInput,
  Album, AlbumInput,
  Song, SongInput,
  Playlist, PlaylistInput,
  PlaylistSong, PlaylistSongWithSong,
  Stats,
} from '../types';

const BASE = '/api';

async function request<T>(url: string, options: RequestInit = {}): Promise<T | null> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data: T = await res.json();
  if (!res.ok) throw new Error((data as Record<string, unknown>).error as string || `Request failed (${res.status})`);
  return data;
}

// Artists
export function getArtists(): Promise<Artist[] | null> {
  return request<Artist[]>('/artists');
}

export function getArtist(id: number): Promise<Artist | null> {
  return request<Artist>(`/artists/${id}`);
}

export function createArtist(data: ArtistInput): Promise<Artist | null> {
  return request<Artist>('/artists', { method: 'POST', body: JSON.stringify(data) });
}

export function updateArtist(id: number, data: Partial<ArtistInput>): Promise<Artist | null> {
  return request<Artist>(`/artists/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteArtist(id: number): Promise<null> {
  return request<null>(`/artists/${id}`, { method: 'DELETE' });
}

export function getArtistAlbums(id: number): Promise<Album[] | null> {
  return request<Album[]>(`/artists/${id}/albums`);
}

// Albums
export function getAlbums(artistId?: number): Promise<Album[] | null> {
  const qs = artistId ? `?artist_id=${artistId}` : '';
  return request<Album[]>(`/albums${qs}`);
}

export function getAlbum(id: number): Promise<Album | null> {
  return request<Album>(`/albums/${id}`);
}

export function createAlbum(data: AlbumInput): Promise<Album | null> {
  return request<Album>('/albums', { method: 'POST', body: JSON.stringify(data) });
}

export function updateAlbum(id: number, data: Partial<AlbumInput>): Promise<Album | null> {
  return request<Album>(`/albums/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteAlbum(id: number): Promise<null> {
  return request<null>(`/albums/${id}`, { method: 'DELETE' });
}

export function getAlbumSongs(id: number): Promise<Song[] | null> {
  return request<Song[]>(`/albums/${id}/songs`);
}

// Songs
export function getSongs(albumId?: number): Promise<Song[] | null> {
  const qs = albumId ? `?album_id=${albumId}` : '';
  return request<Song[]>(`/songs${qs}`);
}

export function getSong(id: number): Promise<Song | null> {
  return request<Song>(`/songs/${id}`);
}

export function createSong(data: SongInput): Promise<Song | null> {
  return request<Song>('/songs', { method: 'POST', body: JSON.stringify(data) });
}

export function updateSong(id: number, data: Partial<SongInput>): Promise<Song | null> {
  return request<Song>(`/songs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteSong(id: number): Promise<null> {
  return request<null>(`/songs/${id}`, { method: 'DELETE' });
}

// Stats
export function getStats(): Promise<Stats | null> {
  return request<Stats>('/stats');
}

// Playlists
export function getPlaylists(): Promise<Playlist[] | null> {
  return request<Playlist[]>('/playlists');
}

export function getPlaylist(id: number): Promise<Playlist | null> {
  return request<Playlist>(`/playlists/${id}`);
}

export function createPlaylist(data: PlaylistInput): Promise<Playlist | null> {
  return request<Playlist>('/playlists', { method: 'POST', body: JSON.stringify(data) });
}

export function updatePlaylist(id: number, data: Partial<PlaylistInput>): Promise<Playlist | null> {
  return request<Playlist>(`/playlists/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deletePlaylist(id: number): Promise<null> {
  return request<null>(`/playlists/${id}`, { method: 'DELETE' });
}

// Playlist Songs
export function getPlaylistSongs(id: number): Promise<PlaylistSongWithSong[] | null> {
  return request<PlaylistSongWithSong[]>(`/playlists/${id}/songs`);
}

export function addSongToPlaylist(playlistId: number, songId: number): Promise<PlaylistSong | null> {
  return request<PlaylistSong>(`/playlists/${playlistId}/songs`, {
    method: 'POST',
    body: JSON.stringify({ song_id: songId }),
  });
}

export function removeSongFromPlaylist(playlistId: number, songId: number): Promise<null> {
  return request<null>(`/playlists/${playlistId}/songs/${songId}`, {
    method: 'DELETE',
  });
}

export function reorderPlaylistSongs(playlistId: number, songIds: number[]): Promise<{ id: number }[] | null> {
  return request<{ id: number }[]>(`/playlists/${playlistId}/songs/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ song_ids: songIds }),
  });
}
