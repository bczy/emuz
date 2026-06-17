# Story STORY-001: Cross-Platform Structured Logger

**Status**: ready-for-dev
**Epic**: Harness — Hardening
**Estimate**: 4h
**Priority**: High

## User Story
As a developer, I want a cross-platform structured logger in `@emuz/core`, so that desktop and mobile code can emit leveled, namespaced, JSON-formatted logs through a pluggable transport instead of scattered `console.*` calls.

## Acceptance Criteria
- [ ] `createLogger(namespace: string)` factory exported from `libs/core/src/services` returns a `Logger` with methods `debug`, `info`, `warn`, `error`, each accepting `(message: string, context?: Record<string, unknown>)`
- [ ] Log levels are ordered `debug < info < warn < error`; a configurable minimum level filters out lower-severity records (default `info`)
- [ ] Each emitted record is a JSON object containing at minimum `timestamp` (ISO-8601), `level`, `namespace`, `message`, and a flattened `context`
- [ ] A `child(subNamespace: string)` method returns a logger whose namespace is `parent:child`
- [ ] Output is delivered via a pluggable `LogTransport` interface (`write(record: LogRecord): void`); the default transport is injectable so desktop and mobile can supply their own
- [ ] All filesystem or platform IO performed by any transport goes through `@emuz/platform` adapters — the core logger itself performs no direct IO
- [ ] No `console.*` calls remain in `libs/` shared code paths touched by this story; an ESLint `no-console` assertion or unit test guards this
- [ ] Unit tests in `libs/core/src/__tests__/Logger.test.ts` cover: level filtering, JSON record shape, namespace/child composition, custom transport invocation, and that context is included
- [ ] `Logger`, `LogRecord`, `LogLevel`, and `LogTransport` types are exported from `libs/core/src/index.ts`

## Technical Notes
- **Architecture ref**: architecture.md — cross-platform `libs/` rules (no platform-specific code, IO via `@emuz/platform`)
- **PRD ref**: NFR — observability / no user data collection (logs stay local)
- **Dependencies**: none
- **Key files**:
  - `libs/core/src/services/Logger.ts` (new)
  - `libs/core/src/__tests__/Logger.test.ts` (new)
  - `libs/core/src/index.ts` (export new types)
- **TDD cycle**: write level/shape/transport tests → red → implement logger + transport interface → green → refactor
