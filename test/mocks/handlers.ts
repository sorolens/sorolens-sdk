import { http, HttpResponse } from "msw";
import {
  BASE_URL,
  CONTRACT_ID,
  contract,
  contractEvent,
  contractStats,
  globalStats,
  invocation,
  storageEntry,
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
];
