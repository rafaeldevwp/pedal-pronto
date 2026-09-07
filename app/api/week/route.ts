import { ensurePolarSchema, ownerId, runtime } from '@/lib/polar';
import { runReadiness } from '@/lib/readiness';

export const dynamic = 'force-dynamic';

type Json = Record<string, any>;
const zone = 'America/Sao_Paulo';
const isoDate = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
const todayInZone = () => isoDate(new Date());
const dayNumber = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};
const addDays = (date: string, amount: number) => {
  const [year, month, day] = date.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day + amount));
  return value.toISOString().slice(0, 10);
};
const intervals = async (path: string, init?: RequestInit) => {
  const response = await fetch(`https://intervals.icu/api/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${btoa(`API_KEY:${runtime.INTERVALS_API_KEY}`)}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (response.status === 401 || response.status === 403)
    throw new Error('INTERVALS_AUTH');
  if (!response.ok) throw new Error(`INTERVALS_${response.status}`);
  return response.status === 204 ? null : response.json();
};
const minutes = (event: Json) => {
  const seconds = Number(
    event.moving_time || event.duration || event.workout_doc?.duration || 0,
  );
  return seconds ? Math.round(seconds / 60) : undefined;
};
const normalize = (event: Json) => ({
  id: event.id,
  date: String(event.start_date_local || event.start_date || '').slice(0, 10),
  name: event.name || 'Treino sem nome',
  durationMinutes: minutes(event),
  load: event.icu_training_load ?? event.load,
  structure: String(event.description || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*]/.test(line)),
  status: 'planejado' as const,
});
const activityDate = (activity: Json) =>
  String(activity.start_date_local || activity.start_date || '').slice(0, 10);
const activityMinutes = (activity: Json) =>
  Math.round(Number(activity.moving_time || activity.elapsed_time || 0) / 60) ||
  undefined;
const activityIntensity = (activity: Json) => {
  const value = Number(activity.icu_intensity || activity.intensity || 0);
  return value > 2 ? value / 100 : value;
};
const activityModality = (activity: Json) =>
  String(activity.type || activity.icu_type || '').includes('Virtual') ? 'indoor' : 'outdoor';
const activityMetric = (activity: Json) => {
  const durationHours = Number(activity.moving_time || activity.elapsed_time || 0) / 3600;
  const load = Number(activity.icu_training_load || activity.load || 0);
  const power = Number(activity.average_watts || activity.weighted_average_watts || 0);
  const heartRate = Number(activity.average_heartrate || activity.average_hr || 0);
  return {
    power, heartRate,
    cadence: Number(activity.average_cadence || 0),
    rpe: Number(activity.perceived_exertion || activity.rpe || 0),
    intensity: activityIntensity(activity),
    decoupling: Math.abs(Number(activity.decoupling || activity.aerobic_decoupling || 0)),
    efficiency: Number(activity.efficiency_factor || activity.power_hr_ratio || (power && heartRate ? power / heartRate : 0)),
    loadPerHour: durationHours && load ? load / durationHours : 0,
  };
};
const median = (values: number[]) => {
  const sorted = values.filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
  if (!sorted.length) return undefined;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const pct = (current: number, baseline?: number) => baseline && current ? ((current / baseline) - 1) * 100 : undefined;
const similarComparison = (activity: Json, history: Json[]) => {
  const duration = activityMinutes(activity) || 0;
  const intensity = activityIntensity(activity);
  const modality = activityModality(activity);
  const currentDate = activityDate(activity);
  const candidates = history
    .filter((candidate) => {
      const candidateDuration = activityMinutes(candidate) || 0;
      const candidateIntensity = activityIntensity(candidate);
      return activityDate(candidate) < currentDate &&
        activityModality(candidate) === modality &&
        candidateDuration >= duration * 0.75 && candidateDuration <= duration * 1.25 &&
        (!intensity || !candidateIntensity || Math.abs(candidateIntensity - intensity) <= 0.1);
    })
    .sort((a, b) => {
      const aDistance = Math.abs((activityMinutes(a) || 0) - duration) + Math.abs(activityIntensity(a) - intensity) * 100;
      const bDistance = Math.abs((activityMinutes(b) || 0) - duration) + Math.abs(activityIntensity(b) - intensity) * 100;
      return aDistance - bDistance;
    })
    .slice(0, 8);
  const group = `${candidates.length} ${modality === 'indoor' ? 'pedais indoor' : 'pedais ao ar livre'} de duração e intensidade parecidas nos últimos 120 dias`;
  if (candidates.length < 3) return {
    headline: 'Ainda faltam treinos parecidos',
    message: 'O histórico ainda não permite afirmar se esta sessão foi melhor ou pior que o seu padrão.',
    group,
    confidence: 'limitada',
    evidence: ['São necessários pelo menos 3 treinos pessoais comparáveis.'],
    caveat: 'Tipo, duração e intensidade reduzem diferenças, mas percurso, clima e equipamento também influenciam.',
  };
  const current = activityMetric(activity);
  const baselines = Object.fromEntries(Object.keys(current).map((key) => [key, median(candidates.map((candidate) => activityMetric(candidate)[key as keyof ReturnType<typeof activityMetric>]))])) as Record<keyof ReturnType<typeof activityMetric>, number | undefined>;
  const powerChange = pct(current.power, baselines.power);
  const hrChange = pct(current.heartRate, baselines.heartRate);
  const efficiencyChange = pct(current.efficiency, baselines.efficiency);
  const cadenceChange = pct(current.cadence, baselines.cadence);
  const loadChange = pct(current.loadPerHour, baselines.loadPerHour);
  const evidence: string[] = [];
  if (powerChange !== undefined) evidence.push(`Potência ${Math.abs(powerChange).toFixed(0)}% ${powerChange >= 0 ? 'acima' : 'abaixo'} do padrão semelhante.`);
  if (hrChange !== undefined) evidence.push(`Esforço do coração ${Math.abs(hrChange).toFixed(0)}% ${hrChange >= 0 ? 'acima' : 'abaixo'} do padrão.`);
  if (cadenceChange !== undefined && Math.abs(cadenceChange) >= 3) evidence.push(`Cadência ${Math.abs(cadenceChange).toFixed(0)}% ${cadenceChange >= 0 ? 'acima' : 'abaixo'} do habitual.`);
  if (current.decoupling && baselines.decoupling) evidence.push(`Variação cardíaca ${current.decoupling.toFixed(1)}%, ante ${baselines.decoupling.toFixed(1)}% no grupo.`);
  if (current.rpe && baselines.rpe) evidence.push(`Sensação ${current.rpe}/10, ante ${baselines.rpe.toFixed(1)}/10 no grupo.`);
  if (loadChange !== undefined) evidence.push(`Carga por hora ${Math.abs(loadChange).toFixed(0)}% ${loadChange >= 0 ? 'maior' : 'menor'}.`);
  const efficientSignals = Number((efficiencyChange || 0) >= 3) + Number((powerChange || 0) >= 3 && (hrChange || 0) <= 2) + Number(Boolean(current.decoupling && baselines.decoupling && current.decoupling <= baselines.decoupling));
  const demandingSignals = Number((powerChange || 0) <= -4 && (hrChange || 0) >= 3) + Number(Boolean(current.decoupling && baselines.decoupling && current.decoupling >= baselines.decoupling + 2)) + Number(Boolean(current.rpe && baselines.rpe && current.rpe >= baselines.rpe + 2));
  const comparableMetrics = [powerChange, hrChange, efficiencyChange, cadenceChange, loadChange, current.decoupling && baselines.decoupling, current.rpe && baselines.rpe].filter((value) => value !== undefined && value !== 0).length;
  let headline = 'Dentro do seu padrão';
  let message = 'O conjunto dos dados ficou próximo ao que costuma acontecer em sessões semelhantes.';
  if (efficientSignals >= 2) {
    headline = 'Mais eficiente que o habitual';
    message = 'Você entregou um resultado melhor com esforço cardíaco controlado em comparação com seus pedais parecidos.';
  } else if (demandingSignals >= 2) {
    headline = 'Mais difícil que o habitual';
    message = 'Mais de um sinal mostra que esta sessão custou mais ao corpo do que pedais semelhantes.';
  }
  return {
    headline, message, group,
    confidence: candidates.length >= 6 && comparableMetrics >= 4 ? 'boa' : 'moderada',
    evidence: evidence.slice(0, 4),
    caveat: 'É uma comparação pessoal, não um diagnóstico; percurso, clima, equipamento e qualidade dos sensores podem mudar o resultado.',
  };
};
const completedWorkout = (activity: Json, history: Json[], planned?: ReturnType<typeof normalize>) => {
  const actualLoad = Number(activity.icu_training_load || activity.load || 0);
  const plannedLoad = Number(planned?.load || 0);
  const ratio = plannedLoad && actualLoad ? actualLoad / plannedLoad : undefined;
  const rpe = Number(activity.perceived_exertion || activity.rpe || 0);
  const intensity = activityIntensity(activity);
  const decoupling = Math.abs(Number(activity.decoupling || activity.aerobic_decoupling || 0));
  const durationHours = Number(activity.moving_time || 0) / 3600;
  const loadPerHour = durationHours && actualLoad ? actualLoad / durationHours : 0;
  const signals: string[] = [];
  let difficulty = 0;
  if (rpe) {
    signals.push(`sensação ${rpe}/10`);
    difficulty += rpe >= 8 ? 2 : rpe >= 6 ? 1 : 0;
  }
  if (intensity) {
    signals.push(`intensidade ${Math.round(intensity * 100)}%`);
    difficulty += intensity >= 0.9 ? 2 : intensity >= 0.75 ? 1 : 0;
  }
  if (loadPerHour) {
    signals.push(`carga por hora ${Math.round(loadPerHour)}`);
    difficulty += loadPerHour >= 80 ? 2 : loadPerHour >= 55 ? 1 : 0;
  }
  if (decoupling) {
    signals.push(`variação cardíaca ${decoupling.toFixed(1)}%`);
    difficulty += decoupling >= 8 ? 2 : decoupling >= 5 ? 1 : 0;
  }
  if (ratio) {
    signals.push(`carga ${Math.round(ratio * 100)}% do previsto`);
    difficulty += ratio > 1.2 ? 1 : 0;
  }
  let headline = 'Treino concluído';
  let message = 'Os dados disponíveis não bastam para dizer com segurança se foi fácil ou difícil.';
  let nextStep = 'Hidrate-se e siga a recuperação prevista no plano.';
  if (signals.length >= 2 && difficulty >= 4) {
    headline = 'Treino exigente';
    message = 'Mais de um sinal indica esforço alto. Considere esta sessão pesada, mesmo que um número isolado pareça normal.';
    nextStep = 'Priorize alimentação, hidratação e uma boa noite de sono.';
  } else if (signals.length >= 2 && difficulty === 0) {
    headline = 'Treino leve';
    message = 'Os sinais disponíveis apontam um esforço controlado e confortável.';
    nextStep = 'Recupere normalmente e não aumente o próximo treino por causa disso.';
  } else if (signals.length >= 2) {
    headline = 'Treino moderado';
    message = 'O conjunto dos sinais mostra esforço relevante, mas sem evidência suficiente de uma sessão muito pesada.';
    nextStep = 'Observe pernas, sono e disposição antes da próxima sessão.';
  } else if (ratio && ratio < 0.8) {
    headline = 'Menor que o planejado';
    message = 'A carga ficou abaixo da previsão, mas faltam outros sinais para classificar a dificuldade.';
    nextStep = 'Mantenha o plano e deixe a prontidão do dia seguinte orientar qualquer ajuste.';
  }
  return {
    id: activity.id,
    date: activityDate(activity),
    name: activity.name || planned?.name || 'Treino realizado',
    durationMinutes: activityMinutes(activity),
    load: actualLoad || undefined,
    structure: planned?.structure || [],
    status: 'realizado' as const,
    feedback: {
      headline,
      message,
      nextStep,
      confidence: signals.length >= 3 ? 'boa' : signals.length === 2 ? 'moderada' : 'limitada',
      signals,
    },
    comparison: similarComparison(activity, history),
    details: {
      power: activity.average_watts || activity.weighted_average_watts,
      heartRate: activity.average_heartrate || activity.average_hr,
      cadence: activity.average_cadence,
      rpe: rpe || undefined,
      intensity: intensity || undefined,
      decoupling: decoupling || undefined,
      efficiency: activity.efficiency_factor || activity.power_hr_ratio,
    },
  };
};

const objectiveNames: Record<string, string> = { performance: 'performance geral', resistencia: 'resistência', ftp: 'potência/FTP', saude: 'saúde e consistência' };

function futureProposal(event: Json, goal: { objective: string; eventDate?: string; priority?: string }) {
  const objective = goal.objective || 'performance';
  const original = normalize(event);
  const description = String(event.description || '');
  if (description.includes('Ajuste semanal confirmado pelo Pedal Pronto.')) return null;
  const updated = { ...event };
  const reps = description.match(/\b([3-9]|[1-9]\d)x\b/i);
  let change = '';
  let factor = 0.86;
  const intensity = description.match(/\b(8[5-9]|9\d|1[0-4]\d)%/);
  const eventDays = goal.eventDate ? Math.ceil((new Date(`${goal.eventDate}T12:00:00Z`).getTime() - Date.now()) / 86400000) : undefined;
  const protectSpecificity = goal.priority === 'principal' && eventDays !== undefined && eventDays >= 0 && eventDays <= 21;
  const preferIntensity = !protectSpecificity && (objective === 'resistencia' || objective === 'saude');
  if (reps && (!preferIntensity || !intensity)) {
    const from = Number(reps[1]);
    const to = Math.max(2, from - 1);
    updated.description = description.replace(reps[0], `${to}x`);
    updated.name = String(event.name || '').replace(new RegExp(`\\b${from}x`, 'i'), `${to}x`);
    change = `Reduzir somente as repetições, de ${from} para ${to}; intensidade e recuperação permanecem iguais.`;
    factor = Math.max(0.72, to / from);
  } else {
    if (!intensity) return null;
    const from = Number(intensity[1]);
    const to = Math.max(80, from - 5);
    updated.description = description.replace(intensity[0], `${to}%`);
    change = `Reduzir somente a intensidade principal, de ${from}% para ${to}%; duração e recuperações permanecem iguais.`;
    factor = 0.9;
  }
  delete updated.workout_doc;
  delete updated.icu_training_load;
  updated.description = `${updated.description}\n\nAjuste semanal confirmado pelo Pedal Pronto.`;
  const proposed = normalize(updated);
  proposed.durationMinutes = original.durationMinutes;
  proposed.load = original.load ? Math.round(original.load * factor) : undefined;
  return {
    updated,
    proposal: {
      eventId: original.id,
      date: original.date,
      reason: `A recuperação ou a carga recente pode comprometer o próximo estímulo. A proposta protege o objetivo de ${objectiveNames[objective] || objectiveNames.performance}${protectSpecificity ? ` e a especificidade da meta principal em ${eventDays} dias` : ''}, reduzindo apenas uma variável.`,
      change,
      original: { name: original.name, durationMinutes: original.durationMinutes, load: original.load, structure: original.structure },
      recommended: { name: proposed.name, durationMinutes: proposed.durationMinutes, load: proposed.load, structure: proposed.structure },
    },
  };
}
function chooseSuggestion(readiness: Awaited<ReturnType<typeof runReadiness>>, activities: Json[], planned: Array<ReturnType<typeof normalize>>, today: string) {
  const recent = activities.slice(-4);
  const hard = recent.filter((a) => Number(a.icu_intensity || a.intensity || 0) >= 75).length;
  const long = recent.some((a) => Number(a.moving_time || 0) >= 2 * 3600);
  const next = planned.find((event) => event.date > today);
  if (readiness.classification === 'amarela' || hard >= 2 || long) return {
    name: 'Ativação regenerativa opcional', durationMinutes: 25, load: 12,
    structure: ['- 8m 42%', '- 12m 48% 90-95rpm', '- 5m 40%'],
    reason: `A semana já trouxe ${hard >= 2 ? 'estímulos intensos' : long ? 'volume relevante' : 'recuperação parcial'}. Esta opção favorece circulação sem adicionar um novo estímulo.${next ? ` Preserva o próximo treino: ${next.name}.` : ''}`,
  };
  const lowCadence = recent.every((a) => Number(a.average_cadence || 0) < 88);
  if (lowCadence) return {
    name: 'Técnica de cadência opcional', durationMinutes: 35, load: 20,
    structure: ['- 10m 48%', '- 4x 2m 55% 95-105rpm, 2m 45%', '- 9m 45%'],
    reason: `Prontidão favorável e pouco trabalho recente de cadência. O estímulo é técnico e leve, sem competir com a progressão da semana.${next ? ` O treino ${next.name} continua prioritário.` : ''}`,
  };
  return {
    name: 'Endurance leve opcional', durationMinutes: 40, load: 25,
    structure: ['- 10m 48%', '- 25m 58-62%', '- 5m 42%'],
    reason: `Recuperação favorável e carga recente controlada. Esta opção acrescenta base aeróbica com baixo custo, sem transformar o descanso em obrigação.${next ? ` Preserva o próximo treino: ${next.name}.` : ''}`,
  };
}

async function context(owner: string) {
  await ensurePolarSchema();
  const today = todayInZone();
  const weekday = dayNumber(today);
  const monday = addDays(today, weekday === 0 ? -6 : 1 - weekday);
  const sunday = addDays(monday, 6);
  const historyStart = addDays(today, -120);
  const [readiness, body, activityBody, historyBody, goalRow] = await Promise.all([
    runReadiness(owner, false),
    intervals(
      `/athlete/${runtime.INTERVALS_ATHLETE_ID}/events?oldest=${monday}&newest=${sunday}&category=WORKOUT&resolve=true`,
    ),
    intervals(
      `/athlete/${runtime.INTERVALS_ATHLETE_ID}/activities?oldest=${monday}&newest=${sunday}&limit=50`,
    ),
    intervals(
      `/athlete/${runtime.INTERVALS_ATHLETE_ID}/activities?oldest=${historyStart}&newest=${today}&limit=250`,
    ),
    runtime.DB.prepare('SELECT objective,event_name,event_date,priority FROM athlete_goals WHERE owner_id=?').bind(owner).first<Record<string, string>>(),
  ]);
  const goal = {
    objective: goalRow?.objective || 'performance',
    eventName: goalRow?.event_name || '',
    eventDate: goalRow?.event_date || '',
    priority: goalRow?.priority || 'principal',
  };
  const rawPlanned = (Array.isArray(body) ? body : body?.events || [])
    .filter((event: Json) => event.category === 'WORKOUT')
  const planned = rawPlanned.map(normalize);
  const activities = (Array.isArray(activityBody)
    ? activityBody
    : activityBody?.activities || []
  ).filter((activity: Json) =>
    ['Ride', 'VirtualRide', 'EBikeRide', 'MountainBikeRide'].includes(
      activity.type || activity.icu_type,
    ),
  );
  const history = (Array.isArray(historyBody) ? historyBody : historyBody?.activities || []).filter((activity: Json) =>
    ['Ride', 'VirtualRide', 'EBikeRide', 'MountainBikeRide'].includes(activity.type || activity.icu_type),
  );
  const completedDates = new Set(activities.map(activityDate));
  const completed = activities.map((activity: Json) =>
    completedWorkout(
      activity,
      history,
      planned.find((event: ReturnType<typeof normalize>) => event.date === activityDate(activity)),
    ),
  );
  const events = [...planned.filter((event) => !completedDates.has(event.date)), ...completed]
    .sort((a: Json, b: Json) => a.date.localeCompare(b.date));
  const restDay = [0, 3, 5].includes(weekday);
  const hasToday = events.some((event: Json) => event.date === today);
  const canSuggest =
    restDay &&
    !hasToday &&
    ['verde', 'amarela'].includes(readiness.classification);
  const adaptiveSuggestion = chooseSuggestion(readiness, activities, planned, today);
  const yesterday = addDays(today, -1);
  const yesterdayLoad = activities.filter((a) => activityDate(a) === yesterday).reduce((sum, a) => sum + Number(a.icu_training_load || a.load || 0), 0);
  const planOutlook = planned.filter((event) => event.date > today).slice(0, 3).map((event) => {
    const stressed = readiness.classification !== 'verde' || yesterdayLoad > Math.max(70, Number(readiness.metrics.ctl || 0) * 1.5);
    return {
      id: event.id, date: event.date, name: event.name,
      status: stressed ? 'observar' : 'protegido',
      note: stressed ? 'Pode precisar de ajuste se a recuperação não normalizar. Nenhuma mudança aplicada.' : 'Compatível com a carga atual. Nenhuma mudança proposta.',
    };
  });
  const stressed = readiness.classification !== 'verde' || yesterdayLoad > Math.max(70, Number(readiness.metrics.ctl || 0) * 1.5);
  const proposalBuilt = stressed
    ? rawPlanned
        .filter((event: Json) => {
          const date = String(event.start_date_local || event.start_date || '').slice(0, 10);
          return date > today && ![0, 3, 5].includes(dayNumber(date));
        })
        .map((event: Json) => futureProposal(event, goal))
        .find(Boolean)
    : null;
  const weeklyPlannedLoad = planned.reduce((sum, event) => sum + Number(event.load || 0), 0);
  const proposal = proposalBuilt?.proposal || null;
  return {
    today,
    monday,
    sunday,
    events,
    suggestion: canSuggest ? adaptiveSuggestion : null,
    planOutlook,
    proposal: proposal ? {
      ...proposal,
      weeklyLoadBefore: Math.round(weeklyPlannedLoad),
      weeklyLoadAfter: Math.round(weeklyPlannedLoad - Number(proposal.original.load || 0) + Number(proposal.recommended.load || proposal.original.load || 0)),
    } : null,
    goal,
    suggestionStatus: !restDay
      ? 'Sugestões aparecem somente em dias de descanso.'
      : hasToday
        ? 'Já existe um treino no calendário de hoje.'
        : readiness.classification === 'vermelha'
          ? 'Recuperação insuficiente: preserve o descanso.'
          : readiness.classification === 'indisponível'
            ? 'Dados incompletos: nenhuma sugestão foi liberada.'
            : undefined,
  };
}

export async function GET(request: Request) {
  const owner = ownerId(request);
  if (!owner)
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  try {
    return Response.json(await context(owner));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Falha ao carregar semana' },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const owner = ownerId(request);
  if (!owner)
    return Response.json({ error: 'Não autorizado' }, { status: 401 });
  try {
    const state = await context(owner);
    let body: Json = {};
    try { body = await request.json(); } catch {}
    if (body.action === 'apply_proposal') {
      if (!state.proposal || Number(body.eventId) !== Number(state.proposal.eventId))
        return Response.json({ error: 'A proposta não está mais disponível. Atualize os dados.' }, { status: 409 });
      const eventsBody = await intervals(`/athlete/${runtime.INTERVALS_ATHLETE_ID}/events?oldest=${state.monday}&newest=${state.sunday}&category=WORKOUT&resolve=true`);
      const source = (Array.isArray(eventsBody) ? eventsBody : eventsBody?.events || []).find((event: Json) => Number(event.id) === Number(state.proposal.eventId));
      const recalculated = source ? futureProposal(source, state.goal) : null;
      if (!recalculated) return Response.json({ error: 'Não foi possível recalcular a proposta com segurança.' }, { status: 409 });
      await intervals(`/athlete/${runtime.INTERVALS_ATHLETE_ID}/events/${source.id}`, {
        method: 'PUT', body: JSON.stringify(recalculated.updated),
      });
      return Response.json({ applied: true, week: await context(owner) });
    }
    if (!state.suggestion)
      return Response.json(
        { error: state.suggestionStatus || 'Sugestão não disponível.' },
        { status: 409 },
      );
    const created = await intervals(
      `/athlete/${runtime.INTERVALS_ATHLETE_ID}/events`,
      {
        method: 'POST',
        body: JSON.stringify({
          category: 'WORKOUT',
          start_date_local: `${state.today}T07:00:00`,
          name: state.suggestion.name,
          description: state.suggestion.structure.join('\n'),
          moving_time: state.suggestion.durationMinutes * 60,
          icu_training_load: state.suggestion.load,
        }),
      },
    );
    return Response.json({ created: normalize(created), week: await context(owner) });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Falha ao criar treino' },
      { status: 502 },
    );
  }
}
