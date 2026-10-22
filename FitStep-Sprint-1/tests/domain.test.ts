import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calendarDaysInclusive,
  isDateKey,
  lastSevenDays,
  localDateKey,
  parseLocalDate,
  startOfLocalDay,
} from '../src/domain/dates';
import {
  appReducer,
  createInitialState,
  restoreState,
  selectTotalSteps,
  selectWeek,
  type TrackingData,
} from '../src/domain/model';
import { calculateProgress, MAX_DAILY_STEPS } from '../src/domain/progress';

const TODAY = '2026-10-21';

test('progress distinguishes half, reached and exceeded goals', () => {
  assert.deepEqual(calculateProgress(4000, 8000), { percent: 50, remaining: 4000 });
  assert.deepEqual(calculateProgress(8000, 8000), { percent: 100, remaining: 0 });
  assert.deepEqual(calculateProgress(10000, 8000), { percent: 125, remaining: 0 });
});

test('progress never reports a reached goal while one step remains', () => {
  assert.deepEqual(calculateProgress(7999, 8000), { percent: 99, remaining: 1 });
});

test('changing a saved goal changes progress without changing recorded steps', () => {
  let state = createInitialState(TODAY);
  state = appReducer(state, { type: 'live-delta', day: TODAY, steps: 6000 });
  state = appReducer(state, {
    type: 'save-settings',
    settings: { ...state.settings, dailyGoal: 12000 },
  });

  assert.equal(state.live.stepsByDay[TODAY], 6000);
  assert.equal(state.settings.dailyGoal, 12000);
  assert.deepEqual(
    calculateProgress(state.live.stepsByDay[TODAY], state.settings.dailyGoal),
    { percent: 50, remaining: 6000 },
  );
});

test('invalid goals cannot replace valid settings', () => {
  const state = createInitialState(TODAY);
  for (const dailyGoal of [0, -1, NaN, Infinity, 10.5, MAX_DAILY_STEPS + 1]) {
    const updated = appReducer(state, {
      type: 'save-settings',
      settings: { ...state.settings, dailyGoal },
    });
    assert.equal(updated.settings.dailyGoal, state.settings.dailyGoal, String(dailyGoal));
    assert.deepEqual(updated.live, state.live);
  }

  for (const dailyGoal of [1, MAX_DAILY_STEPS]) {
    const updated = appReducer(state, {
      type: 'save-settings',
      settings: { ...state.settings, dailyGoal },
    });
    assert.equal(updated.settings.dailyGoal, dailyGoal);
  }
});

test('sensor deltas add, while repeated absolute totals do not double count', () => {
  let state = createInitialState(TODAY);
  state = appReducer(state, { type: 'live-delta', day: TODAY, steps: 12 });
  state = appReducer(state, { type: 'live-delta', day: TODAY, steps: 8 });
  assert.equal(state.live.stepsByDay[TODAY], 20);

  state = appReducer(state, { type: 'live-total', day: TODAY, steps: 20 });
  state = appReducer(state, { type: 'live-total', day: TODAY, steps: 20 });
  assert.equal(state.live.stepsByDay[TODAY], 20);

  state = appReducer(state, { type: 'live-total', day: TODAY, steps: 25 });
  state = appReducer(state, { type: 'live-total', day: TODAY, steps: 24 });
  assert.equal(state.live.stepsByDay[TODAY], 25);

  state = appReducer(state, { type: 'live-delta', day: TODAY, steps: 5 });
  assert.equal(state.live.stepsByDay[TODAY], 30);
});

test('invalid sensor readings do not contaminate daily records', () => {
  let state = createInitialState(TODAY);
  state = appReducer(state, { type: 'live-delta', day: TODAY, steps: 50 });
  const recorded = state.live;

  for (const steps of [-1, NaN, Infinity, 1.5, MAX_DAILY_STEPS + 1]) {
    state = appReducer(state, { type: 'live-delta', day: TODAY, steps });
    state = appReducer(state, { type: 'live-total', day: TODAY, steps });
  }
  state = appReducer(state, { type: 'live-delta', day: '2026-02-30', steps: 100 });
  assert.deepEqual(state.live, recorded);
});

