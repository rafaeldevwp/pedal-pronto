CREATE TABLE IF NOT EXISTS polar_oauth_states (state TEXT PRIMARY KEY, owner_id TEXT NOT NULL, created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS polar_connections (owner_id TEXT PRIMARY KEY, polar_user_id TEXT NOT NULL, access_token TEXT NOT NULL, connected_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_polar_oauth_states_created_at ON polar_oauth_states(created_at);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS readiness_runs (id INTEGER PRIMARY KEY AUTOINCREMENT, owner_id TEXT NOT NULL, run_date TEXT NOT NULL, classification TEXT NOT NULL, changed INTEGER NOT NULL DEFAULT 0, report_json TEXT NOT NULL, created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_readiness_runs_owner_date ON readiness_runs(owner_id, run_date, created_at DESC);
