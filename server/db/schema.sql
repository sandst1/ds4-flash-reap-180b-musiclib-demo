-- Music Library Database Schema

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS artists (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  bio         TEXT,
  image_url   TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS albums (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id    INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title        TEXT    NOT NULL,
  cover_url    TEXT,
  release_year INTEGER,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS songs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id     INTEGER NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  title        TEXT    NOT NULL,
  track_num    INTEGER,
  duration_sec INTEGER,
  file_path    TEXT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS playlists (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  description TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS playlist_songs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  song_id     INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL,
  added_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Auto-update updated_at triggers
CREATE TRIGGER IF NOT EXISTS tr_artists_updated_at
  AFTER UPDATE ON artists
  FOR EACH ROW
BEGIN
  UPDATE artists SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS tr_albums_updated_at
  AFTER UPDATE ON albums
  FOR EACH ROW
BEGIN
  UPDATE albums SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS tr_songs_updated_at
  AFTER UPDATE ON songs
  FOR EACH ROW
BEGIN
  UPDATE songs SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS tr_playlists_updated_at
  AFTER UPDATE ON playlists
  FOR EACH ROW
BEGIN
  UPDATE playlists SET updated_at = datetime('now') WHERE id = OLD.id;
END;
