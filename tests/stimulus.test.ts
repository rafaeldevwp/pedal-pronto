import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyStimulus, computeStimulusCoverage, describeMissingKeyStimulus, isWeekKeySourceFor } from '../lib/stimulus.ts';

test('classifica VO2max por intensidade alta', () => {
  assert.equal(classifyStimulus({ durationMinutes: 60, structure: ['- 15m 50%', '- 5x 4min 110%, 3min 45%', '- 10m 45%'] }), 'vo2max');
});

test('classifica limiar por intensidade moderada-alta', () => {
  assert.equal(classifyStimulus({ durationMinutes: 60, structure: ['- 15m 50%', '- 20min 95%', '- 10m 45%'] }), 'limiar');
});

test('classifica endurance por duração longa e baixa intensidade', () => {
  assert.equal(classifyStimulus({ durationMinutes: 90, structure: ['- 90m 60%'] }), 'endurance');
});

test('classifica recuperação por duração curta e baixa intensidade', () => {
  assert.equal(classifyStimulus({ durationMinutes: 25, structure: ['- 25m 45%'] }), 'recuperacao');
});

test('sem estrutura reconhecível, duração decide entre endurance e recuperação', () => {
  assert.equal(classifyStimulus({ durationMinutes: 20, structure: [] }), 'recuperacao');
  assert.equal(classifyStimulus({ durationMinutes: 60, structure: [] }), 'endurance');
});

test('cobertura semanal: sessão realizada marca entregue, planejada marca planejado', () => {
  const coverage = computeStimulusCoverage([
    { status: 'realizado', durationMinutes: 90, structure: ['- 90m 60%'] },
    { status: 'planejado', durationMinutes: 60, structure: ['- 20min 95%'] },
  ]);
  assert.equal(coverage.endurance, 'entregue');
  assert.equal(coverage.limiar, 'planejado');
  assert.equal(coverage.vo2max, 'pendente');
});

test('realizado nunca é rebaixado por um planejado do mesmo tipo depois', () => {
  const coverage = computeStimulusCoverage([
    { status: 'realizado', durationMinutes: 60, structure: ['- 20min 95%'] },
    { status: 'planejado', durationMinutes: 60, structure: ['- 20min 95%'] },
  ]);
  assert.equal(coverage.limiar, 'entregue');
});

test('descreve estímulo-chave faltante quando limiar e VO2max estão pendentes', () => {
  const coverage = computeStimulusCoverage([{ status: 'realizado', durationMinutes: 90, structure: ['- 90m 60%'] }]);
  const message = describeMissingKeyStimulus(coverage);
  assert.match(message!, /limiar/);
  assert.match(message!, /VO2max/);
});

test('não aponta lacuna quando o próprio treino de hoje é do tipo que faltava', () => {
  const coverage = computeStimulusCoverage([]);
  const message = describeMissingKeyStimulus(coverage, 'vo2max');
  assert.match(message!, /limiar/);
  assert.doesNotMatch(message!, /VO2max/);
});

test('isWeekKeySourceFor identifica quando o treino de hoje é a única fonte pendente daquele estímulo', () => {
  const coverage = computeStimulusCoverage([]);
  assert.equal(isWeekKeySourceFor(coverage, 'vo2max'), true);
  assert.equal(isWeekKeySourceFor(coverage, 'endurance'), false);
});

test('isWeekKeySourceFor é falso quando o estímulo já foi entregue por outra sessão', () => {
  const coverage = computeStimulusCoverage([{ status: 'realizado', durationMinutes: 60, structure: ['- 20min 95%'] }]);
  assert.equal(isWeekKeySourceFor(coverage, 'limiar'), false);
});
