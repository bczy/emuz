# Story STORY-003: Zod-Validated Electron IPC Contracts

**Status**: ready-for-dev
**Reserved**: supervised
**Epic**: Harness — Hardening
**Estimate**: 6h
**Priority**: Medium

**RESERVED — supervised mode only, do not implement autonomously.**

## User Story
As a desktop developer, I want every Electron main↔renderer IPC message validated by a shared Zod schema, so that malformed or malicious payloads crossing the process boundary are rejected before reaching handler logic.

## Acceptance Criteria
- [ ] A shared Zod schema is defined for the request payload and the response of every IPC channel exposed by the four handler modules
- [ ] `apps/desktop/src/main/ipc/database.ts` validates inbound args with `schema.parse`/`safeParse` and rejects invalid payloads with a typed error before touching the database
- [ ] `apps/desktop/src/main/ipc/filesystem.ts` validates inbound args (including path inputs) before any filesystem access; invalid input is rejected (defends against directory traversal)
- [ ] `apps/desktop/src/main/ipc/launcher.ts` validates inbound args before launching any emulator process
- [ ] `apps/desktop/src/main/ipc/storage.ts` validates inbound args before any storage read/write
- [ ] `apps/desktop/src/preload/index.ts` exposes only the validated, typed channel surface; the renderer cannot invoke an unlisted channel
- [ ] Schemas are colocated/shared so the preload bridge and main handlers import the same source of truth (no drift between renderer-facing types and main validation)
- [ ] Unit tests prove each channel rejects at least one invalid payload shape and accepts a valid one
- [ ] No raw `ipcMain.handle` callback consumes its `args` without first running them through the channel's Zod schema

## Technical Notes
- **Architecture ref**: architecture.md — IPC bridge between Electron main and renderer; security rule "validate all file paths (prevent directory traversal)"
- **PRD ref**: desktop security / IPC hardening
- **Dependencies**: none — additive validation layer over existing handlers
- **Current files (reference)**:
  - `apps/desktop/src/main/ipc/database.ts`
  - `apps/desktop/src/main/ipc/filesystem.ts`
  - `apps/desktop/src/main/ipc/launcher.ts`
  - `apps/desktop/src/main/ipc/storage.ts`
  - `apps/desktop/src/preload/index.ts`
- **TDD cycle**: write per-channel accept/reject schema tests → red → wire `safeParse` into each handler + preload surface → green → refactor shared schema module
