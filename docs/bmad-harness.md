# BMAD Harness

The BMAD harness is a small set of POSIX-shell and Node scripts that mechanize
the guarded BMAD development sequence for EmuZ. It turns the human-facing
Definition-of-Done checklist and the architecture Quality Gates into
deterministic, scriptable checks so that no story is marked "Done" until every
objective gate passes — and so the chain of harness tooling itself stays
internally consistent.

It enforces, end to end, the sequence:

```
generate tokens  →  validate backlog  →  drive a story  →  gate (DoD)  →  sync issue/labels
```

## Components and issues

The harness is delivered as four independent components, each tracked by its own
GitHub issue and developed on its own branch:

| Component | Issue | Branch                   | Scripts                                                 |
| --------- | ----- | ------------------------ | ------------------------------------------------------- |
| A         | #54   | `claude/harness-cycle`   | `scripts/bmad-cycle.sh`, `scripts/bmad-gate-check.sh`   |
| B         | #55   | `claude/harness-tokens`  | `scripts/generate-tokens.mjs`                           |
| C         | #56   | `claude/harness-backlog` | `scripts/bmad-backlog.mjs`                              |
| D         | #57   | `claude/harness-labels`  | `scripts/bmad-labels.sh`                               |

Issue **#58** tracks the integration of all four components into the green chain.

