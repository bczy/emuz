#!/usr/bin/env bash
# =============================================================================
# bmad-labels.sh — EmuZ BMAD harness: GitHub label & status automation
# =============================================================================
#
# Component E of the EmuZ BMAD harness. Manages the GitHub label set used to
# track BMAD story/issue progress and provides one-shot status transitions that
# keep an issue's `status:*` label mutually exclusive.
#
# -----------------------------------------------------------------------------
# USAGE
# -----------------------------------------------------------------------------
#   scripts/bmad-labels.sh <command> [args]
#
#   init                          Idempotently create the full BMAD label set.
#   todo         <issue-number>   Set issue status to `status:todo`.
#   in-progress  <issue-number>   Set issue status to `status:in-progress`.
#   review       <issue-number>   Set issue status to `status:review`.
#   -h | --help | (no args)       Print usage.
#
#   Any extra arguments are passed through to `gh` (e.g. `--repo owner/name`).
#
# -----------------------------------------------------------------------------
# REPOSITORY SELECTION
# -----------------------------------------------------------------------------
#   Defaults to `bczy/emuz`. Override with either:
#     - the GH_REPO environment variable, e.g.  GH_REPO=owner/name ...
#     - a passthrough `--repo owner/name` flag on the command line.
#
# -----------------------------------------------------------------------------
# LABEL SET
# -----------------------------------------------------------------------------
#   Status (mutually exclusive — a status transition removes the others):
#     status:todo            grey      Not started / queued.
#     status:in-progress     yellow    Actively being worked.
#     status:review          purple    In review / awaiting verification.
#
#   Persona (which BMAD agent owns the work):
#     persona:bmad-sm        blue
#     persona:bmad-architect indigo
#     persona:bmad-dev       green
#     persona:bmad-qa        red
#
#   Pending markers (from CLAUDE.md status mapping):
#     tests-pending          pale-yellow   Story `Done (tests pending)`.
#     feature-pending        yellow        Story `Done (<feature> pending)`.
#
# -----------------------------------------------------------------------------
# STATUS -> LABEL MAPPING (per CLAUDE.md "BMAD <-> GitHub Issues" sync rules)
# -----------------------------------------------------------------------------
#   Story `**Status**`                       GitHub state   Labels
#   ---------------------------------------   ------------   ---------------------------------
#   Done (all ACs checked)                    CLOSED         none (remove pending labels)
#   Done (tests pending)                      OPEN           tests-pending
#   Done (<feature> pending)                  OPEN           feature-pending
#   Done (both pending)                       OPEN           tests-pending + feature-pending
#   In Progress                               OPEN           tests-pending and/or feature-pending
#   Pending                                   OPEN           no pending labels until work starts
#
#   The `status:*` labels managed by this script give a coarse kanban view that
#   complements the pending markers above:
#     Pending      -> status:todo
#     In Progress  -> status:in-progress
#     In review    -> status:review
#   (Closing an issue / marking Done is handled elsewhere — never close an issue
#   while unchecked ACs remain, per CLAUDE.md.)
#
# -----------------------------------------------------------------------------
# MCP FALLBACK (when `gh` is unavailable or unauthenticated)
# -----------------------------------------------------------------------------
#   This script requires the GitHub CLI (`gh`) on PATH and authenticated. If it
#   is not available, the equivalent operations can be performed via the GitHub
#   MCP server tool `mcp__github__issue_write`.
#
#   IMPORTANT: `mcp__github__issue_write` sets the issue's labels to the FULL
#   array you pass — there is no add/remove delta. So to transition status you
#   pass the complete desired label set (the new `status:*` label plus every
#   non-status label you wish to keep). Read the issue first to learn its
#   current labels (e.g. via `mcp__github__issue_read`), drop any existing
#   `status:*` entries, then append the target status label.
#
#   Applying a label that does not yet exist auto-creates it, so `init` is not
#   strictly required before a transition via MCP — but running `init` (or its
#   MCP equivalent: create each label) keeps colours and descriptions
#   consistent.
#
#   Example — move issue #58 to "review" via MCP, keeping its persona label:
#     mcp__github__issue_write {
#       "method": "update",
#       "owner":  "bczy",
#       "repo":   "emuz",
#       "issue_number": 58,
#       "labels": ["persona:bmad-dev", "status:review"]
#     }
#   (Here the previous "status:in-progress" was omitted from the array, which
#   removes it; "status:review" is added.)
#
# =============================================================================

set -uo pipefail

# Default repository; overridable via GH_REPO env or a passthrough --repo flag.
DEFAULT_REPO="bczy/emuz"
REPO="${GH_REPO:-$DEFAULT_REPO}"

PROG="$(basename "$0")"

# All status labels (used to compute which to remove on a transition).
STATUS_LABELS="status:todo status:in-progress status:review"

