import type {
  Contract,
  ContractAlert,
  ContractEvent,
  ContractStats,
  GlobalStats,
  HealthCheck,
  Invocation,
  MonitoredContract,
  StorageEntry,
  WatchdogStats,
} from "../../src/types.js";

export const BASE_URL = "http://localhost:8080";
export const CONTRACT_ID = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";

export const globalStats: GlobalStats = {
  totalContracts: 42,
  totalEvents: 1024,
  totalInvocations: 512,
  trackedContracts: 10,
  lastUpdatedAt: "2024-01-01T00:00:00Z",
};

export const contract: Contract = {
  id: "1",
  contractId: CONTRACT_ID,
  alias: "my-contract",
  network: "testnet",
  firstSeenAt: "2024-01-01T00:00:00Z",
  lastActivityAt: "2024-01-02T00:00:00Z",
  invocationCount: 50,
  eventCount: 100,
  isTracked: true,
};

export const contractEvent: ContractEvent = {
  id: "evt-1",
  contractId: CONTRACT_ID,
  type: "transfer",
  ledger: 1000,
  timestamp: "2024-01-01T00:00:00Z",
  transactionHash: "abc123",
  topics: ["topic1"],
  data: { amount: "100" },
};

export const invocation: Invocation = {
  id: "inv-1",
  contractId: CONTRACT_ID,
  function: "transfer",
  ledger: 1000,
  timestamp: "2024-01-01T00:00:00Z",
  transactionHash: "abc123",
  invoker: "GABC123",
  success: true,
  args: ["arg1", "arg2"],
  result: "ok",
};

export const storageEntry: StorageEntry = {
  key: "balance",
  value: "1000",
  type: "persistent",
  lastModifiedLedger: 999,
  lastModifiedAt: "2024-01-01T00:00:00Z",
  isUrgent: false,
};

export const monitoredContract: MonitoredContract = {
  contract_id: CONTRACT_ID,
  name: "MyToken",
  owner: "GABC123",
  status: "Healthy",
  last_check: "2024-01-01T00:00:00Z",
  check_interval: 60,
  registered_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

export const healthCheck: HealthCheck = {
  contract_id: CONTRACT_ID,
  status: "Healthy",
  metadata: null,
  ledger: 1000,
  tx_hash: "abc123",
  timestamp: "2024-01-01T00:00:00Z",
};

export const contractAlert: ContractAlert = {
  contract_id: CONTRACT_ID,
  severity: "Critical",
  message: "Contract unresponsive",
  ledger: 1000,
  tx_hash: "abc123",
  timestamp: "2024-01-01T00:00:00Z",
};

export const watchdogStats: WatchdogStats = {
  total_monitored: 5,
  healthy: 3,
  degraded: 1,
  unresponsive: 1,
  total_alerts: 7,
  critical_alerts: 2,
};

export const contractStats: ContractStats = {
  contractId: CONTRACT_ID,
  window: "24h",
  invocations: 50,
  events: 100,
  uniqueInvokers: 15,
  successRate: 0.98,
  avgLedgerTime: 5.2,
  topFunctions: [{ name: "transfer", count: 30 }],
};
