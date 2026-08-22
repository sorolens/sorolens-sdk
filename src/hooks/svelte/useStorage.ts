import type { SorolensClient } from "../../client.js";
import type { StorageEntry } from "../../types.js";
import { createAsyncStore } from "./_internal.js";
import type { AsyncStore } from "./_internal.js";

export type UseStorageStore = AsyncStore<StorageEntry[]>;

/**
 * Svelte store for a contract's data-space storage entries. Fetches
 * immediately; `refetch()` re-runs.
 */
export function useStorage(
  client: SorolensClient,
  contractId: string
): UseStorageStore {
  return createAsyncStore(() => client.getStorage(contractId));
}
