import { beforeEach, expect, test, vi } from 'vitest';
import { ensurePolarSchema, runtime } from '@/lib/polar';
import { recordReadinessRun, runReadiness, type ReadinessResult } from '@/lib/readiness';

const OWNER = 'atleta-de-teste';
const zone = 'America/Sao_Paulo';
const isoDate = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const daysAgo = (amount: number) => isoDate(new Date(Date.now() - amount * 86400000));

// Uma noite dentro da média: 8 h de sono, qualidade 85, HRV 70, FC noturna 48, Nightly Recharge 5.
// Quinze noites iguais fazem a base individual — o dia mais recente é comparado com ela.
const nights = (over: Record<string, unknown> = {}) =>
  Array.from({ length: 15 }, (_, index) => ({
    date: daysAgo(14 - index),
    sleep_time: 8 * 3600,
    sleep_score: 85,
    total_interruption_duration: 600,
    ...(index === 14 ? over : {}),
  }));
const recharges = (over: Record<string, unknown> = {}) =>
  Array.from({ length: 15 }, (_, index) => ({
    date: daysAgo(14 - index),
    heart_rate_variability_avg: 70,
    heart_rate_avg: 48,
    ans_charge: 0.5,
    nightly_recharge_status: 5,
    ...(index === 14 ? over : {}),
  }));

type Scenario = {
  sleep?: Record<string, unknown>;
  recharge?: Record<string, unknown>;
  ctl?: number;
  atl?: number;
  ctl28?: number;
  dailyLoad?: number;
};

// Uma carga diária constante mantém ACWR em 1 e a rampa em zero: nada de carga acende sozinho,
// então cada teste acende só o sinal que quer observar.
const stubIntervals = ({ ctl = 60, atl = 55, ctl28 = 60, dailyLoad = 55 }: Scenario = {}) => {
  const wellness = Array.from({ length: 42 }, (_, index) => ({
    id: daysAgo(41 - index),
    ctl: index >= 41 ? ctl : index >= 14 ? ctl28 + ((ctl - ctl28) * (index - 14)) / 27 : ctl28,
    atl: index === 41 ? atl : dailyLoad,
  }));
  const activities = Array.from({ length: 28 }, (_, index) => ({
    start_date_local: `${daysAgo(27 - index)}T06:00:00`,
    type: 'Ride',
    icu_training_load: dailyLoad,
  }));
  return { wellness, activities };
};

const stubFetch = (scenario: Scenario = {}, events: unknown[] = []) => {
  const { wellness, activities } = stubIntervals(scenario);
  vi.stubGlobal('fetch', async (input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input);
    const body = url.includes('/v3/users/sleep')
      ? nights(scenario.sleep)
      : url.includes('/v3/users/nightly-recharge')
        ? recharges(scenario.recharge)
        : url.includes('/wellness')
          ? wellness
          : url.includes('/activities')
            ? activities
            : url.includes('/events')
              ? events
              : [];
    return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
  });
};

beforeEach(async () => {
  vi.unstubAllGlobals();
  await ensurePolarSchema();
  await runtime.DB.prepare('DELETE FROM polar_connections').run();
  await runtime.DB.prepare('DELETE FROM readiness_runs').run();
  await runtime.DB.prepare(
    'INSERT INTO polar_connections (owner_id,polar_user_id,access_token,connected_at) VALUES (?,?,?,?)',
  ).bind(OWNER, 'p1', 'token-de-teste', Date.now()).run();
});

test('sem conexão com o Polar a prontidão falha em vez de inventar um dia verde', async () => {
  await runtime.DB.prepare('DELETE FROM polar_connections').run();
  stubFetch();
  await expect(runReadiness(OWNER)).rejects.toThrow('POLAR_NOT_CONNECTED');
});

test('noite dentro da média, sem check-in, dá dia verde', async () => {
  stubFetch();
  const result = await runReadiness(OWNER);
  expect(result.classification).toBe('verde');
});

