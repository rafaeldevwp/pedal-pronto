CREATE TABLE IF NOT EXISTS mesocycle_anchor (
  owner_id TEXT PRIMARY KEY,
  anchor_date TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS mesocycle_phases (
  owner_id TEXT NOT NULL,
  cycle INTEGER NOT NULL,
  week INTEGER NOT NULL,
  phase TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (owner_id, cycle, week)
);
