import { ensurePolarSchema, ownerId, runtime } from '@/lib/polar';
import { resolveMesocycleFromEvents } from '@/lib/mesocycle';
import { intervalsFetch, plannedEventsFrom } from '@/lib/intervals';

export const dynamic = 'force-dynamic';

// SPEC-28: a fase vem do código C{n}W{n}D{n} no nome do treino no Intervals.icu. Não há mais o
// que cadastrar, então a rota perdeu o PUT — é somente leitura.
export async function GET(request: Request) {
  const owner = ownerId(request);
  if (!owner) return Response.json({ error: 'Não autorizado' }, { status: 401 });
  await ensurePolarSchema();
  const now = new Date();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
  const lookbackStart = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(now.getTime() - 28 * 86_400_000));
  const events = await intervalsFetch(`/athlete/${runtime.INTERVALS_ATHLETE_ID}/events?oldest=${lookbackStart}&newest=${today}&category=WORKOUT`);
  return Response.json(resolveMesocycleFromEvents(plannedEventsFrom(events), today));
}
