export interface Artist {
  id: number;
  name: string;
  bio: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArtistInput {
  name: string;
  bio?: string | null;
  image_url?: string | null;
}

export interface Album {
  id: number;
  artist_id: number;
  title: string;
  cover_url: string | null;
  release_year: number | null;
  created_at: string;
  updated_at: string;
}

export interface AlbumInput {
  artist_id: number;
  title: string;
  cover_url?: string | null;
  release_year?: number | null;
}

export interface AlbumWithArtist extends Album {
  artist_name: string;
}

export interface Song {
  id: number;
  album_id: number;
  title: string;
  track_num: number | null;
  duration_sec: number | null;
  file_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface SongInput {
  album_id: number;
  title: string;
  track_num?: number | null;
  duration_sec?: number | null;
  file_path?: string | null;
}

export interface SongWithAlbum extends Song {
  album_title: string;
}

export interface Playlist {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaylistInput {
  name: string;
  description?: string | null;
}

export interface PlaylistSong {
  id: number;
  playlist_id: number;
  song_id: number;
  position: number;
  added_at: string;
}

export interface PlaylistSongWithSong extends Song {
  position: number;
  added_at: string;
}

export interface PlaylistWithSongs extends Playlist {
  songs: PlaylistSongWithSong[];
}

export interface Stats {
  artists: number;
  albums: number;
  songs: number;
  playlists: number;
}

export interface ApiError {
  error: string;
  status: number;
}
