export type CyclePointer = { cycle: number; week: number; day: number };

const DAY_MS = 86_400_000;

function utcDay(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function calculateCyclePointer(anchor: string, date: string): CyclePointer | undefined {
  const start = utcDay(anchor), current = utcDay(date);
  if (start === undefined || current === undefined || current < start) return undefined;
  const offset = Math.floor((current - start) / DAY_MS);
  return { cycle: Math.floor(offset / 28) + 1, week: Math.floor((offset % 28) / 7) + 1, day: (offset % 7) + 1 };
}

export function parseCyclePointer(name: string): CyclePointer | undefined {
  const match = /(?:^|\b)C(\d+)W([1-4])D([1-7])(?:\b|$)/i.exec(name);
  return match ? { cycle: Number(match[1]), week: Number(match[2]), day: Number(match[3]) } : undefined;
}

export function resolvePhase(calculated: CyclePointer | undefined): string {
  if (!calculated) return 'desconhecida';
  return calculated.week === 4 ? 'recovery' : 'build';
}

export function resolveMesocycle(anchor: string | undefined, date: string, eventName = '') {
  const calculated = anchor ? calculateCyclePointer(anchor, date) : undefined;
  const event = parseCyclePointer(eventName);
  const matches = calculated && event
    ? calculated.cycle === event.cycle && calculated.week === event.week && calculated.day === event.day
    : undefined;
  return {
    anchor: anchor || null,
    calculated: calculated || null,
    event: event || null,
    phase: resolvePhase(calculated),
    warning: matches === false ? `O ponteiro calculado C${calculated!.cycle}W${calculated!.week}D${calculated!.day} diverge do evento C${event!.cycle}W${event!.week}D${event!.day}. Nenhuma correção foi aplicada.` : null,
  };
}
