import assert from 'node:assert/strict';
import test from 'node:test';
import { anchorFromEvent, calculateCyclePointer, parseCyclePointer, resolveMesocycle, resolveMesocycleFromEvents, resolvePhase } from '../lib/mesocycle.ts';

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

// SPEC-28: a fase passa a vir do código no nome do treino, não de âncora cadastrada à mão.

test('deriva a âncora implícita a partir de um evento com código no nome', () => {
  assert.equal(anchorFromEvent({ cycle: 1, week: 1, day: 1 }, '2026-01-05'), '2026-01-05');
  assert.equal(anchorFromEvent({ cycle: 1, week: 2, day: 1 }, '2026-01-12'), '2026-01-05');
  assert.equal(anchorFromEvent({ cycle: 2, week: 1, day: 1 }, '2026-02-02'), '2026-01-05');
});

test('o treino de hoje com código define a fase diretamente', () => {
  const result = resolveMesocycleFromEvents([{ date: '2026-01-26', name: 'C1W4D1 - Recuperação' }], '2026-01-26');
  assert.deepEqual(result.calculated, { cycle: 1, week: 4, day: 1 });
  assert.equal(result.phase, 'recovery');
  assert.equal(result.inherited, false);
});

test('sem código hoje, herda o último ciclo conhecido avançando a contagem', () => {
  const events = [
    { date: '2026-01-05', name: 'C1W1D1 - Base' },
    { date: '2026-01-12', name: 'C1W2D1 - Tempo' },
    { date: '2026-01-14', name: 'Rolo livre' },
  ];
  const result = resolveMesocycleFromEvents(events, '2026-01-14');
  assert.deepEqual(result.calculated, { cycle: 1, week: 2, day: 3 });
  assert.equal(result.phase, 'build');
  assert.equal(result.inherited, true);
  assert.equal(result.reference?.name, 'C1W2D1 - Tempo');
});

test('a herança atravessa a virada de semana e chega em recovery sozinha', () => {
  const result = resolveMesocycleFromEvents([{ date: '2026-01-05', name: 'C1W1D1' }], '2026-01-26');
  assert.deepEqual(result.calculated, { cycle: 1, week: 4, day: 1 });
  assert.equal(result.phase, 'recovery');
});

test('nenhum treino com código deixa a fase explicitamente desconhecida', () => {
  const result = resolveMesocycleFromEvents([{ date: '2026-01-12', name: 'Descanso' }], '2026-01-14');
  assert.equal(result.calculated, null);
  assert.equal(result.anchor, null);
  assert.equal(result.phase, 'desconhecida');
});

test('eventos futuros não são usados como referência da fase de hoje', () => {
  const events = [
    { date: '2026-01-05', name: 'C1W1D1' },
    { date: '2026-02-02', name: 'C2W1D1' },
  ];
  const result = resolveMesocycleFromEvents(events, '2026-01-07');
  assert.equal(result.reference?.date, '2026-01-05');
  assert.deepEqual(result.calculated, { cycle: 1, week: 1, day: 3 });
});
