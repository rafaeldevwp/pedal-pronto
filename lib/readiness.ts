import { ensurePolarSchema, runtime } from '@/lib/polar';

type Json = Record<string, any>;
export type ReadinessResult = {
  classification: 'verde' | 'amarela' | 'vermelha' | 'indisponível';
  score: number;
  changed: boolean;
  title: string;
  summary: string;
  evidence: string[];
  recovery: string;
  workout: {
    id?: number;
    name: string;
    durationMinutes?: number;
    load?: number;
    action: string;
  } | null;
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

function adaptWorkout(event: Json, classification: 'amarela' | 'vermelha') {
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
  if (reps) {
    const from = Number(reps[1]),
      to = Math.max(2, from - 1);
    updated.description = oldDescription.replace(reps[0], `${to}x`);
    updated.name = oldName.replace(new RegExp(`\\b${from}x`, 'i'), `${to}x`);
    delete updated.workout_doc;
    delete updated.icu_training_load;
    delete updated.moving_time;
    return {
      updated,
      action: `repetições reduzidas de ${from} para ${to}; intensidade e recuperações preservadas`,
      durationMinutes: oldDuration
        ? Math.round((oldDuration / 60) * 0.9)
        : undefined,
      load: oldLoad ? Math.round(oldLoad * 0.84) : undefined,
    };
  }
  const intensity = oldDescription.match(/\b(8[5-9]|9\d|1[0-4]\d)%/);
  if (intensity) {
    const from = Number(intensity[1]),
      to = Math.max(80, from - 5);
    updated.description = oldDescription.replace(intensity[0], `${to}%`);
    delete updated.workout_doc;
    delete updated.icu_training_load;
    return {
      updated,
      action: `intensidade reduzida de ${from}% para ${to}%; volume e densidade preservados`,
      durationMinutes: oldDuration ? Math.round(oldDuration / 60) : undefined,
      load: oldLoad ? Math.round(oldLoad * 0.9) : undefined,
    };
  }
  return null;
}

export async function runReadiness(
  owner: string,
  apply: boolean,
  checkin?: { fadiga?: number; dor?: number; estresse?: number },
): Promise<ReadinessResult> {
  await ensurePolarSchema();
  const connection = await runtime.DB.prepare(
    'SELECT access_token FROM polar_connections WHERE owner_id=?',
  )
    .bind(owner)
    .first<{ access_token: string }>();
  if (!connection) throw new Error('POLAR_NOT_CONNECTED');
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
          `/athlete/${runtime.INTERVALS_ATHLETE_ID}/activities?oldest=${yesterday}&newest=${yesterday}&limit=20`,
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
      num(
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
            (num(s.sleep_time, s.total_sleep, s.sleep_duration) || 0) / 3600,
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
    const acts: Json[] = Array.isArray(activities)
      ? activities
      : activities.activities || [];
    const yesterdayLoad = acts.reduce(
      (s, a) => s + (num(a.icu_training_load, a.training_load) || 0),
      0,
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
    if (!evidence.length)
      evidence.push(
        'Sono, recuperação autonômica e carga estão dentro da tendência individual.',
      );
    const priorBad = recharges
      .filter((r) => r.date < latestRecharge.date)
      .slice(-1)
      .some(
        (r) =>
          num(r.nightly_recharge_status)! <= 3 ||
          (num(r.ans_charge) ?? 0) <= -3,
      );
    let classification: 'verde' | 'amarela' | 'vermelha' =
      severe >= 2 || (flags >= 4 && priorBad) || (checkin?.dor ?? 0) >= 6
        ? 'vermelha'
        : flags >= 2
          ? 'amarela'
          : 'verde';
    let changed = false,
      action =
        classification === 'verde'
          ? 'Treino mantido sem aumento.'
          : classification === 'amarela'
            ? 'Ajuste moderado recomendado.'
            : 'Substituição conservadora recomendada.';
    let finalName = workout?.name || 'Nenhum treino planejado';
    let duration = num(workout?.moving_time, workout?.duration);
    let load = num(workout?.icu_training_load, workout?.load);
    const weekday = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      weekday: 'short',
    }).format(now);
    const restDay = ['Wed', 'Fri', 'Sun'].includes(weekday);
    if (apply && workout && classification !== 'verde' && !restDay) {
      const adapted = adaptWorkout(workout, classification);
      if (adapted) {
        await intervals(
          `/athlete/${runtime.INTERVALS_ATHLETE_ID}/events/${workout.id}`,
          { method: 'PUT', body: JSON.stringify(adapted.updated) },
        );
        changed = true;
        action = adapted.action;
        finalName = adapted.updated.name;
        duration = adapted.durationMinutes
          ? adapted.durationMinutes * 60
          : duration;
        load = adapted.load ?? load;
      }
    } else if (restDay && classification !== 'verde')
      action = 'Dia de descanso preservado; nenhum treino foi criado.';
    const result: ReadinessResult = {
      classification,
      score:
        classification === 'verde' ? 4 : classification === 'amarela' ? 3 : 1,
      changed,
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
            : 'Priorize descanso; dor ou sintomas de doença justificam avaliação profissional.',
      workout: {
        id: workout?.id,
        name: finalName,
        durationMinutes: duration ? Math.round(duration / 60) : undefined,
        load: load ? Math.round(load) : undefined,
        action,
      },
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
    };
    await runtime.DB.prepare(
      'INSERT INTO readiness_runs (owner_id,run_date,classification,changed,report_json,created_at) VALUES (?,?,?,?,?,?)',
    )
      .bind(
        owner,
        today,
        classification,
        changed ? 1 : 0,
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
function unavailable(warning: string, workout: Json | null): ReadinessResult {
  return {
    classification: 'indisponível',
    score: 0,
    changed: false,
    title: 'Decisão suspensa',
    summary: 'Treino não modificado.',
    evidence: [warning],
    recovery: 'Sincronize o relógio e tente novamente mais tarde.',
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
