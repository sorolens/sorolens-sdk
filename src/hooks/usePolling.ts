import { useEffect, useRef } from "react";
import { createPoller } from "../polling.js";

export interface UsePollingOptions {
  /** Milliseconds between fetches. Default 5000. */
  intervalMs?: number;
  /** Called with every successful fetch result. */
  onData: (data: unknown) => void;
  /** Called with every fetch failure. */
  onError: (error: Error) => void;
}

/**
 * Poll `fetcher` on an interval for as long as this hook is mounted.
 *
 * ```tsx
 * usePolling(
 *   () => client.pollEvents(contractId),
 *   {
 *     intervalMs: 10_000,
 *     onData: (events) => setEvents(events as ContractEvent[]),
 *     onError: (err) => setError(err),
 *   }
 * );
 * ```
 *
 * Lifecycle: one poller per mount, started on mount and disposed on
 * unmount (StrictMode's double invoke included — every effect run gets a
 * fresh instance). Changing `intervalMs` re-arms with the new cadence.
 * `onData` / `onError` / `fetcher` are read through refs at invocation
 * time, so inline closures never tear down the timer.
 */
export function usePolling(
  fetcher: () => Promise<unknown>,
  options: UsePollingOptions
): void {
  const { intervalMs, onData, onError } = options;

  const fetcherRef = useRef(fetcher);
  const dataRef = useRef(onData);
  const errorRef = useRef(onError);
  fetcherRef.current = fetcher;
  dataRef.current = onData;
  errorRef.current = onError;

  useEffect(() => {
    const poller = createPoller(
      () => fetcherRef.current(),
      intervalMs === undefined
        ? { onData: (data) => dataRef.current(data), onError: (err) => errorRef.current(err) }
        : {
            intervalMs,
            onData: (data) => dataRef.current(data),
            onError: (err) => errorRef.current(err),
          }
    );
    poller.start();
    return () => {
      poller.dispose();
    };
  }, [intervalMs]);
}
