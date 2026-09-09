import assert from 'node:assert/strict';
import test from 'node:test';
import { acwrFromIntervals, calculateAcwr, evaluateLoadSafety, isYesterdayLoadHigh } from '../lib/load-safety.ts';

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

// SPEC-29: o ACWR passa a vir do Intervals.icu como atl/ctl; o cálculo local vira reserva.

test('acwrFromIntervals divide atl por ctl e recusa entradas inválidas', () => {
  assert.equal(acwrFromIntervals(60, 50), 1.2);
  assert.equal(acwrFromIntervals(undefined, 50), undefined);
  assert.equal(acwrFromIntervals(60, undefined), undefined);
  assert.equal(acwrFromIntervals(60, 0), undefined);
});

test('o valor do Intervals.icu prevalece sobre o cálculo local de média móvel', () => {
  const days = Array.from({ length: 28 }, (_, index) => ({ date: `d${index}`, load: 50, ctl: 40 + index }));
  const local = evaluateLoadSafety(days, 6);
  const fromSource = evaluateLoadSafety(days, 6, 1.62);
  assert.equal(local.acwrSource, 'cálculo local');
  assert.equal(fromSource.acwrSource, 'intervals.icu');
  assert.equal(fromSource.acwr, 1.62);
  assert.ok(fromSource.flags.some((flag) => flag.id === 'acwr_high' && flag.severity === 'severa'));
});

test('sem atl/ctl do Intervals.icu o cálculo local ainda responde', () => {
  const days = Array.from({ length: 28 }, (_, index) => ({ date: `d${index}`, load: index >= 21 ? 120 : 40, ctl: 40 }));
  const result = evaluateLoadSafety(days, 6, acwrFromIntervals(undefined, undefined));
  assert.equal(result.acwrSource, 'cálculo local');
  assert.ok(result.acwr !== undefined);
});
