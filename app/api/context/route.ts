import { ownerId } from '@/lib/polar';
import { loadAthleteContext } from '@/lib/context-loader';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const owner = ownerId(request);
  if (!owner) return Response.json({ error: 'Não autorizado' }, { status: 401 });
  try {
    const { snapshot } = await loadAthleteContext(owner);
    return Response.json(snapshot);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Falha ao carregar contexto' },
      { status: 502 },
    );
  }
}
