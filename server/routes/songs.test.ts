import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import supertest from 'supertest';
import { errorHandler } from '../middleware/errorHandler.ts';

const ORIGINAL_DB_PATH = process.env.DB_PATH;
process.env.DB_PATH = ':memory:';

let db: import('../db/sqlite.ts').Database;
let request: ReturnType<typeof supertest>;
let albumId: number;

beforeAll(async () => {
  const mod = await import('../db/index.ts');
  db = mod.getDb();

  const artistId = db.prepare('INSERT INTO artists (name) VALUES (?)').run('Test Artist').lastInsertRowid as number;
  albumId = db.prepare('INSERT INTO albums (artist_id, title) VALUES (?, ?)').run(artistId, 'Test Album').lastInsertRowid as number;

  const { router } = await import('./songs.ts');

  const app = express();
  app.use(express.json());
  app.use('/api/songs', router);
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

describe('songs API', () => {
  it('GET /api/songs returns empty list initially', async () => {
    const res = await request.get('/api/songs');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  describe('CRUD operations', () => {
    let createdId: number;

    it('POST /api/songs creates a new song', async () => {
      const res = await request.post('/api/songs').send({ album_id: albumId, title: 'Test Song', track_num: 1, duration_sec: 180 });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ album_id: albumId, title: 'Test Song', track_num: 1, duration_sec: 180 });
      expect(res.body.id).toBeTruthy();
      createdId = res.body.id;
    });

    it('POST /api/songs returns 400 when album_id is missing', async () => {
      const res = await request.post('/api/songs').send({ title: 'No Album' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'album_id and title are required', status: 400 });
    });

    it('POST /api/songs returns 400 when title is missing', async () => {
      const res = await request.post('/api/songs').send({ album_id: albumId });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'album_id and title are required', status: 400 });
    });

    it('POST /api/songs returns 400 when title is empty', async () => {
      const res = await request.post('/api/songs').send({ album_id: albumId, title: '' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'album_id and title are required', status: 400 });
    });

    it('POST /api/songs returns 400 for nonexistent album', async () => {
      const res = await request.post('/api/songs').send({ album_id: 999, title: 'Ghost Song' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'Album not found', status: 400 });
    });

    it('GET /api/songs/:id returns the song', async () => {
      const res = await request.get(`/api/songs/${createdId}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: createdId, album_id: albumId, title: 'Test Song' });
    });

    it('GET /api/songs/:id returns 404 for unknown id', async () => {
      const res = await request.get('/api/songs/999');
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Song not found', status: 404 });
    });

    it('PUT /api/songs/:id updates the song', async () => {
      const res = await request.put(`/api/songs/${createdId}`).send({ title: 'Updated Song', track_num: 2, duration_sec: 200 });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ title: 'Updated Song', track_num: 2, duration_sec: 200 });
    });

    it('PUT /api/songs/:id returns 404 for unknown id', async () => {
      const res = await request.put('/api/songs/999').send({ title: 'Nope' });
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Song not found', status: 404 });
    });

    it('PUT /api/songs/:id returns 400 when title is empty', async () => {
      const res = await request.put(`/api/songs/${createdId}`).send({ title: '' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'title cannot be empty', status: 400 });
    });

    it('PUT /api/songs/:id returns 400 for invalid album_id', async () => {
      const res = await request.put(`/api/songs/${createdId}`).send({ album_id: 999 });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'Album not found', status: 400 });
    });

    it('DELETE /api/songs/:id returns 204 and removes the song', async () => {
      const createRes = await request.post('/api/songs').send({ album_id: albumId, title: 'Delete Me' });
      const id = createRes.body.id;
      const res = await request.delete(`/api/songs/${id}`);
      expect(res.status).toBe(204);

      const getRes = await request.get(`/api/songs/${id}`);
      expect(getRes.status).toBe(404);
    });

    it('DELETE /api/songs/:id returns 404 for non-existent song', async () => {
      const res = await request.delete('/api/songs/999');
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Song not found', status: 404 });
    });
  });

  describe('GET /api/songs filtered by ?album_id', () => {
    let albumA: number, albumB: number;

    beforeAll(() => {
      const artistId = db.prepare('INSERT INTO artists (name) VALUES (?)').run('Filter Artist').lastInsertRowid as number;
      albumA = db.prepare('INSERT INTO albums (artist_id, title) VALUES (?, ?)').run(artistId, 'Album A').lastInsertRowid as number;
      albumB = db.prepare('INSERT INTO albums (artist_id, title) VALUES (?, ?)').run(artistId, 'Album B').lastInsertRowid as number;
      db.prepare('INSERT INTO songs (album_id, title, track_num) VALUES (?, ?, ?)').run(albumA, 'AA Song 1', 1);
      db.prepare('INSERT INTO songs (album_id, title, track_num) VALUES (?, ?, ?)').run(albumA, 'AA Song 2', 2);
      db.prepare('INSERT INTO songs (album_id, title, track_num) VALUES (?, ?, ?)').run(albumB, 'BB Song 1', 1);
    });

    it('returns only songs for the given album_id', async () => {
      const res = await request.get(`/api/songs?album_id=${albumA}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      res.body.forEach((s: { album_id: number }) => expect(s.album_id).toBe(albumA));
    });

    it('returns empty list for album with no songs', async () => {
      const artistId = db.prepare('INSERT INTO artists (name) VALUES (?)').run('Lone Artist').lastInsertRowid as number;
      const emptyAlbum = db.prepare('INSERT INTO albums (artist_id, title) VALUES (?, ?)').run(artistId, 'Empty Album').lastInsertRowid as number;
      const res = await request.get(`/api/songs?album_id=${emptyAlbum}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });
});
