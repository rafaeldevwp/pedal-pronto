import { ownerId, runtime } from '@/lib/polar';

export const dynamic = 'force-dynamic';
type Json = Record<string, any>;
const zone = 'America/Sao_Paulo';
const isoDate = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86400000);
const num = (...values: any[]) => values.find((value) => typeof value === 'number' && Number.isFinite(value));
const get = async (path: string) => {
  const response = await fetch(`https://intervals.icu/api/v1${path}`, {
    headers: { Authorization: `Basic ${btoa(`API_KEY:${runtime.INTERVALS_API_KEY}`)}`, Accept: 'application/json' },
  });
  if (response.status === 401 || response.status === 403) throw new Error('INTERVALS_AUTH');
  if (!response.ok) throw new Error(`INTERVALS_${response.status}`);
  return response.json();
};
const getOptional = async (path: string) => {
  try { return await get(path); } catch { return null; }
};
const periods = [5, 60, 300, 1200, 2400];
const labels: Record<number, string> = { 5: '5 s', 60: '1 min', 300: '5 min', 1200: '20 min', 2400: '40 min' };

function spikePower(activity: Json, seconds: number) {
  const direct: Record<number, string[]> = {
    5: ['best_5s', 'power_5s', 'p5s'], 60: ['best_1m', 'power_1m', 'p1m'],
    300: ['best_5m', 'power_5m', 'p5m'], 1200: ['best_20m', 'power_20m', 'p20m'],
    2400: ['best_40m', 'power_40m', 'p40m'],
  };
  for (const key of direct[seconds]) if (num(activity[key])) return Number(activity[key]);
  const curves = [activity.icu_power_spikes, activity.power_spikes, activity.power_curve].filter(Boolean);
  for (const curve of curves) {
    if (Array.isArray(curve)) {
      for (const point of curve) {
        if (Array.isArray(point) && Number(point[0]) === seconds) return Number(point[1]);
        if (typeof point === 'object' && Number(point.seconds || point.duration || point.secs) === seconds)
          return Number(point.watts || point.power || point.value);
      }
    } else if (typeof curve === 'object') {
      const value = curve[seconds] ?? curve[String(seconds)] ?? curve[labels[seconds]];
      if (num(value)) return Number(value);
    }
  }
  return undefined;
}

function curvePower(payload: any, seconds: number): number | undefined {
  if (!payload) return undefined;
  if (Array.isArray(payload)) {
    for (const point of payload) {
      if (Array.isArray(point) && Number(point[0]) === seconds && Number.isFinite(Number(point[1]))) return Number(point[1]);
      if (point && typeof point === 'object') {
        const duration = Number(point.seconds ?? point.secs ?? point.duration ?? point.x);
        const watts = Number(point.watts ?? point.power ?? point.value ?? point.y);
        if (duration === seconds && Number.isFinite(watts)) return watts;
      }
    }
    for (const value of payload) {
      const found = curvePower(value, seconds);
      if (found) return found;
    }
  } else if (typeof payload === 'object') {
    const secs = payload.secs || payload.seconds || payload.durations;
    const watts = payload.watts || payload.power || payload.values;
    if (Array.isArray(secs) && Array.isArray(watts)) {
      const index = secs.findIndex((value: any) => Number(value) === seconds);
      if (index >= 0 && Number.isFinite(Number(watts[index]))) return Number(watts[index]);
    }
    const direct = payload[seconds] ?? payload[String(seconds)];
    if (Number.isFinite(Number(direct))) return Number(direct);
    for (const value of Object.values(payload)) {
      const found = curvePower(value, seconds);
      if (found) return found;
    }
  }
  return undefined;
}

