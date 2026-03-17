## Story

<!-- Link the BMAD story file and GitHub issue this PR implements -->

- Story file: `_bmad-output/implementation-artifacts/stories/epic-XX/story-X.X-title.md`
- Closes #

## What changed

<!-- Brief description of the implementation -->

## Checklist

### TDD (non-negotiable)

- [ ] Tests written **before** implementation
- [ ] All new tests passing (`pnpm nx test <package>`)
- [ ] Coverage ≥ 80% for modified packages

### Code quality

- [ ] TypeScript strict mode — no errors or warnings
- [ ] Functional components + hooks only (no class components)
- [ ] No platform-specific code in `libs/` (use `@emuz/platform` adapters)
- [ ] No direct `fs` access outside `libs/platform/src/filesystem/desktop.ts`

### Cross-platform

- [ ] Tested on desktop (or N/A)
- [ ] Tested on mobile (or N/A)

### Story acceptance criteria

<!-- Copy the unchecked items from the story file and check them off -->

- [ ] ...

### i18n

- [ ] New UI strings added to `libs/i18n/src/locales/en/` first

### Docs

- [ ] CLAUDE.md / docs updated if needed
