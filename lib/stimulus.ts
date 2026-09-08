export type StimulusType = 'endurance' | 'limiar' | 'vo2max' | 'recuperacao';
export type StimulusStatus = 'entregue' | 'planejado' | 'pendente';
export type StimulusCoverage = Record<StimulusType, StimulusStatus>;

const stimulusLabels: Record<StimulusType, string> = {
  endurance: 'endurance', limiar: 'limiar', vo2max: 'VO2max', recuperacao: 'recuperação',
};

function maxIntensity(structure: string[] = []): number | undefined {
  const matches = structure.join('\n').match(/\b(\d{2,3})%/g);
  if (!matches) return undefined;
  return Math.max(...matches.map((match) => Number(match.replace('%', ''))));
}

export function classifyStimulus(session: { durationMinutes?: number; structure?: string[] }): StimulusType {
  const intensity = maxIntensity(session.structure);
  if (intensity !== undefined) {
    if (intensity >= 106) return 'vo2max';
    if (intensity >= 88) return 'limiar';
    return (session.durationMinutes ?? 0) < 35 ? 'recuperacao' : 'endurance';
  }
  if ((session.durationMinutes ?? 0) < 35) return 'recuperacao';
  return 'endurance';
}

export function computeStimulusCoverage(sessions: Array<{ status: 'planejado' | 'realizado'; durationMinutes?: number; structure?: string[] }>): StimulusCoverage {
  const coverage: StimulusCoverage = { endurance: 'pendente', limiar: 'pendente', vo2max: 'pendente', recuperacao: 'pendente' };
  for (const session of sessions) {
    const type = classifyStimulus(session);
    if (session.status === 'realizado') coverage[type] = 'entregue';
    else if (coverage[type] !== 'entregue') coverage[type] = 'planejado';
  }
  return coverage;
}

export function describeMissingKeyStimulus(coverage: StimulusCoverage, todayStimulus?: StimulusType): string | undefined {
  const keyTypes: StimulusType[] = ['limiar', 'vo2max'];
  const missing = keyTypes.filter((type) => coverage[type] === 'pendente' && type !== todayStimulus);
  if (!missing.length) return undefined;
  return `A semana ainda não entregou nem tem planejado o estímulo de ${missing.map((type) => stimulusLabels[type]).join(' e ')}.`;
}

export function isWeekKeySourceFor(coverage: StimulusCoverage, todayStimulus: StimulusType): boolean {
  return (todayStimulus === 'limiar' || todayStimulus === 'vo2max') && coverage[todayStimulus] !== 'entregue';
}
