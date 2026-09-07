import { ownerId } from '@/lib/polar';
import { confirmReadinessProposal, runReadiness, type Checkin } from '@/lib/readiness';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const owner = ownerId(request);
  if (!owner)
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  return Response.json(await runReadiness(owner));
}
export async function POST(request: Request) {
  const owner = ownerId(request);
  if (!owner)
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  let body: { action?: string; confirmed?: boolean; proposalId?: string; operationId?: string; checkin?: Checkin } = {};
  try {
    body = await request.json();
  } catch {}
  try {
    if (body.action === 'confirm_today') {
      if (!body.confirmed || !body.proposalId || !body.operationId)
        return Response.json({ error: 'CONSENT_REQUIRED' }, { status: 400 });
      return Response.json(await confirmReadinessProposal(owner, body.proposalId, body.operationId, body.checkin));
    }
    return Response.json(await runReadiness(owner, body.checkin));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao processar';
    const status = ['WORKOUT_COMPLETED', 'EVENT_NOT_EDITABLE', 'PROPOSAL_CHANGED'].includes(message) ? 409 : 400;
    return Response.json({ error: message }, { status });
  }
}
