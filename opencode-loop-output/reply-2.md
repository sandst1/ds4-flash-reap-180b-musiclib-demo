









































Now I need to update the TASKS.md to mark T18 as completed and commit.

















Done. Created `server/db/index.test.js` with 4 tests covering:
- `getDb()` returns same instance on repeated calls
- All tables created on init (excluding `sqlite_%` internal tables)
- `seedDb()` inserts seed data (2 artists, 3 albums, 5 songs)
- `:memory:` database works via `DB_PATH` env var

All 4 tests pass, lint is clean. Committed as `b37a084 T18: Database layer tests`.