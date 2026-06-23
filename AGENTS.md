# Music Library — Agent Instructions

## Project

This is a single-user music library web application for managing artists, albums, songs, and playlists. Built with Express.js + SQLite (better-sqlite3) backend and React (Vite) frontend in an npm workspaces monorepo.

## Key Files

| File | Purpose |
|---|---|
| `IMPL-PLAN.md`         | Overall implementation plan, dependencies, order |
| `TASKS.md`             | Task checklist with checkboxes — update as you work |
| `docs/PRD.md`          | Product requirements |
| `docs/ARCHITECTURE.md` | Architecture, schema, API docs |
| `AGENTS.md`            | This file — agent context |

## Conventions

- **Backend**: Express routes in `server/routes/*.js`, each exporting a `Router`. DB access via `server/db/index.js`.
- **Frontend**: React pages in `client/src/pages/*.jsx`, shared components in `client/src/components/*.jsx`. API calls through `client/src/api/client.js`.
- **Database**: `better-sqlite3` synchronous API. Schema in `server/db/schema.sql`.
- **No authentication** — single-user app.
- **Error responses**: Always return `{ error, status }` JSON.

## Workflow

1. Read `IMPL-PLAN.md` to understand overall plan and task sequencing.
2. Pick the next unchecked task from `TASKS.md`.
3. Update TASKS.md checkbox to `[x]` when a task is done.
4. After each task, run applicable verification commands (`npm run lint`, `npm run typecheck`, `npm run build`, `npm run test`).
5. Commands should be compact on success (summary line only), verbose on failure.
6. Add notes or gotchas to this file as needed.

## npm Scripts (defined in root package.json)

| Script | Purpose |
|---|---|
| `npm run lint`   | ESLint across server + client |
| `npm run typecheck` | `tsc --noEmit` if TS added, or placeholder |
| `npm run build`  | Build client for production |
| `npm run test`   | Run all tests (Node `--test` for server) |
| `npm run dev`    | Start server + client in dev mode |
| `npm run dev:server` | Start backend only |
| `npm run dev:client` | Start frontend only |
