const today = new Date().toISOString().slice(0, 10);
const day = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

export const readiness = {
  classification: 'amarela',
  score: 3,
  changed: false,
  title: 'Recuperação parcial: ajuste moderado disponível',
  summary: 'Sono e HRV ficaram abaixo da sua base, e a carga dos últimos sete dias está acima da média recente. O treino segue de pé, com uma versão mais leve pronta para sua revisão.',
  evidence: [
    'Sono 6.2 h, abaixo da base 7.8 h',
    'HRV 54 ms, abaixo da base 71 ms',
    'ACWR 1.42 — carga dos últimos 7 dias acima da média recente',
    'Fadiga percebida 7/10',
    'Boa prontidão nunca aumenta a sessão automaticamente.',
  ],
  recovery: 'Priorize dormir cedo hoje e evite intensidade extra fora do plano.',
  loadTrend: Array.from({ length: 7 }, (_, i) => ({ date: day(i - 6), fitness: 58 + i * 0.4, fatigue: 62 + i * 1.1 })),
  workout: {
    name: 'C2W3D4 — Limiar 3x12 min',
    durationMinutes: 75,
    load: 82,
    action: 'Ajuste moderado disponível para revisão; nada foi alterado.',
    structure: ['- 20 min aquecimento progressivo', '- 3x12 min em limiar, 5 min fácil entre', '- 15 min volta à calma'],
    original: { name: 'C2W3D4 — Limiar 3x12 min', durationMinutes: 75, load: 82, structure: [] },
  },
  proposal: {
    id: 'p1', eventId: 991, date: today, classification: 'amarela',
    change: 'Reduz de 3 para 2 séries, preservando o estímulo de limiar.',
    original: { name: 'C2W3D4 — Limiar 3x12 min', durationMinutes: 75, load: 82, structure: ['- 20 min aquecimento progressivo', '- 3x12 min em limiar, 5 min fácil entre', '- 15 min volta à calma'] },
    recommended: { name: 'C2W3D4 — Limiar 2x12 min', durationMinutes: 62, load: 64, structure: ['- 20 min aquecimento progressivo', '- 2x12 min em limiar, 5 min fácil entre', '- 15 min volta à calma'] },
  },
  metrics: { sleepHours: 6.2, sleepScore: 71, hrv: 54, restingHr: 52, ansCharge: -2.4, nightlyStatus: 3, ctl: 61, atl: 87, form: -26, ramp: 4.2, acwr: 1.42, rampLimit: 6, safetyFlags: [{ id: 'acwr_high', severity: 'moderada' }] },
  updatedAt: new Date().toISOString(),
};

const workout = (offset, name, status, extra = {}) => ({
  id: 900 + offset, date: day(offset), name,
  durationMinutes: 75, load: 82,
  structure: ['- 20 min aquecimento progressivo', '- 3x12 min em limiar, 5 min fácil entre', '- 15 min volta à calma'],
  status, ...extra,
});

export const week = {
  today, monday: day(-2), sunday: day(4),
  events: [
    workout(-2, 'C2W3D1 — Endurance 90 min', 'realizado', {
      feedback: { headline: 'Sessão cumprida como planejada', message: 'A carga realizada ficou dentro do previsto e o esforço percebido acompanhou.', nextStep: 'Nada a ajustar para a próxima.', confidence: 'boa', signals: ['Carga 88 ante 85 planejados.', 'RPE 5/10.', 'Desacoplamento 3.8%.'] },
      comparison: { headline: 'Dentro do seu padrão', message: 'O conjunto dos dados ficou próximo ao que costuma acontecer em sessões semelhantes.', group: '6 pedais ao ar livre de duração e intensidade parecidas nos últimos 120 dias', confidence: 'boa', evidence: ['Potência 2% acima do padrão semelhante.', 'Esforço do coração 1% abaixo do padrão.', 'Variação cardíaca 3.8%, ante 4.1% no grupo.'], caveat: 'É uma comparação pessoal, não um diagnóstico; percurso, clima, equipamento e qualidade dos sensores podem mudar o resultado.' },
      details: { power: 212, heartRate: 141, cadence: 87, rpe: 5, intensity: 0.72, decoupling: 3.8, efficiency: 1.5 },
    }),
    workout(-1, 'C2W3D3 — Recuperação 45 min', 'realizado', {
      feedback: { headline: 'Mais leve que o planejado', message: 'A carga ficou abaixo do previsto, o que é esperado num dia de recuperação.', nextStep: 'Sem ajuste necessário.', confidence: 'moderada', signals: ['Carga 31 ante 40 planejados.', 'RPE 3/10.'] },
      details: { power: 148, heartRate: 118, cadence: 84, rpe: 3, intensity: 0.51 },
    }),
    workout(0, 'C2W3D4 — Limiar 3x12 min', 'planejado'),
    workout(2, 'C2W3D6 — Endurance 2h30', 'planejado'),
  ],
  suggestion: null,
  forecast: {
    risk: 'moderado',
    headline: 'O treino-chave de sábado merece atenção',
    message: 'A carga acumulada da semana está acima da média recente e o próximo estímulo importante é longo.',
    today: { name: 'C2W3D4 — Limiar 3x12 min', load: 82, durationMinutes: 75 },
    nextKey: { name: 'C2W3D6 — Endurance 2h30', date: day(2), load: 145, durationMinutes: 150, daysAway: 2 },
    evidence: ['ACWR 1.42, acima da média recente.', 'Carga realizada 119 de 310 previstos.', 'Fadiga percebida 7/10 hoje.'],
    confidence: 'moderada',
    guidance: 'Aceitar o ajuste de hoje preserva o treino de sábado.',
    caveat: 'É uma projeção a partir dos dados de hoje; um dia bem dormido muda a leitura.',
  },
  futureAlert: null,
  planOutlook: [
    { id: 902, date: day(2), name: 'C2W3D6 — Endurance 2h30', status: 'protegido', note: 'É a única fonte de estímulo longo da semana.' },
  ],
  decisionHistory: [
    { id: 1, decisionDate: day(-2), workoutDate: day(-2), source: 'prontidao_diaria', status: 'mantido', original: { name: 'C2W3D1 — Endurance 90 min', durationMinutes: 90, load: 85 }, recommended: null, effective: null, reason: 'Prontidão verde: treino mantido sem aumento.', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), outcome: { name: 'Endurance 90 min', durationMinutes: 92, load: 88, rpe: 5 } },
    { id: 2, decisionDate: day(-1), workoutDate: day(-1), source: 'replanejamento', status: 'alterado', original: { name: 'C2W3D3 — Endurance 60 min', durationMinutes: 60, load: 55 }, recommended: { name: 'C2W3D3 — Recuperação 45 min', durationMinutes: 45, load: 40 }, effective: { name: 'C2W3D3 — Recuperação 45 min', durationMinutes: 45, load: 40 }, reason: 'Fadiga percebida alta e sono abaixo da base.', createdAt: new Date(Date.now() - 86400000).toISOString(), outcome: { name: 'Recuperação 45 min', durationMinutes: 44, load: 31, rpe: 3 } },
  ],
  proposal: null,
  mesocycle: { cycle: 2, week: 3, day: 4, phase: 'build' },
  weeklyLoadTarget: 310,
  weeklyLoadDone: 119,
};

