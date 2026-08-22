import type { SorolensClient } from "../../client.js";
import type { Contract } from "../../types.js";
import { createAsyncStore } from "./_internal.js";
import type { AsyncStore } from "./_internal.js";

export type UseContractStore = AsyncStore<Contract>;

/**
 * Svelte store for a single tracked contract.
 *
 * ```svelte
 * <script lang="ts">
 *   import { SorolensClient } from "@sorolens/sdk";
 *   import { useContract } from "@sorolens/sdk/svelte";
 *
 *   const client = SorolensClient.fromEnv();
 *   const contract = useContract(client, "CAAAAAAAAA…");
 * </script>
 *
 * {#if $contract.isLoading}Loading…{:else if $contract.error}{$contract.error.message}{:else}
 *   {$contract.data?.alias}
 * {/if}
 * ```
 *
 * The value is a Svelte-compatible store (`subscribe`) plus a `refetch()`
 * escape hatch. Fetching starts immediately and re-runs whenever you call
 * `refetch()`; stale responses are dropped by token guard, mirroring the
 * React hook.
 */
export function useContract(
  client: SorolensClient,
  contractId: string
): UseContractStore {
  return createAsyncStore(() => client.getContract(contractId));
}
