import { basicAuth, ensurePolarSchema, runtime } from '@/lib/polar';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const incoming = new URL(request.url); const code = incoming.searchParams.get('code'); const state = incoming.searchParams.get('state');
  if (!code || !state) return Response.redirect(new URL('/?polar=denied', incoming), 302);
  await ensurePolarSchema();
  const row = await runtime.DB.prepare('SELECT owner_id, created_at FROM polar_oauth_states WHERE state = ?').bind(state).first<{ owner_id: string; created_at: number }>();
  await runtime.DB.prepare('DELETE FROM polar_oauth_states WHERE state = ?').bind(state).run();
  if (!row || Date.now() - row.created_at > 600_000) return Response.redirect(new URL('/?polar=expired', incoming), 302);
  const tokenResponse = await fetch('https://polarremote.com/v2/oauth2/token', { method: 'POST', headers: { Authorization: basicAuth(), 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: runtime.POLAR_REDIRECT_URI }) });
  if (!tokenResponse.ok) return Response.redirect(new URL('/?polar=failed', incoming), 302);
  const token = await tokenResponse.json() as { access_token: string; x_user_id: number | string };
  const register = await fetch('https://www.polaraccesslink.com/v3/users', { method: 'POST', headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ 'member-id': `pedal-pronto-${row.owner_id}` }) });
  if (![200, 201, 204, 409].includes(register.status)) return Response.redirect(new URL('/?polar=failed', incoming), 302);
  await runtime.DB.prepare('INSERT INTO polar_connections (owner_id, polar_user_id, access_token, connected_at) VALUES (?, ?, ?, ?) ON CONFLICT(owner_id) DO UPDATE SET polar_user_id=excluded.polar_user_id, access_token=excluded.access_token, connected_at=excluded.connected_at').bind(row.owner_id, String(token.x_user_id), token.access_token, Date.now()).run();
  return Response.redirect(new URL('/?polar=connected', incoming), 302);
}
