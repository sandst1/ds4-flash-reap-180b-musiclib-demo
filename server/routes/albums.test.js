import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import supertest from 'supertest';
import { errorHandler } from '../middleware/errorHandler.js';

const ORIGINAL_DB_PATH = process.env.DB_PATH;
process.env.DB_PATH = ':memory:';

let db, request, artistId;

beforeAll(async () => {
  const mod = await import('../db/index.js');
  db = mod.getDb();

  artistId = db.prepare('INSERT INTO artists (name) VALUES (?)').run('Test Artist').lastInsertRowid;

  const { router } = await import('./albums.js');

  const app = express();
  app.use(express.json());
  app.use('/api/albums', router);
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

describe('albums API', () => {
  it('GET /api/albums returns empty list initially', async () => {
    const res = await request.get('/api/albums');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  describe('CRUD operations', () => {
    let createdId;

    it('POST /api/albums creates a new album', async () => {
      const res = await request.post('/api/albums').send({ artist_id: artistId, title: 'Test Album', release_year: 2000 });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ artist_id: artistId, title: 'Test Album', release_year: 2000 });
      expect(res.body.id).toBeTruthy();
      createdId = res.body.id;
    });

    it('POST /api/albums returns 400 when artist_id is missing', async () => {
      const res = await request.post('/api/albums').send({ title: 'No Artist' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'artist_id and title are required', status: 400 });
    });

    it('POST /api/albums returns 400 when title is missing', async () => {
      const res = await request.post('/api/albums').send({ artist_id: artistId });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'artist_id and title are required', status: 400 });
    });

    it('POST /api/albums returns 400 when title is empty', async () => {
      const res = await request.post('/api/albums').send({ artist_id: artistId, title: '' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'artist_id and title are required', status: 400 });
    });

    it('POST /api/albums returns 400 for nonexistent artist', async () => {
      const res = await request.post('/api/albums').send({ artist_id: 999, title: 'Ghost Album' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'Artist not found', status: 400 });
    });

    it('GET /api/albums/:id returns the album with artist_name', async () => {
      const res = await request.get(`/api/albums/${createdId}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: createdId, artist_id: artistId, title: 'Test Album', artist_name: 'Test Artist' });
    });

    it('GET /api/albums/:id returns 404 for unknown id', async () => {
      const res = await request.get('/api/albums/999');
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Album not found', status: 404 });
    });

    it('PUT /api/albums/:id updates the album', async () => {
      const res = await request.put(`/api/albums/${createdId}`).send({ title: 'Updated Album', release_year: 2001 });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ title: 'Updated Album', release_year: 2001 });
    });

    it('PUT /api/albums/:id returns 404 for unknown id', async () => {
      const res = await request.put('/api/albums/999').send({ title: 'Nope' });
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Album not found', status: 404 });
    });

    it('PUT /api/albums/:id returns 400 when title is empty', async () => {
      const res = await request.put(`/api/albums/${createdId}`).send({ title: '' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'title cannot be empty', status: 400 });
    });

    it('PUT /api/albums/:id returns 400 for invalid artist_id', async () => {
      const res = await request.put(`/api/albums/${createdId}`).send({ artist_id: 999 });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: 'Artist not found', status: 400 });
    });

    it('DELETE /api/albums/:id returns 204 and removes the album', async () => {
      const createRes = await request.post('/api/albums').send({ artist_id: artistId, title: 'Delete Me' });
      const id = createRes.body.id;
      const res = await request.delete(`/api/albums/${id}`);
      expect(res.status).toBe(204);

      const getRes = await request.get(`/api/albums/${id}`);
      expect(getRes.status).toBe(404);
    });

    it('DELETE /api/albums/:id returns 404 for non-existent album', async () => {
      const res = await request.delete('/api/albums/999');
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Album not found', status: 404 });
    });

    it('DELETE /api/albums/:id cascades to songs', async () => {
      const albumInfo = db.prepare(
        'INSERT INTO albums (artist_id, title, release_year) VALUES (?, ?, ?)'
      ).run(artistId, 'Cascade Album', 2000);
      const albumId = albumInfo.lastInsertRowid;

      db.prepare(
        'INSERT INTO songs (album_id, title, track_num, duration_sec) VALUES (?, ?, ?, ?)'
      ).run(albumId, 'Test Song', 1, 120);

      expect(db.prepare('SELECT COUNT(*) AS count FROM songs WHERE album_id = ?').get(albumId).count).toBe(1);

      const delRes = await request.delete(`/api/albums/${albumId}`);
      expect(delRes.status).toBe(204);

      expect(db.prepare('SELECT COUNT(*) AS count FROM albums WHERE id = ?').get(albumId).count).toBe(0);
      expect(db.prepare('SELECT COUNT(*) AS count FROM songs WHERE album_id = ?').get(albumId).count).toBe(0);
    });
  });

  describe('GET /api/albums filtered by ?artist_id', () => {
    let artistA, artistB;

    beforeAll(() => {
      artistA = db.prepare('INSERT INTO artists (name) VALUES (?)').run('Artist A').lastInsertRowid;
      artistB = db.prepare('INSERT INTO artists (name) VALUES (?)').run('Artist B').lastInsertRowid;
      db.prepare('INSERT INTO albums (artist_id, title) VALUES (?, ?)').run(artistA, 'AA Album 1');
      db.prepare('INSERT INTO albums (artist_id, title) VALUES (?, ?)').run(artistA, 'AA Album 2');
      db.prepare('INSERT INTO albums (artist_id, title) VALUES (?, ?)').run(artistB, 'BB Album 1');
    });

    it('returns only albums for the given artist_id', async () => {
      const res = await request.get(`/api/albums?artist_id=${artistA}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      res.body.forEach(a => expect(a.artist_id).toBe(artistA));
    });

    it('returns empty list for artist with no albums', async () => {
      const loneArtist = db.prepare('INSERT INTO artists (name) VALUES (?)').run('Lone Artist').lastInsertRowid;
      const res = await request.get(`/api/albums?artist_id=${loneArtist}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /api/albums/:id/songs', () => {
    let albumWithSongs;
    let albumWithoutSongs;

    beforeAll(() => {
      albumWithSongs = db.prepare(
        'INSERT INTO albums (artist_id, title) VALUES (?, ?)'
      ).run(artistId, 'Songs Album').lastInsertRowid;
      db.prepare('INSERT INTO songs (album_id, title, track_num) VALUES (?, ?, ?)').run(albumWithSongs, 'Song A', 1);
      db.prepare('INSERT INTO songs (album_id, title, track_num) VALUES (?, ?, ?)').run(albumWithSongs, 'Song B', 2);

      albumWithoutSongs = db.prepare(
        'INSERT INTO albums (artist_id, title) VALUES (?, ?)'
      ).run(artistId, 'Empty Album').lastInsertRowid;
    });

    it('returns songs for an album that has them', async () => {
      const res = await request.get(`/api/albums/${albumWithSongs}/songs`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject({ album_id: albumWithSongs, title: 'Song A' });
      expect(res.body[1]).toMatchObject({ album_id: albumWithSongs, title: 'Song B' });
    });

    it('returns empty list for an album with no songs', async () => {
      const res = await request.get(`/api/albums/${albumWithoutSongs}/songs`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns 404 for non-existent album', async () => {
      const res = await request.get('/api/albums/999/songs');
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: 'Album not found', status: 404 });
    });
  });
});
