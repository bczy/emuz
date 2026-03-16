# Story 4.1: Electron Project Setup

**Status**: Done
**Epic**: Epic 4 — Desktop App
**Estimate**: 3h
**Priority**: Critical

## User Story
As a developer, I want the Electron app configured with Vite renderer, preload script, and IPC bridge, so that the desktop app builds and runs in dev mode.

## Acceptance Criteria
- [x] `apps/desktop` created with `@emuz/desktop` private package
- [x] TypeScript strict configuration (main + renderer tsconfigs)
- [x] Vite configured for renderer process
- [x] Electron main process entry point (`src/main/index.ts`)
- [x] Preload script with `contextBridge` exposing safe IPC API
- [x] Dev scripts: `nx serve desktop` starts both processes

## Technical Notes
- **Architecture ref**: plan.md §Electron Setup
- **Dependencies**: Story 3.1
- **Constraint**: Renderer process must not have Node.js access — only via IPC/preload
