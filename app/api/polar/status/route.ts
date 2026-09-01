import { ensurePolarSchema, ownerId, runtime } from '@/lib/polar';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const owner = ownerId(request); if (!owner) return Response.json({ connected: false }, { status: 401 });
  await ensurePolarSchema(); const row = await runtime.DB.prepare('SELECT connected_at FROM polar_connections WHERE owner_id = ?').bind(owner).first<{ connected_at: number }>();
  return Response.json({ connected: Boolean(row), connectedAt: row?.connected_at ?? null });
}
