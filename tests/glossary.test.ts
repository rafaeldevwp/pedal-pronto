import assert from 'node:assert/strict';
import test from 'node:test';
import { glossary, glossaryById } from '../lib/glossary.ts';

test('glossário possui identificadores únicos e todos os campos explicativos', () => {
  assert.equal(new Set(glossary.map((entry) => entry.id)).size, glossary.length);
  for (const entry of glossary) {
    assert.ok(entry.term && entry.fullName && entry.summary && entry.appUse && entry.direction);
    assert.ok(entry.baseline && entry.source && entry.limitations);
  }
});

test('termos essenciais têm uma definição centralizada', () => {
  for (const id of ['hrv', 'ans-charge', 'nightly-recharge', 'ctl', 'atl', 'forma', 'rampa', 'rpe', 'desacoplamento', 'prontidao'])
    assert.ok(glossaryById(id), `verbete ausente: ${id}`);
});

test('todas as categorias do produto estão representadas', () => {
  assert.deepEqual(new Set(glossary.map((entry) => entry.category)), new Set(['Recuperação', 'Carga', 'Treino', 'Planejamento']));
});