test('demo changes and reset preserve independently recorded live data and settings', () => {
  let state = createInitialState(TODAY);
  assert.equal(state.mode, 'live');
  assert.deepEqual(state.live.stepsByDay, {});
  assert.ok(state.schemaVersion >= 1);

  const originalDemo = state.demo;
  state = appReducer(state, { type: 'demo-add', day: TODAY, steps: 100 });
  assert.deepEqual(state.demo, originalDemo);

  state = appReducer(state, { type: 'live-delta', day: TODAY, steps: 250 });
  state = appReducer(state, {
    type: 'save-settings',
    settings: { ...state.settings, dailyGoal: 9000 },
  });
  const recordedLive = state.live;

  state = appReducer(state, { type: 'set-mode', mode: 'demo' });
  state = appReducer(state, { type: 'demo-add', day: TODAY, steps: 1100 });
  assert.equal(state.demo.stepsByDay[TODAY], originalDemo.stepsByDay[TODAY] + 1100);
  assert.deepEqual(state.live, recordedLive);

  state = appReducer(state, { type: 'demo-reset', today: TODAY });
  assert.deepEqual(state.demo, originalDemo);
  assert.deepEqual(state.live, recordedLive);
  assert.equal(state.settings.dailyGoal, 9000);

  state = appReducer(state, { type: 'set-mode', mode: 'live' });
  assert.equal(state[state.mode].stepsByDay[TODAY], 250);
});

test('a new local day begins at zero and keeps the previous day in the week', () => {
  let state = createInitialState(TODAY);
  state = appReducer(state, { type: 'live-delta', day: TODAY, steps: 100 });
  const tomorrow = '2026-10-22';
  const weekBeforeWalking = selectWeek(state.live, tomorrow);

  assert.equal(weekBeforeWalking.length, 7);
  assert.equal(weekBeforeWalking.at(-1)?.dateKey, tomorrow);
  assert.equal(weekBeforeWalking.at(-1)?.steps, 0);
  assert.equal(weekBeforeWalking.find(day => day.dateKey === TODAY)?.steps, 100);
  assert.equal(weekBeforeWalking.filter(day => day.isToday).length, 1);

  state = appReducer(state, { type: 'live-delta', day: tomorrow, steps: 25 });
  assert.equal(selectWeek(state.live, tomorrow).at(-1)?.steps, 25);
  assert.equal(state.live.stepsByDay[TODAY], 100);
  assert.equal(selectTotalSteps(state.live, tomorrow), 125);
});

test('week is chronological, complete and correctly aligned across a year boundary', () => {
  const days = lastSevenDays('2026-01-04');
  assert.deepEqual(days, [
    '2025-12-29', '2025-12-30', '2025-12-31',
    '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04',
  ]);

  const tracking: TrackingData = {
    firstUseDate: '2025-12-29',
    stepsByDay: { '2025-12-31': 123, '2026-01-04': 456 },
  };
  const week = selectWeek(tracking, '2026-01-04');
  assert.deepEqual(week.map(day => day.dateKey), days);
  assert.deepEqual(week.map(day => day.steps), [0, 0, 123, 0, 0, 0, 456]);
  assert.deepEqual(week.map(day => day.shortLabel), ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);
  assert.deepEqual(week.filter(day => day.isToday).map(day => day.dateKey), ['2026-01-04']);
});

test('calendar days remain consecutive through spring and autumn DST boundaries', () => {
  assert.deepEqual(lastSevenDays('2026-04-01'), [
    '2026-03-26', '2026-03-27', '2026-03-28',
    '2026-03-29', '2026-03-30', '2026-03-31', '2026-04-01',
  ]);
  assert.deepEqual(lastSevenDays('2026-10-28'), [
    '2026-10-22', '2026-10-23', '2026-10-24',
    '2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28',
  ]);
  assert.equal(calendarDaysInclusive('2026-03-28', '2026-03-30'), 3);
  assert.equal(calendarDaysInclusive('2026-10-24', '2026-10-26'), 3);
  assert.equal(calendarDaysInclusive('2025-12-31', '2026-01-01'), 2);
});

