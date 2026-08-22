# @sorolens/sdk

TypeScript SDK for querying Soroban contract history via the Sorolens REST API.

## Installation

```bash
npm install @sorolens/sdk
# or
pnpm add @sorolens/sdk
# or
yarn add @sorolens/sdk
```

## Quick start

Install the SDK:

```bash
pnpm add @sorolens/sdk
```

Set the API base URL, then use the factory method:

```bash
export SOROLENS_BASE_URL=https://your-sorolens-instance.example.com
```

```typescript
import { SorolensClient } from "@sorolens/sdk";

const client = SorolensClient.fromEnv();

const stats = await client.getGlobalStats();
console.log(stats.totalContracts);

const { events } = await client.listEvents("CABC...", { limit: 20 });
```

## CommonJS (Node.js)

The package also ships a CommonJS entry point for Node.js consumers using `require()`:

```javascript
const { SorolensClient } = require("@sorolens/sdk");

async function main() {
  const client = new SorolensClient({
    baseUrl: "https://your-sorolens-instance.example.com",
  });

  const stats = await client.getGlobalStats();
  console.log(stats.totalContracts);
}

main();
```

Node 18+ is required for native `fetch`.

## Environment variable

Set `SOROLENS_BASE_URL` and use the factory method:

```typescript
import { SorolensClient } from "@sorolens/sdk";

const client = SorolensClient.fromEnv();
```

## API reference

### Constructor

```typescript
new SorolensClient(options: {
  baseUrl: string;
  timeout?: number; // ms, default 30000
})
```

### Methods

#### `getGlobalStats(): Promise<GlobalStats>`

Returns platform-wide aggregate statistics.

#### `listContracts(options?): Promise<{ contracts: Contract[], nextCursor: string }>`

Options: `{ limit?: number, cursor?: string }`

#### `trackContract(contractId, alias?): Promise<Contract>`

Start tracking a Soroban contract. Optionally assign a human-readable alias.

#### `getContract(contractId): Promise<Contract>`

Fetch a single contract by its Soroban contract ID.

#### `listEvents(contractId, options?): Promise<{ events: ContractEvent[], nextCursor: string }>`

Options: `{ type?, from?, to?, limit?, cursor? }`

#### `listInvocations(contractId, options?): Promise<{ invocations: Invocation[], nextCursor: string }>`

Options: `{ success?, function?, limit?, cursor? }`

#### `getStorage(contractId): Promise<StorageEntry[]>`

Returns all current storage entries for the contract.

#### `getStats(contractId, window): Promise<ContractStats>`

`window` is one of `"1h" | "24h" | "7d" | "30d"`.

#### `pollEvents(contractId): Promise<ContractEvent[]>`

Convenience method that fetches the 50 most recent events.

#### `SorolensClient.fromEnv(): SorolensClient`

Reads `SOROLENS_BASE_URL` from `process.env` and constructs the client.

## React hooks

React 18+ is an optional peer dependency. Install it alongside the SDK:

```bash
pnpm add @sorolens/sdk react
```

Import hooks directly:

```typescript
import { useContract, useEvents, useStorage, useStats } from "@sorolens/sdk";
```

### `useContract(client, contractId)`

```typescript
const { data, isLoading, error, refetch } = useContract(client, contractId);
```

### `useEvents(client, contractId, options?)`

```typescript
const { data, isLoading, error, fetchMore } = useEvents(client, contractId, {
  type: "transfer",
  limit: 25,
});
```

### `useStorage(client, contractId)`

```typescript
const { data, isLoading, error, urgentEntries } = useStorage(client, contractId);
```

`urgentEntries` is a filtered subset where `isUrgent === true`.

### `useStats(client, contractId, window)`

```typescript
const { data, isLoading, error } = useStats(client, contractId, "24h");
```

### Component example

```tsx
import { SorolensClient, useContract } from "@sorolens/sdk";

const client = new SorolensClient({
  baseUrl: "https://your-sorolens-instance.example.com",
});

export function ContractCard({ contractId }: { contractId: string }) {
  const { data, isLoading, error, refetch } = useContract(client, contractId);

  if (isLoading) {
    return <p>Loading contract...</p>;
  }

  if (error) {
    return (
      <div>
        <p>Failed to load contract.</p>
        <button type="button" onClick={refetch}>
          Retry
        </button>
      </div>
    );
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

## Error handling

All non-2xx responses throw a `SorolensError`:

```typescript
import { SorolensError } from "@sorolens/sdk";

