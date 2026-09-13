import type { ZodType } from "zod";
import { SorolensError } from "./errors.js";
import {
  AlertSeverity,
  AlertsResponseSchema,
  Contract,
  ContractAlert,
  ContractEvent,
  ContractStats,
  ContractStatsSchema,
  ContractSchema,
  GlobalStats,
  GlobalStatsSchema,
  HealthCheck,
  HealthChecksResponseSchema,
  Invocation,
  ListContractsResponseSchema,
  ListEventsResponseSchema,
  ListInvocationsResponseSchema,
  MonitoredContract,
  MonitoredContractSchema,
  MonitoredContractsResponseSchema,
  StorageEntry,
  StorageEntrySchema,
  WatchdogStats,
  WatchdogStatsSchema,
} from "./types.js";

export interface SorolensClientOptions {
  baseUrl: string;
  timeout?: number;
}

export class SorolensClient {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(options: SorolensClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.timeout = options.timeout ?? 30_000;
  }

  static fromEnv(): SorolensClient {
    const baseUrl = process.env["SOROLENS_BASE_URL"];
    if (!baseUrl) {
      throw new Error(
        "SOROLENS_BASE_URL environment variable is not set"
      );
    }
    return new SorolensClient({ baseUrl });
  }

  private async request<T>(
    path: string,
    schema: ZodType<T>,
    init?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...init?.headers,
        },
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new SorolensError(
          "TIMEOUT",
          `Request to ${url} timed out after ${this.timeout}ms`,
          ""
        );
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      throw await SorolensError.fromResponse(response);
    }

    const raw: unknown = await response.json();
    return schema.parse(raw);
  }

  private buildQuery(
    params: Record<string, string | number | boolean | undefined>
  ): string {
    const entries = Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== ""
    ) as [string, string | number | boolean][];
    if (entries.length === 0) return "";
    const qs = new URLSearchParams(
      entries.map(([k, v]) => [k, String(v)])
    );
    return `?${qs.toString()}`;
  }

  async getGlobalStats(): Promise<GlobalStats> {
    return this.request("/api/v1/stats", GlobalStatsSchema);
  }

  async listContracts(options?: {
    limit?: number;
    cursor?: string;
  }): Promise<{ contracts: Contract[]; nextCursor: string }> {
    const qs = this.buildQuery({
      limit: options?.limit,
      cursor: options?.cursor,
    });
    return this.request(`/api/v1/contracts${qs}`, ListContractsResponseSchema);
  }

  async trackContract(
    contractId: string,
    alias?: string
  ): Promise<Contract> {
    return this.request(
      "/api/v1/contracts",
      ContractSchema,
      {
        method: "POST",
        body: JSON.stringify({ contractId, alias }),
      }
    );
  }

  async getContract(contractId: string): Promise<Contract> {
    return this.request(
      `/api/v1/contracts/${encodeURIComponent(contractId)}`,
      ContractSchema
    );
  }

  async listEvents(
    contractId: string,
    options?: {
      type?: string;
      from?: string;
      to?: string;
      limit?: number;
      cursor?: string;
    }
  ): Promise<{ events: ContractEvent[]; nextCursor: string }> {
    const qs = this.buildQuery({
      type: options?.type,
      from: options?.from,
      to: options?.to,
      limit: options?.limit,
      cursor: options?.cursor,
    });
    return this.request(
      `/api/v1/contracts/${encodeURIComponent(contractId)}/events${qs}`,
      ListEventsResponseSchema
    );
  }

  async listInvocations(
    contractId: string,
    options?: {
      success?: boolean;
      function?: string;
      limit?: number;
      cursor?: string;
    }
  ): Promise<{ invocations: Invocation[]; nextCursor: string }> {
    const qs = this.buildQuery({
      success: options?.success,
      function: options?.function,
      limit: options?.limit,
      cursor: options?.cursor,
    });
    return this.request(
      `/api/v1/contracts/${encodeURIComponent(contractId)}/invocations${qs}`,
      ListInvocationsResponseSchema
    );
  }

  async getStorage(contractId: string): Promise<StorageEntry[]> {
    return this.request(
      `/api/v1/contracts/${encodeURIComponent(contractId)}/storage`,
      StorageEntrySchema.array()
    );
  }

  async getStats(
    contractId: string,
    window: "1h" | "24h" | "7d" | "30d"
  ): Promise<ContractStats> {
    return this.request(
      `/api/v1/contracts/${encodeURIComponent(contractId)}/stats?window=${window}`,
      ContractStatsSchema
    );
  }

  async pollEvents(contractId: string): Promise<ContractEvent[]> {
    const result = await this.listEvents(contractId, { limit: 50 });
    return result.events;
  }

  async getWatchdogStats(): Promise<WatchdogStats> {
    return this.request("/api/v1/watchdog/stats", WatchdogStatsSchema);
  }

  async getMonitoredContracts(
    cursor?: string
  ): Promise<{ contracts: MonitoredContract[]; next_cursor: string | null }> {
    const qs = this.buildQuery({ cursor });
    return this.request(
      `/api/v1/watchdog/contracts${qs}`,
      MonitoredContractsResponseSchema
    );
  }

  async getMonitoredContract(contractId: string): Promise<MonitoredContract> {
    return this.request(
      `/api/v1/watchdog/contracts/${encodeURIComponent(contractId)}`,
      MonitoredContractSchema
    );
  }

  async getHealthHistory(
    contractId: string,
    limit?: number
  ): Promise<HealthCheck[]> {
    const qs = this.buildQuery({ limit });
    const result = await this.request(
      `/api/v1/watchdog/contracts/${encodeURIComponent(contractId)}/health${qs}`,
      HealthChecksResponseSchema
    );
    return result.health_checks;
  }

  async getContractAlerts(
    contractId: string,
    options?: { severity?: AlertSeverity; limit?: number }
  ): Promise<ContractAlert[]> {
    const qs = this.buildQuery({
      severity: options?.severity,
      limit: options?.limit,
    });
    const result = await this.request(
      `/api/v1/watchdog/contracts/${encodeURIComponent(contractId)}/alerts${qs}`,
      AlertsResponseSchema
    );
    return result.alerts;
  }

  async getAllAlerts(options?: {
    severity?: AlertSeverity;
  }): Promise<ContractAlert[]> {
    const qs = this.buildQuery({ severity: options?.severity });
    const result = await this.request(
      `/api/v1/watchdog/alerts${qs}`,
      AlertsResponseSchema
    );
    return result.alerts;
  }
}
