import { useCallback, useEffect, useRef, useState } from "react";
import type { SorolensClient } from "../client.js";
import type { ContractEvent } from "../types.js";

export interface UseEventsOptions {
  type?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export interface UseEventsResult {
  data: ContractEvent[];
  isLoading: boolean;
  error: Error | null;
  fetchMore: () => void;
}

export function useEvents(
  client: SorolensClient,
  contractId: string,
  options?: UseEventsOptions
): UseEventsResult {
  const [data, setData] = useState<ContractEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cursorRef = useRef<string | undefined>(undefined);
  const counter = useRef(0);

  const load = useCallback(
    (append: boolean) => {
      const token = ++counter.current;
      setIsLoading(true);
      setError(null);

      const eventsOptions = {
        ...options,
        ...(append && cursorRef.current ? { cursor: cursorRef.current } : {}),
      };
      client
        .listEvents(contractId, eventsOptions)
        .then((result) => {
          if (token !== counter.current) return;
          cursorRef.current = result.nextCursor;
          setData((prev) => (append ? [...prev, ...result.events] : result.events));
        })
        .catch((err: unknown) => {
          if (token !== counter.current) return;
          setError(err instanceof Error ? err : new Error(String(err)));
        })
        .finally(() => {
          if (token !== counter.current) return;
          setIsLoading(false);
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client, contractId, options?.type, options?.from, options?.to, options?.limit]
  );

  useEffect(() => {
    cursorRef.current = undefined;
    load(false);
  }, [load]);

  const fetchMore = useCallback(() => {
    load(true);
  }, [load]);

  return { data, isLoading, error, fetchMore };
}
