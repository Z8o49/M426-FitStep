export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export function createStorageRepository(storage: KeyValueStorage, key = 'fitstep:state') {
  let pending: Promise<void> = Promise.resolve();

  return {
    async load(): Promise<unknown> {
      await pending;
      const value = await storage.getItem(key);
      return value === null ? null : JSON.parse(value);
    },
    save(value: unknown): Promise<void> {
      const serialized = JSON.stringify(value);
      const operation = pending.then(() => storage.setItem(key, serialized));
      pending = operation.catch(() => undefined);
      return operation;
    },
  };
}
