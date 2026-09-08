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
    runtime.DB.prepare(
      'CREATE TABLE IF NOT EXISTS athlete_goals (owner_id TEXT PRIMARY KEY, objective TEXT NOT NULL, event_name TEXT, event_date TEXT, priority TEXT NOT NULL, updated_at INTEGER NOT NULL)',
    ),
    runtime.DB.prepare(
      'CREATE TABLE IF NOT EXISTS training_decisions (id INTEGER PRIMARY KEY AUTOINCREMENT, owner_id TEXT NOT NULL, decision_date TEXT NOT NULL, workout_date TEXT NOT NULL, source TEXT NOT NULL, status TEXT NOT NULL, original_json TEXT, recommended_json TEXT, effective_json TEXT, reason TEXT NOT NULL, related_decision_id INTEGER, created_at INTEGER NOT NULL)',
    ),
    runtime.DB.prepare(
      'CREATE INDEX IF NOT EXISTS idx_training_decisions_owner_created ON training_decisions(owner_id, created_at DESC)',
    ),
    runtime.DB.prepare(
      'CREATE TABLE IF NOT EXISTS training_write_operations (operation_id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, proposal_id TEXT NOT NULL, status TEXT NOT NULL, response_json TEXT, created_at INTEGER NOT NULL, completed_at INTEGER)',
    ),
    runtime.DB.prepare(
      'CREATE INDEX IF NOT EXISTS idx_training_write_operations_owner ON training_write_operations(owner_id, created_at DESC)',
    ),
    runtime.DB.prepare(
      'CREATE TABLE IF NOT EXISTS mesocycle_anchor (owner_id TEXT PRIMARY KEY, anchor_date TEXT NOT NULL, updated_at INTEGER NOT NULL)',
    ),
    runtime.DB.prepare(
      'CREATE TABLE IF NOT EXISTS mesocycle_phases (owner_id TEXT NOT NULL, cycle INTEGER NOT NULL, week INTEGER NOT NULL, phase TEXT NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY(owner_id,cycle,week))',
    ),
  ]);
}
export async function recordTrainingDecision(owner: string, decision: {
  decisionDate: string;
  workoutDate: string;
  source: 'prontidao_diaria' | 'replanejamento' | 'sugestao_off' | 'resultado';
  status: 'mantido' | 'alterado' | 'adicionado' | 'resultado';
  original?: unknown;
  recommended?: unknown;
  effective?: unknown;
  reason: string;
  relatedDecisionId?: number;
}) {
  await runtime.DB.prepare(
    `INSERT INTO training_decisions
     (owner_id,decision_date,workout_date,source,status,original_json,recommended_json,effective_json,reason,related_decision_id,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  ).bind(
    owner, decision.decisionDate, decision.workoutDate, decision.source, decision.status,
    decision.original ? JSON.stringify(decision.original) : null,
    decision.recommended ? JSON.stringify(decision.recommended) : null,
    decision.effective ? JSON.stringify(decision.effective) : null,
    decision.reason, decision.relatedDecisionId || null, Date.now(),
  ).run();
}
export function ownerId(request: Request) {
  return request.headers.get('oai-authenticated-user-id');
}
export function basicAuth() {
  return `Basic ${btoa(`${runtime.POLAR_CLIENT_ID}:${runtime.POLAR_CLIENT_SECRET}`)}`;
}
