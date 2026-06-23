-- Seed data for development

INSERT OR IGNORE INTO artists (id, name, bio) VALUES
  (1, 'The Rock Band', 'A legendary rock band from the 90s.'),
  (2, 'Jazz Ensemble', 'Smooth jazz collective.');

INSERT OR IGNORE INTO albums (id, artist_id, title, release_year) VALUES
  (1, 1, 'Greatest Hits', 1995),
  (2, 1, 'Live Concert', 1997),
  (3, 2, 'Midnight Jazz', 2001);

INSERT OR IGNORE INTO songs (id, album_id, title, track_num, duration_sec) VALUES
  (1, 1, 'Anthem', 1, 240),
  (2, 1, 'Power Ballad', 2, 310),
  (3, 2, 'Live Track 1', 1, 180),
  (4, 3, 'Jazy Nights', 1, 290),
  (5, 3, 'Smooth Moves', 2, 215);

INSERT OR IGNORE INTO playlists (id, name, description) VALUES
  (1, 'Favorites', 'My top picks');

INSERT OR IGNORE INTO playlist_songs (id, playlist_id, song_id, position) VALUES
  (1, 1, 1, 1),
  (2, 1, 4, 2);
