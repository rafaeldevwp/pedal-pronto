CREATE TABLE IF NOT EXISTS training_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id TEXT NOT NULL,
  decision_date TEXT NOT NULL,
  workout_date TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  original_json TEXT,
  recommended_json TEXT,
  effective_json TEXT,
  reason TEXT NOT NULL,
  related_decision_id INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_training_decisions_owner_created
ON training_decisions(owner_id, created_at DESC);

PRAGMA optimize;
