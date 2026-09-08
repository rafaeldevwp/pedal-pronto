import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultCheckin, normalizeCheckin, parseStoredCheckin } from '../lib/checkin.ts';

test('zero permanece um valor válido em todos os indicadores', () => {
  const result = normalizeCheckin({
    fadiga: 0, dor: 0, estresse: 0, pernas: 0, motivacao: 0, sintomas: 0, tempoDisponivel: 0,
  });
  assert.deepEqual(result, {
    fadiga: 0, dor: 0, estresse: 0, pernas: 0, motivacao: 0, sintomas: 0, tempoDisponivel: 0,
  });
});

test('valores máximos válidos permanecem intactos', () => {
  const result = normalizeCheckin({
    fadiga: 10, dor: 10, estresse: 10, pernas: 10, motivacao: 10, sintomas: 10, tempoDisponivel: 180,
  });
  assert.equal(result.fadiga, 10);
  assert.equal(result.tempoDisponivel, 180);
});

test('ida e volta ao zero não recupera o valor padrão', () => {
  const atMaximum = normalizeCheckin({ ...defaultCheckin, dor: 10 });
  const atZero = normalizeCheckin({ ...atMaximum, dor: 0 });
  assert.equal(atZero.dor, 0);
});

test('recarga restaura zeros salvos', () => {
  const restored = parseStoredCheckin(JSON.stringify({
    fadiga: 0, dor: 0, estresse: 0, pernas: 0, motivacao: 0, sintomas: 0, tempoDisponivel: 0,
  }));
  assert.equal(restored.dor, 0);
  assert.equal(restored.sintomas, 0);
  assert.equal(restored.tempoDisponivel, 0);
});

test('armazenamento inválido volta aos padrões seguros', () => {
  assert.deepEqual(parseStoredCheckin('{inválido'), defaultCheckin);
});
