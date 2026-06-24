import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Set in-memory DB before any module code runs
const ORIGINAL_DB_PATH = process.env.DB_PATH;
process.env.DB_PATH = ':memory:';

let mod;

beforeAll(async () => {
  mod = await import('./index.ts');
});

afterAll(() => {
  if (ORIGINAL_DB_PATH === undefined) {
    delete process.env.DB_PATH;
  } else {
    process.env.DB_PATH = ORIGINAL_DB_PATH;
  }
});

describe('database layer', () => {
  it('getDb() returns the same instance on repeated calls', () => {
    const db1 = mod.getDb();
    const db2 = mod.getDb();
    expect(db1).toBe(db2);
  });

  it('creates all expected tables on init', () => {
    const db = mod.getDb();
    const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
    const names = rows.map(r => r.name);
    expect(names).toEqual(['albums', 'artists', 'playlist_songs', 'playlists', 'songs']);
  });

  it('seedDb() inserts seed data', () => {
    const db = mod.getDb();
    mod.seedDb(db);

    const artists = db.prepare('SELECT COUNT(*) AS count FROM artists').get();
    const albums = db.prepare('SELECT COUNT(*) AS count FROM albums').get();
    const songs = db.prepare('SELECT COUNT(*) AS count FROM songs').get();

    expect(artists.count).toBe(2);
    expect(albums.count).toBe(3);
    expect(songs.count).toBe(5);
  });

  it('uses :memory: database', () => {
    const db = mod.getDb();
    const result = db.prepare("SELECT sqlite_version() AS v").get();
    expect(result.v).toBeTruthy();
  });
});
