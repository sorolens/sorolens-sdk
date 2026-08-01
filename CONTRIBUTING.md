# Contributing to @sorolens/sdk

## Setup

```bash
pnpm install
```

## Running tests

```bash
pnpm test          # run once
pnpm test:watch    # watch mode
pnpm test:coverage # with coverage report
```

## Type checking

```bash
pnpm typecheck
```

## Building

```bash
pnpm build
```

## Adding a new client method

1. Add the Zod schema and TypeScript type to `src/types.ts`.
2. Add the method to `SorolensClient` in `src/client.ts`. Use `this.request(path, Schema)` to fetch and validate.
3. Export any new types from `src/index.ts`.
4. Add tests in `test/client.test.ts`: happy path, 404, 422, and timeout cases.
5. Update `README.md` with the method signature.
6. Add a line to `CHANGELOG.md` under the relevant version.

## Adding a new React hook

1. Create `src/hooks/useMyHook.ts`. Import `SorolensClient` and the relevant type.
2. Export the hook and its result type from `src/index.ts`.
3. Document the hook in `README.md` under "React hooks".

## Commit style

Follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.

## Pull requests

Fill out the PR template. All checks must pass before merging.
