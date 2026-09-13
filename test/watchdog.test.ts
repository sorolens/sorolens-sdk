import { describe, expect, it } from "vitest";
import { SorolensClient } from "../src/client.js";
import {
  AlertSeveritySchema,
  ContractAlertSchema,
  HealthCheckSchema,
  HealthStatusSchema,
  MonitoredContractSchema,
  WatchdogStatsSchema,
} from "../src/types.js";
import {
  BASE_URL,
  CONTRACT_ID,
  contractAlert,
  healthCheck,
  monitoredContract,
  watchdogStats,
} from "./mocks/fixtures.js";

function makeClient(): SorolensClient {
  return new SorolensClient({ baseUrl: BASE_URL, timeout: 5000 });
}

describe("watchdog schemas", () => {
  it("accepts known HealthStatus values", () => {
    expect(HealthStatusSchema.parse("Healthy")).toBe("Healthy");
    expect(HealthStatusSchema.parse("Degraded")).toBe("Degraded");
    expect(HealthStatusSchema.parse("Unresponsive")).toBe("Unresponsive");
  });

  it("accepts custom HealthStatus strings", () => {
    expect(HealthStatusSchema.parse("Custom")).toBe("Custom");
  });

  it("validates AlertSeverity", () => {
    expect(AlertSeveritySchema.parse("Critical")).toBe("Critical");
    expect(() => AlertSeveritySchema.parse("BOGUS")).toThrow();
  });

  it("validates MonitoredContract", () => {
    expect(MonitoredContractSchema.parse(monitoredContract)).toEqual(
      monitoredContract
    );
    expect(() => MonitoredContractSchema.parse({ ...monitoredContract, name: 42 })).toThrow();
  });

  it("validates HealthCheck including nullable metadata", () => {
    expect(HealthCheckSchema.parse(healthCheck)).toEqual(healthCheck);
    expect(
      HealthCheckSchema.parse({ ...healthCheck, metadata: "extra" }).metadata
    ).toBe("extra");
  });

  it("validates ContractAlert", () => {
    expect(ContractAlertSchema.parse(contractAlert)).toEqual(contractAlert);
    expect(() =>
      ContractAlertSchema.parse({ ...contractAlert, severity: "Nope" })
    ).toThrow();
  });

  it("validates WatchdogStats", () => {
    expect(WatchdogStatsSchema.parse(watchdogStats)).toEqual(watchdogStats);
  });
});

describe("watchdog client methods", () => {
  it("getWatchdogStats returns validated stats", async () => {
    const client = makeClient();
    expect(await client.getWatchdogStats()).toEqual(watchdogStats);
  });

  it("getMonitoredContracts returns list with cursor", async () => {
    const client = makeClient();
    const result = await client.getMonitoredContracts();
    expect(result.contracts).toEqual([monitoredContract]);
    expect(result.next_cursor).toBeNull();
  });

  it("getMonitoredContract returns single contract", async () => {
    const client = makeClient();
    expect(await client.getMonitoredContract(CONTRACT_ID)).toEqual(
      monitoredContract
    );
  });

  it("getHealthHistory returns array unwrapped", async () => {
    const client = makeClient();
    expect(await client.getHealthHistory(CONTRACT_ID, 25)).toEqual([
      healthCheck,
    ]);
  });

  it("getContractAlerts returns alerts", async () => {
    const client = makeClient();
    expect(
      await client.getContractAlerts(CONTRACT_ID, { severity: "Critical" })
    ).toEqual([contractAlert]);
  });

  it("getAllAlerts returns alerts", async () => {
    const client = makeClient();
    expect(await client.getAllAlerts({ severity: "Critical" })).toEqual([
      contractAlert,
    ]);
  });
});
