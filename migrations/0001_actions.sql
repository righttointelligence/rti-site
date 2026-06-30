CREATE TABLE IF NOT EXISTS actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state_key TEXT NOT NULL,
  action_kind TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_actions_state_created_at
  ON actions (state_key, created_at);
