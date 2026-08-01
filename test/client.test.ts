import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { SorolensClient } from "../src/client.js";
import { SorolensError } from "../src/errors.js";
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
import { server } from "./mocks/server.js";

function makeClient(): SorolensClient {
  return new SorolensClient({ baseUrl: BASE_URL, timeout: 5000 });
}

describe("SorolensClient", () => {
  describe("getGlobalStats", () => {
    it("returns global stats on success", async () => {
      const client = makeClient();
      const result = await client.getGlobalStats();
      expect(result).toEqual(globalStats);
    });

    it("throws SorolensError on 404", async () => {
      server.use(
        http.get(`${BASE_URL}/api/v1/stats`, () =>
          HttpResponse.json(
            { error: { code: "NOT_FOUND", message: "Not found", request_id: "req-1" } },
            { status: 404 }
          )
        )
      );
      const client = makeClient();
      await expect(client.getGlobalStats()).rejects.toBeInstanceOf(SorolensError);
    });

    it("throws SorolensError with correct code on 422", async () => {
      server.use(
        http.get(`${BASE_URL}/api/v1/stats`, () =>
          HttpResponse.json(
            { error: { code: "VALIDATION_ERROR", message: "Invalid", request_id: "req-2" } },
            { status: 422 }
          )
        )
      );
      const client = makeClient();
      const err = await client.getGlobalStats().catch((e) => e);
      expect(err).toBeInstanceOf(SorolensError);
      expect((err as SorolensError).code).toBe("VALIDATION_ERROR");
      expect((err as SorolensError).requestId).toBe("req-2");
    });
  });

  describe("listContracts", () => {
    it("returns paginated contracts", async () => {
      const client = makeClient();
      const result = await client.listContracts({ limit: 10 });
      expect(result.contracts).toEqual([contract]);
      expect(result.nextCursor).toBe("");
    });
  });

  describe("trackContract", () => {
    it("tracks a contract and returns it", async () => {
      const client = makeClient();
      const result = await client.trackContract(CONTRACT_ID, "my-contract");
      expect(result).toEqual(contract);
    });
  });

  describe("getContract", () => {
    it("returns a contract by id", async () => {
      const client = makeClient();
      const result = await client.getContract(CONTRACT_ID);
      expect(result).toEqual(contract);
    });

    it("throws SorolensError on 404", async () => {
      server.use(
        http.get(`${BASE_URL}/api/v1/contracts/${CONTRACT_ID}`, () =>
          HttpResponse.json(
            { error: { code: "NOT_FOUND", message: "Contract not found", request_id: "req-3" } },
            { status: 404 }
          )
        )
      );
      const client = makeClient();
      const err = await client.getContract(CONTRACT_ID).catch((e) => e);
      expect(err).toBeInstanceOf(SorolensError);
      expect((err as SorolensError).code).toBe("NOT_FOUND");
    });
  });

  describe("listEvents", () => {
    it("returns events for a contract", async () => {
      const client = makeClient();
      const result = await client.listEvents(CONTRACT_ID, { type: "transfer" });
      expect(result.events).toEqual([contractEvent]);
    });

    it("throws SorolensError on 422", async () => {
      server.use(
        http.get(`${BASE_URL}/api/v1/contracts/${CONTRACT_ID}/events`, () =>
          HttpResponse.json(
            { error: { code: "VALIDATION_ERROR", message: "Bad params", request_id: "req-4" } },
            { status: 422 }
          )
        )
      );
      const client = makeClient();
      await expect(client.listEvents(CONTRACT_ID)).rejects.toBeInstanceOf(SorolensError);
    });
  });

  describe("listInvocations", () => {
    it("returns invocations for a contract", async () => {
      const client = makeClient();
      const result = await client.listInvocations(CONTRACT_ID, { success: true });
      expect(result.invocations).toEqual([invocation]);
    });
  });

  describe("getStorage", () => {
    it("returns storage entries", async () => {
      const client = makeClient();
      const result = await client.getStorage(CONTRACT_ID);
      expect(result).toEqual([storageEntry]);
    });
  });

  describe("getStats", () => {
    it("returns contract stats for a window", async () => {
      const client = makeClient();
      const result = await client.getStats(CONTRACT_ID, "24h");
      expect(result).toEqual(contractStats);
    });
  });

  describe("pollEvents", () => {
    it("returns recent events", async () => {
      const client = makeClient();
      const result = await client.pollEvents(CONTRACT_ID);
      expect(result).toEqual([contractEvent]);
    });
  });

  describe("network timeout", () => {
    it("throws SorolensError with TIMEOUT code on timeout", async () => {
      server.use(
        http.get(`${BASE_URL}/api/v1/stats`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          return HttpResponse.json(globalStats);
        })
      );
      const client = new SorolensClient({ baseUrl: BASE_URL, timeout: 50 });
      const err = await client.getGlobalStats().catch((e) => e);
      expect(err).toBeInstanceOf(SorolensError);
      expect((err as SorolensError).code).toBe("TIMEOUT");
    });
  });

  describe("SorolensClient.fromEnv", () => {
    it("constructs from SOROLENS_BASE_URL env var", () => {
      process.env["SOROLENS_BASE_URL"] = BASE_URL;
      const client = SorolensClient.fromEnv();
      expect(client).toBeInstanceOf(SorolensClient);
      delete process.env["SOROLENS_BASE_URL"];
    });

    it("throws when env var is missing", () => {
      delete process.env["SOROLENS_BASE_URL"];
      expect(() => SorolensClient.fromEnv()).toThrow();
    });
  });
});
