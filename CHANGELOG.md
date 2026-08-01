# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-08-01

### Added

- `SorolensClient` with full typed methods for the Sorolens REST API
- Zod schemas for all response types: `GlobalStats`, `Contract`, `ContractEvent`, `Invocation`, `StorageEntry`, `ContractStats`
- `SorolensError` with `code`, `message`, and `requestId` parsed from the API error envelope
- React hooks: `useContract`, `useEvents`, `useStorage`, `useStats`
- `SorolensClient.fromEnv()` factory that reads `SOROLENS_BASE_URL`
- Dual CJS and ESM output via tsup
- Vitest test suite with msw mock server covering all methods
