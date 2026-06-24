import { Router, type Request, type Response } from 'express';
import { getDb } from '../db/index.ts';
import type { Playlist, PlaylistWithSongs } from '../types.ts';

const router = Router();

// GET /api/playlists — list all playlists
router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const playlists = db.prepare('SELECT * FROM playlists ORDER BY name').all() as Playlist[];
  res.json(playlists);
});

// POST /api/playlists — create playlist
router.post('/', (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required', status: 400 });
  }
  const db = getDb();
  const info = db.prepare(
    'INSERT INTO playlists (name, description) VALUES (?, ?)'
  ).run(name.trim(), description ?? null);
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(info.lastInsertRowid) as Playlist;
  res.status(201).json(playlist);
});

// GET /api/playlists/:id — get playlist by ID (includes joined songs)
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id) as Playlist | undefined;
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found', status: 404 });
  }
  const songs = db.prepare(
    `SELECT s.*, ps.position, ps.added_at
     FROM playlist_songs ps
     JOIN songs s ON s.id = ps.song_id
     WHERE ps.playlist_id = ?
     ORDER BY ps.position`
  ).all(req.params.id);
  (playlist as PlaylistWithSongs).songs = songs;
  res.json(playlist);
});

// PUT /api/playlists/:id — update playlist
router.put('/:id', (req: Request, res: Response) => {
  const { name, description } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id) as Playlist | undefined;
  if (!existing) {
    return res.status(404).json({ error: 'Playlist not found', status: 404 });
  }
  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ error: 'name cannot be empty', status: 400 });
  }
  db.prepare(
    'UPDATE playlists SET name = ?, description = ? WHERE id = ?'
  ).run(
    name !== undefined ? name.trim() : existing.name,
    description !== undefined ? description : existing.description,
    req.params.id
  );
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id) as Playlist;
  res.json(playlist);
});

// DELETE /api/playlists/:id — delete playlist
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id) as Playlist | undefined;
  if (!existing) {
    return res.status(404).json({ error: 'Playlist not found', status: 404 });
  }
  db.prepare('DELETE FROM playlists WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

export { router };
