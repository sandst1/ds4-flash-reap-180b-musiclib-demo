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

- [x] **T24 — Shared component tests**  
  `client/src/components/Layout.test.jsx` — renders NavBar + children.  
  `client/src/components/NavBar.test.jsx` — renders links (Dashboard, Artists, Songs, Playlists), highlights active link based on current pathname. Use `MemoryRouter` wrapper.

- [x] **T25 — Page component tests**  
  `client/src/pages/*.test.jsx` — each page tested for: **loading** state (shows loading text), **error** state (shows error message in red), **empty** state (shows empty message), **populated** state (renders table/list with correct data). Mock API client functions via `vi.mock()`. Use `MemoryRouter` wrapper for pages that use `<Link>` or `useParams`. For detail pages, verify fetch is called with the correct `id` param. For PlaylistDetail, test move-up/move-down reorder interaction.

---

## Phase 8: TypeScript — Tooling & Shared Types

- [x] **T26 — Install TypeScript dependencies**  
  Install `typescript` in root and both workspaces. Install `@types/node`, `@types/express` in server workspace. Add `@types/react`, `@types/react-dom` (already bundled by vite but add for `tsc`), `@types/react-router-dom` to client workspace. Install `tsx` (or `ts-node`) for running TS directly in dev.

- [x] **T27 — Create tsconfig files**  
  Root `tsconfig.base.json` with shared compiler options (`strict: true`, `moduleResolution: bundler`, `esModuleInterop: true`, `skipLibCheck: true`).  
  `server/tsconfig.json` — extends base, `outDir: dist`, includes `src/**.ts`.  
  `client/tsconfig.json` — extends base, `jsx: react-jsx`, includes `src/**.ts`, `src/**.tsx`.  
  Update `eslint.config.js` to handle `.ts`/`.tsx` files using the typescript-eslint plugin.

- [x] **T28 — Create shared type definitions**  
  Create `types/index.d.ts` (or `types.ts`) with interfaces for all entities:
  - `Artist`, `Album`, `Song`, `Playlist`, `PlaylistSong` (full row types)
  - `ArtistInput`, `AlbumInput`, `SongInput`, `PlaylistInput` (create/update payloads)
  - `Stats` (dashboard counts)
  - `ApiError` (`{ error: string; status: number }`)
  - `PlaylistWithSongs` (playlist + nested songs array)
  - Re-export from `server/types.ts` and `client/src/types.ts` (or keep one shared location).

## Phase 9: TypeScript — Server Source

- [x] **T29 — Convert DB layer to TS**  
  Rename `server/db/sqlite.js` → `sqlite.ts`. Add typed wrapper: type `Stmt` from `node:sqlite`, return types for `prepare().all()`, `.get()`, `.run()`.  
  Rename `server/db/index.js` → `index.ts`. Type `getDb()` return, `seedDb()` param.  
  Update all imports inside the files and in `tsconfig.json` includes.

- [x] **T30 — Convert middleware to TS**  
  Rename `server/middleware/errorHandler.js` → `errorHandler.ts`. Type the Express error-handling signature `(err: Error, req: Request, res: Response, next: NextFunction)`.  
  Rename `server/middleware/errorHandler.test.js` → `errorHandler.test.ts`.

- [x] **T31 — Convert artists route to TS**  
  Rename `server/routes/artists.js` → `artists.ts`. Add types to `req.body`, `req.params`, response types.  
  Rename `server/routes/artists.test.js` → `artists.test.ts`. Add `supertest` types.

- [x] **T32 — Convert albums route to TS**  
  Rename `server/routes/albums.js` → `albums.ts`. Same treatment as artists.  
  Rename `server/routes/albums.test.js` → `albums.test.ts`.

- [x] **T33 — Convert songs route to TS**  
  Rename `server/routes/songs.js` → `songs.ts`.  
  Rename `server/routes/songs.test.js` → `songs.test.ts`.

