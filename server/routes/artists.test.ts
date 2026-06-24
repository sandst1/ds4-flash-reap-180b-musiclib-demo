import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import supertest from 'supertest';
import { errorHandler } from '../middleware/errorHandler.ts';
import type { Artist } from '../types.ts';

const ORIGINAL_DB_PATH = process.env.DB_PATH;
process.env.DB_PATH = ':memory:';

let db: import('../db/sqlite.ts').Database;
let request: ReturnType<typeof supertest>;

beforeAll(async () => {
  const mod = await import('../db/index.ts');
  db = mod.getDb();

  const { router } = await import('./artists.ts');

  const app = express();
  app.use(express.json());
  app.use('/api/artists', router);
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

describe('artists API', () => {
  it('GET /api/artists returns empty list initially', async () => {
    const res = await request.get('/api/artists');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  describe('CRUD operations', () => {
    let createdId: number;

    it('POST /api/artists creates a new artist', async () => {
      const res = await request.post('/api/artists').send({ name: 'Test Artist', bio: 'Test bio' });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: 'Test Artist', bio: 'Test bio' });
      expect(res.body.id).toBeTruthy();
      createdId = res.body.id;
    });

    it('POST /api/artists returns 400 when name is missing', async () => {
      const res = await request.post('/api/artists').send({ bio: 'no name' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'name is required', status: 400 });
    });

    it('POST /api/artists returns 400 when name is empty', async () => {
      const res = await request.post('/api/artists').send({ name: '' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'name is required', status: 400 });
    });

    it('GET /api/artists/:id returns the artist', async () => {
      const res = await request.get(`/api/artists/${createdId}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: createdId, name: 'Test Artist' });
    });

    it('GET /api/artists/:id returns 404 for unknown id', async () => {
      const res = await request.get('/api/artists/999');
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Artist not found', status: 404 });
    });

    it('PUT /api/artists/:id updates the artist', async () => {
      const res = await request.put(`/api/artists/${createdId}`).send({ name: 'Updated Artist', bio: 'Updated bio' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: 'Updated Artist', bio: 'Updated bio' });
    });

    it('PUT /api/artists/:id returns 404 for unknown id', async () => {
      const res = await request.put('/api/artists/999').send({ name: 'Nope' });
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Artist not found', status: 404 });
    });

    it('PUT /api/artists/:id returns 400 when name is empty string', async () => {
      const res = await request.put(`/api/artists/${createdId}`).send({ name: '' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'name cannot be empty', status: 400 });
    });

    it('PUT /api/artists/:id allows updating without name', async () => {
      const res = await request.put(`/api/artists/${createdId}`).send({ bio: 'just bio update' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: 'Updated Artist', bio: 'just bio update' });
    });

    it('DELETE /api/artists/:id returns 204 and removes the artist', async () => {
      const createRes = await request.post('/api/artists').send({ name: 'Delete Me' });
      const id = createRes.body.id;
      const res = await request.delete(`/api/artists/${id}`);
      expect(res.status).toBe(204);

      const getRes = await request.get(`/api/artists/${id}`);
      expect(getRes.status).toBe(404);
    });

    it('DELETE /api/artists/:id returns 404 for non-existent artist', async () => {
      const res = await request.delete('/api/artists/999');
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Artist not found', status: 404 });
    });

    it('DELETE /api/artists/:id cascades to albums and songs', async () => {
      const artistRes = await request.post('/api/artists').send({ name: 'Cascade Test' });
      const artistId = artistRes.body.id;

      const albumInfo = db.prepare(
        'INSERT INTO albums (artist_id, title, release_year) VALUES (?, ?, ?)'
      ).run(artistId, 'Test Album', 2000);
      const albumId = albumInfo.lastInsertRowid as number;

      db.prepare(
        'INSERT INTO songs (album_id, title, track_num, duration_sec) VALUES (?, ?, ?, ?)'
      ).run(albumId, 'Test Song', 1, 120);

      expect((db.prepare('SELECT COUNT(*) AS count FROM albums WHERE id = ?').get(albumId) as { count: number }).count).toBe(1);
      expect((db.prepare('SELECT COUNT(*) AS count FROM songs WHERE album_id = ?').get(albumId) as { count: number }).count).toBe(1);

      const delRes = await request.delete(`/api/artists/${artistId}`);
      expect(delRes.status).toBe(204);

      expect((db.prepare('SELECT COUNT(*) AS count FROM artists WHERE id = ?').get(artistId) as { count: number }).count).toBe(0);
      expect((db.prepare('SELECT COUNT(*) AS count FROM albums WHERE id = ?').get(albumId) as { count: number }).count).toBe(0);
      const songRows = db.prepare('SELECT COUNT(*) AS count FROM songs WHERE album_id = ?').get(albumId) as { count: number };
      expect(songRows.count).toBe(0);
    });
  });

  describe('GET /api/artists/:id/albums', () => {
    let artistWithAlbums: number;
    let artistWithoutAlbums: number;

    beforeAll(() => {
      artistWithAlbums = (db.prepare(
        'INSERT INTO artists (name) VALUES (?)'
      ).run('Album Artist').lastInsertRowid as number);
      db.prepare('INSERT INTO albums (artist_id, title, release_year) VALUES (?, ?, ?)').run(artistWithAlbums, 'Album A', 1999);
      db.prepare('INSERT INTO albums (artist_id, title, release_year) VALUES (?, ?, ?)').run(artistWithAlbums, 'Album B', 2001);

      artistWithoutAlbums = (db.prepare(
        'INSERT INTO artists (name) VALUES (?)'
      ).run('Lone Artist').lastInsertRowid as number);
    });

    it('returns albums for an artist that has them', async () => {
      const res = await request.get(`/api/artists/${artistWithAlbums}/albums`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject({ artist_id: artistWithAlbums, title: 'Album A' });
      expect(res.body[1]).toMatchObject({ artist_id: artistWithAlbums, title: 'Album B' });
    });

    it('returns empty list for an artist with no albums', async () => {
      const res = await request.get(`/api/artists/${artistWithoutAlbums}/albums`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns 404 for non-existent artist', async () => {
      const res = await request.get('/api/artists/999/albums');
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Artist not found', status: 404 });
    });
  });
});
