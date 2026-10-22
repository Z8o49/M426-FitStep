import assert from 'node:assert/strict';
import test from 'node:test';
import { dayRanges, millisecondsUntilTomorrow, readStepCounter } from '../src/hooks/pedometerMath';

process.env.TZ = 'Europe/Zurich';

test('cumulative sensor samples add only newly observed steps', () => {
  let previous: number | null = 0;
  let total = 0;

  for (const value of [1, 4, 4, 3, 8, 12]) {
    const result = readStepCounter(previous, value);
    previous = result.previous;
    total += result.delta;
  }

  assert.equal(total, 12);
  assert.equal(previous, 12);
});

test('invalid sensor samples cannot corrupt the existing counter', () => {
  for (const value of [NaN, Infinity, -1, Number.MAX_SAFE_INTEGER + 1]) {
    assert.deepEqual(readStepCounter(12, value), { previous: 12, delta: 0 });
  }
});

test('a fresh foreground subscription has its own delta baseline', () => {
  assert.deepEqual(readStepCounter(null, 2), { previous: 2, delta: 0 });
  assert.deepEqual(readStepCounter(2, 7), { previous: 7, delta: 5 });
  assert.deepEqual(readStepCounter(null, 1), { previous: 1, delta: 0 });
});

test('the Android initial sample does not create a phantom step after resume', () => {
  let previous: number | null = null;
  const deltas = [1, 1, 2].map(current => {
    const result = readStepCounter(previous, current);
    previous = result.previous;
    return result.delta;
  });

  assert.deepEqual(deltas, [0, 0, 1]);
});

test('history includes today and six previous local calendar days', () => {
  const now = new Date(2026, 9, 21, 17, 45);
  const ranges = dayRanges(now, true);

  assert.equal(ranges.length, 7);
  assert.equal(ranges[0].dateKey, '2026-10-21');
  assert.equal(ranges[6].dateKey, '2026-10-15');
  assert.equal(ranges[0].start.getHours(), 0);
  assert.equal(ranges[0].end.getTime(), now.getTime());
  assert.equal(ranges[1].end.getTime(), ranges[0].start.getTime());
  assert.equal(dayRanges(now, false).length, 1);
});

test('calendar history follows 23-hour and 25-hour daylight-saving days', () => {
  const spring = dayRanges(new Date(2026, 2, 30, 12), true)[1];
  const autumn = dayRanges(new Date(2026, 9, 26, 12), true)[1];

  assert.equal(spring.dateKey, '2026-03-29');
  assert.equal((spring.end.getTime() - spring.start.getTime()) / 3_600_000, 23);
  assert.equal(autumn.dateKey, '2026-10-25');
  assert.equal((autumn.end.getTime() - autumn.start.getTime()) / 3_600_000, 25);
});

test('rollover delay uses the next local midnight instead of a fixed 24 hours', () => {
  assert.equal(millisecondsUntilTomorrow(new Date(2026, 2, 29, 0)), 23 * 3_600_000 + 25);
  assert.equal(millisecondsUntilTomorrow(new Date(2026, 9, 25, 0)), 25 * 3_600_000 + 25);
});
