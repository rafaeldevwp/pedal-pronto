// SPEC-35: `decideTraining` foi removido junto com a prévia do motor adaptativo, que era sua
// única consumidora. O que resta aqui é a regra de ajuste de uma variável, compartilhada pelo
// treino de hoje (`lib/readiness.ts`) e pelo replanejamento futuro (`app/api/week/route.ts`).

export type WorkoutAdjustmentInput = { name: string; durationMinutes?: number; load?: number; description?: string; structure?: string[] };

function reduceIntensity(workout: WorkoutAdjustmentInput) {
  const text = workout.description ?? (workout.structure || []).join('\n');
  const intensity = text.match(/\b(8[5-9]|9\d|1[0-4]\d)%/);
  if (!intensity) return null;
  const from = Number(intensity[1]), to = Math.max(80, from - 5);
  return {
    action: 'reduzir_intensidade' as const,
    stimulusPreserved: 'duração',
    recommended: {
      name: workout.name,
      durationMinutes: workout.durationMinutes,
      load: workout.load ? Math.round(workout.load * 0.9) : undefined,
      description: text.replace(intensity[0], `${to}%`),
      descriptionChange: `Intensidade principal reduzida de ${from}% para ${to}%; duração preservada.`,
    },
  };
}

function reduceRepetitions(workout: WorkoutAdjustmentInput) {
  const text = workout.description ?? (workout.structure || []).join('\n');
  const reps = text.match(/\b([2-9]|[1-9]\d)x\b/i);
  if (!reps) return null;
  const from = Number(reps[1]), to = from - 1;
  // SPEC-34: com 2 séries não há para onde descer. Antes o piso devolvia "de 2 para 2" e cortava
  // duração e carga sem reduzir série alguma; agora cede a vez para a redução de intensidade.
  if (to < 2) return null;
  return {
    action: 'reduzir_repeticoes' as const,
    stimulusPreserved: 'intensidade',
    recommended: {
      name: workout.name.replace(new RegExp(`\\b${from}x`, 'i'), `${to}x`),
      durationMinutes: workout.durationMinutes ? Math.round(workout.durationMinutes * 0.9) : undefined,
      load: workout.load ? Math.round(workout.load * 0.84) : undefined,
      description: text.replace(reps[0], `${to}x`),
      descriptionChange: `Repetições reduzidas de ${from} para ${to}; intensidade preservada.`,
    },
  };
}

export function preferVolumeReduction(phase: string): boolean {
  const phaseLower = phase.toLowerCase();
  const isRecoveryPhase = /recovery|deload|recupera/.test(phaseLower);
  const isProgressionPhase = /build|peak|choque|carga/.test(phaseLower);
  return isProgressionPhase || !isRecoveryPhase;
}

export const recoveryRecommendation = {
  name: 'Recuperação leve — ajuste do motor adaptativo',
  durationMinutes: 30,
  load: 18,
  description: '- 10m 45%\n- 15m 50%\n- 5m 40%',
  descriptionChange: 'Substituído por recuperação leve (10m 45% · 15m 50% · 5m 40%).',
};

export function adjustWorkoutPlan(
  workout: WorkoutAdjustmentInput,
  classification: 'amarela' | 'vermelha',
  phase: string,
  forceVolumeFirst = false,
) {
  if (classification === 'vermelha') {
    return { action: 'substituir_recuperacao' as const, stimulusPreserved: 'nenhum (prioriza recuperação)', recommended: recoveryRecommendation };
  }
  return forceVolumeFirst || preferVolumeReduction(phase)
    ? reduceRepetitions(workout) || reduceIntensity(workout)
    : reduceIntensity(workout) || reduceRepetitions(workout);
}
