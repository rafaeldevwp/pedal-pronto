import { ensurePolarSchema, ownerId, runtime } from '@/lib/polar';
import { runReadiness, type Checkin } from '@/lib/readiness';
import { resolveMesocycle, type PhaseMap } from '@/lib/mesocycle';
import { buildAthleteSnapshot, type GoalSnapshotInput, type MesocycleSnapshotInput } from '@/lib/context';

export const dynamic = 'force-dynamic';

async function loadSnapshot(owner: string, checkin?: Checkin) {
  await ensurePolarSchema();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  const [readiness, anchorRow, phaseRows, goalRow] = await Promise.all([
    runReadiness(owner, checkin),
    runtime.DB.prepare('SELECT anchor_date, updated_at FROM mesocycle_anchor WHERE owner_id=?').bind(owner).first<{ anchor_date: string; updated_at: number }>(),
    runtime.DB.prepare('SELECT cycle,week,phase FROM mesocycle_phases WHERE owner_id=? ORDER BY cycle,week').bind(owner).all<{ cycle: number; week: number; phase: string }>(),
    runtime.DB.prepare('SELECT objective,event_name,event_date,priority,updated_at FROM athlete_goals WHERE owner_id=?').bind(owner).first<Record<string, string | number>>(),
  ]);
  const phases: PhaseMap = Object.fromEntries((phaseRows.results || []).map((row) => [`${row.cycle}:${row.week}`, row.phase]));
  const mesocycle: MesocycleSnapshotInput = {
    ...resolveMesocycle(anchorRow?.anchor_date, today, phases, readiness.workout?.name || ''),
    anchorUpdatedAt: anchorRow ? new Date(Number(anchorRow.updated_at)).toISOString() : null,
  };
  const goal: GoalSnapshotInput = goalRow ? {
    objective: String(goalRow.objective),
    eventName: goalRow.event_name ? String(goalRow.event_name) : undefined,
    eventDate: goalRow.event_date ? String(goalRow.event_date) : undefined,
    priority: String(goalRow.priority),
    updatedAt: new Date(Number(goalRow.updated_at)).toISOString(),
  } : null;
  return buildAthleteSnapshot({ readiness, mesocycle, goal, checkin });
}

export async function GET(request: Request) {
  const owner = ownerId(request);
  if (!owner) return Response.json({ error: 'Não autorizado' }, { status: 401 });
  try {
    return Response.json(await loadSnapshot(owner));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Falha ao carregar contexto' },
      { status: 502 },
    );
  }
}
