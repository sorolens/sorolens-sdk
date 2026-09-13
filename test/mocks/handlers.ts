import { http, HttpResponse } from "msw";
import {
  BASE_URL,
  CONTRACT_ID,
  contract,
  contractAlert,
  contractEvent,
  contractStats,
  globalStats,
  healthCheck,
  invocation,
  monitoredContract,
  storageEntry,
  watchdogStats,
} from "./fixtures.js";

export const handlers = [
  http.get(`${BASE_URL}/api/v1/stats`, () =>
    HttpResponse.json(globalStats)
  ),

  http.get(`${BASE_URL}/api/v1/contracts`, () =>
    HttpResponse.json({ contracts: [contract], nextCursor: "" })
  ),

  http.post(`${BASE_URL}/api/v1/contracts`, () =>
    HttpResponse.json(contract)
  ),

  http.get(`${BASE_URL}/api/v1/contracts/${CONTRACT_ID}`, () =>
    HttpResponse.json(contract)
  ),

  http.get(`${BASE_URL}/api/v1/contracts/${CONTRACT_ID}/events`, () =>
    HttpResponse.json({ events: [contractEvent], nextCursor: "" })
  ),

  http.get(`${BASE_URL}/api/v1/contracts/${CONTRACT_ID}/invocations`, () =>
    HttpResponse.json({ invocations: [invocation], nextCursor: "" })
  ),

  http.get(`${BASE_URL}/api/v1/contracts/${CONTRACT_ID}/storage`, () =>
    HttpResponse.json([storageEntry])
  ),

  http.get(`${BASE_URL}/api/v1/contracts/${CONTRACT_ID}/stats`, () =>
    HttpResponse.json(contractStats)
  ),

  http.get(`${BASE_URL}/api/v1/watchdog/stats`, () =>
    HttpResponse.json(watchdogStats)
  ),

  http.get(`${BASE_URL}/api/v1/watchdog/contracts`, () =>
    HttpResponse.json({ contracts: [monitoredContract], next_cursor: null })
  ),

  http.get(`${BASE_URL}/api/v1/watchdog/contracts/${CONTRACT_ID}`, () =>
    HttpResponse.json(monitoredContract)
  ),

  http.get(`${BASE_URL}/api/v1/watchdog/contracts/${CONTRACT_ID}/health`, () =>
    HttpResponse.json({ health_checks: [healthCheck] })
  ),

  http.get(`${BASE_URL}/api/v1/watchdog/contracts/${CONTRACT_ID}/alerts`, () =>
    HttpResponse.json({ alerts: [contractAlert] })
  ),

  http.get(`${BASE_URL}/api/v1/watchdog/alerts`, () =>
    HttpResponse.json({ alerts: [contractAlert] })
  ),
];
