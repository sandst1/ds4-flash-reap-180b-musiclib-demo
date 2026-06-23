# Music Library — Product Requirements Document

## 1. Overview

A local, single-user music library manager. Users organize music metadata (artists, albums, songs) and create/manage playlists. No audio playback — this is a catalog management tool.

## 2. Goals

- Track artists and their biographical info
- Group songs into albums, linked to artists
- Create and manage playlists (add/remove/reorder songs)
- Browse the library through a clean web UI

## 3. User Stories

### Artists
- As a user, I can create a new artist with name, bio, and image
- As a user, I can view a list of all artists
- As a user, I can view a single artist's detail page showing their albums
- As a user, I can edit an artist's info
- As a user, I can delete an artist (and their albums/songs)

### Albums
- As a user, I can create an album under an artist (title, cover image, release year)
- As a user, I can view all albums or filter by artist
- As a user, I can view an album's detail page showing its songs
- As a user, I can edit album metadata
- As a user, I can delete an album (and its songs)

### Songs
- As a user, I can add a song to an album (title, track number, duration, optional file path)
- As a user, I can view a list of all songs or filter by album
- As a user, I can edit song details
- As a user, I can delete a song

### Playlists
- As a user, I can create a playlist with a name and description
- As a user, I can view all playlists
- As a user, I can view a playlist's song list in order
- As a user, I can add songs to a playlist
- As a user, I can remove songs from a playlist
- As a user, I can reorder songs within a playlist (drag or move up/down)
- As a user, I can edit playlist metadata
- As a user, I can delete a playlist

## 4. Non-Functional Requirements

- Single-user, no authentication
- Data persisted to local SQLite database
- Responsive web UI (desktop + mobile)
- Fast startup — no external DB server needed
