import { ensurePolarSchema, recordTrainingDecision, runtime } from '@/lib/polar';
import { assertEditablePlannedEvent, claimTrainingWrite, completeTrainingWrite, proposalFingerprint } from '@/lib/training-safety';

type Json = Record<string, any>;
export type ReadinessResult = {
  classification: 'verde' | 'amarela' | 'vermelha' | 'indisponível';
  score: number;
  changed: boolean;
  title: string;
  summary: string;
  evidence: string[];
  recovery: string;
  loadTrend: Array<{ date: string; fitness?: number; fatigue?: number }>;
  workout: {
    id?: number;
    name: string;
    durationMinutes?: number;
    load?: number;
    action: string;
    structure?: string[];
    original?: {
      name: string;
      durationMinutes?: number;
      load?: number;
      structure?: string[];
    };
  } | null;
  proposal?: {
    id: string;
    eventId: number;
    date: string;
    classification: 'amarela' | 'vermelha';
    change: string;
    original: { name: string; durationMinutes?: number; load?: number; structure?: string[] };
    recommended: { name: string; durationMinutes?: number; load?: number; structure?: string[] };
  };
  metrics: {
    sleepHours?: number;
    sleepScore?: number;
    hrv?: number;
    restingHr?: number;
    ansCharge?: number;
    nightlyStatus?: number;
    ctl?: number;
    atl?: number;
    form?: number;
    ramp?: number;
  };
  updatedAt: string;
  warning?: string;
  goal?: { objective: string; eventName?: string; eventDate?: string; priority: string; guidance: string };
};

type Objective = 'performance' | 'resistencia' | 'ftp' | 'saude';
export type Checkin = {
  fadiga?: number;
  dor?: number;
  estresse?: number;
  pernas?: number;
  motivacao?: number;
  sintomas?: number;
  tempoDisponivel?: number;
};
const objectiveNames: Record<Objective, string> = {
  performance: 'performance geral', resistencia: 'resistência', ftp: 'potência/FTP', saude: 'saúde e consistência',
};

const zone = 'America/Sao_Paulo';
const isoDate = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
const median = (xs: number[]) => {
  const a = xs.filter(Number.isFinite).sort((x, y) => x - y);
  return a.length
    ? (a[Math.floor((a.length - 1) / 2)] + a[Math.ceil((a.length - 1) / 2)]) / 2
    : undefined;
};
const num = (...v: any[]) => {
  for (const x of v) if (typeof x === 'number' && Number.isFinite(x)) return x;
  return undefined;
};
const durationSeconds = (...values: any[]) => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const match = value.match(
        /^PT(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?$/i,
      );
      if (match)
        return (
          Number(match[1] || 0) * 3600 +
          Number(match[2] || 0) * 60 +
          Number(match[3] || 0)
        );
    }
  }
  return 0;
};
const polarGet = async (path: string, token: string) => {
  const r = await fetch(`https://www.polaraccesslink.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (r.status === 401 || r.status === 403) throw new Error('POLAR_AUTH');
  if (!r.ok) throw new Error(`POLAR_${r.status}`);
  return r.json() as Promise<Json>;
};
const intervals = async (path: string, init?: RequestInit) => {
  const auth = btoa(`API_KEY:${runtime.INTERVALS_API_KEY}`);
  const r = await fetch(`https://intervals.icu/api/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
  });
  if (r.status === 401 || r.status === 403) throw new Error('INTERVALS_AUTH');
  if (!r.ok) throw new Error(`INTERVALS_${r.status}`);
  return r.status === 204 ? null : r.json();
};

