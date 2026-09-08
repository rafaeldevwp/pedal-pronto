import { ensurePolarSchema, ownerId, runtime } from '@/lib/polar';
import { resolveMesocycle } from '@/lib/mesocycle';

export const dynamic = 'force-dynamic';
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

async function read(owner: string) {
  const anchorRow = await runtime.DB.prepare('SELECT anchor_date FROM mesocycle_anchor WHERE owner_id=?').bind(owner).first<{ anchor_date: string }>();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  return resolveMesocycle(anchorRow?.anchor_date, today);
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
  const body = await request.json() as { anchor?: string };
  if (body.anchor !== undefined) {
    if (!datePattern.test(body.anchor)) return Response.json({ error: 'Âncora inválida' }, { status: 400 });
    await runtime.DB.prepare('INSERT INTO mesocycle_anchor(owner_id,anchor_date,updated_at) VALUES(?,?,?) ON CONFLICT(owner_id) DO UPDATE SET anchor_date=excluded.anchor_date,updated_at=excluded.updated_at').bind(owner, body.anchor, Date.now()).run();
  }
  return Response.json(await read(owner));
}
