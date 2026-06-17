# tech-debt audit — workflow

A strictly **read-only** audit of the EmuZ monorepo. Run the steps in order, collect
findings, and emit a single Markdown report. Do not modify anything.

## Hard rules

- **No writes of any kind.** No `Write`/`Edit`, no `mkdir`, no `git` mutations, no file
  moves or deletes. Only read-only tools: `Read`, `Glob`, `Grep`, and read-only shell
  (`ls`, `git log`, `git status`, `cat`, `rg`).
- **No new dependencies** and no `pnpm install`. If a command needs `node_modules` that
  are absent, record it as "not evaluated (deps unavailable)" rather than installing.
- The deliverable is a report in your reply — never a committed file.

## Steps

1. **Marker inventory.** Find `TODO`, `FIXME`, `HACK`, `XXX` comments across the repo
   (exclude `node_modules`, `dist`, `coverage`, `_bmad`, `.git`). Use ripgrep, e.g.
   `rg -n "\b(TODO|FIXME|HACK|XXX)\b" --glob '!**/node_modules/**'`. Group counts by
   package (`apps/desktop`, `apps/mobile`, `libs/core`, `libs/database`, `libs/ui`,
   `libs/emulators`, `libs/platform`, `libs/i18n`).

2. **Lint debt (count only).** If `node_modules` is present, run `pnpm lint` and report
   the warning/error counts per project — do **not** pass `--fix`. If deps are absent,
   mark as "not evaluated".

3. **IPC boundary `any` / unvalidated payloads.** Scan the Electron main↔renderer
   contracts for `any` and runtime-unvalidated payloads — known debt, since Zod is not
   yet used at the boundary (see STORY-003, reserved):
   `apps/desktop/src/main/ipc/{database,filesystem,launcher,storage,index}.ts` and
   `apps/desktop/src/preload/index.ts`. Report each `any` / untyped `unknown[]` crossing
   the bridge with `file:line`.

4. **Design-token drift.** If `scripts/generate-tokens.mjs` exists, run
   `node scripts/generate-tokens.mjs --check` and report whether the `__generated__`
   mirrors are in sync. If the script does not exist yet, mark as "not evaluated
   (generator absent)".

5. **Coverage gaps.** Read `coverage/**/coverage-summary.json` if present and flag any
   package below 80% line coverage (the `libs/core` target). If no coverage artifacts
   exist, mark as "not evaluated (run `pnpm test:coverage` first)".

## Report format

Emit Markdown with these sections:

- **Summary** — one paragraph + a counts table (markers, lint, IPC `any`, token drift,
  coverage gaps).
- **Findings by severity** — `High` / `Medium` / `Low`, each item with `file:line` and a
  one-line description.
- **Suggested follow-up stories** — phrased as candidate backlog items (so the SM can
  turn them into STORY-00x), e.g. "Introduce Zod IPC contracts (already drafted as
  STORY-003)".

End the report by restating that **no files were modified** during the audit.
