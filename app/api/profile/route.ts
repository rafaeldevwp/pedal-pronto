import { ensurePolarSchema, ownerId, runtime } from '@/lib/polar';

export const dynamic = 'force-dynamic';

const fallback = {
  objective: 'performance',
  eventName: '',
  eventDate: '',
  priority: 'principal',
};

export async function GET(request: Request) {
  const owner = ownerId(request);
  if (!owner) return Response.json({ error: 'Não autorizado' }, { status: 401 });
  await ensurePolarSchema();
  const row = await runtime.DB.prepare(
    'SELECT objective, event_name, event_date, priority FROM athlete_goals WHERE owner_id=?',
  ).bind(owner).first<Record<string, string>>();
  return Response.json(row ? {
    objective: row.objective,
    eventName: row.event_name || '',
    eventDate: row.event_date || '',
    priority: row.priority,
  } : fallback);
}

export async function PUT(request: Request) {
  const owner = ownerId(request);
  if (!owner) return Response.json({ error: 'Não autorizado' }, { status: 401 });
  await ensurePolarSchema();
  const body = await request.json() as Record<string, string>;
  const objective = ['performance', 'resistencia', 'ftp', 'saude'].includes(body.objective) ? body.objective : fallback.objective;
  const priority = ['principal', 'secundario', 'base'].includes(body.priority) ? body.priority : fallback.priority;
  const eventName = String(body.eventName || '').trim().slice(0, 80);
  const eventDate = /^\d{4}-\d{2}-\d{2}$/.test(body.eventDate || '') ? body.eventDate : '';
  await runtime.DB.prepare(
    'INSERT INTO athlete_goals (owner_id,objective,event_name,event_date,priority,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(owner_id) DO UPDATE SET objective=excluded.objective,event_name=excluded.event_name,event_date=excluded.event_date,priority=excluded.priority,updated_at=excluded.updated_at',
  ).bind(owner, objective, eventName || null, eventDate || null, priority, Date.now()).run();
  return Response.json({ objective, eventName, eventDate, priority });
}
