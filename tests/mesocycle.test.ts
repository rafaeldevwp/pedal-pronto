import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCyclePointer, parseCyclePointer, resolveMesocycle, resolvePhase } from '../lib/mesocycle.ts';

test('calcula dias, viradas de semana e ciclo em blocos de 28 dias', () => {
  assert.deepEqual(calculateCyclePointer('2026-01-05', '2026-01-05'), { cycle: 1, week: 1, day: 1 });
  assert.deepEqual(calculateCyclePointer('2026-01-05', '2026-01-12'), { cycle: 1, week: 2, day: 1 });
  assert.deepEqual(calculateCyclePointer('2026-01-05', '2026-02-02'), { cycle: 2, week: 1, day: 1 });
});

test('extrai C/W/D e ignora nomes sem ponteiro', () => {
  assert.deepEqual(parseCyclePointer('C3W2D6 - Longo'), { cycle: 3, week: 2, day: 6 });
  assert.equal(parseCyclePointer('Descanso'), undefined);
});

test('resolvePhase: semanas 1 a 3 são build, semana 4 é recovery, sem ponteiro é desconhecida', () => {
  assert.equal(resolvePhase({ cycle: 1, week: 1, day: 1 }), 'build');
  assert.equal(resolvePhase({ cycle: 1, week: 2, day: 1 }), 'build');
  assert.equal(resolvePhase({ cycle: 1, week: 3, day: 1 }), 'build');
  assert.equal(resolvePhase({ cycle: 1, week: 4, day: 1 }), 'recovery');
  assert.equal(resolvePhase(undefined), 'desconhecida');
});

test('resolve fase automaticamente pela semana, sem cadastro manual', () => {
  const matching = resolveMesocycle('2026-01-05', '2026-01-12', 'C1W2D1');
  assert.equal(matching.phase, 'build');
  assert.equal(matching.warning, null);
});

test('divergência entre calculado e evento gera aviso, mas a fase continua vindo da semana calculada', () => {
  const mismatch = resolveMesocycle('2026-01-05', '2026-01-12', 'C2W1D1');
  assert.equal(mismatch.phase, 'build');
  assert.match(mismatch.warning!, /Nenhuma correção/);
});

test('última semana do ciclo resolve como recovery automaticamente', () => {
  const result = resolveMesocycle('2026-01-05', '2026-01-26', '');
  assert.deepEqual(result.calculated, { cycle: 1, week: 4, day: 1 });
  assert.equal(result.phase, 'recovery');
});

test('sem âncora mantém estado e fase explicitamente desconhecidos', () => {
  const result = resolveMesocycle(undefined, '2026-01-12', 'Descanso');
  assert.equal(result.calculated, null);
  assert.equal(result.phase, 'desconhecida');
});
