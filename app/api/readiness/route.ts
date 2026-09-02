import { ownerId } from '@/lib/polar';
import { runReadiness } from '@/lib/readiness';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const owner = ownerId(request);
  if (!owner)
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  return Response.json(await runReadiness(owner, false));
}
export async function POST(request: Request) {
  const owner = ownerId(request);
  if (!owner)
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  let body: any = {};
  try {
    body = await request.json();
  } catch {}
  return Response.json(await runReadiness(owner, true, body.checkin));
}
