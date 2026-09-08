import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAthleteSnapshot } from '../lib/context.ts';
import type { ReadinessResult } from '../lib/readiness.ts';

const baseReadiness: ReadinessResult = {
  classification: 'verde',
  score: 4,
  changed: false,
  title: 'Pronto para o treino',
  summary: 'Treino mantido sem aumento.',
  evidence: [],
  recovery: 'Hidrate-se e siga o plano sem aumentar a sessão.',
  loadTrend: [],
  workout: { name: 'C1W2D1 - Endurance', durationMinutes: 60, load: 50, action: 'Treino mantido sem aumento.' },
  metrics: { ctl: 40, atl: 35, form: 5, acwr: 1.1, ramp: 3, rampLimit: 6, safetyFlags: [] },
  updatedAt: '2026-01-12T12:00:00.000Z',
};

const now = new Date('2026-01-12T12:00:00.000Z');

test('snapshot completo: tudo válido e nada bloqueado', () => {
  const snapshot = buildAthleteSnapshot({
    readiness: baseReadiness,
    mesocycle: { anchor: '2026-01-05', calculated: { cycle: 1, week: 2, day: 1 }, event: { cycle: 1, week: 2, day: 1 }, phase: 'build', warning: null, anchorUpdatedAt: '2026-01-05T00:00:00.000Z' },
    goal: { objective: 'performance', priority: 'principal', updatedAt: '2026-01-01T00:00:00.000Z' },
    checkin: { fadiga: 4, dor: 0, estresse: 3, pernas: 7, motivacao: 7, sintomas: 0, tempoDisponivel: 60 },
    now,
  });
  assert.equal(snapshot.readiness.quality, 'válido');
  assert.equal(snapshot.mesocycle.quality, 'válido');
  assert.equal(snapshot.goal.quality, 'válido');
  assert.equal(snapshot.checkin.quality, 'válido');
  assert.equal(snapshot.blocked, false);
  assert.deepEqual(snapshot.blockReasons, []);
  assert.equal(snapshot.mesocycle.value?.phase, 'build');
});

test('snapshot parcial: sem âncora e sem check-in não bloqueia, só marca ausente', () => {
  const snapshot = buildAthleteSnapshot({
    readiness: baseReadiness,
    mesocycle: { anchor: null, calculated: null, event: null, phase: 'desconhecida', warning: null },
    goal: { objective: 'performance', priority: 'principal' },
    now,
  });
  assert.equal(snapshot.mesocycle.quality, 'ausente');
  assert.equal(snapshot.mesocycle.value, null);
  assert.equal(snapshot.checkin.quality, 'ausente');
  assert.equal(snapshot.blocked, false, 'ausência de âncora/check-in não deve bloquear proposta sozinha');
});

test('snapshot com sessão expirada: prontidão ausente e bloqueia', () => {
  const expired: ReadinessResult = {
    classification: 'indisponível',
    score: 0,
    changed: false,
    title: 'Decisão suspensa',
    summary: 'Treino não modificado.',
    evidence: [],
    recovery: 'Sincronize o relógio e tente novamente mais tarde.',
    loadTrend: [],
    workout: null,
    metrics: {},
    updatedAt: '2026-01-12T12:00:00.000Z',
    warning: 'Uma das sessões expirou. Autentique novamente antes de qualquer alteração.',
    reasonCode: 'sessao_expirada',
  };
  const snapshot = buildAthleteSnapshot({
    readiness: expired,
    mesocycle: { anchor: null, calculated: null, event: null, phase: 'desconhecida', warning: null },
    goal: null,
    now,
  });
  assert.equal(snapshot.readiness.quality, 'ausente');
  assert.equal(snapshot.readiness.value, null);
  assert.equal(snapshot.goal.quality, 'ausente');
  assert.equal(snapshot.blocked, true);
  assert.match(snapshot.blockReasons[0], /expirou/);
});

test('snapshot com sincronização atrasada do Polar', () => {
  const late: ReadinessResult = {
    ...baseReadiness,
    classification: 'indisponível',
    warning: 'Dados recentes de sono ou Nightly Recharge ainda não chegaram do Polar.',
    reasonCode: 'atrasado',
  };
  const snapshot = buildAthleteSnapshot({
    readiness: late,
    mesocycle: { anchor: '2026-01-05', calculated: { cycle: 1, week: 2, day: 1 }, event: null, phase: 'build', warning: null },
    goal: { objective: 'performance', priority: 'principal' },
    now,
  });
  assert.equal(snapshot.readiness.quality, 'atrasado');
  assert.equal(snapshot.blocked, true);
});

test('snapshot com divergência de mesociclo: contraditório e bloqueia mesmo com prontidão válida', () => {
  const snapshot = buildAthleteSnapshot({
    readiness: baseReadiness,
    mesocycle: {
      anchor: '2026-01-05',
      calculated: { cycle: 1, week: 2, day: 1 },
      event: { cycle: 2, week: 1, day: 1 },
      phase: 'desconhecida',
      warning: 'O ponteiro calculado C1W2D1 diverge do evento C2W1D1. Nenhuma correção foi aplicada.',
    },
    goal: { objective: 'performance', priority: 'principal' },
    now,
  });
  assert.equal(snapshot.mesocycle.quality, 'contraditório');
  assert.equal(snapshot.blocked, true);
  assert.match(snapshot.blockReasons.join(' '), /diverge/);
});

test('snapshot nunca inventa valor: campo ausente sempre retorna value null', () => {
  const snapshot = buildAthleteSnapshot({
    readiness: { ...baseReadiness, classification: 'indisponível', warning: 'Os dados estão ausentes, atrasados ou contraditórios. O treino não foi modificado.', reasonCode: 'contraditorio' },
    mesocycle: { anchor: null, calculated: null, event: null, phase: 'desconhecida', warning: null },
    goal: null,
    now,
  });
  assert.equal(snapshot.readiness.value, null);
  assert.equal(snapshot.mesocycle.value, null);
  assert.equal(snapshot.goal.value, null);
  assert.equal(snapshot.checkin.value, null);
});
