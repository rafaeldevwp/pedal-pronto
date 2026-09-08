import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateAcwr, evaluateLoadSafety, isYesterdayLoadHigh } from '../lib/load-safety.ts';

const history = (loads: number[], ctlStart = 40) => loads.map((load, index) => ({ date: `d${index}`, load, ctl: ctlStart + index }));

test('ACWR usa sete dias contra a média semanal dos vinte e oito', () => {
  const days = history([...Array(21).fill(40), ...Array(7).fill(80)]);
  assert.equal(calculateAcwr(days), 560 / (1400 / 4));
});

test('classifica ACWR moderado e severo nos limiares definidos', () => {
  const moderate = history([...Array(21).fill(50), ...Array(7).fill(75)], 40).map((d) => ({ ...d, ctl: 40 }));
  assert.deepEqual(evaluateLoadSafety(moderate, 6).flags, [{ id: 'acwr_high', severity: 'moderada' }]);
  const severe = history([...Array(21).fill(30), ...Array(7).fill(90)], 40).map((d) => ({ ...d, ctl: 40 }));
  assert.deepEqual(evaluateLoadSafety(severe, 6).flags, [{ id: 'acwr_high', severity: 'severa' }]);
});

test('ramp rate respeita teto configurável', () => {
  const result = evaluateLoadSafety(history(Array(28).fill(40), 20), 5);
  assert.equal(result.rampRate, 7);
  assert.ok(result.flags.some((flag) => flag.id === 'ramp_rate_exceeded'));
});

test('histórico incompleto não inventa ACWR', () => {
  assert.equal(evaluateLoadSafety(history(Array(20).fill(50)), 6).acwr, undefined);
});

test('carga de ontem usa um único piso conservador de 70', () => {
  assert.equal(isYesterdayLoadHigh(69, 20), false);
  assert.equal(isYesterdayLoadHigh(71, 20), true);
  assert.equal(isYesterdayLoadHigh(91, 60), true);
  assert.equal(isYesterdayLoadHigh(90, 60), false);
});
