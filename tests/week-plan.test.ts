import assert from 'node:assert/strict';
import test from 'node:test';
import { pairActivitiesWithPlanned } from '../lib/week-plan.ts';

const planned = (date: string, name: string) => ({ date, name });
const done = (date: string, id: string) => ({ date, id });

test('o caso comum: um planejado e um pedal no mesmo dia se encontram', () => {
  const { pairs, unmatchedPlanned } = pairActivitiesWithPlanned(
    [done('2026-09-09', 'a1')],
    [planned('2026-09-09', '4x 8min')],
  );
  assert.equal(pairs[0].planned?.name, '4x 8min');
  assert.deepEqual(unmatchedPlanned, []);
});

test('dois pedais no mesmo dia: só o primeiro herda o treino planejado', () => {
  const { pairs } = pairActivitiesWithPlanned(
    [done('2026-09-09', 'principal'), done('2026-09-09', 'deslocamento')],
    [planned('2026-09-09', '4x 8min')],
  );
  assert.equal(pairs[0].planned?.name, '4x 8min');
  assert.equal(pairs[1].planned, undefined);
});

test('dois planejados e um pedal: o planejado restante continua visível na semana', () => {
  const { pairs, unmatchedPlanned } = pairActivitiesWithPlanned(
    [done('2026-09-09', 'a1')],
    [planned('2026-09-09', '4x 8min'), planned('2026-09-09', 'Técnica 30min')],
  );
  assert.equal(pairs[0].planned?.name, '4x 8min');
  assert.equal(unmatchedPlanned.length, 1);
  assert.equal(unmatchedPlanned[0].name, 'Técnica 30min');
});

test('pedal em dia sem treino planejado não inventa plano', () => {
  const { pairs, unmatchedPlanned } = pairActivitiesWithPlanned(
    [done('2026-09-11', 'extra')],
    [planned('2026-09-09', '4x 8min')],
  );
  assert.equal(pairs[0].planned, undefined);
  assert.equal(unmatchedPlanned.length, 1);
});

test('dias diferentes não se misturam', () => {
  const { pairs, unmatchedPlanned } = pairActivitiesWithPlanned(
    [done('2026-09-09', 'a1'), done('2026-09-10', 'a2')],
    [planned('2026-09-10', 'Longo'), planned('2026-09-09', 'Tempo')],
  );
  assert.equal(pairs[0].planned?.name, 'Tempo');
  assert.equal(pairs[1].planned?.name, 'Longo');
  assert.deepEqual(unmatchedPlanned, []);
});

test('semana sem nenhuma atividade preserva todos os planejados', () => {
  const { pairs, unmatchedPlanned } = pairActivitiesWithPlanned([], [planned('2026-09-09', 'Tempo')]);
  assert.deepEqual(pairs, []);
  assert.equal(unmatchedPlanned.length, 1);
});
