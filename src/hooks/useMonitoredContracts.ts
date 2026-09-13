import { useCallback, useEffect, useRef, useState } from "react";
import type { SorolensClient } from "../client.js";
import type { MonitoredContract } from "../types.js";

export interface UseMonitoredContractsResult {
  contracts: MonitoredContract[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMonitoredContracts(
  client: SorolensClient
): UseMonitoredContractsResult {
  const [contracts, setContracts] = useState<MonitoredContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const counter = useRef(0);

  const fetch = useCallback(() => {
    const token = ++counter.current;
    setIsLoading(true);
    setError(null);

    client
      .getMonitoredContracts()
      .then((result) => {
        if (token !== counter.current) return;
        setContracts(result.contracts);
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

  return { contracts, isLoading, error, refetch: fetch };
}
