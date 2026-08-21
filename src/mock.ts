import type { SorolensClient } from "./client.js";
import type {
  Contract,
  ContractEvent,
  ContractStats,
  GlobalStats,
  Invocation,
  StorageEntry,
} from "./types.js";

/**
 * The public surface of {@link SorolensClient} that a mock must satisfy.
 * Deriving it with `Pick` keeps the mock in sync at compile time: when the
 * real client gains or changes a public method, `MockSorolensClient` fails
 * to typecheck until it is updated too.
 */
export type SorolensClientInterface = Pick<
  SorolensClient,
  | "getGlobalStats"
  | "listContracts"
  | "trackContract"
  | "getContract"
  | "listEvents"
  | "listInvocations"
  | "getStorage"
  | "getStats"
  | "pollEvents"
>;

type QueuedResponse<TResult> =
  | { kind: "resolve"; value: TResult }
  | { kind: "reject"; error: unknown };

/**
 * A queued, per-method mock handle. Responses are consumed first-in-first-out
 * via the `mockResolvedValueOnce` / `mockRejectedValueOnce` helpers; once the
 * queue is empty, the last `mockImplementation` (if any) answers instead.
 * Every invocation records its arguments in {@link calls} for assertions.
 */
export class QueuedMockMethod<TArgs extends unknown[], TResult> {
  private readonly name: string;
  private readonly queue: QueuedResponse<TResult>[] = [];
  private implementation?: ((...args: TArgs) => Promise<TResult>) | undefined;

  /** Arguments captured from every invocation, oldest first. */
  readonly calls: TArgs[] = [];

  constructor(name: string) {
    this.name = name;
  }

  /** Queue one resolved value; consumed before any persistent implementation. */
  mockResolvedValueOnce(value: TResult): this {
    this.queue.push({ kind: "resolve", value });
    return this;
  }

  /** Queue one thrown error; consumed before any persistent implementation. */
  mockRejectedValueOnce(error: unknown): this {
    this.queue.push({ kind: "reject", error });
    return this;
  }

  /**
   * Answer every call not covered by a queued response. Passing no argument
   * clears the current implementation.
   */
  mockImplementation(fn?: (...args: TArgs) => Promise<TResult>): this {
    this.implementation = fn;
    return this;
  }

  /** Forget queued responses, recorded calls, and any implementation. */
  reset(): this {
    this.queue.length = 0;
    this.calls.length = 0;
    this.implementation = undefined;
    return this;
  }

  async invoke(...args: TArgs): Promise<TResult> {
    this.calls.push(args);

    const next = this.queue.shift();
    if (next) {
      if (next.kind === "reject") {
        throw next.error;
      }
      return next.value;
    }

    if (this.implementation) {
      return this.implementation(...args);
    }

    throw new Error(
      `MockSorolensClient.${this.name}: no response queued for call #${this.calls.length}. ` +
        "Queue one with .mockResolvedValueOnce() / .mockRejectedValueOnce(), or set a default with .mockImplementation()."
    );
  }
}

/**
 * Test double for {@link SorolensClient}: same public interface, zero network.
 *
 * Each method reads from its own queue so consumer tests can script exact
 * response sequences without msw or any transport:
 *
 * ```ts
 * const client = new MockSorolensClient();
 * client.mockGetContract.mockResolvedValueOnce(contract);
 * await client.getContract("0xabc");
 * expect(client.mockGetContract.calls).toEqual([["0xabc"]]);
 * ```
 *
 * Test-only export: import it from `sorolens-sdk/testing`.
 */
export class MockSorolensClient implements SorolensClientInterface {
  readonly mockGetGlobalStats = new QueuedMockMethod<[], GlobalStats>(
    "getGlobalStats"
  );
  readonly mockListContracts = new QueuedMockMethod<
    [{ limit?: number; cursor?: string }?],
    { contracts: Contract[]; nextCursor: string }
  >("listContracts");
  readonly mockTrackContract = new QueuedMockMethod<
    [contractId: string, alias?: string],
    Contract
  >("trackContract");
  readonly mockGetContract = new QueuedMockMethod<[string], Contract>(
    "getContract"
  );
  readonly mockListEvents = new QueuedMockMethod<
    [string, { type?: string; from?: string; to?: string; limit?: number; cursor?: string }?],
    { events: ContractEvent[]; nextCursor: string }
  >("listEvents");
  readonly mockListInvocations = new QueuedMockMethod<
    [string, { success?: boolean; function?: string; limit?: number; cursor?: string }?],
    { invocations: Invocation[]; nextCursor: string }
  >("listInvocations");
  readonly mockGetStorage = new QueuedMockMethod<[string], StorageEntry[]>(
    "getStorage"
  );
  readonly mockGetStats = new QueuedMockMethod<
    [string, "1h" | "24h" | "7d" | "30d"],
    ContractStats
  >("getStats");
  readonly mockPollEvents = new QueuedMockMethod<[string], ContractEvent[]>(
    "pollEvents"
  );

  getGlobalStats(): Promise<GlobalStats> {
    return this.mockGetGlobalStats.invoke();
  }

  listContracts(options?: {
    limit?: number;
    cursor?: string;
  }): Promise<{ contracts: Contract[]; nextCursor: string }> {
    return this.mockListContracts.invoke(options);
  }

  trackContract(contractId: string, alias?: string): Promise<Contract> {
    return this.mockTrackContract.invoke(contractId, alias);
  }

  getContract(contractId: string): Promise<Contract> {
    return this.mockGetContract.invoke(contractId);
  }

  listEvents(
    contractId: string,
    options?: {
      type?: string;
      from?: string;
      to?: string;
      limit?: number;
      cursor?: string;
    }
  ): Promise<{ events: ContractEvent[]; nextCursor: string }> {
    return this.mockListEvents.invoke(contractId, options);
  }

  listInvocations(
    contractId: string,
    options?: {
      success?: boolean;
      function?: string;
      limit?: number;
      cursor?: string;
    }
  ): Promise<{ invocations: Invocation[]; nextCursor: string }> {
    return this.mockListInvocations.invoke(contractId, options);
  }

  getStorage(contractId: string): Promise<StorageEntry[]> {
    return this.mockGetStorage.invoke(contractId);
  }

  getStats(
    contractId: string,
    window: "1h" | "24h" | "7d" | "30d"
  ): Promise<ContractStats> {
    return this.mockGetStats.invoke(contractId, window);
  }

  pollEvents(contractId: string): Promise<ContractEvent[]> {
    return this.mockPollEvents.invoke(contractId);
  }

  /** Reset every method handle in one call. */
  reset(): this {
    for (const value of Object.values(this)) {
      if (value instanceof QueuedMockMethod) {
        value.reset();
      }
    }
    return this;
  }
}
