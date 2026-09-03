import { ownerId, runtime } from '@/lib/polar';
import { runReadiness } from '@/lib/readiness';

export const dynamic = 'force-dynamic';

type Json = Record<string, any>;
const zone = 'America/Sao_Paulo';
const isoDate = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
const todayInZone = () => isoDate(new Date());
const dayNumber = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};
const addDays = (date: string, amount: number) => {
  const [year, month, day] = date.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day + amount));
  return value.toISOString().slice(0, 10);
};
const intervals = async (path: string, init?: RequestInit) => {
  const response = await fetch(`https://intervals.icu/api/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${btoa(`API_KEY:${runtime.INTERVALS_API_KEY}`)}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (response.status === 401 || response.status === 403)
    throw new Error('INTERVALS_AUTH');
  if (!response.ok) throw new Error(`INTERVALS_${response.status}`);
  return response.status === 204 ? null : response.json();
};
const minutes = (event: Json) => {
  const seconds = Number(
    event.moving_time || event.duration || event.workout_doc?.duration || 0,
  );
  return seconds ? Math.round(seconds / 60) : undefined;
};
const normalize = (event: Json) => ({
  id: event.id,
  date: String(event.start_date_local || event.start_date || '').slice(0, 10),
  name: event.name || 'Treino sem nome',
  durationMinutes: minutes(event),
  load: event.icu_training_load ?? event.load,
  structure: String(event.description || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*]/.test(line)),
  status: 'planejado' as const,
});
const activityDate = (activity: Json) =>
  String(activity.start_date_local || activity.start_date || '').slice(0, 10);
const activityMinutes = (activity: Json) =>
  Math.round(Number(activity.moving_time || activity.elapsed_time || 0) / 60) ||
  undefined;
const completedWorkout = (activity: Json, planned?: ReturnType<typeof normalize>) => {
  const actualLoad = Number(activity.icu_training_load || activity.load || 0);
  const plannedLoad = Number(planned?.load || 0);
  const ratio = plannedLoad && actualLoad ? actualLoad / plannedLoad : undefined;
  const rpe = Number(activity.perceived_exertion || activity.rpe || 0);
  const rawIntensity = Number(activity.icu_intensity || activity.intensity || 0);
  const intensity = rawIntensity > 2 ? rawIntensity / 100 : rawIntensity;
  const decoupling = Math.abs(Number(activity.decoupling || activity.aerobic_decoupling || 0));
  const durationHours = Number(activity.moving_time || 0) / 3600;
  const loadPerHour = durationHours && actualLoad ? actualLoad / durationHours : 0;
  const signals: string[] = [];
  let difficulty = 0;
  if (rpe) {
    signals.push(`sensação ${rpe}/10`);
    difficulty += rpe >= 8 ? 2 : rpe >= 6 ? 1 : 0;
  }
  if (intensity) {
    signals.push(`intensidade ${Math.round(intensity * 100)}%`);
    difficulty += intensity >= 0.9 ? 2 : intensity >= 0.75 ? 1 : 0;
  }
  if (loadPerHour) {
    signals.push(`carga por hora ${Math.round(loadPerHour)}`);
    difficulty += loadPerHour >= 80 ? 2 : loadPerHour >= 55 ? 1 : 0;
  }
  if (decoupling) {
    signals.push(`variação cardíaca ${decoupling.toFixed(1)}%`);
    difficulty += decoupling >= 8 ? 2 : decoupling >= 5 ? 1 : 0;
  }
  if (ratio) {
    signals.push(`carga ${Math.round(ratio * 100)}% do previsto`);
    difficulty += ratio > 1.2 ? 1 : 0;
  }
  let headline = 'Treino concluído';
  let message = 'Os dados disponíveis não bastam para dizer com segurança se foi fácil ou difícil.';
  let nextStep = 'Hidrate-se e siga a recuperação prevista no plano.';
  if (signals.length >= 2 && difficulty >= 4) {
    headline = 'Treino exigente';
    message = 'Mais de um sinal indica esforço alto. Considere esta sessão pesada, mesmo que um número isolado pareça normal.';
    nextStep = 'Priorize alimentação, hidratação e uma boa noite de sono.';
  } else if (signals.length >= 2 && difficulty === 0) {
    headline = 'Treino leve';
    message = 'Os sinais disponíveis apontam um esforço controlado e confortável.';
    nextStep = 'Recupere normalmente e não aumente o próximo treino por causa disso.';
  } else if (signals.length >= 2) {
    headline = 'Treino moderado';
    message = 'O conjunto dos sinais mostra esforço relevante, mas sem evidência suficiente de uma sessão muito pesada.';
    nextStep = 'Observe pernas, sono e disposição antes da próxima sessão.';
  } else if (ratio && ratio < 0.8) {
    headline = 'Menor que o planejado';
    message = 'A carga ficou abaixo da previsão, mas faltam outros sinais para classificar a dificuldade.';
    nextStep = 'Mantenha o plano e deixe a prontidão do dia seguinte orientar qualquer ajuste.';
  }
  return {
    id: activity.id,
    date: activityDate(activity),
    name: activity.name || planned?.name || 'Treino realizado',
    durationMinutes: activityMinutes(activity),
    load: actualLoad || undefined,
    structure: planned?.structure || [],
    status: 'realizado' as const,
    feedback: {
      headline,
      message,
      nextStep,
      confidence: signals.length >= 3 ? 'boa' : signals.length === 2 ? 'moderada' : 'limitada',
      signals,
    },
    details: {
      power: activity.average_watts || activity.weighted_average_watts,
      heartRate: activity.average_heartrate || activity.average_hr,
      cadence: activity.average_cadence,
      rpe: rpe || undefined,
      intensity: intensity || undefined,
      decoupling: decoupling || undefined,
      efficiency: activity.efficiency_factor || activity.power_hr_ratio,
    },
  };
};
const suggestion = {
  name: 'Giro regenerativo opcional',
  durationMinutes: 30,
  load: 18,
  structure: ['- 10m 45%', '- 15m 50%', '- 5m 40%'],
  reason:
    'Sessão curta e leve, oferecida apenas como opção. Não substitui descanso quando houver dor, doença ou fadiga fora do padrão.',
};

async function context(owner: string) {
  const today = todayInZone();
  const weekday = dayNumber(today);
  const monday = addDays(today, weekday === 0 ? -6 : 1 - weekday);
  const sunday = addDays(monday, 6);
  const [readiness, body, activityBody] = await Promise.all([
    runReadiness(owner, false),
    intervals(
      `/athlete/${runtime.INTERVALS_ATHLETE_ID}/events?oldest=${monday}&newest=${sunday}&category=WORKOUT&resolve=true`,
    ),
    intervals(
      `/athlete/${runtime.INTERVALS_ATHLETE_ID}/activities?oldest=${monday}&newest=${sunday}&limit=50`,
    ),
  ]);
  const planned = (Array.isArray(body) ? body : body?.events || [])
    .filter((event: Json) => event.category === 'WORKOUT')
    .map(normalize);
  const activities = (Array.isArray(activityBody)
    ? activityBody
    : activityBody?.activities || []
  ).filter((activity: Json) =>
    ['Ride', 'VirtualRide', 'EBikeRide', 'MountainBikeRide'].includes(
      activity.type || activity.icu_type,
    ),
  );
  const completedDates = new Set(activities.map(activityDate));
  const completed = activities.map((activity: Json) =>
    completedWorkout(
      activity,
      planned.find((event: ReturnType<typeof normalize>) => event.date === activityDate(activity)),
    ),
  );
  const events = [...planned.filter((event) => !completedDates.has(event.date)), ...completed]
    .sort((a: Json, b: Json) => a.date.localeCompare(b.date));
  const restDay = [0, 3, 5].includes(weekday);
  const hasToday = events.some((event: Json) => event.date === today);
  const canSuggest =
    restDay &&
    !hasToday &&
    ['verde', 'amarela'].includes(readiness.classification);
  return {
    today,
    monday,
    sunday,
    events,
    suggestion: canSuggest ? suggestion : null,
    suggestionStatus: !restDay
      ? 'Sugestões aparecem somente em dias de descanso.'
      : hasToday
        ? 'Já existe um treino no calendário de hoje.'
        : readiness.classification === 'vermelha'
          ? 'Recuperação insuficiente: preserve o descanso.'
          : readiness.classification === 'indisponível'
            ? 'Dados incompletos: nenhuma sugestão foi liberada.'
            : undefined,
  };
}

export async function GET(request: Request) {
  const owner = ownerId(request);
  if (!owner)
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  try {
    return Response.json(await context(owner));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Falha ao carregar semana' },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const owner = ownerId(request);
  if (!owner)
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  try {
    const state = await context(owner);
    if (!state.suggestion)
      return Response.json(
        { error: state.suggestionStatus || 'Sugestão não disponível.' },
        { status: 409 },
      );
    const created = await intervals(
      `/athlete/${runtime.INTERVALS_ATHLETE_ID}/events`,
      {
        method: 'POST',
        body: JSON.stringify({
          category: 'WORKOUT',
          start_date_local: `${state.today}T07:00:00`,
          name: suggestion.name,
          description: suggestion.structure.join('\n'),
          moving_time: suggestion.durationMinutes * 60,
          icu_training_load: suggestion.load,
        }),
      },
    );
    return Response.json({ created: normalize(created), week: await context(owner) });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Falha ao criar treino' },
      { status: 502 },
    );
  }
}