test('date helpers use local calendar components and reject impossible dates', () => {
  const midday = new Date(2026, 9, 21, 12, 34);
  assert.equal(localDateKey(midday), TODAY);

  const parsed = parseLocalDate(TODAY);
  assert.deepEqual(
    [parsed.getFullYear(), parsed.getMonth(), parsed.getDate()],
    [2026, 9, 21],
  );
  const start = startOfLocalDay(midday);
  assert.equal(localDateKey(start), TODAY);
  assert.equal(start.getHours(), 0);

  assert.equal(isDateKey('2024-02-29'), true);
  for (const invalid of ['2026-02-29', '2026-04-31', '2026-00-21', '2026-13-21', '2026-1-2', '', null, 20261021]) {
    assert.equal(isDateKey(invalid), false, String(invalid));
  }
});

test('hydration keeps valid entries, sanitizes malformed values and restores safe settings', () => {
  const initial = createInitialState(TODAY);
  const raw = {
    ...initial,
    mode: 'unknown',
    settings: { ...initial.settings, dailyGoal: -500 },
    live: {
      firstUseDate: 'broken',
      stepsByDay: {
        [TODAY]: 150,
        '2026-10-20': 0,
        '2026-02-30': 500,
        '2026-10-19': -1,
        '2026-10-18': 1.25,
        '2026-10-17': '250',
        '2026-10-16': NaN,
        '2026-10-15': Infinity,
        '2026-10-14': MAX_DAILY_STEPS + 1,
      },
    },
    demo: ['malformed'],
  };

  const restored = restoreState(raw, TODAY);
  const hydrated = appReducer(initial, { type: 'hydrate', value: restored });
  assert.equal(hydrated.settings.dailyGoal, initial.settings.dailyGoal);
  assert.equal(hydrated.mode, 'live');
  assert.equal(hydrated.live.firstUseDate, TODAY);
  assert.deepEqual(hydrated.live.stepsByDay, { [TODAY]: 150, '2026-10-20': 0 });
  assert.equal(hydrated.demo.firstUseDate, TODAY);
  assert.deepEqual(hydrated.demo.stepsByDay, {});
});

test('valid persisted settings, mode and separate histories survive a JSON round trip', () => {
  let state = createInitialState(TODAY);
  state = appReducer(state, { type: 'live-delta', day: TODAY, steps: 321 });
  state = appReducer(state, { type: 'set-mode', mode: 'demo' });
  state = appReducer(state, { type: 'demo-add', day: TODAY, steps: 100 });
  state = appReducer(state, {
    type: 'save-settings',
    settings: { ...state.settings, dailyGoal: 10000 },
  });
  const restored = restoreState(JSON.parse(JSON.stringify(state)), '2026-10-22');

  assert.deepEqual(restored, state);
  assert.equal(selectWeek(restored.live, '2026-10-22').at(-1)?.steps, 0);
});

test('missing storage gets safe defaults while unsupported formats are reported', () => {
  assert.deepEqual(restoreState(null, TODAY), createInitialState(TODAY));
  assert.deepEqual(restoreState(undefined, TODAY), createInitialState(TODAY));
  assert.throws(() => restoreState({ schemaVersion: 999999 }, TODAY), /Speicherformat/);
});

test('total since first use excludes imported earlier days and future records', () => {
  const tracking: TrackingData = {
    firstUseDate: TODAY,
    stepsByDay: {
      '2026-10-20': 3000,
      [TODAY]: 200,
      '2026-10-22': 400,
      '2026-10-23': 1000,
    },
  };

  assert.equal(selectTotalSteps(tracking, TODAY), 200);
  assert.equal(selectTotalSteps(tracking, '2026-10-22'), 600);
  assert.equal(selectWeek(tracking, TODAY).find(day => day.dateKey === '2026-10-20')?.steps, 3000);
  assert.equal(calendarDaysInclusive(tracking.firstUseDate, '2026-10-22'), 2);
});