// T25/SPEC-25: o check-in chegava só na primeira chamada e a releitura automática devolvia a cor
// sem ele — o atleta via amarelo virar verde sozinho depois de três minutos.
test('T25 — dor no check-in derruba o dia para vermelho mesmo com o corpo dentro da base', async () => {
  stubFetch();
  const result = await runReadiness(OWNER, { dor: 6 });
  expect(result.classification).toBe('vermelha');
  expect(result.evidence.some((line) => line.includes('Dor percebida 6/10'))).toBe(true);
});

test('T25 — a mesma noite sem o check-in volta a verde: é o check-in que muda a cor', async () => {
  stubFetch();
  const comCheckin = await runReadiness(OWNER, { fadiga: 9, estresse: 8 });
  vi.unstubAllGlobals();
  stubFetch();
  const semCheckin = await runReadiness(OWNER);
  expect(comCheckin.classification).toBe('amarela');
  expect(semCheckin.classification).toBe('verde');
});

// T33/SPEC-33: ACWR e rampa apareciam só como texto. Por decisão do atleta passaram a contar como
// qualquer outro sinal na cor do dia.
test('T33 — ACWR alto entra na contagem e aparece na evidência', async () => {
  // ATL bem acima do CTL: é o próprio Intervals.icu dizendo que a semana pesou.
  stubFetch({ ctl: 50, atl: 90 });
  const result = await runReadiness(OWNER);
  expect(result.metrics.acwr).toBeCloseTo(1.8, 5);
  expect(result.evidence.some((line) => line.startsWith('ACWR'))).toBe(true);
  expect(result.classification).not.toBe('verde');
});

test('T33 — rampa de fitness acima do teto aparece na evidência com o teto fixo de 6', async () => {
  // CTL saindo de 40 e chegando a 70 em 28 dias: mais de 6 pontos por semana.
  stubFetch({ ctl: 70, atl: 70, ctl28: 40 });
  const result = await runReadiness(OWNER);
  expect(result.metrics.rampLimit).toBe(6);
  expect(result.evidence.some((line) => line.includes('acima do teto de 6'))).toBe(true);
});

test('T33 — ACWR vem do Intervals.icu, não de um cálculo paralelo', async () => {
  stubFetch({ ctl: 60, atl: 66 });
  const result = await runReadiness(OWNER);
  expect(result.metrics.acwr).toBeCloseTo(1.1, 5);
});

// A releitura automática roda a cada três minutos. Se cada uma inserisse uma linha, o histórico do
// dia viraria dezenas de registros iguais.
test('a releitura do mesmo dia atualiza a linha existente em vez de empilhar', async () => {
  const result = { classification: 'amarela', score: 3 } as ReadinessResult;
  await recordReadinessRun(OWNER, result);
  await recordReadinessRun(OWNER, { ...result, classification: 'vermelha' } as ReadinessResult);
  const rows = await runtime.DB.prepare('SELECT classification FROM readiness_runs WHERE owner_id=?')
    .bind(OWNER).all<{ classification: string }>();
  expect(rows.results).toHaveLength(1);
  expect(rows.results[0].classification).toBe('vermelha');
});

test('dia indisponível não vira registro: ausência de dado não é uma decisão', async () => {
  await recordReadinessRun(OWNER, { classification: 'indisponível' } as ReadinessResult);
  const rows = await runtime.DB.prepare('SELECT 1 FROM readiness_runs WHERE owner_id=?').bind(OWNER).all();
  expect(rows.results).toHaveLength(0);
});

test('sem sono recente do Polar a prontidão fica indisponível em vez de chutar', async () => {
  vi.stubGlobal('fetch', async (input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input);
    const body = url.includes('/v3/users/') ? [] : url.includes('/wellness') || url.includes('/activities') ? [] : [];
    return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
  });
  const result = await runReadiness(OWNER);
  expect(result.classification).toBe('indisponível');
  expect(result.reasonCode).toBe('atrasado');
});
