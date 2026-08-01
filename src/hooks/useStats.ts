import { useEffect, useRef, useState } from "react";
import type { SorolensClient } from "../client.js";
import type { ContractStats } from "../types.js";

export interface UseStatsResult {
  data: ContractStats | null;
  isLoading: boolean;
  error: Error | null;
}

export function useStats(
  client: SorolensClient,
  contractId: string,
  window: "1h" | "24h" | "7d" | "30d"
): UseStatsResult {
  const [data, setData] = useState<ContractStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const counter = useRef(0);

  useEffect(() => {
    const token = ++counter.current;
    setIsLoading(true);
    setError(null);

    client
      .getStats(contractId, window)
      .then((stats) => {
        if (token !== counter.current) return;
        setData(stats);
      })
      .catch((err: unknown) => {
        if (token !== counter.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (token !== counter.current) return;
        setIsLoading(false);
      });
  }, [client, contractId, window]);

  return { data, isLoading, error };
}