This document is owned by component A (#54), which provides the chain validator
and the Definition-of-Done gate.

## npm scripts

Four scripts are wired into `package.json` for convenient invocation:

| Script                   | Runs                            | Purpose                                      |
| ------------------------ | ------------------------------- | -------------------------------------------- |
| `pnpm bmad:cycle`        | `bash scripts/bmad-cycle.sh`    | Validate the whole harness chain (RED/GREEN) |
| `pnpm bmad:gate`         | `bash scripts/bmad-gate-check.sh` | Run the 8-check DoD gate on a story        |
| `pnpm bmad:labels`       | `bash scripts/bmad-labels.sh`   | Apply the story↔issue label mapping          |
| `pnpm tokens:generate`   | `node scripts/generate-tokens.mjs` | Regenerate the theme token artifacts      |

Each underlying script also exposes `--help`.

## The cycle validator — `scripts/bmad-cycle.sh`

The cycle validator is the top-level health check for the harness. It prints a
clear `[GREEN]` / `[ RED ]` line per check (colorized via `tput` when the output
is a TTY, plain text otherwise), then a final verdict, and **exits non-zero if
any check is RED**.

Checks:

1. **Presence + executability** of every sibling harness script:
   - `scripts/bmad-gate-check.sh` (A, #54)
   - `scripts/generate-tokens.mjs` (B, #55)
   - `scripts/bmad-backlog.mjs` (C, #56)
   - `scripts/bmad-labels.sh` (D, #57)

   A missing or non-executable script is reported RED, but the validator keeps
   going so you see the full picture in one run.
2. `scripts/bmad-gate-check.sh --dry-run` exits 0 (only when the file exists).
3. `node scripts/generate-tokens.mjs --check` exits 0 (only when the file exists).
4. `node scripts/bmad-backlog.mjs --validate` exits 0 (only when the file exists).
5. `package.json` declares the `lint`, `test`, `test:coverage`, and `build`
   scripts (verified by grep — the scripts are **not** executed).
6. The git working tree is clean (`git status --porcelain` empty). Under
   `--dry-run` this is informational (`[WARN]`); in a full run a dirty tree is RED.

Usage:

```bash
pnpm bmad:cycle              # full validation
pnpm bmad:cycle --dry-run    # tree-clean check is informational only
```

Because each component is developed in its own isolated branch, running
`--dry-run` from a single component branch is expected to report RED on the
sibling scripts that do not yet exist there. That is intentional: the chain only
goes fully GREEN once all four components are integrated (issue #58).

## The Definition-of-Done gate — `scripts/bmad-gate-check.sh`

The gate is the mechanical Definition-of-Done check for a single story. It
mechanizes the human checklist in
[`.claude/skills/bmad-dev-story/checklist.md`](../.claude/skills/bmad-dev-story/checklist.md)
and the six **Quality Gates** declared under `## Quality Gates` in
[`_bmad-output/planning-artifacts/architecture.md`](../_bmad-output/planning-artifacts/architecture.md).

Usage:

```bash
pnpm bmad:gate <story-file>            # full gate
pnpm bmad:gate --dry-run <story-file>  # validate wiring only; skip heavy commands
```

It prints `[PASS]` / `[FAIL]` (and `[WARN]` / `[SKIP]`) per check and exits
non-zero on any FAIL.

### The 8 checks

1. **All ACs checked** — zero `- [ ]` checkboxes remain in `<story-file>`
   (counted via grep). This is the objective form of the checklist's
   "Acceptance Criteria Satisfaction" / "All Tasks Complete" items.
2. **`pnpm lint`** — strict lint (`--max-warnings=0`). Skipped under `--dry-run`.
3. **`pnpm test`** — full test run / regression prevention. Skipped under `--dry-run`.
4. **Core coverage ≥ 80%** — after `pnpm nx test core --coverage`, parse
   `lines.pct` from `coverage/libs/core/coverage-summary.json`. The check passes
   when `lines.pct ≥ 80`; it WARNs (does not FAIL) when the summary file is
   absent. This realizes the architecture gate "Unit tests written and passing
   (≥80% coverage)".
5. **`pnpm build`** — full build (proxy for "no TypeScript strict-mode errors"
   across all 5 target platforms). Skipped under `--dry-run`.
6. **`pnpm format:check`** — prettier formatting is clean.
7. **Token drift** — `node scripts/generate-tokens.mjs --check`; FAILs if the
   committed theme token artifacts differ from a fresh generation. (The
   generated tokens under `libs/ui/src/themes/__generated__/` and their sources
   are never hand-edited.)
8. **Story ↔ issue sync** — parse the story `**Status**` line and echo the
   expected GitHub issue state and labels per the mapping in `CLAUDE.md`:

   | Story `**Status**`          | GitHub state | Labels                              |
   | --------------------------- | ------------ | ----------------------------------- |
   | `Done`                      | CLOSED       | (none)                              |
   | `Done (tests pending)`      | OPEN         | `tests-pending`                     |
   | `Done (<feature> pending)`  | OPEN         | `feature-pending`                   |
   | `Done (tests + feature …)`  | OPEN         | `tests-pending` + `feature-pending` |
   | `In Progress`               | OPEN         | `tests-pending` and/or `feature-pending` |
   | `Pending`                   | OPEN         | (no pending labels)                 |

   When neither the `gh` CLI nor a sync token (`BMAD_SYNC_TOKEN` / `GITHUB_TOKEN`)
   is available, this check WARNs rather than FAILs — the mapping is still printed
   so a human or the component-D label tool can apply it.

`--dry-run` validates the arguments and wiring and exits 0 without running the
heavy `pnpm`/`nx` commands (checks 2, 3, 4, 5, 6 are reported as `[SKIP]`),
which is what `bmad-cycle.sh` invokes to verify the gate is wired correctly.

## How the harness enforces the guarded sequence

- `bmad-cycle.sh` is the single command that proves every link in the chain is
  present, executable, and self-consistent before any story work begins.
- `bmad-gate-check.sh` blocks a story from being declared "Done" until lint,
  tests, coverage, build, formatting, and token integrity all pass — exactly the
  Quality Gates from the architecture document.
- Check 8 keeps the BMAD story file and its GitHub issue in lockstep, enforcing
  the NON-NEGOTIABLE sync rules in `CLAUDE.md`.
- Token regeneration is funneled through `tokens:generate` / `--check` so the
  guarded `tokens.ts` / `dark.ts` / `light.ts` sources and the
  `__generated__/` artifacts are never hand-edited.

Together these scripts make the BMAD sequence reproducible and machine-checkable
rather than relying on manual discipline.
