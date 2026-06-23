import { describe, it, expect, beforeEach } from 'vitest';
import {
  getArtists, getArtist, createArtist, updateArtist, deleteArtist, getArtistAlbums,
  getAlbums, getAlbum, createAlbum, updateAlbum, deleteAlbum, getAlbumSongs,
  getSongs, getSong, createSong, updateSong, deleteSong,
  getStats,
  getPlaylists, getPlaylist, createPlaylist, updatePlaylist, deletePlaylist,
  getPlaylistSongs, addSongToPlaylist, removeSongFromPlaylist, reorderPlaylistSongs,
} from './client';

const BASE = '/api';

function mockFetch(status, body) {
  const ok = status >= 200 && status < 300;
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  });
}

function mockFetchNoContent() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 204,
  });
}

function mockFetchError(status, errorMsg) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({ error: errorMsg }),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('getArtists', () => {
  it('calls GET /api/artists', async () => {
    mockFetch(200, [{ id: 1, name: 'A' }]);
    const result = await getArtists();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/artists`, expect.objectContaining({ headers: { 'Content-Type': 'application/json' } }));
    expect(result).toEqual([{ id: 1, name: 'A' }]);
  });
});

describe('getArtist', () => {
  it('calls GET /api/artists/:id', async () => {
    mockFetch(200, { id: 1, name: 'A' });
    const result = await getArtist(1);
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/artists/1`, expect.any(Object));
    expect(result).toEqual({ id: 1, name: 'A' });
  });
});

describe('createArtist', () => {
  it('calls POST /api/artists with JSON body', async () => {
    mockFetch(201, { id: 1, name: 'New' });
    const data = { name: 'New' };
    const result = await createArtist(data);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/artists`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify(data) }),
    );
    expect(result).toEqual({ id: 1, name: 'New' });
  });
});

describe('updateArtist', () => {
  it('calls PUT /api/artists/:id with JSON body', async () => {
    mockFetch(200, { id: 1, name: 'Updated' });
    const data = { name: 'Updated' };
    const result = await updateArtist(1, data);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/artists/1`,
      expect.objectContaining({ method: 'PUT', body: JSON.stringify(data) }),
    );
    expect(result).toEqual({ id: 1, name: 'Updated' });
  });
});

describe('deleteArtist', () => {
  it('calls DELETE /api/artists/:id and returns null on 204', async () => {
    mockFetchNoContent();
    const result = await deleteArtist(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/artists/1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toBeNull();
  });
});

describe('getArtistAlbums', () => {
  it('calls GET /api/artists/:id/albums', async () => {
    mockFetch(200, [{ id: 1, title: 'Album' }]);
    const result = await getArtistAlbums(1);
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/artists/1/albums`, expect.any(Object));
    expect(result).toEqual([{ id: 1, title: 'Album' }]);
  });
});

describe('getAlbums', () => {
  it('calls GET /api/albums without query when no artistId', async () => {
    mockFetch(200, []);
    await getAlbums();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/albums`, expect.any(Object));
  });

  it('calls GET /api/albums?artist_id=1 with artistId', async () => {
    mockFetch(200, [{ id: 1, title: 'A' }]);
    const result = await getAlbums(1);
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/albums?artist_id=1`, expect.any(Object));
    expect(result).toEqual([{ id: 1, title: 'A' }]);
  });
});

describe('getAlbum', () => {
  it('calls GET /api/albums/:id', async () => {
    mockFetch(200, { id: 1, title: 'A' });
    const result = await getAlbum(1);
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/albums/1`, expect.any(Object));
    expect(result).toEqual({ id: 1, title: 'A' });
  });
});

describe('createAlbum', () => {
  it('calls POST /api/albums with JSON body', async () => {
    mockFetch(201, { id: 1, title: 'A', artist_id: 1 });
    const data = { title: 'A', artist_id: 1 };
    const result = await createAlbum(data);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/albums`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify(data) }),
    );
    expect(result).toEqual({ id: 1, title: 'A', artist_id: 1 });
  });
});

describe('updateAlbum', () => {
  it('calls PUT /api/albums/:id with JSON body', async () => {
    mockFetch(200, { id: 1, title: 'U' });
    const data = { title: 'U' };
    const result = await updateAlbum(1, data);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/albums/1`,
      expect.objectContaining({ method: 'PUT', body: JSON.stringify(data) }),
    );
    expect(result).toEqual({ id: 1, title: 'U' });
  });
});

describe('deleteAlbum', () => {
  it('calls DELETE /api/albums/:id and returns null on 204', async () => {
    mockFetchNoContent();
    const result = await deleteAlbum(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/albums/1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toBeNull();
  });
});

describe('getAlbumSongs', () => {
  it('calls GET /api/albums/:id/songs', async () => {
    mockFetch(200, [{ id: 1, title: 'S' }]);
    const result = await getAlbumSongs(1);
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/albums/1/songs`, expect.any(Object));
    expect(result).toEqual([{ id: 1, title: 'S' }]);
  });
});

describe('getSongs', () => {
  it('calls GET /api/songs without query when no albumId', async () => {
    mockFetch(200, []);
    await getSongs();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/songs`, expect.any(Object));
  });

  it('calls GET /api/songs?album_id=1 with albumId', async () => {
    mockFetch(200, [{ id: 1, title: 'S' }]);
    const result = await getSongs(1);
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/songs?album_id=1`, expect.any(Object));
    expect(result).toEqual([{ id: 1, title: 'S' }]);
  });
});

describe('getSong', () => {
  it('calls GET /api/songs/:id', async () => {
    mockFetch(200, { id: 1, title: 'S' });
    const result = await getSong(1);
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/songs/1`, expect.any(Object));
    expect(result).toEqual({ id: 1, title: 'S' });
  });
});

