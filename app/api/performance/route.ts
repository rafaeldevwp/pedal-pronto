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

export async function GET(request: Request) {
  if (!ownerId(request)) return Response.json({ error: 'Não autorizado' }, { status: 401 });
  const now = new Date(), today = isoDate(now), oldest = isoDate(addDays(now, -83));
  try {
    const body = await get(`/athlete/${runtime.INTERVALS_ATHLETE_ID}/activities?oldest=${oldest}&newest=${today}&limit=500`);
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
    const power = periods.map((seconds) => {
      const current = best(recent, seconds), prior = best(previous, seconds);
      return {
        seconds, label: labels[seconds], current, previous: prior,
        change: current && prior ? ((current - prior) / prior) * 100 : undefined,
      };
    });
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
    return Response.json({
      updatedAt: new Date().toISOString(), activityCount: recent.length, profile, profileMessage, power,
      cardio: cardioList, efficiencyChange, cardioHeadline,
      warning: recent.length < 4 ? 'Poucas atividades recentes: interprete as tendências com cautela.' : undefined,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Falha ao carregar evolução' }, { status: 502 });
  }
}
