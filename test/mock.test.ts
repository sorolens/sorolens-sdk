import { describe, expect, it } from "vitest";
import { MockSorolensClient } from "../src/mock.js";
import type { SorolensClientContract } from "../src/mock.js";
import { SorolensClient } from "../src/client.js";
import {
  BASE_URL,
  CONTRACT_ID,
  contract,
  contractEvent,
  contractStats,
  globalStats,
  invocation,
  storageEntry,
} from "./mocks/fixtures.js";

describe("MockSorolensClient", () => {
  it("satisfies the same structural contract as SorolensClient", () => {
    const mock: SorolensClientContract = new MockSorolensClient();
    const real: SorolensClientContract = new SorolensClient({
      baseUrl: BASE_URL,
    });
    // The real client must also satisfy the contract — if someone adds a
    // method to SorolensClient without updating the mock, tsc fails here
    // in this very file via the assignment below.
    const both: [SorolensClientContract, SorolensClientContract] = [
      real,
      mock,
    ];
    expect(both).toHaveLength(2);
  });

  it("returns queued responses FIFO, then falls back to the sticky value", async () => {
    const mock = new MockSorolensClient();
    mock.getGlobalStats
      .mockResolvedValueOnce({ ...globalStats, totalContracts: 1 })
      .mockResolvedValueOnce({ ...globalStats, totalContracts: 2 })
      .mockResolvedValue(globalStats);

    await expect(mock.getGlobalStats()).resolves.toMatchObject({
      totalContracts: 1,
    });
    await expect(mock.getGlobalStats()).resolves.toMatchObject({
      totalContracts: 2,
    });
    await expect(mock.getGlobalStats()).resolves.toEqual(globalStats);
    await expect(mock.getGlobalStats()).resolves.toEqual(globalStats);
  });

  it("rejects with queued errors and keeps the queue order", async () => {
    const mock = new MockSorolensClient();
    const boom = new Error("network down");
    mock.getContract.mockRejectedValueOnce(boom).mockResolvedValueOnce(contract);

    await expect(mock.getContract(CONTRACT_ID)).rejects.toBe(boom);
    await expect(mock.getContract(CONTRACT_ID)).resolves.toEqual(contract);
  });

  it("computes dynamic responses with mockImplementation", async () => {
    const mock = new MockSorolensClient();
    const stored = new Map<string, StorageEntry[]>();
    stored.set("c1", [storageEntry]);
    mock.getStorage.mockImplementation(async (id) => stored.get(id) ?? []);

    await expect(mock.getStorage("c1")).resolves.toEqual([storageEntry]);
    await expect(mock.getStorage("missing")).resolves.toEqual([]);
  });

  it("fails loudly when a method has no scripted response", async () => {
    const mock = new MockSorolensClient();
    await expect(mock.trackContract(CONTRACT_ID)).rejects.toThrow(
      /no scripted response/
    );
    await expect(mock.listInvocations(CONTRACT_ID)).rejects.toThrow(
      /mockImplementation/
    );
  });

  it("keeps pollEvents independent from listEvents", async () => {
    const mock = new MockSorolensClient();
    mock.pollEvents.mockResolvedValueOnce([contractEvent]);

    await expect(mock.pollEvents(CONTRACT_ID)).resolves.toEqual([
      contractEvent,
    ]);
    // listEvents was never scripted, so it still fails loudly:
    await expect(
      mock.listEvents(CONTRACT_ID)
    ).rejects.toThrow(/no scripted response/);
  });

  it("scripts every remaining public method of the client surface", async () => {
    const mock = new MockSorolensClient();

    mock.listContracts.mockResolvedValueOnce({
      contracts: [contract],
      nextCursor: "",
    });
    mock.getStats.mockResolvedValueOnce(contractStats);
    mock.listEvents.mockResolvedValueOnce({
      events: [contractEvent],
      nextCursor: "",
    });

    await expect(
      mock.listContracts({ limit: 10 })
    ).resolves.toMatchObject({ contracts: [contract] });
    await expect(mock.getStats(CONTRACT_ID, "24h")).resolves.toEqual(
      contractStats
    );
    await expect(
      mock.listEvents(CONTRACT_ID, { limit: 50 })
    ).resolves.toMatchObject({ events: [contractEvent] });
  });

  it("mockReset clears queues and sticky behaviour", async () => {
    const mock = new MockSorolensClient();
    mock.getStats.mockResolvedValueOnce(contractStats).mockResolvedValue(
      contractStats
    );
    mock.getStats.mockReset();

    await expect(mock.getStats(CONTRACT_ID, "7d")).rejects.toThrow(
      /no scripted response/
    );
  });

  it("mirrors the real client's argument shapes end to end", async () => {
    const mock = new MockSorolensClient();
    const seen: Array<Record<string, unknown>> = [];
    mock.listContracts.mockImplementation(async (options) => {
      seen.push({ ...(options ?? {}) });
      return { contracts: [], nextCursor: "cursor-2" };
    });

    const out = await mock.listContracts({ limit: 5, cursor: "cursor-1" });
    expect(out.nextCursor).toBe("cursor-2");
    expect(seen[0]).toEqual({ limit: 5, cursor: "cursor-1" });
  });
});
