import type { SorolensClient } from "../../client.js";
import type { ContractEvent } from "../../types.js";
import { createAsyncComposable } from "./_internal.js";
import type { AsyncComposable } from "./_internal.js";

export interface UseEventsPage {
  events: ContractEvent[];
  nextCursor: string;
}

export type UseEventsComposable = AsyncComposable<UseEventsPage>;

export interface UseEventsOptions {
  type?: string;
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
}

/**
 * Vue composable for a contract's event page (same page shape as
 * `client.listEvents`). Fetches on mount; `refetch()` re-runs with the
 * same options.
 */
export function useEvents(
  client: SorolensClient,
  contractId: string,
  options?: UseEventsOptions
): UseEventsComposable {
  return createAsyncComposable(() =>
    client.listEvents(contractId, options)
  );
}
