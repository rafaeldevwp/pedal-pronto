import { ensurePolarSchema, runtime } from '@/lib/polar';
import { runReadiness, type Checkin, type ReadinessResult } from '@/lib/readiness';
import { resolveMesocycleFromEvents } from '@/lib/mesocycle';
import { intervalsFetch, plannedEventsFrom } from '@/lib/intervals';
import { buildAthleteSnapshot, type AthleteSnapshot, type GoalSnapshotInput, type MesocycleSnapshotInput } from '@/lib/context';

const zone = 'America/Sao_Paulo';
const isoDate = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: zone }).format(date);

// Uma volta completa de ciclo já basta para achar o último treino com código no nome.
const PHASE_LOOKBACK_DAYS = 28;

export async function loadAthleteContext(owner: string, checkin?: Checkin): Promise<{ readiness: ReadinessResult; snapshot: AthleteSnapshot }> {
  await ensurePolarSchema();
  const now = new Date();
  const today = isoDate(now);
  const lookbackStart = isoDate(new Date(now.getTime() - PHASE_LOOKBACK_DAYS * 86_400_000));
  const [goalRow, eventsBody] = await Promise.all([
    runtime.DB.prepare('SELECT objective,event_name,event_date,priority,updated_at FROM athlete_goals WHERE owner_id=?').bind(owner).first<Record<string, string | number>>(),
    intervalsFetch(`/athlete/${runtime.INTERVALS_ATHLETE_ID}/events?oldest=${lookbackStart}&newest=${today}&category=WORKOUT`).catch(() => null),
  ]);
  const mesocycle: MesocycleSnapshotInput = {
    ...resolveMesocycleFromEvents(plannedEventsFrom(eventsBody), today),
    anchorUpdatedAt: null,
  };
  const readiness = await runReadiness(owner, checkin, mesocycle.phase);
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
