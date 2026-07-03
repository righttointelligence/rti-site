-- Single-row cache for the dynamically rendered OG share image.
-- The worker's hourly cron (plus a lazy staleness check on /og.png)
-- re-renders the card with the live signature count and stores it here.
CREATE TABLE IF NOT EXISTS og_cache (
  key TEXT PRIMARY KEY,
  bytes BLOB NOT NULL,
  updated_at INTEGER NOT NULL
);
