export type SafetyFlag = { id: 'acwr_high' | 'ramp_rate_exceeded'; severity: 'moderada' | 'severa' };
export type Objective = 'performance' | 'resistencia' | 'ftp' | 'saude';

export type DecisionInput = {
  classification: 'verde' | 'amarela' | 'vermelha' | 'indisponível';
  blocked: boolean;
  phase: string;
  objective: Objective;
  protectSpecificity: boolean;
  safetyFlags: SafetyFlag[];
  workout: { name: string; durationMinutes?: number; load?: number; structure?: string[] } | null;
  isRestDay: boolean;
  daysToNextKey?: number;
  forecastRisk?: 'baixo' | 'moderado' | 'alto' | 'indeterminado';
};

export type EngineDecision = {
  action: 'manter' | 'reduzir_intensidade' | 'reduzir_repeticoes' | 'substituir_recuperacao' | 'suspender';
  stimulusPreserved: string;
  reasons: string[];
  recommended: { name: string; durationMinutes?: number; load?: number; descriptionChange?: string } | null;
  weeklyEffect: string;
};

const objectiveNames: Record<Objective, string> = {
  performance: 'performance geral', resistencia: 'resistência', ftp: 'potência/FTP', saude: 'saúde e consistência',
};

function safetyReasons(flags: SafetyFlag[]): string[] {
  return flags.map((flag) =>
    flag.id === 'acwr_high'
      ? `ACWR ${flag.severity === 'severa' ? 'muito elevado' : 'elevado'} nos últimos 7 dias frente aos últimos 28.`
      : 'Rampa de fitness (CTL) acima do teto configurado.',
  );
}

function reduceIntensity(workout: { name: string; durationMinutes?: number; load?: number; structure?: string[] }) {
  const text = (workout.structure || []).join('\n');
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
      descriptionChange: `Intensidade principal reduzida de ${from}% para ${to}%; duração preservada.`,
    },
  };
}

function reduceRepetitions(workout: { name: string; durationMinutes?: number; load?: number; structure?: string[] }) {
  const text = (workout.structure || []).join('\n');
  const reps = text.match(/\b([2-9]|[1-9]\d)x\b/i);
  if (!reps) return null;
  const from = Number(reps[1]), to = Math.max(2, from - 1);
  return {
    action: 'reduzir_repeticoes' as const,
    stimulusPreserved: 'intensidade',
    recommended: {
      name: workout.name.replace(new RegExp(`\\b${from}x`, 'i'), `${to}x`),
      durationMinutes: workout.durationMinutes ? Math.round(workout.durationMinutes * 0.9) : undefined,
      load: workout.load ? Math.round(workout.load * 0.84) : undefined,
      descriptionChange: `Repetições reduzidas de ${from} para ${to}; intensidade preservada.`,
    },
  };
}

const recoveryRecommendation = {
  name: 'Recuperação leve — ajuste do motor adaptativo',
  durationMinutes: 30,
  load: 18,
  descriptionChange: 'Substituído por recuperação leve (10m 45% · 15m 50% · 5m 40%).',
};

export function decideTraining(input: DecisionInput): EngineDecision {
  if (input.blocked) {
    return {
      action: 'suspender',
      stimulusPreserved: 'nenhum',
      reasons: ['Dados obrigatórios estão ausentes, atrasados ou contraditórios; nenhuma proposta é gerada até a divergência ser resolvida.'],
      recommended: null,
      weeklyEffect: 'Nenhuma mudança na semana.',
    };
  }
  if (input.classification === 'indisponível' || input.isRestDay || !input.workout) {
    return {
      action: 'manter',
      stimulusPreserved: 'plano original',
      reasons: [
        input.isRestDay
          ? 'Dia de descanso fixo preservado.'
          : !input.workout
            ? 'Não há treino planejado hoje; nenhuma alteração proposta.'
            : 'Prontidão indisponível; nenhuma alteração proposta por segurança.',
      ],
      recommended: null,
      weeklyEffect: 'Nenhuma mudança na semana.',
    };
  }

  const severeSafety = input.safetyFlags.some((flag) => flag.severity === 'severa');
  const phaseLower = input.phase.toLowerCase();
  const isRecoveryPhase = /recovery|deload|recupera/.test(phaseLower);
  const isProgressionPhase = /build|peak|choque|carga/.test(phaseLower);
  const phaseNote = isProgressionPhase
    ? `Fase ${input.phase}: em progressão, a intensidade-alvo é preservada quando possível e o volume é o primeiro a ceder.`
    : isRecoveryPhase
      ? `Fase ${input.phase}: de recuperação, o volume é reduzido primeiro para favorecer a absorção do bloco anterior.`
      : input.phase === 'desconhecida'
        ? 'Fase do mesociclo não cadastrada: aplicamos a regra padrão do objetivo.'
        : `Fase ${input.phase}: sem regra específica cadastrada, aplicamos a regra padrão do objetivo.`;

  if (input.classification === 'vermelha') {
    const reasons = ['Prontidão vermelha: recuperação insuficiente hoje.', ...safetyReasons(input.safetyFlags)];
    return {
      action: 'substituir_recuperacao',
      stimulusPreserved: 'nenhum (prioriza recuperação)',
      reasons,
      recommended: recoveryRecommendation,
      weeklyEffect: 'Reduz a carga de hoje; o estímulo pendente pode ser redistribuído nos próximos dias, se a disponibilidade permitir.',
    };
  }

  const treatAsCaution = input.classification === 'amarela' || severeSafety;
  if (!treatAsCaution) {
    const reasons = ['Prontidão verde; boa prontidão isolada não aumenta a sessão.'];
    if (input.safetyFlags.length) reasons.push(...safetyReasons(input.safetyFlags), 'Sinais de carga moderados, mas ainda dentro de margem para manter o plano.');
    return { action: 'manter', stimulusPreserved: 'plano original', reasons, recommended: null, weeklyEffect: 'Nenhuma mudança na semana.' };
  }

  const reasons = [
    input.classification === 'amarela'
      ? 'Prontidão amarela: cautela recomendada; no máximo uma variável do treino muda.'
      : 'Prontidão verde, mas sinais de carga acumulada pedem cautela; no máximo uma variável do treino muda.',
    ...safetyReasons(input.safetyFlags),
    phaseNote,
  ];
  if (input.daysToNextKey !== undefined && input.daysToNextKey <= 1 && input.forecastRisk === 'alto')
    reasons.push('O próximo treino-chave está a menos de 24 horas; preservar a recuperação de hoje protege esse estímulo.');
  reasons.push(`Objetivo de ${objectiveNames[input.objective]} considerado.`);

  const preferReduceVolumeFirst = isProgressionPhase || (!isRecoveryPhase && !input.protectSpecificity && (input.objective === 'resistencia' || input.objective === 'saude'));
  const picked = preferReduceVolumeFirst
    ? reduceRepetitions(input.workout) || reduceIntensity(input.workout)
    : reduceIntensity(input.workout) || reduceRepetitions(input.workout);

  if (!picked) {
    reasons.push('A estrutura do treino não tem um padrão reconhecido de repetições ou intensidade para reduzir uma única variável; recomendação conservadora aplicada.');
    return {
      action: 'substituir_recuperacao',
      stimulusPreserved: 'nenhum (estrutura não reconhecida)',
      reasons,
      recommended: recoveryRecommendation,
      weeklyEffect: 'Reduz a carga de hoje para manter margem de segurança.',
    };
  }
  return { ...picked, reasons, weeklyEffect: 'Reduz o custo fisiológico de hoje preservando o estímulo principal da semana.' };
}
