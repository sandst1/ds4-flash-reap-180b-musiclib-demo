import { Router, type Request, type Response } from 'express';
import { getDb } from '../db/index.ts';
import type { Song, SongInput, SongWithAlbum } from '../types.ts';

const router = Router();

// GET /api/songs — list all songs (optional ?album_id)
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  let songs;
  const select = `SELECT songs.*, albums.title AS album_title
    FROM songs JOIN albums ON songs.album_id = albums.id`;
  if (req.query.album_id) {
    songs = db.prepare(
      `${select} WHERE songs.album_id = ? ORDER BY songs.track_num`
    ).all(req.query.album_id) as SongWithAlbum[];
  } else {
    songs = db.prepare(
      `${select} ORDER BY songs.album_id, songs.track_num`
    ).all() as SongWithAlbum[];
  }
  res.json(songs);
});

// POST /api/songs — create song
router.post('/', (req: Request, res: Response) => {
  const { album_id, title, track_num, duration_sec, file_path } = req.body as SongInput;
  if (!album_id || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'album_id and title are required', status: 400 });
  }
  const db = getDb();
  const album = db.prepare('SELECT id FROM albums WHERE id = ?').get(album_id) as Pick<Song, 'id'> | undefined;
  if (!album) {
    return res.status(400).json({ error: 'Album not found', status: 400 });
  }
  const info = db.prepare(
    'INSERT INTO songs (album_id, title, track_num, duration_sec, file_path) VALUES (?, ?, ?, ?, ?)'
  ).run(album_id, title.trim(), track_num ?? null, duration_sec ?? null, file_path ?? null);
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(info.lastInsertRowid) as Song;
  res.status(201).json(song);
});

// GET /api/songs/:id — get song by ID
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id) as Song | undefined;
  if (!song) {
    return res.status(404).json({ error: 'Song not found', status: 404 });
  }
  res.json(song);
});

// PUT /api/songs/:id — update song
router.put('/:id', (req: Request, res: Response) => {
  const { title, track_num, duration_sec, file_path, album_id } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id) as Song | undefined;
  if (!existing) {
    return res.status(404).json({ error: 'Song not found', status: 404 });
  }
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ error: 'title cannot be empty', status: 400 });
  }
  if (album_id !== undefined) {
    const album = db.prepare('SELECT id FROM albums WHERE id = ?').get(album_id) as Pick<Song, 'id'> | undefined;
    if (!album) {
      return res.status(400).json({ error: 'Album not found', status: 400 });
    }
  }
  db.prepare(
    'UPDATE songs SET album_id = ?, title = ?, track_num = ?, duration_sec = ?, file_path = ? WHERE id = ?'
  ).run(
    album_id !== undefined ? album_id : existing.album_id,
    title !== undefined ? title.trim() : existing.title,
    track_num !== undefined ? track_num : existing.track_num,
    duration_sec !== undefined ? duration_sec : existing.duration_sec,
    file_path !== undefined ? file_path : existing.file_path,
    req.params.id
  );
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id) as Song;
  res.json(song);
});

// DELETE /api/songs/:id — delete song
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id) as Song | undefined;
  if (!existing) {
    return res.status(404).json({ error: 'Song not found', status: 404 });
  }
  db.prepare('DELETE FROM songs WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

export { router };