export const performance = {
  updatedAt: new Date().toISOString(),
  activityCount: 18,
  profile: 'Tendência mais resistente',
  profileMessage: 'As potências sustentadas evoluíram mais que os esforços curtos.',
  power: [
    { seconds: 5, label: '5 s', current: 842, previous: 861, change: -2.2 },
    { seconds: 60, label: '1 min', current: 412, previous: 418, change: -1.4 },
    { seconds: 300, label: '5 min', current: 318, previous: 302, change: 5.3 },
    { seconds: 1200, label: '20 min', current: 271, previous: 258, change: 5.0 },
    { seconds: 2400, label: '40 min', current: 252, previous: 239, change: 5.4 },
  ],
  powerViews: {
    season: [
      { seconds: 5, label: '5 s', current: 842, previous: 861, change: -2.2 },
      { seconds: 60, label: '1 min', current: 412, previous: 418, change: -1.4 },
      { seconds: 300, label: '5 min', current: 318, previous: 302, change: 5.3 },
      { seconds: 1200, label: '20 min', current: 271, previous: 258, change: 5.0 },
      { seconds: 2400, label: '40 min', current: 252, previous: 239, change: 5.4 },
    ],
    recent: [
      { seconds: 5, label: '5 s', current: 818 }, { seconds: 60, label: '1 min', current: 401 },
      { seconds: 300, label: '5 min', current: 312 }, { seconds: 1200, label: '20 min', current: 268 },
      { seconds: 2400, label: '40 min', current: 249 },
    ],
    all: [
      { seconds: 5, label: '5 s', current: 903 }, { seconds: 60, label: '1 min', current: 441 },
      { seconds: 300, label: '5 min', current: 331 }, { seconds: 1200, label: '20 min', current: 279 },
      { seconds: 2400, label: '40 min', current: 258 },
    ],
  },
  powerSource: 'Curvas oficiais do Intervals.icu',
  cardio: Array.from({ length: 12 }, (_, i) => ({ date: day(-40 + i * 3), watts: 195 + i * 2.4, heartRate: 142 - i * 0.3, efficiency: (195 + i * 2.4) / (142 - i * 0.3), decoupling: 4.6 - i * 0.1 })),
  cardioCoverage: { rides: 18, withPower: 16, withHeartRate: 17, withBoth: 12 },
  efficiencyChange: 6.4,
  cardioHeadline: 'Mais potência para esforço cardíaco parecido',
  learning: {
    status: 'observado',
    headline: 'Suas noites de sono explicam parte do seu rendimento',
    message: 'Em dias com sono acima da sua base, a relação potência–coração ficou mensuravelmente melhor.',
    sample: 14,
    confidence: 'moderada',
    evidence: [
      'sono: em 14 dias comparáveis, a relação potência–coração ficou 7% melhor quando o sinal estava favorável.',
      'HRV: em 12 dias comparáveis, a relação potência–coração ficou 4% melhor quando o sinal estava favorável.',
    ],
    caveat: 'É uma associação observada no seu histórico, não uma relação de causa comprovada.',
  },
};

export const mesocycle = {
  anchor: null,
  calculated: { cycle: 2, week: 3, day: 4 },
  event: { cycle: 2, week: 3, day: 4 },
  phase: 'build',
  warning: null,
  reference: { date: day(0), name: 'C2W3D4 — Limiar 3x12 min' },
  inherited: false,
};

export const polarStatus = { connected: true, connectedAt: Date.now() - 30 * 86400000 };
