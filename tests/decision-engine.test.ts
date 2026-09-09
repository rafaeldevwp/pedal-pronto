import assert from 'node:assert/strict';
import test from 'node:test';
import { adjustWorkoutPlan, preferVolumeReduction } from '../lib/decision-engine.ts';

test('preferVolumeReduction: build/peak sempre prefere reduzir volume', () => {
  assert.equal(preferVolumeReduction('C2W2 Build'), true);
  assert.equal(preferVolumeReduction('Peak'), true);
});

test('preferVolumeReduction: recovery/deload nunca prefere reduzir volume', () => {
  assert.equal(preferVolumeReduction('Recovery'), false);
  assert.equal(preferVolumeReduction('deload'), false);
});

test('preferVolumeReduction: fase desconhecida (sem âncora) segue a regra padrão de progressão', () => {
  assert.equal(preferVolumeReduction('desconhecida'), true);
});

test('descrição e estrutura produzem o mesmo ajuste', () => {
  const treino = { name: '3x 12min 92%', durationMinutes: 60, load: 50 };
  const porDescricao = adjustWorkoutPlan({ ...treino, description: '- 3x 12min 92%' }, 'amarela', 'build');
  const porEstrutura = adjustWorkoutPlan({ ...treino, structure: ['- 3x 12min 92%'] }, 'amarela', 'build');
  assert.deepEqual(porDescricao, porEstrutura);
  assert.equal(porDescricao?.action, 'reduzir_repeticoes');
  assert.equal(porDescricao?.recommended.name, '2x 12min 92%');
  assert.equal(porDescricao?.recommended.durationMinutes, 54);
  assert.equal(porDescricao?.recommended.load, 42);
});

// SPEC-34: com 2 séries não há repetição a cortar, então quem cede é a intensidade.
test('no piso de 2x a redução passa para a intensidade', () => {
  const result = adjustWorkoutPlan({ name: '2x 12min 92%', durationMinutes: 60, load: 50, description: '- 2x 12min 92%' }, 'amarela', 'build');
  assert.equal(result?.action, 'reduzir_intensidade');
  assert.equal(result?.recommended.durationMinutes, 60);
  assert.match(result?.recommended.description || '', /87%/);
  assert.doesNotMatch(result?.recommended.descriptionChange || '', /de 2 para 2/);
});

test('2x sem intensidade reconhecível não gera ajuste de uma variável', () => {
  const result = adjustWorkoutPlan({ name: '2x 12min', durationMinutes: 60, load: 50, description: '- 2x 12min' }, 'amarela', 'build');
  assert.equal(result, null);
});

test('template de recuperação é único para qualquer caminho vermelho', () => {
  const result = adjustWorkoutPlan({ name: '4x 8min 92%', durationMinutes: 60, load: 50, description: '- 4x 8min 92%' }, 'vermelha', 'build');
  assert.equal(result?.recommended.durationMinutes, 30);
  assert.equal(result?.recommended.load, 18);
  assert.match(result?.recommended.description || '', /10m 45%/);
});
