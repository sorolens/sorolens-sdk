import { writable } from "svelte/store";

/**
 * Shared async-state plumbing for the Svelte stores. Mirrors the shape of
 * the React hooks ({ data, isLoading, error } plus refetch) so consumers
 * get identical semantics across frameworks.
 */

export interface AsyncStoreState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export interface AsyncStore<T> {
  subscribe(run: (value: AsyncStoreState<T>) => void): () => void;
  refetch(): Promise<void>;
}

export function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

export function createAsyncStore<T>(fetcher: () => Promise<T>): AsyncStore<T> {
  const store = writable<AsyncStoreState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  let token = 0;

  async function run(): Promise<void> {
    const current = ++token;
    store.update((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await fetcher();
      if (current !== token) return;
      store.set({ data, isLoading: false, error: null });
    } catch (err: unknown) {
      if (current !== token) return;
      store.update((s) => ({ ...s, isLoading: false, error: toError(err) }));
    }
  }

  void run();

  return {
    subscribe: store.subscribe,
    refetch: run,
  };
}
