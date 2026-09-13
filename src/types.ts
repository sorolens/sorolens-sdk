import { z } from "zod";

export const GlobalStatsSchema = z.object({
  totalContracts: z.number(),
  totalEvents: z.number(),
  totalInvocations: z.number(),
  trackedContracts: z.number(),
  lastUpdatedAt: z.string(),
});
export type GlobalStats = z.infer<typeof GlobalStatsSchema>;

export const ContractSchema = z.object({
  id: z.string(),
  contractId: z.string(),
  alias: z.string().optional(),
  network: z.string(),
  firstSeenAt: z.string(),
  lastActivityAt: z.string(),
  invocationCount: z.number(),
  eventCount: z.number(),
  isTracked: z.boolean(),
});
export type Contract = z.infer<typeof ContractSchema>;

export const ContractEventSchema = z.object({
  id: z.string(),
  contractId: z.string(),
  type: z.string(),
  ledger: z.number(),
  timestamp: z.string(),
  transactionHash: z.string(),
  topics: z.array(z.unknown()),
  data: z.unknown(),
});
export type ContractEvent = z.infer<typeof ContractEventSchema>;

export const InvocationSchema = z.object({
  id: z.string(),
  contractId: z.string(),
  function: z.string(),
  ledger: z.number(),
  timestamp: z.string(),
  transactionHash: z.string(),
  invoker: z.string(),
  success: z.boolean(),
  args: z.array(z.unknown()),
  result: z.unknown().optional(),
});
export type Invocation = z.infer<typeof InvocationSchema>;

export const StorageEntrySchema = z.object({
  key: z.string(),
  value: z.unknown(),
  type: z.enum(["persistent", "temporary", "instance"]),
  expiresAt: z.string().optional(),
  lastModifiedLedger: z.number(),
  lastModifiedAt: z.string(),
  isUrgent: z.boolean().optional(),
});
export type StorageEntry = z.infer<typeof StorageEntrySchema>;

export const ContractStatsSchema = z.object({
  contractId: z.string(),
  window: z.enum(["1h", "24h", "7d", "30d"]),
  invocations: z.number(),
  events: z.number(),
  uniqueInvokers: z.number(),
  successRate: z.number(),
  avgLedgerTime: z.number(),
  topFunctions: z.array(
    z.object({
      name: z.string(),
      count: z.number(),
    })
  ),
});
export type ContractStats = z.infer<typeof ContractStatsSchema>;

export const ListContractsResponseSchema = z.object({
  contracts: z.array(ContractSchema),
  nextCursor: z.string(),
});

export const ListEventsResponseSchema = z.object({
  events: z.array(ContractEventSchema),
  nextCursor: z.string(),
});

export const ListInvocationsResponseSchema = z.object({
  invocations: z.array(InvocationSchema),
  nextCursor: z.string(),
});

export const HealthStatusSchema = z.union([
  z.enum(["Healthy", "Degraded", "Unresponsive"]),
  z.string(),
]);
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export const AlertSeveritySchema = z.enum(["Info", "Warning", "Critical"]);
export type AlertSeverity = z.infer<typeof AlertSeveritySchema>;

export const MonitoredContractSchema = z.object({
  contract_id: z.string(),
  name: z.string(),
  owner: z.string(),
  status: HealthStatusSchema,
  last_check: z.string(),
  check_interval: z.number(),
  registered_at: z.string(),
  updated_at: z.string(),
});
export type MonitoredContract = z.infer<typeof MonitoredContractSchema>;

export const HealthCheckSchema = z.object({
  contract_id: z.string(),
  status: HealthStatusSchema,
  metadata: z.string().nullable(),
  ledger: z.number(),
  tx_hash: z.string(),
  timestamp: z.string(),
});
export type HealthCheck = z.infer<typeof HealthCheckSchema>;

export const ContractAlertSchema = z.object({
  contract_id: z.string(),
  severity: AlertSeveritySchema,
  message: z.string(),
  ledger: z.number(),
  tx_hash: z.string(),
  timestamp: z.string(),
});
export type ContractAlert = z.infer<typeof ContractAlertSchema>;

export const WatchdogStatsSchema = z.object({
  total_monitored: z.number(),
  healthy: z.number(),
  degraded: z.number(),
  unresponsive: z.number(),
  total_alerts: z.number(),
  critical_alerts: z.number(),
});
export type WatchdogStats = z.infer<typeof WatchdogStatsSchema>;

export const MonitoredContractsResponseSchema = z.object({
  contracts: z.array(MonitoredContractSchema),
  next_cursor: z.string().nullable(),
});

export const HealthChecksResponseSchema = z.object({
  health_checks: z.array(HealthCheckSchema),
});

export const AlertsResponseSchema = z.object({
  alerts: z.array(ContractAlertSchema),
});
