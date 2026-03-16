# Story 3.2: Core UI Components

**Status**: Done (tests pending)
**Epic**: Epic 3 — UI Components
**Estimate**: 4h
**Priority**: High

## User Story
As a developer, I want primitive UI components (Button, Input, Card, Badge, Icon, Text) so that feature components have consistent building blocks.

## Acceptance Criteria
- [x] `Button` — variants (primary, secondary, ghost), sizes (sm, md, lg)
- [x] `Input` — text input with label, error state
- [x] `Card` — container with optional press handler
- [x] `Badge` — small label with color variants
- [x] `Icon` — wrapper around icon library
- [x] `Text` — typography component (heading, body, caption)
- [ ] Component tests via RNTL

## Technical Notes
- **Architecture ref**: ADR-006 (NativeWind styling)
- **Dependencies**: Story 3.1
- **Constraint**: Functional components + hooks only; no class components
