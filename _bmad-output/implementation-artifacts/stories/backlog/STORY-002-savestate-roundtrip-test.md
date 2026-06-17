# Story STORY-002: Savestate Persistence Round-Trip Test

**Status**: ready-for-dev
**Epic**: Harness — Hardening
**Estimate**: 3h
**Priority**: High

## User Story
As a developer, I want a real round-trip test for savestate persistence, so that I can trust that a saved state can be written and read back byte-for-byte equal, and that corrupt or missing states fail gracefully.

## Acceptance Criteria
- [ ] A round-trip test writes a representative savestate payload, reads it back, and asserts `deepEqual` between the original and the loaded value
- [ ] The test exercises the actual savestate service/persistence path used by the app (not a mock of the code under test); only `@emuz/platform` IO is faked/tempdir-backed
- [ ] A reusable test fixture (a known savestate payload, e.g. JSON or binary buffer) lives under the test directory and is documented inline
- [ ] Edge case: reading a missing savestate returns a typed "not found" result (or throws a documented error) rather than crashing — covered by an assertion
- [ ] Edge case: reading a corrupt/truncated savestate surfaces a clear, typed error and does not return partial garbage — covered by an assertion
- [ ] Round-trip covers nested/structured state (objects, arrays, numbers, strings) to prove no lossy serialization
- [ ] Test is deterministic (no real wall-clock or random-dependent assertions) and cleans up any temp files it creates
- [ ] Test runs under Vitest via `pnpm nx test core` (or the owning lib) and passes

## Technical Notes
- **Architecture ref**: architecture.md — `@emuz/platform` filesystem adapter; no synchronous file ops on main thread
- **PRD ref**: savestate persistence requirement
- **Dependencies**: locate the existing savestate service in `libs/core/src/services` (or relevant lib) before writing the test
- **Key files**:
  - `libs/core/src/__tests__/SavestateRoundtrip.test.ts` (new — adjust path to owning lib if savestate lives elsewhere)
  - test fixture file colocated under the test directory (new)
- **TDD cycle**: this story IS the test; write round-trip + edge-case assertions → run against current implementation → file follow-up if a real defect is found
