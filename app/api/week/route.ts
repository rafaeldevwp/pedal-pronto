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
});
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
  const [readiness, body] = await Promise.all([
    runReadiness(owner, false),
    intervals(
      `/athlete/${runtime.INTERVALS_ATHLETE_ID}/events?oldest=${monday}&newest=${sunday}&category=WORKOUT&resolve=true`,
    ),
  ]);
  const events = (Array.isArray(body) ? body : body?.events || [])
    .filter((event: Json) => event.category === 'WORKOUT')
    .map(normalize)
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
