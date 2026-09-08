import { ensurePolarSchema, ownerId, runtime } from '@/lib/polar';
import { resolveMesocycle } from '@/lib/mesocycle';

export const dynamic = 'force-dynamic';
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

async function read(owner: string) {
  const anchorRow = await runtime.DB.prepare('SELECT anchor_date FROM mesocycle_anchor WHERE owner_id=?').bind(owner).first<{ anchor_date: string }>();
  const rows = await runtime.DB.prepare('SELECT cycle,week,phase FROM mesocycle_phases WHERE owner_id=? ORDER BY cycle,week').bind(owner).all<{ cycle: number; week: number; phase: string }>();
  const phases = Object.fromEntries((rows.results || []).map((row) => [`${row.cycle}:${row.week}`, row.phase]));
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  return { ...resolveMesocycle(anchorRow?.anchor_date, today, phases), phases };
}

export async function GET(request: Request) {
  const owner = ownerId(request);
  if (!owner) return Response.json({ error: 'Não autorizado' }, { status: 401 });
  await ensurePolarSchema();
  return Response.json(await read(owner));
}

export async function PUT(request: Request) {
  const owner = ownerId(request);
  if (!owner) return Response.json({ error: 'Não autorizado' }, { status: 401 });
  await ensurePolarSchema();
  const body = await request.json() as { anchor?: string; phases?: Record<string, string>; phase?: { cycle: number; week: number; value: string } };
  if (body.anchor !== undefined) {
    if (!datePattern.test(body.anchor)) return Response.json({ error: 'Âncora inválida' }, { status: 400 });
    await runtime.DB.prepare('INSERT INTO mesocycle_anchor(owner_id,anchor_date,updated_at) VALUES(?,?,?) ON CONFLICT(owner_id) DO UPDATE SET anchor_date=excluded.anchor_date,updated_at=excluded.updated_at').bind(owner, body.anchor, Date.now()).run();
  }
  const entries = body.phases ? Object.entries(body.phases).map(([key, value]) => ({ cycle: Number(key.split(':')[0]), week: Number(key.split(':')[1]), value })) : body.phase ? [body.phase] : [];
  for (const item of entries) {
    const value = String(item.value || '').trim().slice(0, 40);
    if (!Number.isInteger(item.cycle) || item.cycle < 1 || !Number.isInteger(item.week) || item.week < 1 || item.week > 4 || !value) return Response.json({ error: 'Fase inválida' }, { status: 400 });
    await runtime.DB.prepare('INSERT INTO mesocycle_phases(owner_id,cycle,week,phase,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(owner_id,cycle,week) DO UPDATE SET phase=excluded.phase,updated_at=excluded.updated_at').bind(owner, item.cycle, item.week, value, Date.now()).run();
  }
  return Response.json(await read(owner));
}
