import { useCallback, useEffect, useRef, useState } from "react";
import type { SorolensClient } from "../client.js";
import type { HealthCheck, MonitoredContract } from "../types.js";

export interface UseContractHealthOptions {
  refreshInterval?: number;
}

export interface UseContractHealthResult {
  contract: MonitoredContract | null;
  healthHistory: HealthCheck[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useContractHealth(
  client: SorolensClient,
  contractId: string,
  options?: UseContractHealthOptions
): UseContractHealthResult {
  const [contract, setContract] = useState<MonitoredContract | null>(null);
  const [healthHistory, setHealthHistory] = useState<HealthCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const counter = useRef(0);
  const refreshInterval = options?.refreshInterval ?? 30_000;

  const fetch = useCallback(() => {
    const token = ++counter.current;
    setIsLoading(true);
    setError(null);

    Promise.all([
      client.getMonitoredContract(contractId),
      client.getHealthHistory(contractId),
    ])
      .then(([c, h]) => {
        if (token !== counter.current) return;
        setContract(c);
        setHealthHistory(h);
      })
      .catch((err: unknown) => {
        if (token !== counter.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (token !== counter.current) return;
        setIsLoading(false);
      });
  }, [client, contractId]);

  useEffect(() => {
    fetch();
    if (refreshInterval <= 0) return;
    const id = setInterval(fetch, refreshInterval);
    return () => clearInterval(id);
  }, [fetch, refreshInterval]);

  return { contract, healthHistory, isLoading, error, refetch: fetch };
}