try {
  const contract = await client.getContract("CABC...");
} catch (err) {
  if (err instanceof SorolensError) {
    console.error(err.code, err.message, err.requestId);
  }
}
```

Network timeouts also throw `SorolensError` with `code === "TIMEOUT"`.

## TypeScript

All types are exported:

```typescript
import type {
  GlobalStats,
  Contract,
  ContractEvent,
  Invocation,
  StorageEntry,
  ContractStats,
} from "@sorolens/sdk";
```

Zod schemas are exported for runtime validation in your own code:

```typescript
import { ContractSchema } from "@sorolens/sdk";

const contract = ContractSchema.parse(rawData);
```

## Testing your app (MockSorolensClient)

Unit-test your own components without msw or any network layer. The mock
mirrors the full public surface of `SorolensClient`, and every method is
scriptable with vitest-style ergonomics while staying dependency-free:

```typescript
import { MockSorolensClient } from "@sorolens/sdk/testing";
// also re-exported from the root: import { MockSorolensClient } from "@sorolens/sdk";

const mock = new MockSorolensClient();
mock.getGlobalStats.mockResolvedValueOnce({ ...globalStats });
mock.listEvents
  .mockResolvedValueOnce({ events: [event], nextCursor: "" })
  .mockRejectedValueOnce(new SorolensError("rate limited"));

// Calls with nothing scripted fail loudly instead of returning undefined:
await expect(mock.getContract("x")).rejects.toThrow(/no scripted response/);
```

Queue semantics per method: `mockResolvedValueOnce` / `mockRejectedValueOnce`
are consumed FIFO first; once drained, the sticky `mockResolvedValue` /
`mockRejectedValue` / `mockImplementation` takes over; with neither queued,
the call throws. `pollEvents` owns its own independent queue rather than
deriving from `listEvents`, so polling sequences can be scripted directly.
`mockReset()` clears everything.

## Svelte & Vue

The React hooks have framework-native twins behind optional sub-paths —
install only what you use (both are optional peers; `react` stays optional
too):

```bash
pnpm add @sorolens/sdk svelte     # or: vue
```

**Svelte** (`@sorolens/sdk/svelte`) — each value is a readable store plus a
`refetch()` escape hatch; prefix with `$` in templates:

```svelte
<script lang="ts">
  import { SorolensClient } from "@sorolens/sdk";
  import { useContract } from "@sorolens/sdk/svelte";

  const client = SorolensClient.fromEnv();
  const contract = useContract(client, "CAAAAAAAAA…");
</script>

{#if $contract.isLoading}Loading…{:else if $contract.error}{$contract.error.message}{:else}
  {$contract.data?.alias}
{/if}
```

Also available: `useEvents(client, contractId, options?)`,
`useStorage(client, contractId)`.

**Vue 3** (`@sorolens/sdk/vue`) — composables returning `{ data, isLoading,
error, refetch }`, fetching on mount:

```vue
<script setup lang="ts">
import { SorolensClient } from "@sorolens/sdk";
import { useContract } from "@sorolens/sdk/vue";

const client = SorolensClient.fromEnv();
const { data, isLoading, error, refetch } = useContract(client, "CAAAAAAAAA…");
</script>

<template>
  <span v-if="isLoading">Loading…</span>
  <span v-else-if="error">{{ error.message }}</span>
  <span v-else>{{ data?.alias }}</span>
</template>
```

Both wrappers share the exact state shape and stale-response token guard of
the React hooks, so behaviour is identical across frameworks. Sub-path
resolution is smoke-tested against the built `dist/` output in this repo's
CI.

## Contributors

Thanks to everyone who has contributed to sorolens-sdk!

[![Contributors](https://contrib.rocks/image?repo=sorolens/sorolens-sdk)](https://github.com/sorolens/sorolens-sdk/graphs/contributors)

## License

MIT
