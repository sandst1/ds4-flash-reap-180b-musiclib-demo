import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || resolve(__dirname, '..', 'data', 'musiclib.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(database) {
  const schemaPath = resolve(dirname(fileURLToPath(import.meta.url)), 'schema.sql');
  const sql = readFileSync(schemaPath, 'utf-8');
  database.exec(sql);
}

export function seedDb(database) {
  const seedPath = resolve(dirname(fileURLToPath(import.meta.url)), 'seed.sql');
  const sql = readFileSync(seedPath, 'utf-8');
  database.exec(sql);
}

// Run directly: node server/db/index.js
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  console.log(`DB: ${DB_PATH}`);
  getDb();
  seedDb(db);
  console.log('Database initialized and seeded.');
}
