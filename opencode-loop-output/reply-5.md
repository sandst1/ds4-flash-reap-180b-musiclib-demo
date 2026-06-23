






Let me also check the playlist_songs route and the schema to understand the data model.


Let me check how the routes are mounted in the server index:


Now I have full context. Let me create both test files.


Now let me run the tests to verify they pass:


Server tests all pass (69 tests, 5 files). The client test failure is pre-existing (no client test files yet — tasks T23-T25).

Let me also run just the server tests explicitly to confirm:


All 69 tests pass. Let me update the task and commit.













**T21 complete.** Created `server/routes/songs.test.js` (17 tests) and `server/routes/playlists.test.js` (14 tests). All 69 server tests pass (5 suites).