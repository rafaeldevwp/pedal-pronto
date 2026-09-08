export type CheckinKey = 'fadiga' | 'dor' | 'estresse' | 'pernas' | 'motivacao' | 'sintomas' | 'tempoDisponivel';

export type CheckinState = Record<CheckinKey, number>;

export const defaultCheckin: CheckinState = {
  fadiga: 4,
  dor: 1,
  estresse: 3,
  pernas: 7,
  motivacao: 7,
  sintomas: 0,
  tempoDisponivel: 60,
};

export const checkinFields: ReadonlyArray<{
  key: CheckinKey;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
}> = [
  { key: 'fadiga', label: 'Fadiga', hint: '0 descansado · 10 exausto', min: 0, max: 10, step: 1 },
  { key: 'dor', label: 'Dor', hint: '0 nenhuma · 10 intensa', min: 0, max: 10, step: 1 },
  { key: 'estresse', label: 'Estresse', hint: '0 baixo · 10 muito alto', min: 0, max: 10, step: 1 },
  { key: 'pernas', label: 'Pernas', hint: '0 muito pesadas · 10 ótimas', min: 0, max: 10, step: 1 },
  { key: 'motivacao', label: 'Motivação', hint: '0 nenhuma · 10 muito alta', min: 0, max: 10, step: 1 },
  { key: 'sintomas', label: 'Sintomas', hint: '0 nenhum · 10 fortes', min: 0, max: 10, step: 1 },
  { key: 'tempoDisponivel', label: 'Tempo disponível', hint: 'Minutos disponíveis hoje', min: 0, max: 180, step: 5 },
];

export function normalizeCheckin(input: unknown): CheckinState {
  const candidate = input && typeof input === 'object' ? input as Partial<Record<CheckinKey, unknown>> : {};
  return checkinFields.reduce((result, field) => {
    const raw = candidate[field.key];
    const numeric = typeof raw === 'number' && Number.isFinite(raw) ? raw : defaultCheckin[field.key];
    const clamped = Math.min(field.max, Math.max(field.min, numeric));
    result[field.key] = Math.round(clamped / field.step) * field.step;
    return result;
  }, { ...defaultCheckin });
}

export function parseStoredCheckin(value: string | null): CheckinState {
  if (!value) return { ...defaultCheckin };
  try {
    return normalizeCheckin(JSON.parse(value));
  } catch {
    return { ...defaultCheckin };
  }
}
