/**
 * Test-only entry point (`sorolens-sdk/testing`). Not imported by the main
 * entry, so production bundles never include the mock.
 */
export {
  MockSorolensClient,
  QueuedMockMethod,
} from "./mock.js";
export type { SorolensClientInterface } from "./mock.js";
