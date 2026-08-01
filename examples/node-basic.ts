import { SorolensClient } from "../src/index.js";

const client = new SorolensClient({
  baseUrl: process.env["SOROLENS_BASE_URL"] ?? "http://localhost:8080",
});

const CONTRACT_ID = process.env["CONTRACT_ID"] ?? "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";

async function main(): Promise<void> {
  console.log("Fetching global stats...");
  const stats = await client.getGlobalStats();
  console.log("Global stats:", stats);

  console.log(`\nFetching contract: ${CONTRACT_ID}`);
  const contract = await client.getContract(CONTRACT_ID);
  console.log("Contract:", contract);

  console.log("\nFetching recent events...");
  const { events } = await client.listEvents(CONTRACT_ID, { limit: 5 });
  console.log(`Found ${events.length} events:`);
  for (const event of events) {
    console.log(`  [${event.type}] ledger=${event.ledger} tx=${event.transactionHash}`);
  }

  console.log("\nFetching 24h stats...");
  const contractStats = await client.getStats(CONTRACT_ID, "24h");
  console.log("Stats:", contractStats);
}

main().catch(console.error);
