import { useCallback, useEffect, useRef, useState } from "react";
import type { SorolensClient } from "../client.js";
import type { Contract } from "../types.js";

export interface UseContractResult {
  data: Contract | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useContract(
  client: SorolensClient,
  contractId: string
): UseContractResult {
  const [data, setData] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const counter = useRef(0);

  const fetch = useCallback(() => {
    const token = ++counter.current;
    setIsLoading(true);
    setError(null);

    client
      .getContract(contractId)
      .then((result) => {
        if (token !== counter.current) return;
        setData(result);
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
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
