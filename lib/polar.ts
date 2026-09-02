import { env } from 'cloudflare:workers';

type RuntimeEnv = {
  DB: D1Database;
  POLAR_CLIENT_ID: string;
  POLAR_CLIENT_SECRET: string;
  POLAR_REDIRECT_URI: string;
  INTERVALS_API_KEY: string;
  INTERVALS_ATHLETE_ID: string;
};
export const runtime = env as unknown as RuntimeEnv;

export async function ensurePolarSchema() {
  await runtime.DB.batch([
    runtime.DB.prepare(
      'CREATE TABLE IF NOT EXISTS polar_oauth_states (state TEXT PRIMARY KEY, owner_id TEXT NOT NULL, created_at INTEGER NOT NULL)',
    ),
    runtime.DB.prepare(
      'CREATE TABLE IF NOT EXISTS polar_connections (owner_id TEXT PRIMARY KEY, polar_user_id TEXT NOT NULL, access_token TEXT NOT NULL, connected_at INTEGER NOT NULL)',
    ),
    runtime.DB.prepare(
      'CREATE INDEX IF NOT EXISTS idx_polar_oauth_states_created_at ON polar_oauth_states(created_at)',
    ),
    runtime.DB.prepare(
      'CREATE TABLE IF NOT EXISTS readiness_runs (id INTEGER PRIMARY KEY AUTOINCREMENT, owner_id TEXT NOT NULL, run_date TEXT NOT NULL, classification TEXT NOT NULL, changed INTEGER NOT NULL DEFAULT 0, report_json TEXT NOT NULL, created_at INTEGER NOT NULL)',
    ),
    runtime.DB.prepare(
      'CREATE INDEX IF NOT EXISTS idx_readiness_runs_owner_date ON readiness_runs(owner_id, run_date, created_at DESC)',
    ),
  ]);
}
export function ownerId(request: Request) {
  return request.headers.get('oai-authenticated-user-id');
}
export function basicAuth() {
  return `Basic ${btoa(`${runtime.POLAR_CLIENT_ID}:${runtime.POLAR_CLIENT_SECRET}`)}`;
}
