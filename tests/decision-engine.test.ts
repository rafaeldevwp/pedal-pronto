import assert from 'node:assert/strict';
import test from 'node:test';
import { adjustWorkoutPlan, decideTraining, preferVolumeReduction, type DecisionInput } from '../lib/decision-engine.ts';

const base: DecisionInput = {
  classification: 'verde',
  blocked: false,
  phase: 'desconhecida',
  safetyFlags: [],
  workout: { name: '4x 8min 92%', durationMinutes: 60, load: 55, structure: ['- 15m 50%', '- 4x 8min 92%, 4min 50%', '- 10m 45%'] },
  isRestDay: false,
};

test('dados bloqueados suspendem qualquer proposta', () => {
  const decision = decideTraining({ ...base, blocked: true });
  assert.equal(decision.action, 'suspender');
  assert.equal(decision.recommended, null);
});

test('verde sem sinais de carga mantém o plano sem aumentar', () => {
  const decision = decideTraining(base);
  assert.equal(decision.action, 'manter');
  assert.equal(decision.recommended, null);
  assert.match(decision.reasons[0], /não aumenta/);
});

test('verde com ACWR severo é tratado como cautela e reduz só uma variável', () => {
  const decision = decideTraining({ ...base, safetyFlags: [{ id: 'acwr_high', severity: 'severa' }] });
  assert.notEqual(decision.action, 'manter');
  assert.notEqual(decision.action, 'substituir_recuperacao');
  assert.ok(['reduzir_intensidade', 'reduzir_repeticoes'].includes(decision.action));
});

test('amarela reduz no máximo uma variável, nunca substitui o treino inteiro', () => {
  const decision = decideTraining({ ...base, classification: 'amarela' });
  assert.ok(['reduzir_intensidade', 'reduzir_repeticoes'].includes(decision.action));
});

test('amarela combinada a ACWR severo continua limitada a uma variável (regra imutável)', () => {
  const decision = decideTraining({ ...base, classification: 'amarela', safetyFlags: [{ id: 'acwr_high', severity: 'severa' }] });
  assert.ok(['reduzir_intensidade', 'reduzir_repeticoes'].includes(decision.action), 'amarela nunca pode escalar para substituição completa');
});

test('vermelha sempre substitui por recuperação, mesmo em fase de build', () => {
  const decision = decideTraining({ ...base, classification: 'vermelha', phase: 'build' });
  assert.equal(decision.action, 'substituir_recuperacao');
  assert.equal(decision.recommended?.name, 'Recuperação leve — ajuste do motor adaptativo');
});

test('fase de build prefere reduzir repetições e preservar intensidade', () => {
  const decision = decideTraining({ ...base, classification: 'amarela', phase: 'build' });
  assert.equal(decision.action, 'reduzir_repeticoes');
  assert.equal(decision.stimulusPreserved, 'intensidade');
});

test('fase de recovery prefere reduzir intensidade e preservar duração', () => {
  const decision = decideTraining({ ...base, classification: 'amarela', phase: 'recovery' });
  assert.equal(decision.action, 'reduzir_intensidade');
  assert.equal(decision.stimulusPreserved, 'duração');
});

test('sem âncora configurada (fase desconhecida) segue a regra padrão de progressão', () => {
  const decision = decideTraining({ ...base, classification: 'amarela', phase: 'desconhecida' });
  assert.equal(decision.action, 'reduzir_repeticoes');
  assert.equal(decision.stimulusPreserved, 'intensidade');
});

test('proximidade do treino-chave com risco alto aparece nas justificativas', () => {
  const decision = decideTraining({ ...base, classification: 'amarela', daysToNextKey: 1, forecastRisk: 'alto' });
  assert.ok(decision.reasons.some((reason) => reason.includes('próximo treino-chave')));
});

test('dia de descanso fixo nunca gera proposta', () => {
  const decision = decideTraining({ ...base, classification: 'amarela', isRestDay: true });
  assert.equal(decision.action, 'manter');
  assert.equal(decision.recommended, null);
});

test('sem treino planejado não gera proposta', () => {
  const decision = decideTraining({ ...base, workout: null });
  assert.equal(decision.action, 'manter');
});

test('estrutura sem repetições nem intensidade reconhecível vira recuperação conservadora', () => {
  const decision = decideTraining({ ...base, classification: 'amarela', workout: { name: 'Endurance livre', durationMinutes: 90, load: 60, structure: ['- 90m endurance'] } });
  assert.equal(decision.action, 'substituir_recuperacao');
});

test('preferVolumeReduction: build/peak sempre prefere reduzir volume', () => {
  assert.equal(preferVolumeReduction('C2W2 Build'), true);
  assert.equal(preferVolumeReduction('Peak'), true);
});

test('preferVolumeReduction: recovery/deload nunca prefere reduzir volume', () => {
  assert.equal(preferVolumeReduction('Recovery'), false);
  assert.equal(preferVolumeReduction('deload'), false);
});

test('preferVolumeReduction: fase desconhecida (sem âncora) segue a regra padrão de progressão', () => {
  assert.equal(preferVolumeReduction('desconhecida'), true);
});

const emptyCoverage = { endurance: 'pendente' as const, limiar: 'pendente' as const, vo2max: 'pendente' as const, recuperacao: 'pendente' as const };

test('protege intensidade quando o treino de hoje é a única fonte de VO2max da semana, mesmo em fase de recovery', () => {
  const decision = decideTraining({
    ...base, classification: 'amarela', phase: 'recovery',
    stimulusCoverage: emptyCoverage, todayStimulus: 'vo2max',
  });
  assert.equal(decision.action, 'reduzir_repeticoes');
  assert.equal(decision.stimulusPreserved, 'intensidade');
  assert.ok(decision.reasons.some((reason) => reason.includes('única sessão prevista')));
});

test('não protege estímulo já entregue por outra sessão da semana', () => {
  const covered = { ...emptyCoverage, vo2max: 'entregue' as const };
  const decision = decideTraining({
    ...base, classification: 'amarela', phase: 'recovery',
    stimulusCoverage: covered, todayStimulus: 'vo2max',
  });
  assert.equal(decision.action, 'reduzir_intensidade');
});

test('sem coverage/todayStimulus informados, comportamento permanece igual ao de antes', () => {
  const decision = decideTraining({ ...base, classification: 'amarela', phase: 'recovery' });
  assert.equal(decision.action, 'reduzir_intensidade');
});

test('função única reconhece 2x e reduz duração e carga pela mesma regra', () => {
  const workout = { name: '2x 12min 92%', durationMinutes: 60, load: 50, description: '- 2x 12min 92%' };
  const today = adjustWorkoutPlan(workout, 'amarela', 'build');
  const future = adjustWorkoutPlan(workout, 'amarela', 'build');
  assert.deepEqual(today, future);
  assert.equal(today?.action, 'reduzir_repeticoes');
  assert.equal(today?.recommended.durationMinutes, 54);
  assert.equal(today?.recommended.load, 42);
});

test('template de recuperação é único para qualquer caminho vermelho', () => {
  const result = adjustWorkoutPlan(base.workout!, 'vermelha', 'build');
  assert.equal(result?.recommended.durationMinutes, 30);
  assert.equal(result?.recommended.load, 18);
  assert.match(result?.recommended.description || '', /10m 45%/);
});
