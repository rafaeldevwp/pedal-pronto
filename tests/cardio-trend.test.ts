import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCardioSeries, cardioTrend } from '../lib/cardio-trend.ts';

const ride = (date: string, watts: number, heartRate = 140) => ({
  start_date_local: `${date}T06:00:00`,
  average_watts: watts,
  average_heartrate: heartRate,
});

// Eficiência subindo com o tempo: 180 W no começo, 220 W no fim, sempre a 140 bpm.
const melhorando = [
  ride('2026-08-01', 180), ride('2026-08-03', 182), ride('2026-08-05', 178),
  ride('2026-08-20', 218), ride('2026-08-22', 220), ride('2026-08-24', 222),
];

test('a série sai em ordem cronológica mesmo quando a origem devolve ao contrário', () => {
  const series = buildCardioSeries([...melhorando].reverse());
  assert.deepEqual(series.map((point) => point.date), melhorando.map((activity) => activity.start_date_local.slice(0, 10)));
});

// SPEC-39: este é o teste que importa. O Intervals.icu costuma devolver do mais novo para o mais
// antigo; sem ordenar, a metade chamada de "início" seria a mais recente e a frase sairia trocada.
test('a manchete não depende da ordem em que os pedais chegaram', () => {
  const crescente = cardioTrend(buildCardioSeries(melhorando));
  const decrescente = cardioTrend(buildCardioSeries([...melhorando].reverse()));
  assert.equal(crescente.headline, 'Mais potência para esforço cardíaco parecido');
  assert.equal(decrescente.headline, crescente.headline);
  assert.equal(decrescente.efficiencyChange, crescente.efficiencyChange);
});

test('piora é reconhecida como piora', () => {
  const piorando = [...melhorando].reverse().map((activity, index) => ({
    ...activity,
    start_date_local: melhorando[index].start_date_local,
  }));
  assert.equal(cardioTrend(buildCardioSeries(piorando)).headline, 'O coração está trabalhando mais para a potência produzida');
});

test('sem mudança relevante a leitura é de estabilidade', () => {
  const estavel = ['2026-08-01', '2026-08-05', '2026-08-10', '2026-08-15'].map((date) => ride(date, 200));
  assert.equal(cardioTrend(buildCardioSeries(estavel)).headline, 'Eficiência estável');
});

test('o corte de 12 guarda os pedais mais recentes, não os mais antigos', () => {
  const quinze = Array.from({ length: 15 }, (_, index) => ride(`2026-08-${String(index + 1).padStart(2, '0')}`, 200));
  const series = buildCardioSeries([...quinze].reverse());
  assert.equal(series.length, 12);
  assert.equal(series[0].date, '2026-08-04');
  assert.equal(series.at(-1)!.date, '2026-08-15');
});

test('pedal sem potência ou sem frequência cardíaca fica de fora da série', () => {
  const series = buildCardioSeries([
    ride('2026-08-01', 200),
    { start_date_local: '2026-08-02T06:00:00', average_heartrate: 140 },
    { start_date_local: '2026-08-03T06:00:00', average_watts: 200 },
  ]);
  assert.deepEqual(series.map((point) => point.date), ['2026-08-01']);
});

test('um único pedal não gera veredito: uma das metades ficaria vazia', () => {
  assert.equal(cardioTrend(buildCardioSeries([ride('2026-08-01', 200)])).headline, 'Ainda reunindo treinos comparáveis');
});
