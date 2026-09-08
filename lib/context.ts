import type { Checkin, ReadinessResult } from '@/lib/readiness';
import type { resolveMesocycle } from '@/lib/mesocycle';

export type FieldQuality = 'válido' | 'atrasado' | 'ausente' | 'contraditório';
export type SnapshotField<T> = {
  value: T | null;
  source: string;
  updatedAt: string | null;
  quality: FieldQuality;
  note?: string;
};

export type MesocycleSnapshotInput = ReturnType<typeof resolveMesocycle> & { anchorUpdatedAt?: string | null };
export type GoalSnapshotInput = { objective: string; eventName?: string; eventDate?: string; priority: string; updatedAt?: string | null } | null;

export type AthleteSnapshot = {
  version: 1;
  generatedAt: string;
  readiness: SnapshotField<{
    classification: ReadinessResult['classification'];
    metrics: ReadinessResult['metrics'];
    hasProposal: boolean;
  }>;
  mesocycle: SnapshotField<{ cycle: number; week: number; day: number; phase: string }>;
  goal: SnapshotField<{ objective: string; eventName?: string; eventDate?: string; priority: string }>;
  checkin: SnapshotField<Checkin>;
  blocked: boolean;
  blockReasons: string[];
};

function readinessQuality(readiness: ReadinessResult): { quality: FieldQuality; note?: string } {
  if (readiness.classification !== 'indisponível') return { quality: 'válido' };
  const warning = readiness.warning || 'Prontidão indisponível.';
  if (readiness.reasonCode === 'atrasado') return { quality: 'atrasado', note: warning };
  if (readiness.reasonCode === 'sessao_expirada' || readiness.reasonCode === 'ausente') return { quality: 'ausente', note: warning };
  return { quality: 'contraditório', note: warning };
}

function mesocycleQuality(mesocycle: MesocycleSnapshotInput): { quality: FieldQuality; note?: string } {
  if (!mesocycle.anchor) return { quality: 'ausente', note: 'Âncora do mesociclo ainda não configurada.' };
  if (mesocycle.warning) return { quality: 'contraditório', note: mesocycle.warning };
  if (mesocycle.phase === 'desconhecida') return { quality: 'ausente', note: 'Fase não cadastrada para o ciclo e semana atuais.' };
  return { quality: 'válido' };
}

export function buildAthleteSnapshot(input: {
  readiness: ReadinessResult;
  mesocycle: MesocycleSnapshotInput;
  goal: GoalSnapshotInput;
  checkin?: Checkin;
  now?: Date;
}): AthleteSnapshot {
  const generatedAt = (input.now || new Date()).toISOString();
  const readinessState = readinessQuality(input.readiness);
  const mesocycleState = mesocycleQuality(input.mesocycle);
  const checkinProvided = Boolean(input.checkin && Object.values(input.checkin).some((value) => value !== undefined));
  const blockReasons: string[] = [];
  if (readinessState.quality !== 'válido') blockReasons.push(readinessState.note!);
  if (mesocycleState.quality === 'contraditório') blockReasons.push(mesocycleState.note!);
  return {
    version: 1,
    generatedAt,
    readiness: {
      value: readinessState.quality === 'válido' ? {
        classification: input.readiness.classification,
        metrics: input.readiness.metrics,
        hasProposal: Boolean(input.readiness.proposal),
      } : null,
      source: 'polar+intervals.icu',
      updatedAt: input.readiness.updatedAt,
      quality: readinessState.quality,
      note: readinessState.note,
    },
    mesocycle: {
      value: input.mesocycle.calculated ? {
        cycle: input.mesocycle.calculated.cycle,
        week: input.mesocycle.calculated.week,
        day: input.mesocycle.calculated.day,
        phase: input.mesocycle.phase,
      } : null,
      source: 'pedal-pronto',
      updatedAt: input.mesocycle.anchorUpdatedAt ?? null,
      quality: mesocycleState.quality,
      note: mesocycleState.note,
    },
    goal: {
      value: input.goal ? {
        objective: input.goal.objective,
        eventName: input.goal.eventName,
        eventDate: input.goal.eventDate,
        priority: input.goal.priority,
      } : null,
      source: 'pedal-pronto',
      updatedAt: input.goal?.updatedAt ?? null,
      quality: input.goal ? 'válido' : 'ausente',
    },
    checkin: {
      value: checkinProvided ? input.checkin! : null,
      source: 'atleta',
      updatedAt: checkinProvided ? generatedAt : null,
      quality: checkinProvided ? 'válido' : 'ausente',
    },
    blocked: blockReasons.length > 0,
    blockReasons,
  };
}
