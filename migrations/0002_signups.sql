-- Signups: the movement's list. Email + state (+ optional zip) only — no name,
-- no address, no IP, no user agent. `verified` flips when email verification
-- lands (transactional sender pending); the public counter counts all rows,
-- the district-attributed number politicians see counts verified only.
CREATE TABLE IF NOT EXISTS signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  state_key TEXT NOT NULL,
  zip TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  verify_token TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_signups_state ON signups (state_key, verified);
