import type {
  Contract,
  ContractEvent,
  ContractStats,
  GlobalStats,
  Invocation,
  StorageEntry,
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
