import { useCallback, useEffect, useRef, useState } from "react";
import type { SorolensClient } from "../client.js";
import type { AlertSeverity, ContractAlert } from "../types.js";

export interface UseAlertsOptions {
  severity?: AlertSeverity;
}

export interface UseAlertsResult {
  alerts: ContractAlert[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useAlerts(
  client: SorolensClient,
  contractId?: string,
  options?: UseAlertsOptions
): UseAlertsResult {
  const [alerts, setAlerts] = useState<ContractAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const counter = useRef(0);
  const severity = options?.severity;

  const fetch = useCallback(() => {
    const token = ++counter.current;
    setIsLoading(true);
    setError(null);

    const promise = contractId
      ? client.getContractAlerts(contractId, severity ? { severity } : undefined)
      : client.getAllAlerts(severity ? { severity } : undefined);

    promise
      .then((result) => {
        if (token !== counter.current) return;
        setAlerts(result);
      })
      .catch((err: unknown) => {
        if (token !== counter.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (token !== counter.current) return;
        setIsLoading(false);
      });
  }, [client, contractId, severity]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { alerts, isLoading, error, refetch: fetch };
}
