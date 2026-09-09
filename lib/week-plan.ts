export type DatedSession = { date: string };

// SPEC-32: parear atividade realizada com treino planejado, um para um.
//
// O emparelhamento por data que existia antes tinha dois defeitos. Ao montar a semana, todos os
// treinos planejados de um dia com qualquer atividade eram descartados — dois planejados e um
// pedal faziam os dois sumirem da lista. E ao gerar o feedback, cada atividade buscava o primeiro
// planejado daquela data, então dois pedais no mesmo dia eram ambos comparados contra o mesmo
// treino: um deslocamento de 20 minutos aparecia como "carga 21% do previsto" do treino principal.
//
// Aqui cada atividade consome no máximo um planejado, e o que sobra continua visível na semana.
export function pairActivitiesWithPlanned<A extends DatedSession, P extends DatedSession>(
  activities: A[],
  planned: P[],
): { pairs: Array<{ activity: A; planned?: P }>; unmatchedPlanned: P[] } {
  const remaining = [...planned];
  const pairs = activities.map((activity) => {
    const index = remaining.findIndex((event) => event.date === activity.date);
    return { activity, planned: index >= 0 ? remaining.splice(index, 1)[0] : undefined };
  });
  return { pairs, unmatchedPlanned: remaining };
}
