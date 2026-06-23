






















Now I'll create the artists API test file based on the patterns I see:











All 20 server tests pass (both db and artists). The client test failure is expected — no client tests exist yet.

Now let me commit.


















Done. T19 — Artists API tests complete.

**Created** `server/routes/artists.test.js` (176 lines) with 16 passing tests covering:
- Empty list on fresh `:memory:` DB
- POST: valid create, missing name (400), empty name (400)
- GET by id: found, not found (404)
- PUT: update, 404, empty name (400), partial update without name
- DELETE: 204 + verify removal, 404, cascading deletes to albums & songs
- GET `/:id/albums`: with albums, empty list, 404 for nonexistent artist

Committed in two commits: test file + TASKS.md update.