# Story 7.3: ROM Type — UI Badge & Sidebar Filter

**Status**: Pending
**Epic**: Epic 7 — ROM Categorization
**Estimate**: 3h
**Priority**: Medium
**Assignee**: Expert TypeScript

## User Story

As a user, I want to see a visual badge on homebrew games and filter my library by type, so that I can quickly distinguish commercial games from homebrew content.

## Acceptance Criteria

- [ ] `GameCard` displays a small `"HB"` badge (emerald variant) when `romType === 'homebrew'`; no badge for `'game'`
- [ ] `Sidebar` includes a "Type" section with three options: All / Games / Homebrews
- [ ] Selecting a type in the sidebar updates the active `romType` filter in `libraryStore`
- [ ] `GameDetail` screen shows the current `romType` and allows the user to toggle it
- [ ] Badge and filter labels are i18n-keyed (`romType.game`, `romType.homebrew`, `romType.all`) in all 6 locales
- [ ] Component tests: `GameCard` renders badge when `romType === 'homebrew'`, hides it for `'game'`
- [ ] Component tests: `Sidebar` type filter triggers correct store update

## Technical Notes

- **Architecture ref**: architecture.md §ADR-014
- **PRD ref**: US-1.5, US-3.2 (grid view), US-3.3 (game details)
- **Dependencies**: Story 7.2 (service + store filter must be ready)
- **Files to modify**:
  - `libs/ui/src/components/GameCard/GameCard.tsx`
  - `libs/ui/src/components/Sidebar/Sidebar.tsx`
  - `libs/ui/src/components/GameDetail/GameDetail.tsx` (or equivalent)
  - `libs/i18n/src/locales/en/library.json` (add romType keys)
  - `libs/i18n/src/locales/{es,fr,de,ja,zh}/library.json` (mirror keys)
- **Style**: Badge uses TailwindCSS/NativeWind `bg-emerald-500 text-white text-xs rounded` — consistent with existing platform badge style
- **TDD cycle**: write component snapshot/behaviour tests → red → implement badge + filter UI → green → refactor
