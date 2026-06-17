---
name: tech-debt
description: Read-only technical-debt audit of the EmuZ codebase. Use when the user says "run tech-debt audit", "audit tech debt", or for the STORY-005 canary. NEVER modifies, creates, or deletes any file — it reports only.
---

# tech-debt — read-only audit

**READ-ONLY CONTRACT (non-negotiable):** This skill MUST NOT edit, create, move, or
delete ANY file, and MUST NOT install or add ANY dependency. It only reads the
repository and produces a Markdown report in its response. If completing a request
would require a write of any kind, STOP and report what would need to change instead
of doing it.

This is the skill exercised by **STORY-005** (the canary): it proves the harness can
run an audit without touching a single application file.

Follow the instructions in ./workflow.md.