usage() {
  cat <<EOF
$PROG — EmuZ BMAD harness GitHub label & status automation

Usage:
  $PROG init                          Create the BMAD label set (idempotent).
  $PROG todo         <issue-number>   Set issue status to status:todo.
  $PROG in-progress  <issue-number>   Set issue status to status:in-progress.
  $PROG review       <issue-number>   Set issue status to status:review.
  $PROG -h | --help                   Show this help.

Repository:
  Defaults to '$DEFAULT_REPO'. Override via GH_REPO env var or by passing
  '--repo owner/name' through to gh.

Extra arguments after the issue number are passed through to gh, e.g.:
  $PROG in-progress 58 --repo bczy/emuz

If 'gh' is unavailable, see the MCP fallback documented in this script's
header comment (use mcp__github__issue_write with the full desired labels array).
EOF
}

# Print the MCP fallback guidance to stderr.
print_mcp_fallback() {
  cat >&2 <<EOF

FALLBACK: GitHub MCP server
---------------------------
'gh' is unavailable or not authenticated. Perform the operation via the GitHub
MCP tool 'mcp__github__issue_write' instead.

  - issue_write sets the issue's labels to the FULL array you provide (no
    add/remove delta). To transition status, pass the complete desired label
    set: the new status:* label plus every non-status label to keep.
  - Read current labels first (e.g. mcp__github__issue_read), strip existing
    'status:*' entries, then append the target status label.
  - Applying a not-yet-existing label auto-creates it, so 'init' is optional
    before an MCP transition (but keeps colours/descriptions consistent).

Example — set issue #58 to status:review (keeping persona:bmad-dev):
  mcp__github__issue_write {
    "method": "update",
    "owner": "bczy",
    "repo": "emuz",
    "issue_number": 58,
    "labels": ["persona:bmad-dev", "status:review"]
  }
EOF
}

# Ensure gh is on PATH and authenticated. On failure, print the MCP fallback
# and return non-zero so the caller can exit.
require_gh() {
  if ! command -v gh >/dev/null 2>&1; then
    echo "error: 'gh' (GitHub CLI) is not installed or not on PATH." >&2
    print_mcp_fallback
    return 1
  fi
  if ! gh auth status >/dev/null 2>&1; then
    echo "error: 'gh' is installed but not authenticated (run 'gh auth login')." >&2
    print_mcp_fallback
    return 1
  fi
  return 0
}

# Create or update one label. Uses --force so it is idempotent (updates an
# existing label's colour/description rather than failing).
ensure_label() {
  local name="$1" color="$2" desc="$3"
  gh label create "$name" \
    --repo "$REPO" \
    --color "$color" \
    --description "$desc" \
    --force
}

cmd_init() {
  require_gh || return $?

  echo "Creating BMAD label set on '$REPO'..."

  # Status labels — distinct colours for an at-a-glance kanban view.
  ensure_label "status:todo"        "ededed" "BMAD: not started / queued"
  ensure_label "status:in-progress" "fbca04" "BMAD: actively being worked"
  ensure_label "status:review"      "6f42c1" "BMAD: in review / awaiting verification"

  # Persona labels — which BMAD agent owns the work.
  ensure_label "persona:bmad-sm"        "1d76db" "BMAD persona: Scrum Master"
  ensure_label "persona:bmad-architect" "5319e7" "BMAD persona: Architect"
  ensure_label "persona:bmad-dev"       "0e8a16" "BMAD persona: Developer"
  ensure_label "persona:bmad-qa"        "d93f0b" "BMAD persona: QA"

  # Pending markers — mirror CLAUDE.md story status mapping.
  ensure_label "tests-pending"   "fef2c0" "Story is Done but tests are still pending"
  ensure_label "feature-pending" "fbca04" "Story is Done but a feature is still pending"

  echo "Done."
}

# Transition an issue's status label: add the requested one, remove the others.
# $1 = target status label (e.g. status:review)
# $2 = issue number
# $@ (remaining) = passthrough args to gh
cmd_status() {
  local target="$1"; shift
  local issue="${1:-}"
  if [ "$#" -gt 0 ]; then
    shift
  fi

  if [ -z "$issue" ]; then
    echo "error: missing <issue-number> for '$target' transition." >&2
    echo >&2
    usage >&2
    return 2
  fi

  require_gh || return $?

  # Build --remove-label args for every status label that is not the target.
  local remove_args=()
  local label
  for label in $STATUS_LABELS; do
    if [ "$label" != "$target" ]; then
      remove_args+=(--remove-label "$label")
    fi
  done

  echo "Setting issue #$issue on '$REPO' to '$target' (removing other status labels)..."
  gh issue edit "$issue" \
    --repo "$REPO" \
    --add-label "$target" \
    "${remove_args[@]}" \
    "$@"
}

main() {
  local cmd="${1:-}"
  case "$cmd" in
    "" | -h | --help | help)
      usage
      # No-args / help is not an error.
      return 0
      ;;
    init)
      shift
      cmd_init "$@"
      ;;
    todo)
      shift
      cmd_status "status:todo" "$@"
      ;;
    in-progress)
      shift
      cmd_status "status:in-progress" "$@"
      ;;
    review)
      shift
      cmd_status "status:review" "$@"
      ;;
    *)
      echo "error: unknown command '$cmd'." >&2
      echo >&2
      usage >&2
      return 2
      ;;
  esac
}

main "$@"
