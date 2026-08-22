import type { SorolensClient } from "../../client.js";
import type { StorageEntry } from "../../types.js";
import { createAsyncComposable } from "./_internal.js";
import type { AsyncComposable } from "./_internal.js";

export type UseStorageComposable = AsyncComposable<StorageEntry[]>;

/**
 * Vue composable for a contract's data-space storage entries. Fetches on
 * mount; `refetch()` re-runs.
 */
export function useStorage(
  client: SorolensClient,
  contractId: string
): UseStorageComposable {
  return createAsyncComposable(() => client.getStorage(contractId));
}
