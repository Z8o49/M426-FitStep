import assert from 'node:assert/strict';
import test from 'node:test';
import {
  appReducer,
  createInitialState,
  restoreState,
  type PersonalGoal,
} from '../src/domain/model';

const TODAY = '2026-10-21';

function goal(id: string, text: string): PersonalGoal {
  return { id, text, completed: false, createdAt: '2026-10-21T12:00:00.000Z' };
}

test('Sprint 2 begins with an empty personal-goal list and an editable default name', () => {
  const state = createInitialState(TODAY);
  assert.deepEqual(state.goals, []);
  assert.equal(state.settings.username, 'Nikos');
});

test('empty, whitespace-only and overlong goals are rejected', () => {
  let state = createInitialState(TODAY);
  for (const text of ['', '   ', '\n\t', 'a'.repeat(121)]) {
    state = appReducer(state, { type: 'goal-add', goal: goal('invalid', text) });
  }
  assert.deepEqual(state.goals, []);

  state = appReducer(state, { type: 'goal-add', goal: goal('valid', 'a'.repeat(120)) });
  assert.equal(state.goals.length, 1);
  assert.equal(state.goals[0].text.length, 120);
});

test('new goals are trimmed and start unfinished', () => {
  let state = createInitialState(TODAY);
  state = appReducer(state, {
    type: 'goal-add',
    goal: { ...goal('water', '   1.5 Liter Wasser trinken \n'), completed: true },
  });
  assert.equal(state.goals[0].text, '1.5 Liter Wasser trinken');
  assert.equal(state.goals[0].completed, false);
  assert.equal(state.goals[0].id, 'water');
});

test('adding an existing goal ID does not create ambiguous duplicates', () => {
  let state = createInitialState(TODAY);
  state = appReducer(state, { type: 'goal-add', goal: goal('one', 'Ins Gym gehen') });
  state = appReducer(state, { type: 'goal-add', goal: goal('one', 'Spazieren gehen') });
  assert.equal(state.goals.length, 1);
  assert.equal(state.goals[0].text, 'Ins Gym gehen');
});

test('completed goals remain visible and toggling twice restores the unfinished state', () => {
  let state = createInitialState(TODAY);
  state = appReducer(state, { type: 'goal-add', goal: goal('water', 'Wasser trinken') });
  state = appReducer(state, { type: 'goal-add', goal: goal('gym', 'Ins Gym gehen') });
  const originalGoals = state.goals;

  state = appReducer(state, { type: 'goal-toggle', id: 'water' });
  assert.equal(state.goals.length, 2);
  assert.equal(state.goals.find(item => item.id === 'water')?.completed, true);
  assert.equal(state.goals.find(item => item.id === 'gym')?.completed, false);

  const restoredCompleted = restoreState(JSON.parse(JSON.stringify(state)), TODAY);
  assert.equal(restoredCompleted.goals.find(item => item.id === 'water')?.completed, true);

  state = appReducer(state, { type: 'goal-toggle', id: 'water' });
  assert.deepEqual(state.goals, originalGoals);
});

test('deletion survives a persisted round trip without affecting remaining goals', () => {
  let state = createInitialState(TODAY);
  state = appReducer(state, { type: 'goal-add', goal: goal('remove', 'Wasser trinken') });
  state = appReducer(state, { type: 'goal-add', goal: goal('keep', 'Ins Gym gehen') });
  state = appReducer(state, { type: 'goal-toggle', id: 'keep' });
  state = appReducer(state, { type: 'goal-delete', id: 'remove' });

  const restored = restoreState(JSON.parse(JSON.stringify(state)), '2026-10-22');
  assert.equal(restored.goals.length, 1);
  assert.equal(restored.goals[0].id, 'keep');
  assert.equal(restored.goals[0].text, 'Ins Gym gehen');
  assert.equal(restored.goals[0].completed, true);
  assert.equal(restored.goals.some(item => item.id === 'remove'), false);
});

test('a valid username is trimmed and persists with the daily goal', () => {
  let state = createInitialState(TODAY);
  state = appReducer(state, {
    type: 'save-settings',
    settings: { ...state.settings, username: '  Zoë Müller  ', dailyGoal: 9500 },
  });

  const restored = restoreState(JSON.parse(JSON.stringify(state)), TODAY);
  assert.equal(restored.settings.username, 'Zoë Müller');
  assert.equal(restored.settings.dailyGoal, 9500);
});

test('invalid usernames cannot replace settings and forty characters remain valid', () => {
  const initial = createInitialState(TODAY);
  for (const username of ['', '  ', '\n\t', 'a'.repeat(41)]) {
    const updated = appReducer(initial, {
      type: 'save-settings',
      settings: { ...initial.settings, username },
    });
    assert.deepEqual(updated.settings, initial.settings);
  }

  const updated = appReducer(initial, {
    type: 'save-settings',
    settings: { ...initial.settings, username: 'a'.repeat(40) },
  });
  assert.equal(updated.settings.username.length, 40);
});

test('malformed persisted names fall back without losing a valid daily goal', () => {
  const initial = createInitialState(TODAY);
  for (const username of [null, 42, '', '  ', 'a'.repeat(41)]) {
    const restored = restoreState({
      ...initial,
      settings: { dailyGoal: 11000, username },
    }, TODAY);
    assert.equal(restored.settings.username, initial.settings.username);
    assert.equal(restored.settings.dailyGoal, 11000);
  }
});

test('Sprint 1 data migrates without losing goal, tracking history or selected mode', () => {
  for (const mode of ['live', 'demo'] as const) {
    const sprintOne = {
      schemaVersion: 1,
      settings: { dailyGoal: 12345 },
      mode,
      live: {
        firstUseDate: '2026-10-20',
        stepsByDay: { '2026-10-19': 812, '2026-10-20': 345, [TODAY]: 678 },
      },
      demo: {
        firstUseDate: '2026-10-20',
        stepsByDay: { '2026-10-19': 7000, '2026-10-20': 8000, [TODAY]: 9000 },
      },
    };

    const migrated = restoreState(JSON.parse(JSON.stringify(sprintOne)), '2026-10-22');
    assert.equal(migrated.schemaVersion, 2);
    assert.equal(migrated.settings.dailyGoal, 12345);
    assert.equal(migrated.settings.username, createInitialState(TODAY).settings.username);
    assert.equal(migrated.mode, mode);
    assert.deepEqual(migrated.live, sprintOne.live);
    assert.deepEqual(migrated.demo, sprintOne.demo);
    assert.deepEqual(migrated.goals, []);
    assert.deepEqual(restoreState(JSON.parse(JSON.stringify(migrated)), '2026-10-22'), migrated);
  }
});
