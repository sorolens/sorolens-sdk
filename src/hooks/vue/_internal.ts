import { onMounted, ref } from "vue";
import type { Ref, ShallowRef } from "vue";

/**
 * Shared async-state plumbing for the Vue composables. Mirrors the shape
 * of the React hooks ({ data, isLoading, error } plus refetch) so
 * consumers get identical semantics across frameworks.
 */

export interface AsyncState<T> {
  data: ShallowRef<T | null>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
}

export interface AsyncComposable<T> extends AsyncState<T> {
  refetch: () => Promise<void>;
}

export function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

export function createAsyncComposable<T>(
  fetcher: () => Promise<T>
): AsyncComposable<T> {
  const data = ref<T | null>(null) as ShallowRef<T | null>;
  const isLoading = ref(true);
  const error = ref<Error | null>(null);

  let token = 0;
  let started = false;

  async function run(): Promise<void> {
    const current = ++token;
    isLoading.value = true;
    error.value = null;
    try {
      const result = await fetcher();
      if (current !== token) return;
      data.value = result;
    } catch (err: unknown) {
      if (current !== token) return;
      error.value = toError(err);
    } finally {
      // A superseded run must not flip a newer run's loading flag off.
      if (current === token) isLoading.value = false;
    }
  }

  onMounted(() => {
    if (started) return; // StrictMode-style double invoke guard
    started = true;
    void run();
  });

  return { data, isLoading, error, refetch: run };
}
