/**
 * Framework-agnostic polling for Sorolens data.
 *
 * `createPoller` runs a fetcher on a fixed interval and routes each result
 * to `onData` / `onError`. It never fires immediately — the first tick
 * happens after one full interval, so callers control their initial load
 * (usually by just awaiting the fetcher once themselves). Overlapping runs
 * are impossible: while a fetch is in flight, the next tick is skipped.
 */

export interface PollerHandle {
  /** Begin ticking. Starting an already-running poller is a no-op. */
  start(): void;
  /** Stop ticking. In-flight fetches still deliver their result. */
  stop(): void;
  /** Stop and permanently retire this poller: no further callbacks ever. */
  dispose(): void;
  /** Whether the poller is currently ticking. */
  readonly isRunning: boolean;
}

export interface CreatePollerOptions {
  /** Milliseconds between fetches. Must be a positive, finite number. */
  intervalMs?: number;
  /** Called with every successful fetch result. */
  onData: (data: unknown) => void;
  /** Called with every fetch failure. */
  onError: (error: Error) => void;
}

const DEFAULT_INTERVAL_MS = 5_000;

export function createPoller(
  fetcher: () => Promise<unknown>,
  options: CreatePollerOptions
): PollerHandle {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
  if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
    throw new RangeError(
      `createPoller: intervalMs must be a positive finite number, got ${intervalMs}.`
    );
  }

  const { onData, onError } = options;

  let timer: ReturnType<typeof setInterval> | null = null;
  let inFlight = false;
  let disposed = false;

  const tick = async (): Promise<void> => {
    if (inFlight) return; // never overlap: skip this tick
    inFlight = true;
    try {
      const data = await fetcher();
      if (disposed) return;
      onData(data);
    } catch (err: unknown) {
      if (disposed) return;
      onError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      inFlight = false;
    }
  };

  return {
    start() {
      if (disposed || timer !== null) return;
      timer = setInterval(() => {
        void tick();
      }, intervalMs);
    },
    stop() {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    },
    dispose() {
      disposed = true;
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    },
    get isRunning() {
      return timer !== null;
    },
  };
}
