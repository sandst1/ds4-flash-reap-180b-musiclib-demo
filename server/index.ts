import express, { type Request, type Response, type NextFunction } from 'express';
import { resolve } from 'node:path';
import { errorHandler } from './middleware/errorHandler.ts';
import { getDb, seedDb } from './db/index.ts';
import { router as artistsRouter } from './routes/artists.ts';
import { router as albumsRouter } from './routes/albums.ts';
import { router as songsRouter } from './routes/songs.ts';
import { router as playlistsRouter } from './routes/playlists.ts';
import { router as playlistSongsRouter } from './routes/playlistSongs.ts';
import { router as statsRouter } from './routes/stats.ts';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// JSON body parsing
app.use(express.json());

// Static serving for built client
app.use(express.static(resolve('client', 'dist')));

// API routes
app.use('/api/stats', statsRouter);
app.use('/api/artists', artistsRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/songs', songsRouter);
app.use('/api/playlists', playlistsRouter);
app.use('/api/playlists', playlistSongsRouter);

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  getDb();
  seedDb(getDb());
  console.log(`Server listening on http://localhost:${PORT}`);
});
