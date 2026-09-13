export { SorolensClient } from "./client.js";
export type { SorolensClientOptions } from "./client.js";

export { SorolensError } from "./errors.js";

export {
  GlobalStatsSchema,
  ContractSchema,
  ContractEventSchema,
  InvocationSchema,
  StorageEntrySchema,
  ContractStatsSchema,
  ListContractsResponseSchema,
  ListEventsResponseSchema,
  ListInvocationsResponseSchema,
  HealthStatusSchema,
  AlertSeveritySchema,
  MonitoredContractSchema,
  HealthCheckSchema,
  ContractAlertSchema,
  WatchdogStatsSchema,
  MonitoredContractsResponseSchema,
  HealthChecksResponseSchema,
  AlertsResponseSchema,
} from "./types.js";
export type {
  GlobalStats,
  Contract,
  ContractEvent,
  Invocation,
  StorageEntry,
  ContractStats,
  HealthStatus,
  AlertSeverity,
  MonitoredContract,
  HealthCheck,
  ContractAlert,
  WatchdogStats,
} from "./types.js";

export { useContract } from "./hooks/useContract.js";
export type { UseContractResult } from "./hooks/useContract.js";

export { useEvents } from "./hooks/useEvents.js";
export type { UseEventsOptions, UseEventsResult } from "./hooks/useEvents.js";

export { useStorage } from "./hooks/useStorage.js";
export type { UseStorageResult } from "./hooks/useStorage.js";

export { useStats } from "./hooks/useStats.js";
export type { UseStatsResult } from "./hooks/useStats.js";

export { useMonitoredContracts } from "./hooks/useMonitoredContracts.js";
export type { UseMonitoredContractsResult } from "./hooks/useMonitoredContracts.js";

export { useContractHealth } from "./hooks/useContractHealth.js";
export type {
  UseContractHealthOptions,
  UseContractHealthResult,
} from "./hooks/useContractHealth.js";

export { useAlerts } from "./hooks/useAlerts.js";
export type { UseAlertsOptions, UseAlertsResult } from "./hooks/useAlerts.js";

export { useWatchdogStats } from "./hooks/useWatchdogStats.js";
export type { UseWatchdogStatsResult } from "./hooks/useWatchdogStats.js";
