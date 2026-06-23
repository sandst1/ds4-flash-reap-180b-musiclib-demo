import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import supertest from 'supertest';
import { errorHandler } from '../middleware/errorHandler.js';

const ORIGINAL_DB_PATH = process.env.DB_PATH;
process.env.DB_PATH = ':memory:';

let db, request, songId;

beforeAll(async () => {
  const mod = await import('../db/index.js');
  db = mod.getDb();

  // Create prerequisite: artist → album → song (for playlist with songs test)
  const artistId = db.prepare('INSERT INTO artists (name) VALUES (?)').run('Test Artist').lastInsertRowid;
  const albumId = db.prepare('INSERT INTO albums (artist_id, title) VALUES (?, ?)').run(artistId, 'Test Album').lastInsertRowid;
  songId = db.prepare('INSERT INTO songs (album_id, title, track_num) VALUES (?, ?, ?)').run(albumId, 'Test Song', 1).lastInsertRowid;

  const { router } = await import('./playlists.js');

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

describe('playlists API', () => {
  it('GET /api/playlists returns empty list initially', async () => {
    const res = await request.get('/api/playlists');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  describe('CRUD operations', () => {
    let createdId;

    it('POST /api/playlists creates a new playlist', async () => {
      const res = await request.post('/api/playlists').send({ name: 'Test Playlist', description: 'Test desc' });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: 'Test Playlist', description: 'Test desc' });
      expect(res.body.id).toBeTruthy();
      createdId = res.body.id;
    });

    it('POST /api/playlists returns 400 when name is missing', async () => {
      const res = await request.post('/api/playlists').send({ description: 'no name' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'name is required', status: 400 });
    });

    it('POST /api/playlists returns 400 when name is empty', async () => {
      const res = await request.post('/api/playlists').send({ name: '' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'name is required', status: 400 });
    });

    it('GET /api/playlists/:id returns the playlist with songs array', async () => {
      // Add a song to the playlist so we can verify songs array
      db.prepare('INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)').run(createdId, songId, 1);

      const res = await request.get(`/api/playlists/${createdId}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: createdId, name: 'Test Playlist' });
      expect(Array.isArray(res.body.songs)).toBe(true);
      expect(res.body.songs).toHaveLength(1);
      expect(res.body.songs[0]).toMatchObject({ id: songId, title: 'Test Song', position: 1 });
    });

    it('GET /api/playlists/:id returns empty songs array when no songs added', async () => {
      const createRes = await request.post('/api/playlists').send({ name: 'Empty Playlist' });
      const emptyId = createRes.body.id;

      const res = await request.get(`/api/playlists/${emptyId}`);
      expect(res.status).toBe(200);
      expect(res.body.songs).toEqual([]);
    });

    it('GET /api/playlists/:id returns 404 for unknown id', async () => {
      const res = await request.get('/api/playlists/999');
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Playlist not found', status: 404 });
    });

    it('PUT /api/playlists/:id updates the playlist', async () => {
      const res = await request.put(`/api/playlists/${createdId}`).send({ name: 'Updated Playlist', description: 'Updated desc' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: 'Updated Playlist', description: 'Updated desc' });
    });

    it('PUT /api/playlists/:id returns 404 for unknown id', async () => {
      const res = await request.put('/api/playlists/999').send({ name: 'Nope' });
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Playlist not found', status: 404 });
    });

    it('PUT /api/playlists/:id returns 400 when name is empty', async () => {
      const res = await request.put(`/api/playlists/${createdId}`).send({ name: '' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'name cannot be empty', status: 400 });
    });

    it('PUT /api/playlists/:id allows updating without name', async () => {
      const res = await request.put(`/api/playlists/${createdId}`).send({ description: 'just desc update' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: 'Updated Playlist', description: 'just desc update' });
    });

    it('DELETE /api/playlists/:id returns 204 and removes the playlist', async () => {
      const createRes = await request.post('/api/playlists').send({ name: 'Delete Me' });
      const id = createRes.body.id;
      const res = await request.delete(`/api/playlists/${id}`);
      expect(res.status).toBe(204);

      const getRes = await request.get(`/api/playlists/${id}`);
      expect(getRes.status).toBe(404);
    });

    it('DELETE /api/playlists/:id returns 404 for non-existent playlist', async () => {
      const res = await request.delete('/api/playlists/999');
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Playlist not found', status: 404 });
    });
  });
});
