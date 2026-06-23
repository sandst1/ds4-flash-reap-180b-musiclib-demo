# Music Library — Implementation Plan

## Build Order

The implementation follows a strict dependency order — each layer depends on the one before it.

```
  1. Project scaffolding (monorepo, deps, configs)
          │
  2. Dev tooling setup (eslint, npm scripts for lint/typecheck/test)
          │
  3. Database (schema, init, seed)
          │
  4. Express server skeleton (app setup, middleware)
          │
  5. Backend APIs (artists → albums → songs → playlists → playlist-songs)
          │
  6. React app scaffold (Vite, router, API client)
          │
  7. Frontend pages (artists → albums → songs → playlists)
          │
  8. Navigation & polish (layout, links, styling)
```

## Dependencies

| Task | Depends On |
|---|---|---|
| Dev tooling    | Scaffolding |
| Database       | Scaffolding |
| Server setup   | Database |
| Artists API    | Server setup |
| Albums API     | Artists API (needs artist FK) |
| Songs API      | Albums API |
| Playlists API  | Server setup |
| Playlist Songs API | Playlists API + Songs API |
| React scaffold | — (parallel with backend) |
| Artists UI     | React scaffold + Artists API |
| Albums UI      | React scaffold + Albums API |
| Songs UI       | React scaffold + Songs API |
| Playlists UI   | React scaffold + Playlists API |
| Navigation     | All UI pages |

## Key Decisions

- **Single-user, no auth** — local app assumption
- **SQLite with built-in `node:sqlite`** — synchronous (via thin wrapper), simple, no ORM
- **npm workspaces** — server and client share root
- **Native `fetch`** — no Axios/http client library
- **React Router v6** — standard SPA routing
- **No TypeScript** — plain JS/JSX to keep it simple

## Verification

Manual smoke test at the end — full workflow from artist creation through playlist reorder.

## Dev Checks During Implementation

After completing each task, run the applicable commands to verify:

- **Backend tasks**: `npm run lint`, `npm run test:server` (if unit tests exist)
- **Frontend tasks**: `npm run lint`, `npm run typecheck`, `npm run build`
- Commands should produce compact output on success (pass/fail summary), verbose on failure.