function adaptWorkout(event: Json, classification: 'amarela' | 'vermelha', objective: Objective, protectSpecificity = false) {
  const updated = { ...event };
  const oldName = String(event.name || 'Treino planejado');
  const oldDescription = String(event.description || '');
  const oldDuration =
    num(event.moving_time, event.duration, event.workout_doc?.duration) || 0;
  const oldLoad = num(event.icu_training_load, event.load) || 0;
  if (classification === 'vermelha') {
    updated.name = 'Recuperação leve — ajuste de prontidão';
    updated.description =
      '- 10m 45%\n- 15m 50%\n- 5m 40%\n\nSubstituído automaticamente pelo Pedal Pronto.';
    delete updated.workout_doc;
    delete updated.icu_training_load;
    delete updated.moving_time;
    return {
      updated,
      action: `${oldName} substituído por recuperação leve`,
      durationMinutes: 30,
      load: 18,
    };
  }
  const reps = oldDescription.match(/\b([2-9]|[1-9]\d)x\b/i);
  const intensity = oldDescription.match(/\b(8[5-9]|9\d|1[0-4]\d)%/);
  const reduceIntensity = () => {
    if (!intensity) return null;
    const from = Number(intensity[1]), to = Math.max(80, from - 5);
    updated.description = oldDescription.replace(intensity[0], `${to}%`);
    delete updated.workout_doc;
    delete updated.icu_training_load;
    return {
      updated,
      action: `intensidade reduzida de ${from}% para ${to}%; duração preservada para sustentar o objetivo de ${objectiveNames[objective]}`,
      durationMinutes: oldDuration ? Math.round(oldDuration / 60) : undefined,
      load: oldLoad ? Math.round(oldLoad * 0.9) : undefined,
    };
  };
  const reduceRepetitions = () => {
    if (!reps) return null;
    const from = Number(reps[1]),
      to = Math.max(2, from - 1);
    updated.description = oldDescription.replace(reps[0], `${to}x`);
    updated.name = oldName.replace(new RegExp(`\\b${from}x`, 'i'), `${to}x`);
    delete updated.workout_doc;
    delete updated.icu_training_load;
    delete updated.moving_time;
    return {
      updated,
      action: `repetições reduzidas de ${from} para ${to}; intensidade preservada para sustentar o objetivo de ${objectiveNames[objective]}`,
      durationMinutes: oldDuration
        ? Math.round((oldDuration / 60) * 0.9)
        : undefined,
      load: oldLoad ? Math.round(oldLoad * 0.84) : undefined,
    };
  };
  return !protectSpecificity && (objective === 'resistencia' || objective === 'saude')
    ? reduceIntensity() || reduceRepetitions()
    : reduceRepetitions() || reduceIntensity();
}

