export type SuggestionCategory = 'descanso' | 'mobilidade' | 'recuperacao_ativa' | 'tecnica_cadencia' | 'endurance_leve';
export type SafetyFlag = { id: 'acwr_high' | 'ramp_rate_exceeded'; severity: 'moderada' | 'severa' };

export type OffDaySuggestion = {
  category: SuggestionCategory;
  name: string;
  durationMinutes: number;
  load: number;
  structure: string[];
  benefit: string;
  loadCost: string;
  nextWorkoutImpact: string;
  reason: string;
};

export type OffDayInput = {
  classification: 'verde' | 'amarela' | 'vermelha' | 'indisponível';
  safetyFlags: SafetyFlag[];
  phase: string;
  recentHardCount: number;
  recentLong: boolean;
  lowCadence: boolean;
  daysToNextKey?: number;
  forecastRisk?: 'baixo' | 'moderado' | 'alto' | 'indeterminado';
  checkin?: { dor?: number; sintomas?: number; fadiga?: number };
  nextKeyName?: string;
  recentSuggestionCategories: SuggestionCategory[];
};

const templates: Record<Exclude<SuggestionCategory, 'descanso'>, Omit<OffDaySuggestion, 'reason'>> = {
  mobilidade: {
    category: 'mobilidade',
    name: 'Mobilidade e ativação opcional',
    durationMinutes: 20,
    load: 5,
    structure: ['- 20m mobilidade, alongamento dinâmico e ativação leve'],
    benefit: 'Amplitude de movimento e ativação muscular sem custo cardiovascular relevante.',
    loadCost: 'Carga desprezível (aprox. 5).',
    nextWorkoutImpact: 'Praticamente não consome margem de recuperação para o próximo treino.',
  },
  recuperacao_ativa: {
    category: 'recuperacao_ativa',
    name: 'Ativação regenerativa opcional',
    durationMinutes: 25,
    load: 12,
    structure: ['- 8m 42%', '- 12m 48% 90-95rpm', '- 5m 40%'],
    benefit: 'Favorece a circulação e a remoção de fadiga sem adicionar um novo estímulo de treino.',
    loadCost: 'Carga baixa (aprox. 12).',
    nextWorkoutImpact: 'Custo mínimo de recuperação; não deve comprometer o próximo treino.',
  },
  tecnica_cadencia: {
    category: 'tecnica_cadencia',
    name: 'Técnica de cadência opcional',
    durationMinutes: 35,
    load: 20,
    structure: ['- 10m 48%', '- 4x 2m 55% 95-105rpm, 2m 45%', '- 9m 45%'],
    benefit: 'Estímulo técnico e leve, sem competir com a progressão da semana.',
    loadCost: 'Carga moderada-baixa (aprox. 20).',
    nextWorkoutImpact: 'Custo de recuperação baixo; margem preservada para o próximo treino.',
  },
  endurance_leve: {
    category: 'endurance_leve',
    name: 'Endurance leve opcional',
    durationMinutes: 40,
    load: 25,
    structure: ['- 10m 48%', '- 25m 58-62%', '- 5m 42%'],
    benefit: 'Acrescenta base aeróbica com baixo custo, sem transformar o descanso em obrigação.',
    loadCost: 'Carga moderada (aprox. 25).',
    nextWorkoutImpact: 'Custo de recuperação moderado; observe pernas e sono antes do próximo treino.',
  },
};

function descansoSuggestion(reason: string): OffDaySuggestion {
  return {
    category: 'descanso',
    name: 'Descanso completo',
    durationMinutes: 0,
    load: 0,
    structure: [],
    benefit: 'Recuperação completa, sem nenhum estímulo adicional. Descansar é parte do plano, não uma falha.',
    loadCost: 'Nenhuma carga adicional.',
    nextWorkoutImpact: 'Maximiza a margem de recuperação para o próximo treino.',
    reason,
  };
}

function build(category: Exclude<SuggestionCategory, 'descanso'>, reason: string, nextKeyName?: string): OffDaySuggestion {
  const template = templates[category];
  return {
    ...template,
    nextWorkoutImpact: nextKeyName ? `${template.nextWorkoutImpact} Preserva o próximo treino: ${nextKeyName}.` : template.nextWorkoutImpact,
    reason,
  };
}

function avoidRepeat(preferred: Exclude<SuggestionCategory, 'descanso'>, fallback: Exclude<SuggestionCategory, 'descanso'>, recent: SuggestionCategory[]): Exclude<SuggestionCategory, 'descanso'> {
  const repeatedTwice = recent.length >= 2 && recent[0] === preferred && recent[1] === preferred;
  return repeatedTwice ? fallback : preferred;
}

export function chooseOffDaySuggestion(input: OffDayInput): OffDaySuggestion {
  const severeSafety = input.safetyFlags.some((flag) => flag.severity === 'severa');
  const anySafety = input.safetyFlags.length > 0;
  const painOrSymptoms = (input.checkin?.dor ?? 0) >= 4 || (input.checkin?.sintomas ?? 0) >= 3;
  const keyVeryClose = input.daysToNextKey !== undefined && input.daysToNextKey <= 1 && input.forecastRisk === 'alto';
  const isRecoveryPhase = /recovery|deload|recupera/.test(input.phase.toLowerCase());

  if (painOrSymptoms) {
    return descansoSuggestion('Dor ou sintomas relevantes no check-in: nenhum estímulo é sugerido hoje, só descanso completo.');
  }

  const highRisk = severeSafety || input.classification === 'amarela' || input.recentHardCount >= 2 || input.recentLong || keyVeryClose;
  if (highRisk) {
    const reasonParts = [
      input.classification === 'amarela' ? 'A prontidão de hoje pede cautela.' : null,
      severeSafety ? 'ACWR ou rampa de carga estão elevados.' : null,
      input.recentHardCount >= 2 ? 'A semana já trouxe mais de um estímulo intenso recente.' : null,
      input.recentLong ? 'Houve um treino longo recente.' : null,
      keyVeryClose ? 'O próximo treino-chave está muito próximo e em risco.' : null,
    ].filter(Boolean) as string[];
    if (isRecoveryPhase || (severeSafety && keyVeryClose)) {
      return descansoSuggestion(`${reasonParts.join(' ')} Fase de recuperação ou risco combinado: a opção mais segura é descanso completo.`);
    }
    const category = avoidRepeat('recuperacao_ativa', 'mobilidade', input.recentSuggestionCategories);
    return build(category, `${reasonParts.join(' ')} Esta opção não adiciona um novo estímulo de treino.`, input.nextKeyName);
  }

  if (input.lowCadence) {
    const category = avoidRepeat('tecnica_cadencia', 'endurance_leve', input.recentSuggestionCategories);
    return build(category, 'Prontidão favorável e pouco trabalho recente de cadência.', input.nextKeyName);
  }

  const category = avoidRepeat('endurance_leve', anySafety ? 'mobilidade' : 'tecnica_cadencia', input.recentSuggestionCategories);
  return build(
    category,
    anySafety
      ? 'Recuperação favorável, mas sinais de carga moderados sugerem variar em relação à última sugestão.'
      : 'Recuperação favorável e carga recente controlada.',
    input.nextKeyName,
  );
}
