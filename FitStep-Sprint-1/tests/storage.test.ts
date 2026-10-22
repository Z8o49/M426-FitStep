import assert from 'node:assert/strict';
import test from 'node:test';
import { appReducer, createInitialState, restoreState } from '../src/domain/model';
import { createStorageRepository, type KeyValueStorage } from '../src/services/storageRepository';

function memoryStorage(initial: string | null = null) {
  let saved = initial;
  const writes: Array<{ key: string; value: string }> = [];
  const storage: KeyValueStorage = {
    async getItem() { return saved; },
    async setItem(key, value) {
      writes.push({ key, value });
      saved = value;
    },
  };
  return { storage, writes, read: () => saved };
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => { resolve = done; });
  return { promise, resolve };
}

test('loading empty storage lets the domain create a clean live session', async () => {
  const backing = memoryStorage();
  const repository = createStorageRepository(backing.storage);
  const raw = await repository.load();
  assert.equal(raw, null);
  const restored = restoreState(raw, '2026-10-21');
  assert.equal(restored.mode, 'live');
  assert.deepEqual(restored.live.stepsByDay, {});
  assert.equal(backing.writes.length, 0);
});

test('stored state survives a fresh repository instance', async () => {
  const day = '2026-10-21';
  const backing = memoryStorage();
  let state = createInitialState(day);
  state = appReducer(state, {
    type: 'save-settings',
    settings: { ...state.settings, dailyGoal: 9500 },
  });
  state = appReducer(state, { type: 'live-delta', day, steps: 1234 });
  state = appReducer(state, { type: 'set-mode', mode: 'demo' });
  state = appReducer(state, { type: 'demo-add', day, steps: 100 });

  await createStorageRepository(backing.storage).save(state);
  const raw = await createStorageRepository(backing.storage).load();
  assert.deepEqual(restoreState(raw, day), state);
});

test('overlapping saves are serialized and leave the newest state stored', async () => {
  const releaseFirst = deferred();
  const startedFirst = deferred();
  let stored: string | null = null;
  const started: number[] = [];
  const completed: number[] = [];
  const storage: KeyValueStorage = {
    async getItem() { return stored; },
    async setItem(_key, value) {
      const revision = JSON.parse(value).revision as number;
      started.push(revision);
      if (revision === 1) {
        startedFirst.resolve();
        await releaseFirst.promise;
      }
      stored = value;
      completed.push(revision);
    },
  };
  const repository = createStorageRepository(storage);

  const first = repository.save({ revision: 1 });
  const second = repository.save({ revision: 2 });
  const third = repository.save({ revision: 3 });
  await startedFirst.promise;
  assert.deepEqual(started, [1]);
  assert.deepEqual(completed, []);

  releaseFirst.resolve();
  await Promise.all([first, second, third]);
  assert.deepEqual(started, [1, 2, 3]);
  assert.deepEqual(completed, [1, 2, 3]);
  assert.deepEqual(await repository.load(), { revision: 3 });
});

test('loading waits for a pending save before reading', async () => {
  const startedWrite = deferred();
  const releaseWrite = deferred();
  let stored = '{"revision":0}';
  let readCount = 0;
  const storage: KeyValueStorage = {
    async getItem() {
      readCount += 1;
      return stored;
    },
    async setItem(_key, value) {
      startedWrite.resolve();
      await releaseWrite.promise;
      stored = value;
    },
  };
  const repository = createStorageRepository(storage);
  const saving = repository.save({ revision: 1 });
  await startedWrite.promise;

  const loading = repository.load();
  try {
    await Promise.resolve();
    assert.equal(readCount, 0);
  } finally {
    releaseWrite.resolve();
  }

  await saving;
  assert.deepEqual(await loading, { revision: 1 });
  assert.equal(readCount, 1);
});

test('a failed save is reported and does not block later queued saves', async () => {
  let attempts = 0;
  let stored: string | null = null;
  const storage: KeyValueStorage = {
    async getItem() { return stored; },
    async setItem(_key, value) {
      attempts += 1;
      if (attempts === 1) throw new Error('storage temporarily unavailable');
      stored = value;
    },
  };
  const repository = createStorageRepository(storage);

  const failed = repository.save({ revision: 1 });
  const recovered = repository.save({ revision: 2 });
  await assert.rejects(failed, /temporarily unavailable/);
  await recovered;

  assert.equal(attempts, 2);
  assert.deepEqual(await repository.load(), { revision: 2 });
});

test('save takes a snapshot before a queued object can be changed by its caller', async () => {
  const backing = memoryStorage();
  const repository = createStorageRepository(backing.storage);
  const value = { settings: { dailyGoal: 8000 } };

  const saving = repository.save(value);
  value.settings.dailyGoal = 12000;
  await saving;

  assert.deepEqual(await repository.load(), { settings: { dailyGoal: 8000 } });
});

test('malformed JSON is surfaced without overwriting the existing stored value', async () => {
  const malformed = '{"settings":';
  const backing = memoryStorage(malformed);
  const repository = createStorageRepository(backing.storage);

  await assert.rejects(repository.load(), SyntaxError);
  assert.equal(backing.read(), malformed);
  assert.equal(backing.writes.length, 0);
});

test('read failures are surfaced and a subsequent retry can succeed', async () => {
  let attempts = 0;
  const storage: KeyValueStorage = {
    async getItem() {
      attempts += 1;
      if (attempts === 1) throw new Error('read unavailable');
      return '{"revision":4}';
    },
    async setItem() {
      assert.fail('loading must not write');
    },
  };
  const repository = createStorageRepository(storage);

  await assert.rejects(repository.load(), /read unavailable/);
  assert.deepEqual(await repository.load(), { revision: 4 });
});

test('a repository consistently uses its supplied storage key', async () => {
  const values = new Map<string, string>();
  const readKeys: string[] = [];
  const storage: KeyValueStorage = {
    async getItem(key) {
      readKeys.push(key);
      return values.get(key) ?? null;
    },
    async setItem(key, value) {
      values.set(key, value);
    },
  };
  const repository = createStorageRepository(storage, 'fitstep:test-session');
  await repository.save({ goal: 8000 });

  assert.deepEqual(await repository.load(), { goal: 8000 });
  assert.deepEqual([...values.keys()], ['fitstep:test-session']);
  assert.deepEqual(readKeys, ['fitstep:test-session']);
});