- [x] **T34 — Convert playlists route to TS**  
  Rename `server/routes/playlists.js` → `playlists.ts`.  
  Rename `server/routes/playlists.test.js` → `playlists.test.ts`.

- [x] **T35 — Convert playlistSongs + stats routes to TS**  
  Rename `server/routes/playlistSongs.js` → `playlistSongs.ts`.  
  Rename `server/routes/playlistSongs.test.js` → `playlistSongs.test.ts`.  
  Rename `server/routes/stats.js` → `stats.ts`.  
  Rename `server/routes/stats.test.js` → `stats.test.ts`.

- [x] **T36 — Convert server entry point to TS**  
  Rename `server/index.js` → `index.ts`. Type the Express app. Update `import.meta.url` polyfill if needed. Update `package.json` dev script to use `tsx` or `ts-node/esm`.

- [ ] **T37 — Convert remaining server test files to TS**  
  Rename `server/db/index.test.js` → `index.test.ts`. Verify all tests compile.

## Phase 10: TypeScript — Client Source

- [ ] **T38 — Convert API client to TS**  
  Rename `client/src/api/client.js` → `client.ts`. Type all function params and return types using the shared entity types.  
  Rename `client/src/api/client.test.js` → `client.test.ts`.

- [ ] **T39 — Convert shared components to TS**  
  Rename `client/src/components/Layout.jsx` → `Layout.tsx`. Type the `children` prop.  
  Rename `client/src/components/NavBar.jsx` → `NavBar.tsx`.  
  Rename `client/src/components/Layout.test.jsx` → `Layout.test.tsx`.  
  Rename `client/src/components/NavBar.test.jsx` → `NavBar.test.tsx`.

- [ ] **T40 — Convert Dashboard & Artists pages to TS**  
  Rename `client/src/pages/Dashboard.jsx` → `Dashboard.tsx`.  
  Rename `client/src/pages/ArtistsList.jsx` → `ArtistsList.tsx`.  
  Rename `client/src/pages/ArtistDetail.jsx` → `ArtistDetail.tsx`.  
  Rename their `.test.jsx` → `.test.tsx` counterparts.

- [ ] **T41 — Convert Albums & Songs pages to TS**  
  Rename `client/src/pages/AlbumsList.jsx` → `AlbumsList.tsx`.  
  Rename `client/src/pages/AlbumDetail.jsx` → `AlbumDetail.tsx`.  
  Rename `client/src/pages/SongsList.jsx` → `SongsList.tsx`.  
  Rename their `.test.jsx` → `.test.tsx` counterparts.

- [ ] **T42 — Convert Playlists pages to TS**  
  Rename `client/src/pages/PlaylistsList.jsx` → `PlaylistsList.tsx`.  
  Rename `client/src/pages/PlaylistDetail.jsx` → `PlaylistDetail.tsx`.  
  Rename their `.test.jsx` → `.test.tsx` counterparts.

- [ ] **T43 — Convert App shell & entry point to TS**  
  Rename `client/src/App.jsx` → `App.tsx`.  
  Rename `client/src/main.jsx` → `main.tsx`.  
  Update `index.html` script src to `main.tsx` (Vite handles this).  
  Update `client/vite.config.js` → `vite.config.ts` (or keep `.js` — Vite supports both).

## Phase 11: TypeScript — Config & Build Integration

- [ ] **T44 — Update vitest configs for TS**  
  Update `server/vitest.config.js` include patterns to `['**/*.test.ts']`.  
  Update `client/vitest.config.js` include patterns to `['**/*.test.ts', '**/*.test.tsx']`.  
  Ensure vitest picks up tsconfig.

- [ ] **T45 — Update eslint config for TS**  
  Add `typescript-eslint` parser and plugin to `eslint.config.js`. Update file globs to include `**/*.ts`, `**/*.tsx`. Add ignores for `dist/`. Remove JSX-specific rules that don't apply to TS.

