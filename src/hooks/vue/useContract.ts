import type { SorolensClient } from "../../client.js";
import type { Contract } from "../../types.js";
import { createAsyncComposable } from "./_internal.js";
import type { AsyncComposable } from "./_internal.js";

export type UseContractComposable = AsyncComposable<Contract>;

/**
 * Vue composable for a single tracked contract.
 *
 * ```vue
 * <script setup lang="ts">
 * import { SorolensClient } from "@sorolens/sdk";
 * import { useContract } from "@sorolens/sdk/vue";
 *
 * const client = SorolensClient.fromEnv();
 * const { data, isLoading, error, refetch } = useContract(client, "CAAAAAAAAA…");
 * </script>
 *
 * <template>
 *   <span v-if="isLoading">Loading…</span>
 *   <span v-else-if="error">{{ error.message }}</span>
 *   <span v-else>{{ data?.alias }}</span>
 * </template>
 * ```
 *
 * Fetches on mount (`onMounted`); `refetch()` re-runs with a token guard
 * that drops stale responses, mirroring the React hook.
 */
export function useContract(
  client: SorolensClient,
  contractId: string
): UseContractComposable {
  return createAsyncComposable(() => client.getContract(contractId));
}
