import assert from 'node:assert/strict';
import test from 'node:test';
import { assertDayAvailableForCreation, assertEditablePlannedEvent, proposalFingerprint } from '../lib/training-safety-core.ts';

const planned = { id: 42, category: 'WORKOUT', start_date_local: '2026-09-09T07:00:00', name: 'Tempo', description: '- 30m 85%' };

test('permite somente evento planejado ainda não executado', () => {
  assert.equal(assertEditablePlannedEvent(planned, [], '2026-09-08'), '2026-09-09');
});

test('bloqueia evento passado ou marcado como concluído', () => {
  assert.throws(() => assertEditablePlannedEvent({ ...planned, start_date_local: '2026-09-07T07:00:00' }, [], '2026-09-08'), /EVENT_NOT_EDITABLE/);
  assert.throws(() => assertEditablePlannedEvent({ ...planned, completed: true }, [], '2026-09-08'), /WORKOUT_COMPLETED/);
});

test('bloqueia atividade ligada ao evento', () => {
  assert.throws(() => assertEditablePlannedEvent(planned, [{ paired_event_id: 42 }], '2026-09-08'), /WORKOUT_COMPLETED/);
});

test('bloqueia escrita no dia quando já há atividade sincronizada', () => {
  const today = { ...planned, start_date_local: '2026-09-08T07:00:00' };
  assert.throws(() => assertEditablePlannedEvent(today, [{ id: 'activity-1' }], '2026-09-08'), /WORKOUT_COMPLETED/);
});

test('bloqueia criação em dia OFF quando já existe evento ou atividade', () => {
  assert.throws(() => assertDayAvailableForCreation([planned], []), /EVENT_NOT_EDITABLE/);
  assert.throws(() => assertDayAvailableForCreation([], [{ id: 'activity-2' }]), /WORKOUT_COMPLETED/);
  assert.doesNotThrow(() => assertDayAvailableForCreation([], []));
});

test('a proposta muda quando o treino original muda', () => {
  const recommended = { ...planned, description: '- 25m 85%' };
  assert.notEqual(proposalFingerprint(planned, recommended), proposalFingerprint({ ...planned, description: '- 35m 85%' }, recommended));
});
