# Local saves

Math Valley stores structured player data in the browser's native IndexedDB database `math-valley`, schema version 1. It does not send saves to a server.

- `profile` contains the `player` record: stable current level ID, completed levels, locale, teaching records and journal preferences.
- `levels` contains one versioned checkpoint per stable level ID. It preserves the graph or topology state, route drafts, flows, collected witnesses, proof stage, undo history and camera. The prologue preserves completed rotations and arrival.

The database loads before React mounts the game. Old `math-roam-chapter-v3`, `math-valley-locale` and `math-valley-lessons-v1` localStorage records migrate together in a transaction. Their original keys are retained as a backup and cannot override an existing newer profile. Concurrent tabs merge completion and lesson records; the most recent selection or puzzle edit wins.

Each completed action starts a write immediately. Animations, Three.js objects, canvas images and DOM references are not stored. Reloading during an unfinished animation returns to the preceding completed action. Selecting another level keeps its independent checkpoint; the explicit restart command replaces the current checkpoint with a new initial state. Demonstration scenes have no save callbacks and cannot overwrite real puzzles.

Checkpoints include a rules fingerprint and validation of their state. Incompatible or malformed puzzle snapshots fall back to the level's initial state while retaining the profile. Topology restoration replays the recorded lifts and verifies that a partial proof can be obtained by legal adjacent inverse cancellations.

If IndexedDB is unavailable or a transaction fails, a versioned localStorage bundle is used when possible, then reconciled back into IndexedDB on a later reload. If both storage methods are denied or full, play continues in memory for the current session. Database errors cannot prevent the game from opening.

Saves belong to a browser and site origin. The Vercel and Netlify URLs, different localhost ports, different browsers and other devices have independent saves. This provides local resume, not cloud synchronization. Clearing site data removes the records, and browser storage management may also evict local data. No persistent-storage permission is requested automatically.
