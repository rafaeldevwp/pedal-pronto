// Tendência de eficiência potência–coração dos pedais recentes.
//
// Vive fora da rota porque `app/api/performance/route.ts` importa `cloudflare:workers` e não pode
// ser carregado pelo runner de testes. Aqui é código puro: entram atividades, sai uma frase.

type Json = Record<string, any>;

export type CardioPoint = {
  date: string;
  watts: number;
  heartRate: number;
  efficiency: number;
  decoupling?: number;
};

const num = (...values: any[]) => values.find((value) => typeof value === 'number' && Number.isFinite(value));
const dateOf = (activity: Json) => String(activity.start_date_local || activity.start_date || '').slice(0, 10);

// SPEC-39: a ordenação é o ponto. O Intervals.icu não promete ordem cronológica crescente — as
// rotas irmãs (`week`, `readiness`) ordenam a resposta antes de usar ordem, e esta não ordenava.
// Sem isso, `slice(-12)` pegava os pedais mais antigos da janela em vez dos mais recentes, e a
// metade chamada de "início" podia ser, na verdade, a mais nova — invertendo a frase da tela.
export function buildCardioSeries(activities: Json[], limit = 12): CardioPoint[] {
  return activities
    .map((activity) => {
      const watts = num(activity.average_watts, activity.weighted_average_watts);
      const heartRate = num(activity.average_heartrate, activity.average_hr);
      return watts && heartRate
        ? {
          date: dateOf(activity),
          watts,
          heartRate,
          efficiency: watts / heartRate,
          decoupling: Math.abs(num(activity.decoupling, activity.aerobic_decoupling) || 0) || undefined,
        }
        : null;
    })
    .filter((point): point is CardioPoint => point !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-limit);
}

const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined;

// A comparação exige duas metades de verdade. Com menos de dois pedais uma delas fica vazia e a
// resposta honesta é dizer que ainda não dá para comparar.
export function cardioTrend(points: CardioPoint[]) {
  const half = Math.floor(points.length / 2);
  const early = average(points.slice(0, half).map((point) => point.efficiency));
  const late = average(points.slice(half).map((point) => point.efficiency));
  const efficiencyChange = early && late ? ((late - early) / early) * 100 : undefined;
  const headline = efficiencyChange === undefined
    ? 'Ainda reunindo treinos comparáveis'
    : efficiencyChange > 3
      ? 'Mais potência para esforço cardíaco parecido'
      : efficiencyChange < -3
        ? 'O coração está trabalhando mais para a potência produzida'
        : 'Eficiência estável';
  return { efficiencyChange, headline };
}
