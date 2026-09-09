export type LoadDay = { date: string; load?: number; ctl?: number };
export type LoadSafetyFlag = { id: 'acwr_high' | 'ramp_rate_exceeded'; severity: 'moderada' | 'severa' };

// SPEC-27: teto fixo, na faixa de 5 a 8 da literatura. Era o único limiar do sistema que pedia
// um número ao atleta — os do ACWR sempre foram fixos —, e ninguém tem como saber o próprio teto
// de rampa, então o campo produzia um palpite que virava alerta de segurança.
export const CTL_RAMP_LIMIT = 6;

export function isYesterdayLoadHigh(load: number, ctl?: number) {
  return Number.isFinite(ctl) && load > Math.max(70, Number(ctl) * 1.5);
}

export function calculateAcwr(days: LoadDay[]) {
  const recent = days.slice(-28);
  if (recent.length < 28) return undefined;
  const chronicWeekly = recent.reduce((sum, day) => sum + (day.load || 0), 0) / 4;
  if (chronicWeekly <= 0) return undefined;
  return recent.slice(-7).reduce((sum, day) => sum + (day.load || 0), 0) / chronicWeekly;
}

export function calculateCtlRamp(days: LoadDay[]) {
  const withCtl = days.filter((day) => Number.isFinite(day.ctl));
  if (withCtl.length < 8) return undefined;
  return withCtl.at(-1)!.ctl! - withCtl.at(-8)!.ctl!;
}

// SPEC-29: o ACWR passa a vir do Intervals.icu, fonte oficial da carga, como `atl / ctl`. É uma
// razão pura, sem ambiguidade de unidade, então os limiares convencionais (0,8–1,3 seguro, acima
// de 1,5 elevado) continuam valendo. O cálculo próprio de média móvel 7/28 fica só como reserva
// para quando o Intervals.icu não devolver os dois valores.
export function acwrFromIntervals(atl?: number, ctl?: number) {
  if (!Number.isFinite(atl) || !Number.isFinite(ctl) || Number(ctl) <= 0) return undefined;
  return Number(atl) / Number(ctl);
}

export function evaluateLoadSafety(days: LoadDay[], rampLimit: number, acwrFromSource?: number) {
  const acwr = acwrFromSource ?? calculateAcwr(days);
  const rampRate = calculateCtlRamp(days);
  const flags: LoadSafetyFlag[] = [];
  if (acwr !== undefined && acwr > 1.5) flags.push({ id: 'acwr_high', severity: 'severa' });
  else if (acwr !== undefined && acwr > 1.3) flags.push({ id: 'acwr_high', severity: 'moderada' });
  if (rampRate !== undefined && rampRate > rampLimit) flags.push({ id: 'ramp_rate_exceeded', severity: 'moderada' });
  return { acwr, acwrSource: acwrFromSource !== undefined ? 'intervals.icu' : 'cálculo local', rampRate, rampLimit, flags };
}
