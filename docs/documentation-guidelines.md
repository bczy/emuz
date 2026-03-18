# EmuZ Documentation Guidelines

> All documentation in this project must be written in **English**. No exceptions.
>
> **Documentation must be kept in sync with code.** Any PR that adds or modifies a public API without updating the relevant README and/or `docs/api.md` will be rejected during code review.

---

## Philosophy: LLM-Optimized Documentation

Documentation in EmuZ is written to be consumed by both humans and large language models (Claude, GitHub Copilot, etc.). LLMs generate better code when they understand module boundaries, not just API signatures. A good README answers three questions an LLM will ask before writing code:

1. **What does this module own?** (prevents scope creep)
2. **What does it depend on?** (prevents import violations)
3. **What must I never do here?** (anti-patterns prevent architectural regressions)

---

## Global Rules

| Rule              | Detail                                                                |
| ----------------- | --------------------------------------------------------------------- |
| **Language**      | English only — all READMEs, `docs/`, inline public API comments       |
| **Doc sync**      | Update README and `docs/api.md` in the same PR as the code change     |
| **Anti-patterns** | Every README must have at least one anti-pattern entry                |
| **Types**         | All exported functions and interfaces must show TypeScript signatures |
| **Commands**      | Every package must document its key Nx/pnpm commands                  |

---

## README Template

Copy this template when creating a new library or app README.

````markdown
# @emuz/<name> (or: EmuZ Desktop App / EmuZ Mobile App)

> One sentence: what this package is and its single responsibility.

## Boundaries

### Owns

- List of responsibilities this package holds

### Delegates

- Explicit list of what this package does NOT do (and who does it instead)

## Integration Map

### Internal dependencies

| Package      | Used for                               |
| ------------ | -------------------------------------- |
| `@emuz/core` | example: models and service interfaces |

### Depended by

- `apps/desktop` — (reason)
- `@emuz/ui` — (reason)

### External dependencies

| Package | Version | Role                                 |
| ------- | ------- | ------------------------------------ |
| `zod`   | `^3.x`  | Schema validation and type inference |

## Usage

### Command line

```bash
# Build
pnpm nx build <name>

# Test
pnpm nx test <name>

# Test with coverage
pnpm nx test <name> --coverage

# Lint
pnpm nx lint <name>
```
````

### Code

```typescript
// Canonical import and usage example
import { SomeExport } from '@emuz/<name>';
```

## Public API

### Models (or: Services / Components / Functions / ...)

```typescript
// Key exported interfaces and types
```

## Anti-Patterns

| ❌ Do NOT                      | ✅ Do instead                          |
| ------------------------------ | -------------------------------------- |
| `import fs from 'fs'` directly | Use `@emuz/platform` FileSystemAdapter |

## Constraints

- Bullet list of non-negotiable architectural rules for this package

```

---

## Section Reference

### Boundaries

The most important section for LLM guidance. `Owns` defines the module contract. `Delegates` is as important — it tells a model where to look for adjacent functionality and prevents it from duplicating logic across packages.

**Rules:**
- `Owns` entries must be verifiable in the code (if it's not implemented, remove it)
- `Delegates` entries must name the package responsible: `File I/O → @emuz/platform`

### Integration Map

**Internal dependencies**: Only list direct `@emuz/*` imports (not transitive). Must stay consistent with `docs/architecture.md`.

**Depended by**: List all packages that import this one. This is the downstream impact surface — important for LLMs reasoning about change scope.

**External dependencies**: List only packages that shape the module's design or constrain its usage. Skip dev-only dependencies (test runners, linters). Format: `package@version — one-line role description`.

### Usage › Command line

Always document:
- `pnpm nx build <name>` — build
- `pnpm nx test <name>` — test
- `pnpm nx lint <name>` — lint

For apps, additionally document:
- How to start the dev server (`pnpm nx serve desktop`)
- How to target a specific platform (`pnpm nx run-ios mobile`, `pnpm nx run-android mobile`)
- How to build for production release

### Usage › Code

Provide 1–2 canonical TypeScript import + usage examples. These should reflect the most common real-world usage, not a contrived hello-world. Include types explicitly.

### Public API

Group exports by category (Models, Services, Hooks, Components, Functions). Use the actual TypeScript interface/type definition — copy from source or `docs/api.md`. Do not paraphrase types.

### Anti-Patterns

The most valuable section for preventing LLM-generated architectural errors. Minimum one entry per README. Format: table with ❌ / ✅ columns. Be specific — "don't misuse this" is useless, "don't call `better-sqlite3` from the renderer process — use the IPC `database` channel instead" is actionable.

### Constraints

Non-negotiable rules that apply to this specific package. Reference `.specify/memory/constitution.md` for project-wide constraints. List only constraints that are specific to this package here.

---

## What NOT to Document in READMEs

- Implementation details of private functions (use inline comments instead)
- Exhaustive API reference (that lives in `docs/api.md`)
- Git history or changelogs (use `git log`)
- Roadmap items (use `.specify/specs/`)

---

## Cross-References

- Full API reference: [docs/api.md](api.md)
- System architecture: [docs/architecture.md](architecture.md)
- Contributing guide (PR process): [docs/contributing.md](contributing.md)
- Project constitution: `CLAUDE.md` (root — non-negotiable development rules)
```
