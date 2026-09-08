import assert from 'node:assert/strict';
import test from 'node:test';
import { chooseOffDaySuggestion, type OffDayInput } from '../lib/off-day-suggestions.ts';

const base: OffDayInput = {
  classification: 'verde',
  safetyFlags: [],
  phase: 'desconhecida',
  recentHardCount: 0,
  recentLong: false,
  lowCadence: false,
  recentSuggestionCategories: [],
};

test('recuperação favorável e carga controlada sugere endurance leve', () => {
  const suggestion = chooseOffDaySuggestion(base);
  assert.equal(suggestion.category, 'endurance_leve');
});

test('dor relevante no check-in sempre vira descanso completo, nunca intensidade', () => {
  const suggestion = chooseOffDaySuggestion({ ...base, checkin: { dor: 5 } });
  assert.equal(suggestion.category, 'descanso');
});

test('sintomas relevantes sempre viram descanso completo', () => {
  const suggestion = chooseOffDaySuggestion({ ...base, checkin: { sintomas: 4 } });
  assert.equal(suggestion.category, 'descanso');
});

test('ACWR severo evita intensidade e sugere opção de baixo custo', () => {
  const suggestion = chooseOffDaySuggestion({ ...base, safetyFlags: [{ id: 'acwr_high', severity: 'severa' }] });
  assert.ok(['recuperacao_ativa', 'mobilidade', 'descanso'].includes(suggestion.category));
});

test('treino-chave muito próximo com risco alto evita adicionar estímulo', () => {
  const suggestion = chooseOffDaySuggestion({ ...base, daysToNextKey: 1, forecastRisk: 'alto' });
  assert.ok(['recuperacao_ativa', 'mobilidade', 'descanso'].includes(suggestion.category));
});

test('ACWR severo combinado a treino-chave muito próximo vira descanso completo', () => {
  const suggestion = chooseOffDaySuggestion({ ...base, safetyFlags: [{ id: 'acwr_high', severity: 'severa' }], daysToNextKey: 1, forecastRisk: 'alto' });
  assert.equal(suggestion.category, 'descanso');
});

test('fase de recuperação com risco elevado prefere descanso completo', () => {
  const suggestion = chooseOffDaySuggestion({ ...base, classification: 'amarela', phase: 'Recovery' });
  assert.equal(suggestion.category, 'descanso');
});

test('baixa cadência recente sugere técnica de cadência quando não há risco', () => {
  const suggestion = chooseOffDaySuggestion({ ...base, lowCadence: true });
  assert.equal(suggestion.category, 'tecnica_cadencia');
});

test('não repete a mesma categoria duas vezes seguidas sem justificativa nova', () => {
  const suggestion = chooseOffDaySuggestion({ ...base, recentSuggestionCategories: ['endurance_leve', 'endurance_leve'] });
  assert.notEqual(suggestion.category, 'endurance_leve');
});

test('repetição isolada (uma vez) não é penalizada', () => {
  const suggestion = chooseOffDaySuggestion({ ...base, recentSuggestionCategories: ['endurance_leve'] });
  assert.equal(suggestion.category, 'endurance_leve');
});

test('descanso completo é apresentado com benefício positivo, nunca como falha', () => {
  const suggestion = chooseOffDaySuggestion({ ...base, checkin: { dor: 6 } });
  assert.equal(suggestion.category, 'descanso');
  assert.match(suggestion.benefit, /parte do plano, não uma falha/);
});

test('toda sugestão explica benefício, custo de carga e impacto no próximo treino', () => {
  for (const input of [
    base,
    { ...base, lowCadence: true },
    { ...base, safetyFlags: [{ id: 'acwr_high' as const, severity: 'severa' as const }] },
    { ...base, checkin: { dor: 6 } },
  ]) {
    const suggestion = chooseOffDaySuggestion(input);
    assert.ok(suggestion.benefit.length > 0);
    assert.ok(suggestion.loadCost.length > 0);
    assert.ok(suggestion.nextWorkoutImpact.length > 0);
    assert.ok(suggestion.reason.length > 0);
  }
});