export async function GET(request: Request) {
  const owner = ownerId(request);
  if (!owner) return Response.json({ error: 'Não autorizado' }, { status: 401 });
  const now = new Date(), today = isoDate(now), oldest = isoDate(addDays(now, -83));
  try {
    const [body, season0, season1, days42, allTime, readinessHistory] = await Promise.all([
      get(`/athlete/${runtime.INTERVALS_ATHLETE_ID}/activities?oldest=${oldest}&newest=${today}&limit=500`),
      getOptional(`/athlete/${runtime.INTERVALS_ATHLETE_ID}/power-curves?curves=s0&type=Ride&now=${today}`),
      getOptional(`/athlete/${runtime.INTERVALS_ATHLETE_ID}/power-curves?curves=s1&type=Ride&now=${today}`),
      getOptional(`/athlete/${runtime.INTERVALS_ATHLETE_ID}/power-curves?curves=42d&type=Ride&now=${today}`),
      getOptional(`/athlete/${runtime.INTERVALS_ATHLETE_ID}/power-curves?curves=all&type=Ride&now=${today}`),
      runtime.DB.prepare(
        `SELECT run_date,report_json FROM readiness_runs
         WHERE owner_id=? AND run_date>=?
         AND id IN (SELECT MAX(id) FROM readiness_runs WHERE owner_id=? AND run_date>=? GROUP BY run_date)
         ORDER BY run_date`,
      ).bind(owner, oldest, owner, oldest).all<{ run_date: string; report_json: string }>(),
    ]);
    const activities: Json[] = (Array.isArray(body) ? body : body.activities || []).filter((activity: Json) =>
      ['Ride', 'VirtualRide', 'EBikeRide', 'MountainBikeRide'].includes(activity.type || activity.icu_type),
    );
    const recentStart = isoDate(addDays(now, -41));
    const dateOf = (activity: Json) => String(activity.start_date_local || activity.start_date || '').slice(0, 10);
    const recent = activities.filter((activity) => dateOf(activity) >= recentStart);
    const previous = activities.filter((activity) => dateOf(activity) < recentStart);
    const best = (list: Json[], seconds: number) => {
      const values = list.map((activity) => spikePower(activity, seconds)).filter((value): value is number => Boolean(value));
      return values.length ? Math.max(...values) : undefined;
    };
    const rollingPower = periods.map((seconds) => {
      const current = best(recent, seconds), prior = best(previous, seconds);
      return {
        seconds, label: labels[seconds], current, previous: prior,
        change: current && prior ? ((current - prior) / prior) * 100 : undefined,
      };
    });
    const seasonPower = periods.map((seconds) => {
      const current = curvePower(season0, seconds), prior = curvePower(season1, seconds);
      return { seconds, label: labels[seconds], current, previous: prior, change: current && prior ? ((current - prior) / prior) * 100 : undefined };
    });
    const curveSet = (payload: any) => periods.map((seconds) => ({ seconds, label: labels[seconds], current: curvePower(payload, seconds) }));
    const power = seasonPower.some((point) => point.current) ? seasonPower : rollingPower;
    const changes = power.filter((point) => point.change !== undefined);
    const sprint = changes.filter((point) => point.seconds <= 60).map((point) => point.change!);
    const endurance = changes.filter((point) => point.seconds >= 300).map((point) => point.change!);
    const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined;
    const sprintChange = average(sprint), enduranceChange = average(endurance);
    let profile = 'Histórico ainda insuficiente';
    let profileMessage = 'Precisamos de potências válidas nos dois períodos de 42 dias para reconhecer uma mudança.';
    if (changes.length >= 3 && sprintChange !== undefined && enduranceChange !== undefined) {
      if (sprintChange > enduranceChange + 3) {
        profile = 'Tendência mais explosiva';
        profileMessage = 'As potências curtas evoluíram mais que as de sustentação. É uma tendência, não um rótulo definitivo.';
      } else if (enduranceChange > sprintChange + 3) {
        profile = 'Tendência mais resistente';
        profileMessage = 'As potências sustentadas evoluíram mais que os esforços curtos.';
      } else {
        profile = 'Perfil equilibrado';
        profileMessage = 'Potências curtas e sustentadas estão evoluindo em proporções parecidas.';
      }
    }
    const cardio = recent
      .map((activity) => {
        const watts = num(activity.average_watts, activity.weighted_average_watts);
        const heartRate = num(activity.average_heartrate, activity.average_hr);
        return watts && heartRate ? {
          date: dateOf(activity), watts, heartRate,
          efficiency: watts / heartRate,
          decoupling: Math.abs(num(activity.decoupling, activity.aerobic_decoupling) || 0) || undefined,
        } : null;
      })
      .filter(Boolean)
      .slice(-12);
    const cardioList = cardio as Array<{ date: string; watts: number; heartRate: number; efficiency: number; decoupling?: number }>;
    const half = Math.floor(cardioList.length / 2);
    const early = average(cardioList.slice(0, half).map((point) => point.efficiency));
    const late = average(cardioList.slice(half).map((point) => point.efficiency));
    const efficiencyChange = early && late ? ((late - early) / early) * 100 : undefined;
    const cardioHeadline = efficiencyChange === undefined
      ? 'Ainda reunindo treinos comparáveis'
      : efficiencyChange > 3 ? 'Mais potência para esforço cardíaco parecido'
        : efficiencyChange < -3 ? 'O coração está trabalhando mais para a potência produzida'
          : 'Eficiência estável';
    const readinessByDate = new Map((readinessHistory.results || []).map((row) => {
      try { return [row.run_date, JSON.parse(row.report_json)]; } catch { return [row.run_date, null]; }
    }));
    const paired = recent.map((activity) => {
      const readiness = readinessByDate.get(dateOf(activity));
      const watts = num(activity.average_watts, activity.weighted_average_watts);
      const heartRate = num(activity.average_heartrate, activity.average_hr);
      if (!readiness?.metrics || !watts || !heartRate) return null;
      return {
        date: dateOf(activity), metrics: readiness.metrics,
        outcome: watts / heartRate,
        decoupling: Math.abs(num(activity.decoupling, activity.aerobic_decoupling) || 0),
        rpe: num(activity.perceived_exertion, activity.rpe),
      };
    }).filter(Boolean) as Array<{ date: string; metrics: Json; outcome: number; decoupling: number; rpe?: number }>;
    const median = (values: number[]) => {
      const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
      if (!sorted.length) return undefined;
      const middle = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
    };
    const metricRules = [
      { key: 'sleepHours', label: 'sono', favorable: (value: number, base: number) => value >= base },
      { key: 'hrv', label: 'HRV', favorable: (value: number, base: number) => value >= base },
      { key: 'restingHr', label: 'FC de repouso', favorable: (value: number, base: number) => value <= base },
      { key: 'ansCharge', label: 'ANS Charge', favorable: (value: number, base: number) => value >= base },
    ];
    const outcomeBase = median(paired.map((row) => row.outcome));
    const learnedEvidence: string[] = [];
    let strongest: { label: string; difference: number; sample: number } | undefined;
    for (const rule of metricRules) {
      const valid = paired.filter((row) => Number.isFinite(Number(row.metrics[rule.key])));
      const base = median(valid.map((row) => Number(row.metrics[rule.key])));
      if (!base || valid.length < 8) continue;
      const favorable = valid.filter((row) => rule.favorable(Number(row.metrics[rule.key]), base));
      const unfavorable = valid.filter((row) => !rule.favorable(Number(row.metrics[rule.key]), base));
      if (favorable.length < 3 || unfavorable.length < 3) continue;
      const favorableOutcome = median(favorable.map((row) => row.outcome));
      const unfavorableOutcome = median(unfavorable.map((row) => row.outcome));
      if (!favorableOutcome || !unfavorableOutcome) continue;
      const difference = ((favorableOutcome / unfavorableOutcome) - 1) * 100;
      if (Math.abs(difference) >= 2) learnedEvidence.push(
        `${rule.label}: em ${valid.length} dias comparáveis, a relação potência–coração ficou ${Math.abs(difference).toFixed(0)}% ${difference > 0 ? 'melhor quando o sinal estava favorável' : 'menos favorável quando o sinal parecia melhor'}.`,
      );
      if (!strongest || Math.abs(difference) > Math.abs(strongest.difference)) strongest = { label: rule.label, difference, sample: valid.length };
    }
    const enough = paired.length >= 8 && Boolean(outcomeBase) && learnedEvidence.length > 0;
    const learning = enough && strongest ? {
      status: 'observado',
      headline: strongest.difference > 0 ? `${strongest.label} parece acompanhar seus melhores dias` : 'Seus sinais ainda não formam um padrão simples',
      message: strongest.difference > 0
        ? `No seu histórico recente, dias com ${strongest.label} favorável apareceram junto de melhor eficiência no pedal.`
        : 'Um sinal aparentemente favorável não coincidiu de forma consistente com melhor eficiência. Outros fatores podem estar pesando mais.',
      sample: paired.length,
      confidence: paired.length >= 16 && learnedEvidence.length >= 2 ? 'boa' : 'moderada',
      evidence: learnedEvidence.slice(0, 3),
      caveat: 'Isto mostra associação no seu histórico, não causa. Tipo de treino, terreno, clima, fadiga e sensores podem influenciar o resultado.',
    } : {
      status: 'insuficiente',
      headline: 'Ainda aprendendo o seu padrão',
      message: `Há ${paired.length} ${paired.length === 1 ? 'dia pareado' : 'dias pareados'} entre recuperação e treino; são necessários ao menos 8, com grupos comparáveis, para mostrar uma tendência.`,
      sample: paired.length,
      confidence: 'limitada',
      evidence: ['Nenhuma conclusão será exibida enquanto a amostra mínima e a consistência não forem atingidas.'],
      caveat: 'A ausência de padrão não significa evolução ou regressão.',
    };
    return Response.json({
      updatedAt: new Date().toISOString(), activityCount: recent.length, profile, profileMessage, power,
      powerViews: {
        season: power,
        recent: curveSet(days42).some((point) => point.current) ? curveSet(days42) : rollingPower,
        all: curveSet(allTime),
      },
      powerSource: seasonPower.some((point) => point.current) ? 'Curvas oficiais do Intervals.icu' : 'Atividades disponíveis no Intervals.icu',
      cardio: cardioList, efficiencyChange, cardioHeadline, learning,
      warning: recent.length < 4 ? 'Poucas atividades recentes: interprete as tendências com cautela.' : undefined,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Falha ao carregar evolução' }, { status: 502 });
  }
}