export async function runReadiness(
  owner: string,
  checkin?: Checkin,
): Promise<ReadinessResult> {
  await ensurePolarSchema();
  const connection = await runtime.DB.prepare(
    'SELECT access_token FROM polar_connections WHERE owner_id=?',
  )
    .bind(owner)
    .first<{ access_token: string }>();
  if (!connection) throw new Error('POLAR_NOT_CONNECTED');
  const goalRow = await runtime.DB.prepare(
    'SELECT objective,event_name,event_date,priority FROM athlete_goals WHERE owner_id=?',
  ).bind(owner).first<Record<string, string>>();
  const objective = (['performance', 'resistencia', 'ftp', 'saude'].includes(goalRow?.objective || '') ? goalRow!.objective : 'performance') as Objective;
  const eventDays = goalRow?.event_date
    ? Math.ceil((new Date(`${goalRow.event_date}T12:00:00Z`).getTime() - Date.now()) / 86400000)
    : undefined;
  const protectSpecificity = goalRow?.priority === 'principal' && eventDays !== undefined && eventDays >= 0 && eventDays <= 21;
  const now = new Date(),
    today = isoDate(now),
    yesterday = isoDate(new Date(now.getTime() - 86400000));
  try {
    const [sleepBody, rechargeBody, wellness, activities, events] =
      await Promise.all([
        polarGet('/v3/users/sleep', connection.access_token),
        polarGet('/v3/users/nightly-recharge', connection.access_token),
        intervals(
          `/athlete/${runtime.INTERVALS_ATHLETE_ID}/wellness?oldest=${isoDate(new Date(now.getTime() - 42 * 86400000))}&newest=${today}`,
        ),
        intervals(
          `/athlete/${runtime.INTERVALS_ATHLETE_ID}/activities?oldest=${yesterday}&newest=${today}&limit=40`,
        ),
        intervals(
          `/athlete/${runtime.INTERVALS_ATHLETE_ID}/events?oldest=${today}&newest=${today}&category=WORKOUT&resolve=true`,
        ),
      ]);
    const sleeps: Json[] = (
      Array.isArray(sleepBody)
        ? sleepBody
        : sleepBody.nights || sleepBody.sleep || sleepBody.sleeps || []
    ).sort((a: Json, b: Json) => String(a.date).localeCompare(String(b.date)));
    const recharges: Json[] = (
      Array.isArray(rechargeBody)
        ? rechargeBody
        : rechargeBody.recharges || rechargeBody.nights || []
    ).sort((a: Json, b: Json) => String(a.date).localeCompare(String(b.date)));
    const latestSleep = [...sleeps].reverse().find((s) => s.date <= today),
      latestRecharge = [...recharges].reverse().find((r) => r.date <= today);
    const workout =
      (Array.isArray(events) ? events : events.events || []).find(
        (e: Json) => e.category === 'WORKOUT',
      ) || null;
    if (!latestSleep || !latestRecharge)
      return unavailable(
        'Dados recentes de sono ou Nightly Recharge ainda não chegaram do Polar.',
        workout,
      );
    const priorSleeps = sleeps
        .filter((s) => s.date < latestSleep.date)
        .slice(-14),
      priorRecharge = recharges
        .filter((r) => r.date < latestRecharge.date)
        .slice(-14);
    const sleepSecs =
      durationSeconds(
        latestSleep.sleep_time,
        latestSleep.total_sleep,
        latestSleep.sleep_duration,
      ) || 0;
    const sleepHours = sleepSecs / 3600,
      sleepScore = num(latestSleep.sleep_score),
      interruption = num(latestSleep.total_interruption_duration) || 0;
    const hrv = num(latestRecharge.heart_rate_variability_avg),
      restingHr = num(latestRecharge.heart_rate_avg),
      ansCharge = num(latestRecharge.ans_charge),
      nightlyStatus = num(latestRecharge.nightly_recharge_status);
    const sleepBase = median(
        priorSleeps.map(
          (s) =>
            durationSeconds(s.sleep_time, s.total_sleep, s.sleep_duration) /
            3600,
        ),
      ),
      scoreBase = median(priorSleeps.map((s) => num(s.sleep_score) as number)),
      interruptBase = median(
        priorSleeps.map((s) => num(s.total_interruption_duration) as number),
      );
    const hrvBase = median(
        priorRecharge.map((r) => num(r.heart_rate_variability_avg) as number),
      ),
      hrBase = median(
        priorRecharge.map((r) => num(r.heart_rate_avg) as number),
      );
    const wList: Json[] = Array.isArray(wellness)
      ? wellness
      : wellness.wellness || [];
    const todayWell =
      [...wList].reverse().find((w) => w.id === today) || wList.at(-1) || {};
    const ctl = num(todayWell.ctl, todayWell.icu_ctl),
      atl = num(todayWell.atl, todayWell.icu_atl),
      ramp = num(todayWell.rampRate, todayWell.ramp_rate),
      form = ctl !== undefined && atl !== undefined ? ctl - atl : undefined;
    const loadTrend = wList.slice(-7).map((day) => ({
      date: String(day.id || day.date || ''),
      fitness: num(day.ctl, day.icu_ctl),
      fatigue: num(day.atl, day.icu_atl),
    }));
    const acts: Json[] = Array.isArray(activities)
      ? activities
      : activities.activities || [];
    const yesterdayLoad = acts.filter((activity) => String(activity.start_date_local || activity.start_date || '').slice(0, 10) === yesterday).reduce(
      (s, a) => s + (num(a.icu_training_load, a.training_load) || 0),
      0,
    );
    const todayCompleted = acts.some((activity) =>
      String(activity.start_date_local || activity.start_date || '').slice(0, 10) === today &&
      ['Ride', 'VirtualRide', 'EBikeRide', 'MountainBikeRide'].includes(activity.type || activity.icu_type),
    );
    const evidence: string[] = [];
    let flags = 0,
      severe = 0;
    const flag = (condition: boolean, text: string, isSevere = false) => {
      if (condition) {
        flags++;
        if (isSevere) severe++;
        evidence.push(text);
      }
    };
    flag(
      Boolean(sleepBase && sleepHours < sleepBase * 0.85),
      `Sono ${sleepHours.toFixed(1)} h, abaixo da base ${sleepBase?.toFixed(1)} h`,
      Boolean(sleepBase && sleepHours < sleepBase * 0.7),
    );
    flag(
      Boolean(
        scoreBase && sleepScore !== undefined && sleepScore < scoreBase - 10,
      ),
      `Qualidade ${sleepScore}, abaixo da base ${Math.round(scoreBase!)}`,
      Boolean(
        scoreBase && sleepScore !== undefined && sleepScore < scoreBase - 20,
      ),
    );
    flag(
      Boolean(interruptBase && interruption > interruptBase * 1.5),
      `Interrupções acima do habitual (${Math.round(interruption / 60)} min)`,
      Boolean(interruptBase && interruption > interruptBase * 2),
    );
    flag(
      Boolean(hrvBase && hrv !== undefined && hrv < hrvBase * 0.82),
      `HRV ${Math.round(hrv!)} ms, abaixo da base ${Math.round(hrvBase!)}`,
      Boolean(hrvBase && hrv !== undefined && hrv < hrvBase * 0.7),
    );
    flag(
      Boolean(hrBase && restingHr !== undefined && restingHr > hrBase + 6),
      `FC noturna ${restingHr} bpm, acima da base ${Math.round(hrBase!)}`,
      Boolean(hrBase && restingHr !== undefined && restingHr > hrBase + 10),
    );
    flag(
      Boolean(nightlyStatus !== undefined && nightlyStatus <= 3),
      `Nightly Recharge ${nightlyStatus}/6`,
      nightlyStatus !== undefined && nightlyStatus <= 2,
    );
    flag(
      Boolean(ansCharge !== undefined && ansCharge <= -3),
      `ANS Charge ${ansCharge.toFixed(1)}`,
      ansCharge !== undefined && ansCharge <= -6,
    );
    flag(
      Boolean(form !== undefined && form < -20),
      `Forma ${form!.toFixed(0)} indica fadiga elevada`,
      form !== undefined && form < -30,
    );
    flag(
      Boolean(ctl && yesterdayLoad > ctl * 1.5),
      `Carga de ontem ${Math.round(yesterdayLoad)} foi alta para o fitness ${Math.round(ctl!)}`,
    );
    flag(
      Boolean(checkin?.fadiga !== undefined && checkin.fadiga >= 7),
      `Fadiga percebida ${checkin?.fadiga}/10`,
      Boolean(checkin && checkin.fadiga! >= 9),
    );
    flag(
      Boolean(checkin?.dor !== undefined && checkin.dor >= 4),
      `Dor percebida ${checkin?.dor}/10`,
      Boolean(checkin && checkin.dor! >= 6),
    );
    flag(
      Boolean(checkin?.estresse !== undefined && checkin.estresse >= 8),
      `Estresse percebido ${checkin?.estresse}/10`,
    );
    flag(
      Boolean(checkin?.pernas !== undefined && checkin.pernas <= 3),
      `Pernas pesadas (${checkin?.pernas}/10 de disposição muscular)`,
      Boolean(checkin?.pernas !== undefined && checkin.pernas <= 1),
    );
    flag(
      Boolean(checkin?.motivacao !== undefined && checkin.motivacao <= 3),
      `Motivação baixa (${checkin?.motivacao}/10)`,
    );
    flag(
      Boolean(checkin?.sintomas !== undefined && checkin.sintomas >= 3),
      `Sintomas percebidos ${checkin?.sintomas}/10`,
      Boolean(checkin?.sintomas !== undefined && checkin.sintomas >= 5),
    );
    const plannedMinutes = num(workout?.moving_time, workout?.duration)
      ? Math.round(num(workout?.moving_time, workout?.duration)! / 60)
      : undefined;
    const limitedTime = Boolean(
      checkin?.tempoDisponivel !== undefined && plannedMinutes && checkin.tempoDisponivel < plannedMinutes,
    );
    if (limitedTime) evidence.push(`Tempo disponível ${checkin?.tempoDisponivel} min, abaixo dos ${plannedMinutes} min planejados`);
    if (!evidence.length)
      evidence.push(
        'Sono, recuperação autonômica e carga estão dentro da tendência individual.',
      );
    evidence.push(`Objetivo de ${objectiveNames[objective]} considerado; boa prontidão nunca aumenta a sessão automaticamente.`);
    if (protectSpecificity) evidence.push(`Meta principal em ${eventDays} dias: especificidade preservada e volume reduzido antes da intensidade quando necessário.`);
    const priorBad = recharges
      .filter((r) => r.date < latestRecharge.date)
      .slice(-1)
      .some(
        (r) =>
          num(r.nightly_recharge_status)! <= 3 ||
          (num(r.ans_charge) ?? 0) <= -3,
      );
    const conservativeOverride = (checkin?.dor ?? 0) >= 6 || (checkin?.sintomas ?? 0) >= 5;
    const cautionOverride = (checkin?.dor ?? 0) >= 4 || (checkin?.sintomas ?? 0) >= 3;
    let classification: 'verde' | 'amarela' | 'vermelha' =
      conservativeOverride || severe >= 2 || (flags >= 4 && priorBad)
        ? 'vermelha'
        : cautionOverride || flags >= 2 || limitedTime
          ? 'amarela'
          : 'verde';
    const action =
        classification === 'verde'
          ? 'Treino mantido sem aumento.'
          : classification === 'amarela'
            ? 'Ajuste moderado disponível para revisão; nada foi alterado.'
            : 'Substituição conservadora disponível para revisão; nada foi alterado.';
    const originalWorkout = workout ? {
      name: String(workout.name || 'Treino planejado'),
      durationMinutes: num(workout.moving_time, workout.duration) ? Math.round(num(workout.moving_time, workout.duration)! / 60) : undefined,
      load: num(workout.icu_training_load, workout.load) ? Math.round(num(workout.icu_training_load, workout.load)!) : undefined,
      structure: workoutStructure(workout.description),
    } : undefined;
    const structure = workout ? workoutStructure(workout.description) : [];
    const duration = num(workout?.moving_time, workout?.duration);
    const load = num(workout?.icu_training_load, workout?.load);
    const weekday = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      weekday: 'short',
    }).format(now);
    const restDay = ['Wed', 'Fri', 'Sun'].includes(weekday);
    const adapted = workout && classification !== 'verde' && !restDay && !todayCompleted
      ? adaptWorkout(workout, classification, objective, protectSpecificity)
      : null;
    const recommended = adapted ? {
      name: String(adapted.updated.name),
      durationMinutes: adapted.durationMinutes,
      load: adapted.load,
      structure: workoutStructure(adapted.updated.description),
    } : undefined;
    const proposal = adapted && originalWorkout ? {
      id: proposalFingerprint(workout, adapted.updated),
      eventId: Number(workout.id),
      date: today,
      classification: classification as 'amarela' | 'vermelha',
      change: adapted.action,
      original: originalWorkout,
      recommended: recommended!,
    } : undefined;
    const result: ReadinessResult = {
      classification,
      score:
        classification === 'verde' ? 4 : classification === 'amarela' ? 3 : 1,
      changed: false,
      title:
        classification === 'verde'
          ? 'Pronto para o treino'
          : classification === 'amarela'
            ? 'Recuperação pede cautela'
            : 'Recuperação insuficiente',
      summary: action,
      evidence,
      recovery:
        classification === 'verde'
          ? 'Hidrate-se e siga o plano sem aumentar a sessão.'
          : classification === 'amarela'
            ? 'Priorize alimentação, hidratação e sono; reavalie sensações no aquecimento.'
            : 'Priorize descanso. Dor persistente, sintomas de doença ou piora justificam avaliação profissional.',
      loadTrend,
      workout: {
        id: workout?.id,
        name: workout?.name || 'Nenhum treino planejado',
        durationMinutes: duration ? Math.round(duration / 60) : undefined,
        load: load ? Math.round(load) : undefined,
        action,
        structure,
        original: originalWorkout,
      },
      proposal,
      metrics: {
        sleepHours: +sleepHours.toFixed(1),
        sleepScore,
        hrv,
        restingHr,
        ansCharge,
        nightlyStatus,
        ctl,
        atl,
        form,
        ramp,
      },
      updatedAt: new Date().toISOString(),
      goal: {
        objective,
        eventName: goalRow?.event_name || undefined,
        eventDate: goalRow?.event_date || undefined,
        priority: goalRow?.priority || 'principal',
        guidance: classification === 'vermelha'
          ? `A segurança prevalece sobre o objetivo de ${objectiveNames[objective]}.`
          : protectSpecificity
            ? `Meta principal em ${eventDays} dias: preservamos a especificidade e moderamos primeiro o volume.`
          : objective === 'resistencia'
            ? 'Preservamos duração quando possível e moderamos a intensidade.'
            : objective === 'ftp'
              ? 'Preservamos a intensidade-alvo quando possível e moderamos as repetições.'
              : objective === 'saude'
                ? 'Priorizamos consistência e baixo risco de fadiga excessiva.'
                : 'Preservamos o estímulo principal com o menor ajuste necessário.',
      },
    };
    await runtime.DB.prepare(
      'INSERT INTO readiness_runs (owner_id,run_date,classification,changed,report_json,created_at) VALUES (?,?,?,?,?,?)',
    )
      .bind(
        owner,
        today,
        classification,
        0,
        JSON.stringify(result),
        Date.now(),
      )
      .run();
    return result;
  } catch (e) {
    const m = e instanceof Error ? e.message : '';
    if (m === 'POLAR_AUTH' || m === 'INTERVALS_AUTH')
      return unavailable(
        'Uma das sessões expirou. Autentique novamente antes de qualquer alteração.',
        null,
      );
    return unavailable(
      'Os dados estão ausentes, atrasados ou contraditórios. O treino não foi modificado.',
      null,
    );
  }
}

