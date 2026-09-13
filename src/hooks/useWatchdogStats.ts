import { useCallback, useEffect, useRef, useState } from "react";
import type { SorolensClient } from "../client.js";
import type { WatchdogStats } from "../types.js";

export interface UseWatchdogStatsResult {
  stats: WatchdogStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useWatchdogStats(
  client: SorolensClient
): UseWatchdogStatsResult {
  const [stats, setStats] = useState<WatchdogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const counter = useRef(0);

  const fetch = useCallback(() => {
    const token = ++counter.current;
    setIsLoading(true);
    setError(null);

    client
      .getWatchdogStats()
      .then((result) => {
        if (token !== counter.current) return;
        setStats(result);
      })
      .catch((err: unknown) => {
        if (token !== counter.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (token !== counter.current) return;
        setIsLoading(false);
      });
  }, [client]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { stats, isLoading, error, refetch: fetch };
}