- [ ] **T46 — Update npm scripts and verify build**  
  Update `package.json` typecheck script to `tsc --noEmit` (run separately for server and client, or use project references).  
  Update `npm run build` if server needs compilation.  
  Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` — all pass.

## Phase 12: TypeScript — Verification & Polish

- [ ] **T47 — Full typecheck pass**  
  Run `tsc --noEmit` in both workspaces. Fix any remaining type errors: implicit `any`, missing null checks, untyped callback params, `useParams()` return type, etc.

- [ ] **T48 — Full test pass**  
  Run `npm run test` — all server and client tests pass on `.ts`/`.tsx` files.

- [ ] **T49 — Full build and smoke test**  
  Run `npm run build`, then `npm run dev` and manually verify the app works end-to-end (same as T16).

## File Rename Index

Use this reference to track all file renames:

**Server JS → TS (13 files):**
- `server/db/sqlite.js` → `sqlite.ts`
- `server/db/index.js` → `index.ts`
- `server/db/index.test.js` → `index.test.ts`
- `server/middleware/errorHandler.js` → `errorHandler.ts`
- `server/middleware/errorHandler.test.js` → `errorHandler.test.ts`
- `server/routes/artists.js` → `artists.ts`
- `server/routes/artists.test.js` → `artists.test.ts`
- `server/routes/albums.js` → `albums.ts`
- `server/routes/albums.test.js` → `albums.test.ts`
- `server/routes/songs.js` → `songs.ts`
- `server/routes/songs.test.js` → `songs.test.ts`
- `server/routes/playlists.js` → `playlists.ts`
- `server/routes/playlists.test.js` → `playlists.test.ts`
- `server/routes/playlistSongs.js` → `playlistSongs.ts`
- `server/routes/playlistSongs.test.js` → `playlistSongs.test.ts`
- `server/routes/stats.js` → `stats.ts`
- `server/routes/stats.test.js` → `stats.test.ts`
- `server/index.js` → `index.ts`

**Client JS/JSX → TS/TSX (20 files):**
- `client/src/api/client.js` → `client.ts`
- `client/src/api/client.test.js` → `client.test.ts`
- `client/src/components/Layout.jsx` → `Layout.tsx`
- `client/src/components/Layout.test.jsx` → `Layout.test.tsx`
- `client/src/components/NavBar.jsx` → `NavBar.tsx`
- `client/src/components/NavBar.test.jsx` → `NavBar.test.tsx`
- `client/src/pages/Dashboard.jsx` → `Dashboard.tsx`
- `client/src/pages/Dashboard.test.jsx` → `Dashboard.test.tsx`
- `client/src/pages/ArtistsList.jsx` → `ArtistsList.tsx`
- `client/src/pages/ArtistsList.test.jsx` → `ArtistsList.test.tsx`
- `client/src/pages/ArtistDetail.jsx` → `ArtistDetail.tsx`
- `client/src/pages/ArtistDetail.test.jsx` → `ArtistDetail.test.tsx`
- `client/src/pages/AlbumsList.jsx` → `AlbumsList.tsx`
- `client/src/pages/AlbumDetail.jsx` → `AlbumDetail.tsx`
- `client/src/pages/AlbumDetail.test.jsx` → `AlbumDetail.test.tsx`
- `client/src/pages/SongsList.jsx` → `SongsList.tsx`
- `client/src/pages/SongsList.test.jsx` → `SongsList.test.tsx`
- `client/src/pages/PlaylistsList.jsx` → `PlaylistsList.tsx`
- `client/src/pages/PlaylistsList.test.jsx` → `PlaylistsList.test.tsx`
- `client/src/pages/PlaylistDetail.jsx` → `PlaylistDetail.tsx`
- `client/src/pages/PlaylistDetail.test.jsx` → `PlaylistDetail.test.tsx`
- `client/src/App.jsx` → `App.tsx`
- `client/src/main.jsx` → `main.tsx`