export async function confirmReadinessProposal(owner: string, proposalId: string, operationId: string, checkin?: Checkin) {
  const evaluated = await runReadiness(owner, checkin);
  const proposal = evaluated.proposal;
  if (!proposal || proposal.id !== proposalId) throw new Error('PROPOSAL_CHANGED');
  const [eventBody, activityBody] = await Promise.all([
    intervals(`/athlete/${runtime.INTERVALS_ATHLETE_ID}/events?oldest=${proposal.date}&newest=${proposal.date}&category=WORKOUT&resolve=true`),
    intervals(`/athlete/${runtime.INTERVALS_ATHLETE_ID}/activities?oldest=${proposal.date}&newest=${proposal.date}&limit=40`),
  ]);
  const event = (Array.isArray(eventBody) ? eventBody : eventBody?.events || []).find((item: Json) => Number(item.id) === proposal.eventId);
  const activities = (Array.isArray(activityBody) ? activityBody : activityBody?.activities || []).filter((activity: Json) =>
    ['Ride', 'VirtualRide', 'EBikeRide', 'MountainBikeRide'].includes(activity.type || activity.icu_type),
  );
  assertEditablePlannedEvent(event, activities, proposal.date);
  const eventDays = evaluated.goal?.eventDate
    ? Math.ceil((new Date(`${evaluated.goal.eventDate}T12:00:00Z`).getTime() - Date.now()) / 86400000)
    : undefined;
  const protectSpecificity = evaluated.goal?.priority === 'principal' && eventDays !== undefined && eventDays >= 0 && eventDays <= 21;
  const adapted = adaptWorkout(event, proposal.classification, ((evaluated.goal?.objective || 'performance') as Objective), protectSpecificity);
  if (!adapted || proposalFingerprint(event, adapted.updated) !== proposal.id) throw new Error('PROPOSAL_CHANGED');
  const claim = await claimTrainingWrite(owner, operationId, proposal.id);
  if (claim.repeated) return claim.response;
  await intervals(`/athlete/${runtime.INTERVALS_ATHLETE_ID}/events/${event.id}`, { method: 'PUT', body: JSON.stringify(adapted.updated) });
  const response = {
    applied: true,
    message: `TREINO ALTERADO — ${adapted.updated.name}: ${adapted.action}. Nova duração ${adapted.durationMinutes ?? 'não informada'} min, carga ${adapted.load ?? 'não informada'}.`,
  };
  await completeTrainingWrite(owner, operationId, response);
  await recordTrainingDecision(owner, {
    decisionDate: proposal.date, workoutDate: proposal.date, source: 'prontidao_diaria', status: 'alterado',
    original: proposal.original, recommended: proposal.recommended, effective: proposal.recommended,
    reason: `${proposal.classification.toUpperCase()}: ${adapted.action}`,
  });
  return response;
}
function workoutStructure(description: unknown) {
  return String(description || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .slice(0, 24);
}
function unavailable(warning: string, workout: Json | null): ReadinessResult {
  return {
    classification: 'indisponível',
    score: 0,
    changed: false,
    title: 'Decisão suspensa',
    summary: 'Treino não modificado.',
    evidence: [warning],
    recovery: 'Sincronize o relógio e tente novamente mais tarde.',
    loadTrend: [],
    workout: workout
      ? {
          id: workout.id,
          name: workout.name || 'Treino planejado',
          durationMinutes: num(workout.moving_time)
            ? Math.round(workout.moving_time / 60)
            : undefined,
          load: num(workout.icu_training_load),
          action: 'Mantido por segurança',
        }
      : null,
    metrics: {},
    updatedAt: new Date().toISOString(),
    warning,
  };
}
