import assert from 'node:assert/strict';
import test from 'node:test';
import { decideTraining, type DecisionInput } from '../lib/decision-engine.ts';

const base: DecisionInput = {
  classification: 'verde',
  blocked: false,
  phase: 'desconhecida',
  objective: 'performance',
  protectSpecificity: false,
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
  const decision = decideTraining({ ...base, classification: 'amarela', phase: 'C2W2 Build', objective: 'saude' });
  assert.equal(decision.action, 'reduzir_repeticoes');
  assert.equal(decision.stimulusPreserved, 'intensidade');
});

test('fase de recovery/deload prefere reduzir intensidade e preservar duração', () => {
  const decision = decideTraining({ ...base, classification: 'amarela', phase: 'Recovery', objective: 'ftp' });
  assert.equal(decision.action, 'reduzir_intensidade');
  assert.equal(decision.stimulusPreserved, 'duração');
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

test('especificidade protegida evita reduzir intensidade mesmo em objetivo de resistência', () => {
  const decision = decideTraining({ ...base, classification: 'amarela', objective: 'resistencia', protectSpecificity: true });
  assert.equal(decision.action, 'reduzir_intensidade');
});
