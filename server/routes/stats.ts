import { Router, type Request, type Response } from 'express';
import { getDb } from '../db/index.ts';
import type { Stats } from '../types.ts';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const artists = db.prepare('SELECT COUNT(*) AS count FROM artists').get() as { count: number };
  const albums = db.prepare('SELECT COUNT(*) AS count FROM albums').get() as { count: number };
  const songs = db.prepare('SELECT COUNT(*) AS count FROM songs').get() as { count: number };
  const playlists = db.prepare('SELECT COUNT(*) AS count FROM playlists').get() as { count: number };
  const stats: Stats = {
    artists: artists.count,
    albums: albums.count,
    songs: songs.count,
    playlists: playlists.count,
  };
  res.json(stats);
});

export { router };
