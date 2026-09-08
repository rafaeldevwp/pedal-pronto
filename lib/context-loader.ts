import { ensurePolarSchema, runtime } from '@/lib/polar';
import { runReadiness, type Checkin, type ReadinessResult } from '@/lib/readiness';
import { resolveMesocycle } from '@/lib/mesocycle';
import { buildAthleteSnapshot, type AthleteSnapshot, type GoalSnapshotInput, type MesocycleSnapshotInput } from '@/lib/context';

export async function loadAthleteContext(owner: string, checkin?: Checkin): Promise<{ readiness: ReadinessResult; snapshot: AthleteSnapshot }> {
  await ensurePolarSchema();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  const [readiness, anchorRow, goalRow] = await Promise.all([
    runReadiness(owner, checkin),
    runtime.DB.prepare('SELECT anchor_date, updated_at FROM mesocycle_anchor WHERE owner_id=?').bind(owner).first<{ anchor_date: string; updated_at: number }>(),
    runtime.DB.prepare('SELECT objective,event_name,event_date,priority,updated_at FROM athlete_goals WHERE owner_id=?').bind(owner).first<Record<string, string | number>>(),
  ]);
  const mesocycle: MesocycleSnapshotInput = {
    ...resolveMesocycle(anchorRow?.anchor_date, today, readiness.workout?.name || ''),
    anchorUpdatedAt: anchorRow ? new Date(Number(anchorRow.updated_at)).toISOString() : null,
  };
  const goal: GoalSnapshotInput = goalRow ? {
    objective: String(goalRow.objective),
    eventName: goalRow.event_name ? String(goalRow.event_name) : undefined,
    eventDate: goalRow.event_date ? String(goalRow.event_date) : undefined,
    priority: String(goalRow.priority),
    updatedAt: new Date(Number(goalRow.updated_at)).toISOString(),
  } : null;
  const snapshot = buildAthleteSnapshot({ readiness, mesocycle, goal, checkin });
  return { readiness, snapshot };
}
