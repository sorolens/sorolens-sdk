import { describe, expect, it } from "vitest";
import { SorolensClient } from "../src/client.js";
import {
  MockSorolensClient,
  type SorolensClientInterface,
} from "../src/mock.js";
import {
  contract,
  contractEvent,
  contractStats,
  globalStats,
  invocation,
  storageEntry,
} from "./mocks/fixtures.js";

describe("MockSorolensClient", () => {
  it("satisfies the SorolensClient public interface", () => {
    const mock: SorolensClientInterface = new MockSorolensClient();
    expect(mock).toBeDefined();

    // And a real client satisfies it too, so consumers can accept either.
    const real: SorolensClientInterface = new SorolensClient({
      baseUrl: "https://example.test",
    });
    expect(real).toBeDefined();
  });

  it("serves queued resolved values once, in order", async () => {
    const client = new MockSorolensClient();
    client.mockGetContract.mockResolvedValueOnce(contract);

    const first = await client.getContract("0xabc");
    expect(first).toEqual(contract);
    await expect(client.getContract("0xabc")).rejects.toThrow(
      /no response queued/
    );
  });

  it("queues rejections ahead of defaults", async () => {
    const client = new MockSorolensClient();
    client.mockGetGlobalStats
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(globalStats);

    await expect(client.getGlobalStats()).rejects.toThrow("boom");
    await expect(client.getGlobalStats()).resolves.toEqual(globalStats);
  });

  it("falls back to a persistent implementation after the queue drains", async () => {
    const client = new MockSorolensClient();
    client.mockListContracts.mockImplementation(async (options) => ({
      contracts: [contract],
      nextCursor: options?.cursor ? "next-from-cursor" : "next",
    }));

    await expect(client.listContracts()).resolves.toEqual({
      contracts: [contract],
      nextCursor: "next",
    });
    await expect(client.listContracts({ cursor: "c1" })).resolves.toEqual({
      contracts: [contract],
      nextCursor: "next-from-cursor",
    });
  });

  it("records call arguments for assertions", async () => {
    const client = new MockSorolensClient();
    client.mockGetStats.mockResolvedValueOnce(contractStats);
    client.mockGetStorage.mockResolvedValueOnce([storageEntry]);
    client.mockTrackContract.mockResolvedValueOnce(contract);
    client.mockListEvents.mockResolvedValueOnce({
      events: [contractEvent],
      nextCursor: "",
    });
    client.mockListInvocations.mockResolvedValueOnce({
      invocations: [invocation],
      nextCursor: "",
    });
    client.mockPollEvents.mockResolvedValueOnce([contractEvent]);

    await client.getStats("0xabc", "24h");
    await client.getStorage("0xabc");
    await client.trackContract("0xabc", "my-alias");
    await client.listEvents("0xabc", { limit: 10 });
    await client.listInvocations("0xabc", { success: true });
    await client.pollEvents("0xabc");

    expect(client.mockGetStats.calls).toEqual([["0xabc", "24h"]]);
    expect(client.mockGetStorage.calls).toEqual([["0xabc"]]);
    expect(client.mockTrackContract.calls).toEqual([["0xabc", "my-alias"]]);
    expect(client.mockListEvents.calls).toEqual([
      ["0xabc", { limit: 10 }],
    ]);
    expect(client.mockListInvocations.calls).toEqual([
      ["0xabc", { success: true }],
    ]);
    expect(client.mockPollEvents.calls).toEqual([["0xabc"]]);
  });

  it("reset() clears every method handle at once", async () => {
    const client = new MockSorolensClient();
    client.mockPollEvents.mockResolvedValueOnce([contractEvent]);

    client.reset();

    expect(client.mockPollEvents.calls).toHaveLength(0);
    await expect(client.pollEvents("0xabc")).rejects.toThrow(
      /no response queued/
    );
  });
});
