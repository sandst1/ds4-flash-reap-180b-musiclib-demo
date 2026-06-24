import { Router, type Request, type Response } from 'express';
import { getDb } from '../db/index.ts';
import type { Playlist, PlaylistSong, PlaylistSongWithSong } from '../types.ts';

const router = Router({ mergeParams: true });

// GET /api/playlists/:id/songs — get songs in playlist (ordered)
router.get('/:id/songs', (req: Request, res: Response) => {
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
  ).all(req.params.id) as PlaylistSongWithSong[];
  res.json(songs);
});

// POST /api/playlists/:id/songs — add song to playlist
router.post('/:id/songs', (req: Request, res: Response) => {
  const { song_id } = req.body as { song_id: number };
  if (!song_id || typeof song_id !== 'number') {
    return res.status(400).json({ error: 'song_id is required and must be a number', status: 400 });
  }
  const db = getDb();
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id) as Playlist | undefined;
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found', status: 404 });
  }
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(song_id) as { id: number } | undefined;
  if (!song) {
    return res.status(404).json({ error: 'Song not found', status: 404 });
  }
  const maxPos = db.prepare(
    'SELECT COALESCE(MAX(position), 0) AS max_pos FROM playlist_songs WHERE playlist_id = ?'
  ).get(req.params.id) as { max_pos: number };
  const position = maxPos.max_pos + 1;
  db.prepare(
    'INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)'
  ).run(req.params.id, song_id, position);
  const entry = db.prepare(
    'SELECT * FROM playlist_songs WHERE playlist_id = ? AND song_id = ?'
  ).get(req.params.id, song_id) as PlaylistSong;
  res.status(201).json(entry);
});

// DELETE /api/playlists/:id/songs/:songId — remove song from playlist
router.delete('/:id/songs/:songId', (req: Request, res: Response) => {
  const db = getDb();
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id) as Playlist | undefined;
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found', status: 404 });
  }
  const entry = db.prepare(
    'SELECT * FROM playlist_songs WHERE playlist_id = ? AND song_id = ?'
  ).get(req.params.id, req.params.songId) as PlaylistSong | undefined;
  if (!entry) {
    return res.status(404).json({ error: 'Song not found in playlist', status: 404 });
  }
  db.prepare(
    'DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?'
  ).run(req.params.id, req.params.songId);
  res.status(204).send();
});

// PUT /api/playlists/:id/songs/reorder — reorder songs
router.put('/:id/songs/reorder', (req: Request, res: Response) => {
  const { song_ids } = req.body as { song_ids: number[] };
  if (!Array.isArray(song_ids) || song_ids.length === 0) {
    return res.status(400).json({ error: 'song_ids array is required and must not be empty', status: 400 });
  }
  const db = getDb();
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id) as Playlist | undefined;
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found', status: 404 });
  }
  const updateStmt = db.prepare(
    'UPDATE playlist_songs SET position = ? WHERE playlist_id = ? AND song_id = ?'
  );
  const txn = db.transaction((id: number, ids: number[]) => {
    for (let i = 0; i < ids.length; i++) {
      updateStmt.run(i + 1, id, ids[i]);
    }
  });
  txn(req.params.id, song_ids);
  const songs = db.prepare(
    `SELECT s.*, ps.position, ps.added_at
     FROM playlist_songs ps
     JOIN songs s ON s.id = ps.song_id
     WHERE ps.playlist_id = ?
     ORDER BY ps.position`
  ).all(req.params.id) as PlaylistSongWithSong[];
  res.json(songs);
});

export { router };
