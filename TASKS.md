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

- [ ] **T13 — Songs UI page**  
  `SongsList.jsx` — browsable table of all songs across albums. Create/edit forms.

- [ ] **T14 — Playlists UI pages**  
  `PlaylistsList.jsx` — list of playlists. `PlaylistDetail.jsx` — playlist info + song list with add/remove/reorder (drag-to-reorder or move up/down buttons).

- [ ] **T15 — Navigation & polish**  
  `Layout.jsx` / `NavBar.jsx` — app shell with nav links. Dashboard page `/` with summary counts. Consistent styling. Linking between entities (click artist → albums, click album → songs, etc.).

## Phase 4: Verify

- [ ] **T16 — Smoke test**  
  Start full app, exercise the full workflow: create artist → album → songs → playlist → add/reorder songs → edit/delete everything.
