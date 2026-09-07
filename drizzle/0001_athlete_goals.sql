CREATE TABLE IF NOT EXISTS athlete_goals (
  owner_id TEXT PRIMARY KEY,
  objective TEXT NOT NULL,
  event_name TEXT,
  event_date TEXT,
  priority TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
