import { Router, type Request, type Response } from 'express';
import { getDb } from '../db/index.ts';
import type { Album, AlbumInput, AlbumWithArtist } from '../types.ts';

const router = Router();

// GET /api/albums — list all albums (optional ?artist_id)
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  let albums;
  if (req.query.artist_id) {
    albums = db.prepare(
      'SELECT albums.*, artists.name AS artist_name FROM albums JOIN artists ON albums.artist_id = artists.id WHERE artist_id = ? ORDER BY albums.title'
    ).all(req.query.artist_id) as AlbumWithArtist[];
  } else {
    albums = db.prepare(
      'SELECT albums.*, artists.name AS artist_name FROM albums JOIN artists ON albums.artist_id = artists.id ORDER BY albums.title'
    ).all() as AlbumWithArtist[];
  }
  res.json(albums);
});

// POST /api/albums — create album
router.post('/', (req: Request, res: Response) => {
  const { artist_id, title, cover_url, release_year } = req.body as AlbumInput;
  if (!artist_id || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'artist_id and title are required', status: 400 });
  }
  const db = getDb();
  const artist = db.prepare('SELECT id FROM artists WHERE id = ?').get(artist_id) as Pick<Album, 'id'> | undefined;
  if (!artist) {
    return res.status(400).json({ error: 'Artist not found', status: 400 });
  }
  const info = db.prepare(
    'INSERT INTO albums (artist_id, title, cover_url, release_year) VALUES (?, ?, ?, ?)'
  ).run(artist_id, title.trim(), cover_url ?? null, release_year ?? null);
  const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(info.lastInsertRowid) as Album;
  res.status(201).json(album);
});

// GET /api/albums/:id — get album by ID
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const album = db.prepare(
    'SELECT albums.*, artists.name AS artist_name FROM albums JOIN artists ON albums.artist_id = artists.id WHERE albums.id = ?'
  ).get(req.params.id) as AlbumWithArtist | undefined;
  if (!album) {
    return res.status(404).json({ error: 'Album not found', status: 404 });
  }
  res.json(album);
});

// PUT /api/albums/:id — update album
router.put('/:id', (req: Request, res: Response) => {
  const { title, cover_url, release_year, artist_id } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM albums WHERE id = ?').get(req.params.id) as Album | undefined;
  if (!existing) {
    return res.status(404).json({ error: 'Album not found', status: 404 });
  }
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ error: 'title cannot be empty', status: 400 });
  }
  if (artist_id !== undefined) {
    const artist = db.prepare('SELECT id FROM artists WHERE id = ?').get(artist_id) as Pick<Album, 'id'> | undefined;
    if (!artist) {
      return res.status(400).json({ error: 'Artist not found', status: 400 });
    }
  }
  db.prepare(
    'UPDATE albums SET artist_id = ?, title = ?, cover_url = ?, release_year = ? WHERE id = ?'
  ).run(
    artist_id !== undefined ? artist_id : existing.artist_id,
    title !== undefined ? title.trim() : existing.title,
    cover_url !== undefined ? cover_url : existing.cover_url,
    release_year !== undefined ? release_year : existing.release_year,
    req.params.id
  );
  const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(req.params.id) as Album;
  res.json(album);
});

// GET /api/albums/:id/songs — get songs by album
router.get('/:id/songs', (req: Request, res: Response) => {
  const db = getDb();
  const album = db.prepare('SELECT id FROM albums WHERE id = ?').get(req.params.id) as Pick<Album, 'id'> | undefined;
  if (!album) {
    return res.status(404).json({ error: 'Album not found', status: 404 });
  }
  const songs = db.prepare(
    'SELECT * FROM songs WHERE album_id = ? ORDER BY track_num'
  ).all(req.params.id);
  res.json(songs);
});

// DELETE /api/albums/:id — delete album (cascades to songs)
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM albums WHERE id = ?').get(req.params.id) as Album | undefined;
  if (!existing) {
    return res.status(404).json({ error: 'Album not found', status: 404 });
  }
  db.prepare('DELETE FROM albums WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

export { router };
