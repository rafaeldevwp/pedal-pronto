CREATE TABLE IF NOT EXISTS training_write_operations (
  operation_id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  proposal_id TEXT NOT NULL,
  status TEXT NOT NULL,
  response_json TEXT,
  created_at INTEGER NOT NULL,
  completed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_training_write_operations_owner
ON training_write_operations(owner_id, created_at DESC);

PRAGMA optimize;
