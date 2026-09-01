CREATE TABLE IF NOT EXISTS polar_oauth_states (state TEXT PRIMARY KEY, owner_id TEXT NOT NULL, created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS polar_connections (owner_id TEXT PRIMARY KEY, polar_user_id TEXT NOT NULL, access_token TEXT NOT NULL, connected_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_polar_oauth_states_created_at ON polar_oauth_states(created_at);
