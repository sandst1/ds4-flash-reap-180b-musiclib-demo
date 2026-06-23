# Music Library — Task Checklist

## Phase 1: Foundation

- [x] **T1 — Project scaffolding**  
  Init monorepo with npm workspaces, `server/` and `client/` dirs, root `package.json`, `.gitignore`. Install `express`, `better-sqlite3`, `vite`, `react`, `react-dom`, `react-router-dom`.

- [x] **T2 — Dev tooling setup**  
  Install `eslint` + config, set up `npm run lint`, `npm run typecheck`, `npm run test` scripts in root `package.json`. Add `node --test` (Node built-in test runner) for server unit tests. Commands should produce compact output (summary only on pass, verbose on failure). Configure eslint for both `server/` and `client/`.

- [x] **T3 — Database schema & init**  
  Create `server/db/schema.sql` with the 5 tables (artists, albums, songs, playlists, playlist_songs). Create `server/db/index.js` to initialize SQLite DB on disk, run schema if fresh. Add seed script.

## Phase 2: Backend API

- [x] **T4 — Express server skeleton**  
  Create `server/index.js` — Express app with CORS, JSON body parsing, static serving for dev, error handler middleware. Start on port 3001.

- [x] **T5 — Artists CRUD API**  
  Routes in `server/routes/artists.js`: GET list, POST create, GET by id, PUT update, DELETE delete (cascades to albums/songs).

- [x] **T6 — Albums CRUD API**  
  Routes in `server/routes/albums.js`: GET list (optional `?artist_id`), POST, GET by id, PUT, DELETE. GET `/api/artists/:id/albums`.

- [x] **T7 — Songs CRUD API**  
  Routes in `server/routes/songs.js`: GET list (optional `?album_id`), POST, GET by id, PUT, DELETE. GET `/api/albums/:id/songs`.

- [x] **T8 — Playlists CRUD API**  
  Routes in `server/routes/playlists.js`: GET list, POST, GET by id (includes joined songs), PUT, DELETE.

- [x] **T9 — Playlist Songs API**  
  Routes in `server/routes/playlistSongs.js`: GET songs in playlist (ordered), POST add song, DELETE remove song, PUT reorder (accepts `{ song_ids: [...] }` to set new order).

## Phase 3: Frontend

- [x] **T10 — React app scaffold**  
  Initialize Vite React project in `client/`. Set up React Router, create `client/src/api/client.js` with fetch wrappers for all endpoints. Configure Vite proxy to `localhost:3001` for `/api`.

- [x] **T11 — Artists UI pages**  
  `ArtistsList.jsx` — grid/table of all artists with create button. `ArtistDetail.jsx` — artist info + albums list. Forms for create/edit.

- [x] **T12 — Albums UI page**  
  `AlbumDetail.jsx` — album info + songs list. Create/edit forms (inline in artist detail page).

- [x] **T13 — Songs UI page**  
  `SongsList.jsx` — browsable table of all songs across albums. Create/edit forms.

- [x] **T14 — Playlists UI pages**  
  `PlaylistsList.jsx` — list of playlists. `PlaylistDetail.jsx` — playlist info + song list with add/remove/reorder (drag-to-reorder or move up/down buttons).

- [x] **T15 — Navigation & polish**  
  `Layout.jsx` / `NavBar.jsx` — app shell with nav links. Dashboard page `/` with summary counts. Consistent styling. Linking between entities (click artist → albums, click album → songs, etc.).

## Phase 4: Verify

- [X] **T16 — Smoke test**  
  Start full app, exercise the full workflow: create artist → album → songs → playlist → add/reorder songs → edit/delete everything.

## Phase 5: Testing — Setup

- [X] **T17 — Install vitest & test dependencies**  
  Install `vitest` in `server/` and `client/`. Add `@vitejs/plugin-react` for client (already present), `jsdom`, `@testing-library/react`, `@testing-library/jest-dom` to client devDeps. Add `supertest` to server devDeps. Create `vitest.config.js` for each workspace (server: no env / node; client: `jsdom` env, `setupFiles` for `@testing-library/jest-dom`). Update root `scripts.test` and `server/package.json` test script to use `vitest run`. Add `client/src/test-setup.js` for library imports.

## Phase 6: Testing — Backend (vitest + supertest)

- [X] **T18 — Database layer tests**  
  `server/db/index.test.js` — `getDb()` returns same instance on repeated calls, creates tables (verify with `SELECT name FROM sqlite_master`), `seedDb()` inserts seed data. Use `:memory:` path via `DB_PATH` env var.

- [X] **T19 — Artists API tests**  
  `server/routes/artists.test.js` — build Express app with the artists router + error handler against `:memory:` DB. Test: GET empty list, POST create (valid + missing name 400), GET by id (found + 404), PUT update (valid + 404 + empty name 400), DELETE (204 + 404 + cascading deletes albums/songs), GET nested `/artists/:id/albums` (empty + returns albums).

- [x] **T20 — Albums API tests**  
  `server/routes/albums.test.js` — test: GET list (empty + filtered by `?artist_id`), POST create (valid + missing title/artist_id 400 + nonexistent artist 400), GET by id (includes `artist_name` join + 404), PUT update (valid + 404 + empty title 400 + invalid artist_id 400), DELETE (204 + 404 + cascading deletes songs), GET nested `/albums/:id/songs`.

- [x] **T21 — Songs & Playlists API tests**  
  `server/routes/songs.test.js` — test: GET list (empty + filtered by `?album_id`), POST create (valid + missing fields 400 + nonexistent album 400), GET by id, PUT update, DELETE, 404 cases.  
  `server/routes/playlists.test.js` — test: GET list, POST create (valid + missing name 400), GET by id (includes `songs` array), PUT update, DELETE, 404 cases.

- [x] **T22 — Playlist Songs, Stats & Error handler tests**  
  `server/routes/playlistSongs.test.js` — test: GET songs ordered, POST add (auto-assigns position + duplicate song OK + missing song_id 400 + nonexistent playlist/song 404), DELETE remove (204 + 404), PUT reorder (updates positions + empty song_ids 400).  
  `server/routes/stats.test.js` — test: counts reflect seeded data.  
  `server/middleware/errorHandler.test.js` — test: returns `{ error, status }` JSON with correct status code.

## Phase 7: Testing — Frontend (vitest + jsdom + testing-library)

- [x] **T23 — API client unit tests**  
  `client/src/api/client.test.js` — mock `global.fetch` per test. Verify each exported function calls the correct URL, method, and body JSON. Test 204 returns `null`. Test non-ok responses throw `Error` with server error message.

- [ ] **T24 — Shared component tests**  
  `client/src/components/Layout.test.jsx` — renders NavBar + children.  
  `client/src/components/NavBar.test.jsx` — renders links (Dashboard, Artists, Songs, Playlists), highlights active link based on current pathname. Use `MemoryRouter` wrapper.

- [ ] **T25 — Page component tests**  
  `client/src/pages/*.test.jsx` — each page tested for: **loading** state (shows loading text), **error** state (shows error message in red), **empty** state (shows empty message), **populated** state (renders table/list with correct data). Mock API client functions via `vi.mock()`. Use `MemoryRouter` wrapper for pages that use `<Link>` or `useParams`. For detail pages, verify fetch is called with the correct `id` param. For PlaylistDetail, test move-up/move-down reorder interaction.
