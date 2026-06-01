import type { StoreApi } from 'zustand';

type PersistApi = {
  hasHydrated: () => boolean;
  onFinishHydration: (fn: () => void) => () => void;
};

/** Wait until a zustand persist store has reloaded from AsyncStorage. */
export function waitForPersistHydration<T>(
  store: StoreApi<T> & { persist: PersistApi }
): Promise<void> {
  if (store.persist.hasHydrated()) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const unsub = store.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}
