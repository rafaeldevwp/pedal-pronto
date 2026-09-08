import { ensurePolarSchema, ownerId, runtime } from '@/lib/polar';

export const dynamic = 'force-dynamic';

const fallback = {
  objective: 'performance',
  eventName: '',
  eventDate: '',
  priority: 'principal',
  rampRateLimit: 6,
};

export async function GET(request: Request) {
  const owner = ownerId(request);
  if (!owner) return Response.json({ error: 'Não autorizado' }, { status: 401 });
  await ensurePolarSchema();
  const row = await runtime.DB.prepare(
    'SELECT objective, event_name, event_date, priority FROM athlete_goals WHERE owner_id=?',
  ).bind(owner).first<Record<string, string>>();
  const settings = await runtime.DB.prepare('SELECT ramp_rate_limit FROM athlete_safety_settings WHERE owner_id=?').bind(owner).first<{ ramp_rate_limit: number }>();
  return Response.json(row ? {
    objective: row.objective,
    eventName: row.event_name || '',
    eventDate: row.event_date || '',
    priority: row.priority,
    rampRateLimit: settings?.ramp_rate_limit ?? 6,
  } : fallback);
}

export async function PUT(request: Request) {
  const owner = ownerId(request);
  if (!owner) return Response.json({ error: 'Não autorizado' }, { status: 401 });
  await ensurePolarSchema();
  const body = await request.json() as Record<string, string | number>;
  const objectiveValue = String(body.objective || '');
  const priorityValue = String(body.priority || '');
  const objective = ['performance', 'resistencia', 'ftp', 'saude'].includes(objectiveValue) ? objectiveValue : fallback.objective;
  const priority = ['principal', 'secundario', 'base'].includes(priorityValue) ? priorityValue : fallback.priority;
  const eventName = String(body.eventName || '').trim().slice(0, 80);
  const eventDateValue = String(body.eventDate || '');
  const eventDate = /^\d{4}-\d{2}-\d{2}$/.test(eventDateValue) ? eventDateValue : '';
  await runtime.DB.prepare(
    'INSERT INTO athlete_goals (owner_id,objective,event_name,event_date,priority,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(owner_id) DO UPDATE SET objective=excluded.objective,event_name=excluded.event_name,event_date=excluded.event_date,priority=excluded.priority,updated_at=excluded.updated_at',
  ).bind(owner, objective, eventName || null, eventDate || null, priority, Date.now()).run();
  const requestedLimit = Number(body.rampRateLimit);
  const rampRateLimit = Number.isFinite(requestedLimit) && requestedLimit >= 1 && requestedLimit <= 15 ? requestedLimit : 6;
  await runtime.DB.prepare('INSERT INTO athlete_safety_settings(owner_id,ramp_rate_limit,updated_at) VALUES(?,?,?) ON CONFLICT(owner_id) DO UPDATE SET ramp_rate_limit=excluded.ramp_rate_limit,updated_at=excluded.updated_at').bind(owner, rampRateLimit, Date.now()).run();
  return Response.json({ objective, eventName, eventDate, priority, rampRateLimit });
}
