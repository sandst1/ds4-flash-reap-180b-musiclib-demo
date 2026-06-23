import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import supertest from 'supertest';
import { errorHandler } from '../middleware/errorHandler.js';

const ORIGINAL_DB_PATH = process.env.DB_PATH;
process.env.DB_PATH = ':memory:';

let db, request, playlistId, songId1, songId2, albumId;

beforeAll(async () => {
  const mod = await import('../db/index.js');
  db = mod.getDb();

  const artistId = db.prepare('INSERT INTO artists (name) VALUES (?)').run('Test Artist').lastInsertRowid;
  albumId = db.prepare('INSERT INTO albums (artist_id, title) VALUES (?, ?)').run(artistId, 'Test Album').lastInsertRowid;
  songId1 = db.prepare('INSERT INTO songs (album_id, title, track_num) VALUES (?, ?, ?)').run(albumId, 'Song One', 1).lastInsertRowid;
  songId2 = db.prepare('INSERT INTO songs (album_id, title, track_num) VALUES (?, ?, ?)').run(albumId, 'Song Two', 2).lastInsertRowid;
  playlistId = db.prepare('INSERT INTO playlists (name) VALUES (?)').run('Test Playlist').lastInsertRowid;

  const { router } = await import('./playlistSongs.js');

  const app = express();
  app.use(express.json());
  app.use('/api/playlists', router);
  app.use(errorHandler);
  request = supertest(app);
});

afterAll(() => {
  if (ORIGINAL_DB_PATH === undefined) {
    delete process.env.DB_PATH;
  } else {
    process.env.DB_PATH = ORIGINAL_DB_PATH;
  }
});

describe('playlist songs API', () => {
  it('GET /api/playlists/:id/songs returns empty list initially', async () => {
    const res = await request.get(`/api/playlists/${playlistId}/songs`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('GET /api/playlists/:id/songs returns 404 for unknown playlist', async () => {
    const res = await request.get('/api/playlists/999/songs');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Playlist not found', status: 404 });
  });

  describe('add and remove songs', () => {
    it('POST /api/playlists/:id/songs adds a song with auto-assigned position', async () => {
      const res = await request.post(`/api/playlists/${playlistId}/songs`).send({ song_id: songId1 });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ playlist_id: playlistId, song_id: songId1, position: 1 });
    });

    it('POST /api/playlists/:id/songs adds a second song with incremented position', async () => {
      const res = await request.post(`/api/playlists/${playlistId}/songs`).send({ song_id: songId2 });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ playlist_id: playlistId, song_id: songId2, position: 2 });
    });

    it('POST /api/playlists/:id/songs allows duplicate songs (same song added again)', async () => {
      const res = await request.post(`/api/playlists/${playlistId}/songs`).send({ song_id: songId1 });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ playlist_id: playlistId, song_id: songId1 });
    });

    it('POST /api/playlists/:id/songs returns 400 when song_id is missing', async () => {
      const res = await request.post(`/api/playlists/${playlistId}/songs`).send({});
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'song_id is required and must be a number', status: 400 });
    });

    it('POST /api/playlists/:id/songs returns 400 when song_id is not a number', async () => {
      const res = await request.post(`/api/playlists/${playlistId}/songs`).send({ song_id: 'abc' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'song_id is required and must be a number', status: 400 });
    });

    it('POST /api/playlists/:id/songs returns 404 for nonexistent playlist', async () => {
      const res = await request.post('/api/playlists/999/songs').send({ song_id: songId1 });
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Playlist not found', status: 404 });
    });

    it('POST /api/playlists/:id/songs returns 404 for nonexistent song', async () => {
      const res = await request.post(`/api/playlists/${playlistId}/songs`).send({ song_id: 999 });
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Song not found', status: 404 });
    });

    it('GET /api/playlists/:id/songs returns songs ordered by position', async () => {
      const res = await request.get(`/api/playlists/${playlistId}/songs`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(3);
      expect(res.body[0]).toMatchObject({ id: songId1, title: 'Song One', position: 1 });
      expect(res.body[1]).toMatchObject({ id: songId2, title: 'Song Two', position: 2 });
      expect(res.body[2]).toMatchObject({ id: songId1, title: 'Song One', position: 3 });
    });

    it('DELETE /api/playlists/:id/songs/:songId removes a song from playlist (removes all matching rows)', async () => {
      const res = await request.delete(`/api/playlists/${playlistId}/songs/${songId2}`);
      expect(res.status).toBe(204);

      const getRes = await request.get(`/api/playlists/${playlistId}/songs`);
      expect(getRes.body).toHaveLength(2);
      getRes.body.forEach(s => expect(s.id).toBe(songId1));
    });

    it('DELETE /api/playlists/:id/songs/:songId returns 404 for unknown playlist', async () => {
      const res = await request.delete(`/api/playlists/999/songs/${songId1}`);
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Playlist not found', status: 404 });
    });

    it('DELETE /api/playlists/:id/songs/:songId returns 404 when song not in playlist', async () => {
      const res = await request.delete(`/api/playlists/${playlistId}/songs/999`);
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Song not found in playlist', status: 404 });
    });
  });

  describe('reorder', () => {
    let reorderPlaylistId, songIdA, songIdB, songIdC;

    beforeAll(() => {
      reorderPlaylistId = db.prepare('INSERT INTO playlists (name) VALUES (?)').run('Reorder Playlist').lastInsertRowid;
      songIdA = db.prepare('INSERT INTO songs (album_id, title, track_num) VALUES (?, ?, ?)').run(albumId, 'Song A', 10).lastInsertRowid;
      songIdB = db.prepare('INSERT INTO songs (album_id, title, track_num) VALUES (?, ?, ?)').run(albumId, 'Song B', 11).lastInsertRowid;
      songIdC = db.prepare('INSERT INTO songs (album_id, title, track_num) VALUES (?, ?, ?)').run(albumId, 'Song C', 12).lastInsertRowid;
      db.prepare('INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)').run(reorderPlaylistId, songIdA, 1);
      db.prepare('INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)').run(reorderPlaylistId, songIdB, 2);
      db.prepare('INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)').run(reorderPlaylistId, songIdC, 3);
    });

    it('PUT /api/playlists/:id/songs/reorder updates positions', async () => {
      const res = await request.put(`/api/playlists/${reorderPlaylistId}/songs/reorder`).send({ song_ids: [songIdC, songIdB, songIdA] });
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(3);
      expect(res.body[0]).toMatchObject({ id: songIdC, position: 1 });
      expect(res.body[1]).toMatchObject({ id: songIdB, position: 2 });
      expect(res.body[2]).toMatchObject({ id: songIdA, position: 3 });
    });

    it('PUT /api/playlists/:id/songs/reorder returns 400 when song_ids is empty', async () => {
      const res = await request.put(`/api/playlists/${reorderPlaylistId}/songs/reorder`).send({ song_ids: [] });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'song_ids array is required and must not be empty', status: 400 });
    });

    it('PUT /api/playlists/:id/songs/reorder returns 400 when song_ids is missing', async () => {
      const res = await request.put(`/api/playlists/${reorderPlaylistId}/songs/reorder`).send({});
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'song_ids array is required and must not be empty', status: 400 });
    });

    it('PUT /api/playlists/:id/songs/reorder returns 404 for unknown playlist', async () => {
      const res = await request.put('/api/playlists/999/songs/reorder').send({ song_ids: [1] });
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Playlist not found', status: 404 });
    });
  });
});
