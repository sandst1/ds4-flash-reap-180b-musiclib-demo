# Music Library — Architecture Document

## 1. Tech Stack

| Layer | Choice |
|---|---|
| **Backend** | Node.js + Express.js |
| **Database** | SQLite via built-in `node:sqlite` (Node ≥22) |
| **Frontend** | React 18+ with Vite |
| **Routing (client)** | React Router v6 |
| **HTTP client** | Native `fetch` (no Axios) |
| **Monorepo** | npm workspaces |

## 2. Project Structure

```
musiclib/
├── server/                     # Express REST API
│   ├── db/
│   │   ├── schema.sql          # Table DDL
│   │   ├── seed.sql            # Optional dev seed data
│   │   └── index.js            # DB init + connection
│   ├── routes/
│   │   ├── artists.js
│   │   ├── albums.js
│   │   ├── songs.js
│   │   ├── playlists.js
│   │   └── playlistSongs.js
│   ├── middleware/
│   │   └── errorHandler.js
│   └── index.js                # Express app entry
│
├── client/                     # React SPA (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js       # fetch wrappers
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── NavBar.jsx
│   │   │   └── ...shared UI...
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ArtistsList.jsx
│   │   │   ├── ArtistDetail.jsx
│   │   │   ├── AlbumDetail.jsx
│   │   │   ├── SongsList.jsx
│   │   │   ├── PlaylistsList.jsx
│   │   │   └── PlaylistDetail.jsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── vite.config.js
│
├── docs/                       # Planning documents
├── AGENTS.md                   # Agent instructions
├── IMPL-PLAN.md                # Implementation plan
├── TASKS.md                    # Task breakdown with checkboxes
└── package.json                # Root (npm workspaces)
```

## 3. Database Schema

```
┌──────────────────────────────────────────────────┐
│  artists                                          │
│  �─────────────────────────────────────────────    │
│  id          INTEGER  PRIMARY KEY AUTOINCREMENT   │
│  name        TEXT     NOT NULL                     │
│  bio         TEXT                                  │
│  image_url   TEXT                                  │
│  created_at  TEXT     DEFAULT CURRENT_TIMESTAMP    │
│  updated_at  TEXT     DEFAULT CURRENT_TIMESTAMP    │
└──────────────────────────────────────────────────┘
         │ 1
         │
         │ * (one artist → many albums)
         ▼
┌──────────────────────────────────────────────────┐
│  albums                                           │
│  �─────────────────────────────────────────────    │
│  id           INTEGER  PRIMARY KEY AUTOINCREMENT  │
│  artist_id    INTEGER  NOT NULL → artists.id      │
│  title        TEXT     NOT NULL                    │
│  cover_url    TEXT                                 │
│  release_year INTEGER                               │
│  created_at   TEXT     DEFAULT CURRENT_TIMESTAMP   │
│  updated_at   TEXT     DEFAULT CURRENT_TIMESTAMP   │
└──────────────────────────────────────────────────┘
         │ 1
         │
         │ * (one album → many songs)
         ▼
┌──────────────────────────────────────────────────┐
│  songs                                            │
│  �─────────────────────────────────────────────    │
│  id           INTEGER  PRIMARY KEY AUTOINCREMENT  │
│  album_id     INTEGER  NOT NULL → albums.id       │
│  title        TEXT     NOT NULL                    │
│  track_num    INTEGER                               │
│  duration_sec INTEGER                               │
│  file_path    TEXT                                  │
│  created_at   TEXT     DEFAULT CURRENT_TIMESTAMP   │
│  updated_at   TEXT     DEFAULT CURRENT_TIMESTAMP   │
└──────────────────────────────────────────────────┘
         │ *                         
         │                          �U many-to-many
         ▼                          �U
┌──────────────────────────────────────────────────┐
│  playlist_songs                                   │
│  ┤─────────────────────────────────────────────   │
│  id           INTEGER  PRIMARY KEY AUTOINCREMENT  │
│  playlist_id  INTEGER  NOT NULL → playlists.id   │
│  song_id      INTEGER  NOT NULL → songs.id        │
│  position     INTEGER  NOT NULL                    │
│  added_at     TEXT     DEFAULT CURRENT_TIMESTAMP   │
└──────────────────────────────────────────────────┘
         ▲ *                         │ *
         │                           │
         │ 1                         │
┌──────────────────────────────────────────────────┐
│  playlists                                        │
│  �─────────────────────────────────────────────    │
│  id           INTEGER  PRIMARY KEY AUTOINCREMENT  │
│  name         TEXT     NOT NULL                    │
│  description  TEXT                                 │
│  created_at   TEXT     DEFAULT CURRENT_TIMESTAMP   │
│  updated_at   TEXT     DEFAULT CURRENT_TIMESTAMP   │
└──────────────────────────────────────────────────┘
```

## 4. API Design

All endpoints return JSON. Standard CRUD pattern:

| Method | Endpoint | Description |
|---|---|---|
| `GET`    | `/api/artists`        | List all artists |
| `POST`   | `/api/artists`        | Create artist |
| `GET`    | `/api/artists/:id`    | Get artist by ID |
| `PUT`    | `/api/artists/:id`    | Update artist |
| `DELETE` | `/api/artists/:id`    | Delete artist (cascades) |
| `GET`    | `/api/artists/:id/albums` | Albums by artist |
| `GET`    | `/api/albums`         | List all albums |
| `POST`   | `/api/albums`         | Create album |
| `GET`    | `/api/albums/:id`     | Get album by ID |
| `PUT`    | `/api/albums/:id`     | Update album |
| `DELETE` | `/api/albums/:id`     | Delete album (cascades) |
| `GET`    | `/api/albums/:id/songs` | Songs by album |
| `GET`    | `/api/songs`          | List all songs |
| `POST`   | `/api/songs`          | Create song |
| `GET`    | `/api/songs/:id`      | Get song by ID |
| `PUT`    | `/api/songs/:id`      | Update song |
| `DELETE` | `/api/songs/:id`      | Delete song |
| `GET`    | `/api/playlists`      | List all playlists |
| `POST`   | `/api/playlists`      | Create playlist |
| `GET`    | `/api/playlists/:id`  | Get playlist with songs |
| `PUT`    | `/api/playlists/:id`  | Update playlist |
| `DELETE` | `/api/playlists/:id`  | Delete playlist |
| `GET`    | `/api/playlists/:id/songs` | Songs in playlist (ordered) |
| `POST`   | `/api/playlists/:id/songs` | Add song to playlist |
| `DELETE` | `/api/playlists/:id/songs/:songId` | Remove song |
| `PUT`    | `/api/playlists/:id/songs/reorder` | Reorder songs |

### Error format
```json
{ "error": "Not found", "status": 404 }
```

## 5. Frontend Routes

| Route | Page Component |
|---|---|
| `/`           | Dashboard — summary counts, quick links |
| `/artists`    | ArtistsList — grid/table of all artists |
| `/artists/:id` | ArtistDetail — artist info + albums list |
| `/albums/:id` | AlbumDetail — album info + songs list |
| `/songs`      | SongsList — browsable table of all songs |
| `/playlists`  | PlaylistsList — all playlists |
| `/playlists/:id` | PlaylistDetail — playlist + draggable song list |

## 6. Data Flow

```
Browser �── HTTP �─→ Express Router �─→ Route Handler
                                          │
                                    ┌─────┴─────┐
                                    │            │
                               SQLite      Response JSON
                                    │            │
                                    └────────────┘
                                          │
                                     React Component
                                          │
                                     UI Render
```
