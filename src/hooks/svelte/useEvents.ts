import type { SorolensClient } from "../../client.js";
import type { ContractEvent } from "../../types.js";
import { createAsyncStore } from "./_internal.js";
import type { AsyncStore } from "./_internal.js";

export interface UseEventsPage {
  events: ContractEvent[];
  nextCursor: string;
}

export type UseEventsStore = AsyncStore<UseEventsPage>;

export interface UseEventsOptions {
  type?: string;
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
}

/**
 * Svelte store for a contract's event page (same page shape as
 * `client.listEvents`). Fetches immediately; `refetch()` re-runs with the
 * same options.
 */
export function useEvents(
  client: SorolensClient,
  contractId: string,
  options?: UseEventsOptions
): UseEventsStore {
  return createAsyncStore(() => client.listEvents(contractId, options));
}
