import { Router } from 'express';
import { getDb } from '../db/index.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const artists = db.prepare('SELECT COUNT(*) AS count FROM artists').get();
  const albums = db.prepare('SELECT COUNT(*) AS count FROM albums').get();
  const songs = db.prepare('SELECT COUNT(*) AS count FROM songs').get();
  const playlists = db.prepare('SELECT COUNT(*) AS count FROM playlists').get();
  res.json({
    artists: artists.count,
    albums: albums.count,
    songs: songs.count,
    playlists: playlists.count,
  });
});

export { router };
