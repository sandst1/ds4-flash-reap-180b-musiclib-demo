import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import supertest from 'supertest';
import { errorHandler } from '../middleware/errorHandler.js';

const ORIGINAL_DB_PATH = process.env.DB_PATH;
process.env.DB_PATH = ':memory:';

let request;

beforeAll(async () => {
  const mod = await import('../db/index.js');
  const db = mod.getDb();
  mod.seedDb(db);

  const { router } = await import('./stats.js');

  const app = express();
  app.use(express.json());
  app.use('/api/stats', router);
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

describe('stats API', () => {
  it('GET /api/stats returns counts matching seed data', async () => {
    const res = await request.get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      artists: 2,
      albums: 3,
      songs: 5,
      playlists: 1,
    });
  });
});
