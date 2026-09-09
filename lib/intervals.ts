import { runtime } from '@/lib/polar';

// Casa compartilhada da chamada ao Intervals.icu. `lib/readiness.ts`, `app/api/week/route.ts` e
// `app/api/performance/route.ts` ainda mantêm cópias próprias, anteriores a este módulo; unificar
// as três está registrado como pendência em docs/TASKS.md.
export async function intervalsFetch(path: string, init?: RequestInit) {
  const response = await fetch(`https://intervals.icu/api/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${btoa(`API_KEY:${runtime.INTERVALS_API_KEY}`)}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
  });
  if (response.status === 401 || response.status === 403) throw new Error('INTERVALS_AUTH');
  if (!response.ok) throw new Error(`INTERVALS_${response.status}`);
  return response.status === 204 ? null : response.json();
}

export type IntervalsEvent = Record<string, any>;

export function plannedEventsFrom(body: unknown): Array<{ date: string; name: string }> {
  const raw: IntervalsEvent[] = Array.isArray(body) ? body : (body as any)?.events || [];
  return raw
    .filter((event) => event.category === 'WORKOUT')
    .map((event) => ({
      date: String(event.start_date_local || event.start_date || '').slice(0, 10),
      name: String(event.name || ''),
    }))
    .filter((event) => event.date);
}
