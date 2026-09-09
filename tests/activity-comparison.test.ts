import assert from 'node:assert/strict';
import test from 'node:test';
import { median, similarComparison } from '../lib/activity-comparison.ts';

// Um pedal ao ar livre com sensores completos. Os parâmetros dão para mexer numa métrica de cada
// vez sem quebrar o pareamento por duração, modalidade e intensidade.
const ride = (date: string, over: Record<string, unknown> = {}) => ({
  start_date_local: `${date}T06:00:00`,
  type: 'Ride',
  moving_time: 3600,
  icu_intensity: 75,
  icu_training_load: 60,
  average_watts: 200,
  average_heartrate: 140,
  average_cadence: 85,
  perceived_exertion: 5,
  decoupling: 4,
  ...over,
});

test('mediana descarta zero em potência, porque ali zero é sensor ausente', () => {
  assert.equal(median([0, 200, 220]), 210);
});

test('mediana aceita zero em desacoplamento, porque ali zero é o melhor resultado', () => {
  assert.equal(median([0, 4, 8], true), 4);
});

test('desacoplamento zero no histórico entra na linha de base em vez de sumir', () => {
  const history = [
    ride('2026-08-01', { decoupling: 0 }),
    ride('2026-08-05', { decoupling: 0 }),
    ride('2026-08-09', { decoupling: 6 }),
  ];
  // O pedal de hoje desacoplou 5%: pior que a mediana real (0) do grupo, melhor que a mediana
  // que sairia se os zeros fossem descartados (6). Só a linha de base correta chama de exigente.
  const comparison = similarComparison(ride('2026-08-15', { decoupling: 5, average_watts: 180, average_heartrate: 148 }), history);
  assert.equal(comparison.headline, 'Mais difícil que o habitual');
});

test('pedalar igual à própria média não derruba a confiança relatada', () => {
  const history = Array.from({ length: 6 }, (_, index) => ride(`2026-08-0${index + 1}`));
  const comparison = similarComparison(ride('2026-08-15'), history);
  assert.equal(comparison.confidence, 'boa');
});

test('histórico curto continua avisando que falta base de comparação', () => {
  const comparison = similarComparison(ride('2026-08-15'), [ride('2026-08-01'), ride('2026-08-05')]);
  assert.equal(comparison.confidence, 'limitada');
  assert.equal(comparison.headline, 'Ainda faltam treinos parecidos');
});
