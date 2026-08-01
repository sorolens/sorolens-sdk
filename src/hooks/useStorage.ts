import { useCallback, useEffect, useRef, useState } from "react";
import type { SorolensClient } from "../client.js";
import type { StorageEntry } from "../types.js";

export interface UseStorageResult {
  data: StorageEntry[];
  isLoading: boolean;
  error: Error | null;
  urgentEntries: StorageEntry[];
}

export function useStorage(
  client: SorolensClient,
  contractId: string
): UseStorageResult {
  const [data, setData] = useState<StorageEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const counter = useRef(0);

  useEffect(() => {
    const token = ++counter.current;
    setIsLoading(true);
    setError(null);

    client
      .getStorage(contractId)
      .then((entries) => {
        if (token !== counter.current) return;
        setData(entries);
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

  const urgentEntries = data.filter((e) => e.isUrgent === true);

  return { data, isLoading, error, urgentEntries };
}

export const useStorageCallback = useCallback;
