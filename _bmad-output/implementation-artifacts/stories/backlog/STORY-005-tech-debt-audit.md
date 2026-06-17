# Story STORY-005: Tech-Debt Audit (Read-Only Canary)

**Status**: ready-for-dev
**Epic**: Harness — Hardening
**Estimate**: XS
**Priority**: Low

## User Story
As a maintainer, I want to run the `tech-debt` skill to produce an audit report, so that I have an up-to-date inventory of code smells and debt — produced without changing any application code (read-only canary for the harness).

## Acceptance Criteria
- [ ] The `tech-debt` skill at `.claude/skills/tech-debt/` is invoked to scan the repository
- [ ] An audit report is produced summarizing findings (e.g. count by severity, hotspots, suggested follow-up stories)
- [ ] NO application source file is modified — no edits under `apps/`, `libs/`, `scripts/`, or any config file
- [ ] `libs/ui/src/themes/*` and any `__generated__/` file are explicitly left untouched
- [ ] `git status` after running the skill shows zero changes to tracked application files (only the new report artifact, if any, is added)
- [ ] The report is written to a non-source location (e.g. `_bmad-output/`) so it does not affect builds or tests
- [ ] No dependencies are added and `package.json` is not edited

## Technical Notes
- **Skill ref**: `.claude/skills/tech-debt/` (provided by harness component D)
- **Architecture ref**: harness hardening — read-only validation canary
- **Dependencies**: requires the `tech-debt` skill (component D) to be present
- **Key files**: none modified — output report only, under `_bmad-output/`
- **Note**: This story is intentionally a no-op against application code; its purpose is to prove the autonomous loop can run a read-only skill safely.
