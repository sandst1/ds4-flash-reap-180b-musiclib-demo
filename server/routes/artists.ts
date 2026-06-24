import { Router, type Request, type Response } from 'express';
import { getDb } from '../db/index.ts';
import type { Artist, AlbumWithArtist } from '../types.ts';

const router = Router();

// GET /api/artists — list all artists
router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const artists = db.prepare('SELECT * FROM artists ORDER BY name').all() as Artist[];
  res.json(artists);
});

// POST /api/artists — create artist
router.post('/', (req: Request, res: Response) => {
  const { name, bio, image_url } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required', status: 400 });
  }
  const db = getDb();
  const info = db.prepare(
    'INSERT INTO artists (name, bio, image_url) VALUES (?, ?, ?)'
  ).run(name.trim(), bio ?? null, image_url ?? null);
  const artist = db.prepare('SELECT * FROM artists WHERE id = ?').get(info.lastInsertRowid) as Artist;
  res.status(201).json(artist);
});

// GET /api/artists/:id — get artist by ID
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const artist = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id) as Artist | undefined;
  if (!artist) {
    return res.status(404).json({ error: 'Artist not found', status: 404 });
  }
  res.json(artist);
});

// PUT /api/artists/:id — update artist
router.put('/:id', (req: Request, res: Response) => {
  const { name, bio, image_url } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id) as Artist | undefined;
  if (!existing) {
    return res.status(404).json({ error: 'Artist not found', status: 404 });
  }
  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ error: 'name cannot be empty', status: 400 });
  }
  db.prepare(
    'UPDATE artists SET name = ?, bio = ?, image_url = ? WHERE id = ?'
  ).run(
    name !== undefined ? name.trim() : existing.name,
    bio !== undefined ? bio : existing.bio,
    image_url !== undefined ? image_url : existing.image_url,
    req.params.id
  );
  const artist = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id) as Artist;
  res.json(artist);
});

// GET /api/artists/:id/albums — get albums by artist
router.get('/:id/albums', (req: Request, res: Response) => {
  const db = getDb();
  const artist = db.prepare('SELECT id FROM artists WHERE id = ?').get(req.params.id) as Artist | undefined;
  if (!artist) {
    return res.status(404).json({ error: 'Artist not found', status: 404 });
  }
  const albums = db.prepare(
    'SELECT albums.*, artists.name AS artist_name FROM albums JOIN artists ON albums.artist_id = artists.id WHERE artist_id = ? ORDER BY albums.title'
  ).all(req.params.id) as AlbumWithArtist[];
  res.json(albums);
});

// DELETE /api/artists/:id — delete artist (cascades to albums/songs)
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id) as Artist | undefined;
  if (!existing) {
    return res.status(404).json({ error: 'Artist not found', status: 404 });
  }
  db.prepare('DELETE FROM artists WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

export { router };
