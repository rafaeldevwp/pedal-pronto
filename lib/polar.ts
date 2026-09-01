import { env } from 'cloudflare:workers';

type RuntimeEnv = { DB: D1Database; POLAR_CLIENT_ID: string; POLAR_CLIENT_SECRET: string; POLAR_REDIRECT_URI: string };
export const runtime = env as unknown as RuntimeEnv;

export async function ensurePolarSchema() {
  await runtime.DB.batch([
    runtime.DB.prepare('CREATE TABLE IF NOT EXISTS polar_oauth_states (state TEXT PRIMARY KEY, owner_id TEXT NOT NULL, created_at INTEGER NOT NULL)'),
    runtime.DB.prepare('CREATE TABLE IF NOT EXISTS polar_connections (owner_id TEXT PRIMARY KEY, polar_user_id TEXT NOT NULL, access_token TEXT NOT NULL, connected_at INTEGER NOT NULL)'),
    runtime.DB.prepare('CREATE INDEX IF NOT EXISTS idx_polar_oauth_states_created_at ON polar_oauth_states(created_at)'),
  ]);
}
export function ownerId(request: Request) { return request.headers.get('oai-authenticated-user-id'); }
export function basicAuth() { return `Basic ${btoa(`${runtime.POLAR_CLIENT_ID}:${runtime.POLAR_CLIENT_SECRET}`)}`; }
