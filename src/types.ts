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