describe('createSong', () => {
  it('calls POST /api/songs with JSON body', async () => {
    mockFetch(201, { id: 1, title: 'S', album_id: 1 });
    const data = { title: 'S', album_id: 1 };
    const result = await createSong(data);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/songs`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify(data) }),
    );
    expect(result).toEqual({ id: 1, title: 'S', album_id: 1 });
  });
});

describe('updateSong', () => {
  it('calls PUT /api/songs/:id with JSON body', async () => {
    mockFetch(200, { id: 1, title: 'U' });
    const data = { title: 'U' };
    const result = await updateSong(1, data);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/songs/1`,
      expect.objectContaining({ method: 'PUT', body: JSON.stringify(data) }),
    );
    expect(result).toEqual({ id: 1, title: 'U' });
  });
});

describe('deleteSong', () => {
  it('calls DELETE /api/songs/:id and returns null on 204', async () => {
    mockFetchNoContent();
    const result = await deleteSong(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/songs/1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toBeNull();
  });
});

describe('getStats', () => {
  it('calls GET /api/stats', async () => {
    mockFetch(200, { artists: 3, albums: 5, songs: 10, playlists: 2 });
    const result = await getStats();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/stats`, expect.any(Object));
    expect(result).toEqual({ artists: 3, albums: 5, songs: 10, playlists: 2 });
  });
});

describe('getPlaylists', () => {
  it('calls GET /api/playlists', async () => {
    mockFetch(200, [{ id: 1, name: 'P' }]);
    const result = await getPlaylists();
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/playlists`, expect.any(Object));
    expect(result).toEqual([{ id: 1, name: 'P' }]);
  });
});

describe('getPlaylist', () => {
  it('calls GET /api/playlists/:id', async () => {
    mockFetch(200, { id: 1, name: 'P' });
    const result = await getPlaylist(1);
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/playlists/1`, expect.any(Object));
    expect(result).toEqual({ id: 1, name: 'P' });
  });
});

describe('createPlaylist', () => {
  it('calls POST /api/playlists with JSON body', async () => {
    mockFetch(201, { id: 1, name: 'P' });
    const data = { name: 'P' };
    const result = await createPlaylist(data);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/playlists`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify(data) }),
    );
    expect(result).toEqual({ id: 1, name: 'P' });
  });
});

describe('updatePlaylist', () => {
  it('calls PUT /api/playlists/:id with JSON body', async () => {
    mockFetch(200, { id: 1, name: 'U' });
    const data = { name: 'U' };
    const result = await updatePlaylist(1, data);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/playlists/1`,
      expect.objectContaining({ method: 'PUT', body: JSON.stringify(data) }),
    );
    expect(result).toEqual({ id: 1, name: 'U' });
  });
});

describe('deletePlaylist', () => {
  it('calls DELETE /api/playlists/:id and returns null on 204', async () => {
    mockFetchNoContent();
    const result = await deletePlaylist(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/playlists/1`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toBeNull();
  });
});

describe('getPlaylistSongs', () => {
  it('calls GET /api/playlists/:id/songs', async () => {
    mockFetch(200, [{ id: 1, title: 'S', position: 1 }]);
    const result = await getPlaylistSongs(1);
    expect(global.fetch).toHaveBeenCalledWith(`${BASE}/playlists/1/songs`, expect.any(Object));
    expect(result).toEqual([{ id: 1, title: 'S', position: 1 }]);
  });
});

describe('addSongToPlaylist', () => {
  it('calls POST /api/playlists/:id/songs with song_id in body', async () => {
    mockFetch(201, { id: 1, song_id: 5, playlist_id: 1 });
    const result = await addSongToPlaylist(1, 5);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/playlists/1/songs`,
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ song_id: 5 }) }),
    );
    expect(result).toEqual({ id: 1, song_id: 5, playlist_id: 1 });
  });
});

describe('removeSongFromPlaylist', () => {
  it('calls DELETE /api/playlists/:id/songs/:songId and returns null on 204', async () => {
    mockFetchNoContent();
    const result = await removeSongFromPlaylist(1, 5);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/playlists/1/songs/5`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toBeNull();
  });
});

describe('reorderPlaylistSongs', () => {
  it('calls PUT /api/playlists/:id/songs/reorder with song_ids in body', async () => {
    mockFetch(200, [{ id: 3 }, { id: 1 }, { id: 2 }]);
    const ids = [3, 1, 2];
    const result = await reorderPlaylistSongs(1, ids);
    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE}/playlists/1/songs/reorder`,
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ song_ids: ids }) }),
    );
    expect(result).toEqual([{ id: 3 }, { id: 1 }, { id: 2 }]);
  });
});

describe('error handling', () => {
  it('returns null for 204 responses', async () => {
    mockFetchNoContent();
    const result = await getArtists();
    expect(result).toBeNull();
  });

  it('throws Error with server message on non-ok response', async () => {
    mockFetchError(400, 'Name is required');
    await expect(createArtist({})).rejects.toThrow('Name is required');
  });

  it('throws Error with fallback message when no error field', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });
    await expect(getArtists()).rejects.toThrow('Request failed (500)');
  });
});
