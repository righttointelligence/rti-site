-- O(1) live counters. COUNT(*) scans every row in SQLite, so serving the
-- homepage counter straight from the tables cost rows_read proportional to
-- signatures × viewers × polls. Counters are maintained at write time instead:
-- keys are 'signups', 'actions', 'signups:CA', 'actions:CA', ...
CREATE TABLE IF NOT EXISTS counters (
  key TEXT PRIMARY KEY,
  n INTEGER NOT NULL DEFAULT 0
);
