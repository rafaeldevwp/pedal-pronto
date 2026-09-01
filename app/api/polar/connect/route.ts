import { ensurePolarSchema, ownerId, runtime } from '@/lib/polar';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const owner = ownerId(request);
  if (!owner) return new Response('Não autorizado', { status: 401 });
  await ensurePolarSchema();
  const state = crypto.randomUUID();
  await runtime.DB.prepare('DELETE FROM polar_oauth_states WHERE created_at < ?').bind(Date.now() - 600_000).run();
  await runtime.DB.prepare('INSERT INTO polar_oauth_states (state, owner_id, created_at) VALUES (?, ?, ?)').bind(state, owner, Date.now()).run();
  const url = new URL('https://flow.polar.com/oauth2/authorization');
  url.searchParams.set('response_type', 'code'); url.searchParams.set('client_id', runtime.POLAR_CLIENT_ID);
  url.searchParams.set('redirect_uri', runtime.POLAR_REDIRECT_URI); url.searchParams.set('scope', 'accesslink.read_all'); url.searchParams.set('state', state);
  return Response.redirect(url.toString(), 302);
}
