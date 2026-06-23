import { Router } from 'express';
import { getDb } from '../db/index.js';

const router = Router();

// GET /api/artists — list all artists
router.get('/', (req, res) => {
  const db = getDb();
  const artists = db.prepare('SELECT * FROM artists ORDER BY name').all();
  res.json(artists);
});

// POST /api/artists — create artist
router.post('/', (req, res) => {
  const { name, bio, image_url } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required', status: 400 });
  }
  const db = getDb();
  const info = db.prepare(
    'INSERT INTO artists (name, bio, image_url) VALUES (?, ?, ?)'
  ).run(name.trim(), bio ?? null, image_url ?? null);
  const artist = db.prepare('SELECT * FROM artists WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(artist);
});

// GET /api/artists/:id — get artist by ID
router.get('/:id', (req, res) => {
  const db = getDb();
  const artist = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id);
  if (!artist) {
    return res.status(404).json({ error: 'Artist not found', status: 404 });
  }
  res.json(artist);
});

// PUT /api/artists/:id — update artist
router.put('/:id', (req, res) => {
  const { name, bio, image_url } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id);
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
  const artist = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id);
  res.json(artist);
});

// GET /api/artists/:id/albums — get albums by artist
router.get('/:id/albums', (req, res) => {
  const db = getDb();
  const artist = db.prepare('SELECT id FROM artists WHERE id = ?').get(req.params.id);
  if (!artist) {
    return res.status(404).json({ error: 'Artist not found', status: 404 });
  }
  const albums = db.prepare(
    'SELECT * FROM albums WHERE artist_id = ? ORDER BY title'
  ).all(req.params.id);
  res.json(albums);
});

// DELETE /api/artists/:id — delete artist (cascades to albums/songs)
router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM artists WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Artist not found', status: 404 });
  }
  db.prepare('DELETE FROM artists WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

export { router };
