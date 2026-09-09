// Comparação de um pedal com os pedais parecidos do próprio atleta.
//
// Vive fora da rota porque `app/api/week/route.ts` importa `cloudflare:workers` e não pode ser
// carregado pelo runner de testes. Aqui é código puro: entra atividade e histórico, sai um texto.

type Json = Record<string, any>;

export const activityDate = (activity: Json) =>
  String(activity.start_date_local || activity.start_date || '').slice(0, 10);
export const activityMinutes = (activity: Json) =>
  Math.round(Number(activity.moving_time || activity.elapsed_time || 0) / 60) ||
  undefined;
export const activityIntensity = (activity: Json) => {
  const value = Number(activity.icu_intensity || activity.intensity || 0);
  return value > 2 ? value / 100 : value;
};
export const activityModality = (activity: Json) =>
  String(activity.type || activity.icu_type || '').includes('Virtual') ? 'indoor' : 'outdoor';
// SPEC-37: desacoplamento zero é o melhor resultado possível, não sensor ausente. Só dá para
// separar os dois casos aqui, olhando o campo bruto — depois de virar número, `0` é ambíguo.
const finiteOrUndefined = (value: unknown) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Math.abs(Number(value));
  return Number.isFinite(parsed) ? parsed : undefined;
};
export const activityMetric = (activity: Json) => {
  const durationHours = Number(activity.moving_time || activity.elapsed_time || 0) / 3600;
  const load = Number(activity.icu_training_load || activity.load || 0);
  const power = Number(activity.average_watts || activity.weighted_average_watts || 0);
  const heartRate = Number(activity.average_heartrate || activity.average_hr || 0);
  return {
    power, heartRate,
    cadence: Number(activity.average_cadence || 0),
    rpe: Number(activity.perceived_exertion || activity.rpe || 0),
    intensity: activityIntensity(activity),
    decoupling: finiteOrUndefined(activity.decoupling ?? activity.aerobic_decoupling),
    efficiency: Number(activity.efficiency_factor || activity.power_hr_ratio || (power && heartRate ? power / heartRate : 0)),
    loadPerHour: durationHours && load ? load / durationHours : 0,
  };
};
// SPEC-37: para potência, FC e cadência, zero significa sensor ausente e precisa sair da conta.
// Para desacoplamento, zero é o melhor resultado possível — descartá-lo puxava a linha de base
// para cima e fazia o pedal parecer pior do que foi. Daí o `allowZero`.
export const median = (values: Array<number | undefined>, allowZero = false) => {
  const sorted = values
    .filter((value): value is number => Number.isFinite(value) && (allowZero ? value! >= 0 : value! > 0))
    .sort((a, b) => a - b);
  if (!sorted.length) return undefined;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const pct = (current: number, baseline?: number) => baseline && current ? ((current / baseline) - 1) * 100 : undefined;
export const similarComparison = (activity: Json, history: Json[]) => {
  const duration = activityMinutes(activity) || 0;
  const intensity = activityIntensity(activity);
  const modality = activityModality(activity);
  const currentDate = activityDate(activity);
  const candidates = history
    .filter((candidate) => {
      const candidateDuration = activityMinutes(candidate) || 0;
      const candidateIntensity = activityIntensity(candidate);
      return activityDate(candidate) < currentDate &&
        activityModality(candidate) === modality &&
        candidateDuration >= duration * 0.75 && candidateDuration <= duration * 1.25 &&
        (!intensity || !candidateIntensity || Math.abs(candidateIntensity - intensity) <= 0.1);
    })
    .sort((a, b) => {
      const aDistance = Math.abs((activityMinutes(a) || 0) - duration) + Math.abs(activityIntensity(a) - intensity) * 100;
      const bDistance = Math.abs((activityMinutes(b) || 0) - duration) + Math.abs(activityIntensity(b) - intensity) * 100;
      return aDistance - bDistance;
    })
    .slice(0, 8);
  const group = `${candidates.length} ${modality === 'indoor' ? 'pedais indoor' : 'pedais ao ar livre'} de duração e intensidade parecidas nos últimos 120 dias`;
  if (candidates.length < 3) return {
    headline: 'Ainda faltam treinos parecidos',
    message: 'O histórico ainda não permite afirmar se esta sessão foi melhor ou pior que o seu padrão.',
    group,
    confidence: 'limitada',
    evidence: ['São necessários pelo menos 3 treinos pessoais comparáveis.'],
    caveat: 'Tipo, duração e intensidade reduzem diferenças, mas percurso, clima e equipamento também influenciam.',
  };
  const current = activityMetric(activity);
  const candidateMetrics = candidates.map(activityMetric);
  const baselines = Object.fromEntries(
    Object.keys(current).map((key) => {
      const metric = key as keyof ReturnType<typeof activityMetric>;
      return [metric, median(candidateMetrics.map((candidate) => candidate[metric]), metric === 'decoupling')];
    }),
  ) as Record<keyof ReturnType<typeof activityMetric>, number | undefined>;
  const powerChange = pct(current.power, baselines.power);
  const hrChange = pct(current.heartRate, baselines.heartRate);
  const efficiencyChange = pct(current.efficiency, baselines.efficiency);
  const cadenceChange = pct(current.cadence, baselines.cadence);
  const loadChange = pct(current.loadPerHour, baselines.loadPerHour);
  const evidence: string[] = [];
  if (powerChange !== undefined) evidence.push(`Potência ${Math.abs(powerChange).toFixed(0)}% ${powerChange >= 0 ? 'acima' : 'abaixo'} do padrão semelhante.`);
  if (hrChange !== undefined) evidence.push(`Esforço do coração ${Math.abs(hrChange).toFixed(0)}% ${hrChange >= 0 ? 'acima' : 'abaixo'} do padrão.`);
  if (cadenceChange !== undefined && Math.abs(cadenceChange) >= 3) evidence.push(`Cadência ${Math.abs(cadenceChange).toFixed(0)}% ${cadenceChange >= 0 ? 'acima' : 'abaixo'} do habitual.`);
  const decouplingComparable = current.decoupling !== undefined && baselines.decoupling !== undefined;
  if (decouplingComparable) evidence.push(`Variação cardíaca ${current.decoupling!.toFixed(1)}%, ante ${baselines.decoupling!.toFixed(1)}% no grupo.`);
  if (current.rpe && baselines.rpe) evidence.push(`Sensação ${current.rpe}/10, ante ${baselines.rpe.toFixed(1)}/10 no grupo.`);
  if (loadChange !== undefined) evidence.push(`Carga por hora ${Math.abs(loadChange).toFixed(0)}% ${loadChange >= 0 ? 'maior' : 'menor'}.`);
  const efficientSignals = Number((efficiencyChange || 0) >= 3) + Number((powerChange || 0) >= 3 && (hrChange || 0) <= 2) + Number(decouplingComparable && current.decoupling! <= baselines.decoupling!);
  const demandingSignals = Number((powerChange || 0) <= -4 && (hrChange || 0) >= 3) + Number(decouplingComparable && current.decoupling! >= baselines.decoupling! + 2) + Number(Boolean(current.rpe && baselines.rpe && current.rpe >= baselines.rpe + 2));
  // SPEC-37: conta métricas comparáveis, não métricas que mudaram. O filtro anterior descartava
  // variação de exatamente 0, então pedalar igual à sua média reduzia a confiança relatada.
  const comparableMetrics = [powerChange, hrChange, efficiencyChange, cadenceChange, loadChange].filter((value) => value !== undefined).length
    + Number(decouplingComparable)
    + Number(Boolean(current.rpe && baselines.rpe));
  let headline = 'Dentro do seu padrão';
  let message = 'O conjunto dos dados ficou próximo ao que costuma acontecer em sessões semelhantes.';
  if (efficientSignals >= 2) {
    headline = 'Mais eficiente que o habitual';
    message = 'Você entregou um resultado melhor com esforço cardíaco controlado em comparação com seus pedais parecidos.';
  } else if (demandingSignals >= 2) {
    headline = 'Mais difícil que o habitual';
    message = 'Mais de um sinal mostra que esta sessão custou mais ao corpo do que pedais semelhantes.';
  }
  return {
    headline, message, group,
    confidence: candidates.length >= 6 && comparableMetrics >= 4 ? 'boa' : 'moderada',
    evidence: evidence.slice(0, 4),
    caveat: 'É uma comparação pessoal, não um diagnóstico; percurso, clima, equipamento e qualidade dos sensores podem mudar o resultado.',
  };
};
