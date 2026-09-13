import type {
  Contract,
  ContractEvent,
  ContractStats,
  GlobalStats,
  Invocation,
  StorageEntry,
} from "./types.js";

/**
 * Structural contract shared by {@link SorolensClient} and
 * {@link MockSorolensClient}. Type your application's seams against this
 * interface rather than the concrete class so real and mock clients stay
 * freely interchangeable.
 */
export interface SorolensClientContract {
  getGlobalStats(): Promise<GlobalStats>;
  listContracts(options?: {
    limit?: number;
    cursor?: string;
  }): Promise<{ contracts: Contract[]; nextCursor: string }>;
  trackContract(contractId: string, alias?: string): Promise<Contract>;
  getContract(contractId: string): Promise<Contract>;
  listEvents(
    contractId: string,
    options?: {
      type?: string;
      from?: string;
      to?: string;
      limit?: number;
      cursor?: string;
    }
  ): Promise<{ events: ContractEvent[]; nextCursor: string }>;
  listInvocations(
    contractId: string,
    options?: {
      success?: boolean;
      function?: string;
      limit?: number;
      cursor?: string;
    }
  ): Promise<{ invocations: Invocation[]; nextCursor: string }>;
  getStorage(contractId: string): Promise<StorageEntry[]>;
  getStats(
    contractId: string,
    window: "1h" | "24h" | "7d" | "30d"
  ): Promise<ContractStats>;
  pollEvents(contractId: string): Promise<ContractEvent[]>;
}

/**
 * A method that is both callable and scriptable, mirroring vitest's
 * `vi.fn()` ergonomics without depending on vitest: production consumers
 * get a zero-dependency test double, test files get the familiar
 * `.mockResolvedValueOnce(...)` shape.
 */
export interface ScriptableMethod<T, Args extends unknown[]> {
  (...args: Args): Promise<T>;
  /** Queue one successful response for the next call (FIFO). */
  mockResolvedValueOnce(value: T): this;
  /** Queue one failure for the next call (e.g. a `SorolensError`). */
  mockRejectedValueOnce(error: unknown): this;
  /** Answer every call once any queued Once-responses are drained. */
  mockResolvedValue(value: T): this;
  /** Reject every call once any queued Once-responses are drained. */
  mockRejectedValue(error: unknown): this;
  /** Compute every drained-call response dynamically. */
  mockImplementation(fn: (...args: Args) => Promise<T>): this;
  /** Drop all queued responses and any sticky behaviour. */
  mockReset(): this;
}

interface QueuedResponse<T> {
  ok: boolean;
  value?: T;
  error?: unknown;
}

function scriptableMethod<T, Args extends unknown[]>(
  methodName: string
): ScriptableMethod<T, Args> {
  const queue: Array<QueuedResponse<T>> = [];
  let sticky: ((...args: Args) => Promise<T>) | null = null;

  const dequeue = async (args: Args): Promise<T> => {
    const head = queue.shift();
    if (head !== undefined) {
      if (head.ok) return head.value as T;
      throw head.error;
    }
    if (sticky !== null) return sticky(...args);
    throw new Error(
      `MockSorolensClient.${methodName}: no scripted response. Queue one with .mockResolvedValueOnce()/.mockRejectedValueOnce(), or set a default with .mockResolvedValue()/.mockImplementation().`
    );
  };

  const method = ((...args: Args) => dequeue(args)) as ScriptableMethod<
    T,
    Args
  >;

  method.mockResolvedValueOnce = (value: T): typeof method => {
    queue.push({ ok: true, value });
    return method;
  };
  method.mockRejectedValueOnce = (error: unknown): typeof method => {
    queue.push({ ok: false, error });
    return method;
  };
  method.mockResolvedValue = (value: T): typeof method => {
    sticky = async () => value;
    return method;
  };
  method.mockRejectedValue = (error: unknown): typeof method => {
    sticky = async () => {
      throw error;
    };
    return method;
  };
  method.mockImplementation = (
    fn: (...args: Args) => Promise<T>
  ): typeof method => {
    sticky = fn;
    return method;
  };
  method.mockReset = (): typeof method => {
    queue.length = 0;
    sticky = null;
    return method;
  };

  return method;
}

/**
 * Zero-network test double mirroring the full public surface of
 * `SorolensClient`. Every method is callable like the real client and
 * scriptable like a `vi.fn()`:
 *
 * ```ts
 * import { MockSorolensClient } from "sorolens-sdk";
 * // or: import { MockSorolensClient } from "sorolens-sdk/testing";
 *
 * const mock = new MockSorolensClient();
 * mock.getGlobalStats.mockResolvedValueOnce(globalStats);
 * mock.listEvents.mockResolvedValueOnce({ events: [event], nextCursor: "" });
 *
 * await clientUsing(mock).loadDashboard();
 *
 * // Calls with no scripted response fail loudly instead of returning
 * // undefined — including pollEvents, which owns its own independent
 * // queue rather than deriving from listEvents:
 * await expect(mock.pollEvents("c1")).rejects.toThrow(/no scripted response/);
 * ```
 */
export class MockSorolensClient implements SorolensClientContract {
  readonly getGlobalStats = scriptableMethod<GlobalStats, []>(
    "getGlobalStats"
  );
  readonly listContracts = scriptableMethod<
    { contracts: Contract[]; nextCursor: string },
    [options?: { limit?: number; cursor?: string }]
  >("listContracts");
  readonly trackContract = scriptableMethod<
    Contract,
    [contractId: string, alias?: string]
  >("trackContract");
  readonly getContract = scriptableMethod<Contract, [contractId: string]>(
    "getContract"
  );
  readonly listEvents = scriptableMethod<
    { events: ContractEvent[]; nextCursor: string },
    [
      contractId: string,
      options?: {
        type?: string;
        from?: string;
        to?: string;
        limit?: number;
        cursor?: string;
      },
    ]
  >("listEvents");
  readonly listInvocations = scriptableMethod<
    { invocations: Invocation[]; nextCursor: string },
    [
      contractId: string,
      options?: {
        success?: boolean;
        function?: string;
        limit?: number;
        cursor?: string;
      },
    ]
  >("listInvocations");
  readonly getStorage = scriptableMethod<StorageEntry[], [contractId: string]>(
    "getStorage"
  );
  readonly getStats = scriptableMethod<
    ContractStats,
    [contractId: string, window: "1h" | "24h" | "7d" | "30d"]
  >("getStats");
  readonly pollEvents = scriptableMethod<ContractEvent[], [contractId: string]>(
    "pollEvents"
  );
}
