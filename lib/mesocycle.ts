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

export type PlannedEvent = { date: string; name: string };

function offsetOf(pointer: CyclePointer) {
  return (pointer.cycle - 1) * 28 + (pointer.week - 1) * 7 + (pointer.day - 1);
}

// A data implícita de C1W1D1 num evento que já carrega o código no nome.
export function anchorFromEvent(pointer: CyclePointer, eventDate: string) {
  const day = utcDay(eventDate);
  if (day === undefined) return undefined;
  return new Date(day - offsetOf(pointer) * DAY_MS).toISOString().slice(0, 10);
}

// SPEC-28: o atleta já escreve C{n}W{n}D{n} no nome do treino no Intervals.icu, que é a fonte
// oficial do plano — a fase passa a vir dali, sem âncora cadastrada à mão. Quando o treino de
// hoje não traz o código, herda o último ciclo conhecido: acha o evento codificado mais recente
// e avança a contagem de dias até hoje.
export function resolveMesocycleFromEvents(events: PlannedEvent[], today: string) {
  const reference = events
    .filter((event) => event.date <= today && parseCyclePointer(event.name))
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(-1);
  const pointer = reference ? parseCyclePointer(reference.name) : undefined;
  const anchor = pointer && reference ? anchorFromEvent(pointer, reference.date) : undefined;
  const calculated = anchor ? calculateCyclePointer(anchor, today) : undefined;
  return {
    anchor: anchor || null,
    calculated: calculated || null,
    event: pointer || null,
    phase: resolvePhase(calculated),
    warning: null as string | null,
    reference: reference ? { date: reference.date, name: reference.name } : null,
    inherited: Boolean(reference && reference.date !== today),
  };
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
