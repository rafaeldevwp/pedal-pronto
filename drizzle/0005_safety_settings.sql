CREATE TABLE IF NOT EXISTS athlete_safety_settings (
  owner_id TEXT PRIMARY KEY,
  ramp_rate_limit REAL NOT NULL DEFAULT 6,
  updated_at INTEGER NOT NULL
);
