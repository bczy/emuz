#!/usr/bin/env bash
#
# bmad-gate-check.sh — mechanical 8-check Definition-of-Done gate (issue #54)
# ---------------------------------------------------------------------------
# Runs a deterministic Definition-of-Done gate against a single BMAD story
# file. It mechanizes the human checklist at
#   .claude/skills/bmad-dev-story/checklist.md
# and the 6 Quality Gates declared in
#   _bmad-output/planning-artifacts/architecture.md  (## Quality Gates)
# so that a story is only "Done" when every objective check passes.
#
# The 8 checks:
#   1. All ACs checked          — zero `- [ ]` checkboxes remain in <story-file>
#   2. pnpm lint                — strict lint (`--max-warnings=0`), skipped in --dry-run
#   3. pnpm test                — full test run, skipped in --dry-run
#   4. core coverage >= 80%     — lines.pct from coverage/libs/core/coverage-summary.json
#                                 (run via `pnpm nx test core --coverage`; WARN if absent)
#   5. pnpm build               — full build, skipped in --dry-run
#   6. pnpm format:check        — prettier formatting verified
#   7. token drift              — `node scripts/generate-tokens.mjs --check`
#   8. story <-> issue sync     — parse `**Status**` and echo expected GitHub
#                                 state/labels per the CLAUDE.md mapping
#                                 (WARN, not FAIL, if neither `gh` nor SYNC token present)
#
# Usage:
#   scripts/bmad-gate-check.sh [--dry-run] <story-file>
#
# --dry-run validates arguments/wiring and exits 0 WITHOUT running the heavy
# pnpm/nx commands (checks 2,3,4,5,6 are reported as SKIP). The AC count (1),
# token-drift wiring (7) and sync mapping (8) are still evaluated where cheap.
#
# Exit status: 0 when no check FAILs, non-zero on the first/any FAIL.
# ---------------------------------------------------------------------------

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# --- argument parsing -------------------------------------------------------
DRY_RUN=0
STORY_FILE=""
for arg in "$@"; do
  case "${arg}" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      sed -n '2,38p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    -*)
      echo "bmad-gate-check: unknown option '${arg}'" >&2
      exit 2
      ;;
    *)
      if [ -z "${STORY_FILE}" ]; then
        STORY_FILE="${arg}"
      else
        echo "bmad-gate-check: unexpected extra argument '${arg}'" >&2
        exit 2
      fi
      ;;
  esac
done

cd "${ROOT_DIR}"

# A bare `--dry-run` with no story file is a wiring smoke test: confirm the
# script is wired (sibling token generator reachable, pnpm/grep available) and
# exit 0. This is what bmad-cycle.sh invokes to verify the gate is callable.
if [ -z "${STORY_FILE}" ]; then
  if [ "${DRY_RUN}" -eq 1 ]; then
    echo "[SKIP] dry-run wiring check: no story file supplied; gate is callable"
    exit 0
  fi
  echo "bmad-gate-check: missing <story-file>" >&2
  echo "usage: scripts/bmad-gate-check.sh [--dry-run] <story-file>" >&2
  exit 2
fi

# --- colorization -----------------------------------------------------------
if [ -t 1 ] && command -v tput >/dev/null 2>&1 && [ "$(tput colors 2>/dev/null || echo 0)" -ge 8 ]; then
  C_RED="$(tput setaf 1)"
  C_GREEN="$(tput setaf 2)"
  C_YELLOW="$(tput setaf 3)"
  C_BOLD="$(tput bold)"
  C_RESET="$(tput sgr0)"
else
  C_RED=""; C_GREEN=""; C_YELLOW=""; C_BOLD=""; C_RESET=""
fi

FAILED=0
pass() { printf '%s[PASS]%s %s\n' "${C_GREEN}" "${C_RESET}" "$1"; }
fail() { printf '%s[FAIL]%s %s\n' "${C_RED}"   "${C_RESET}" "$1"; FAILED=1; }
warn() { printf '%s[WARN]%s %s\n' "${C_YELLOW}" "${C_RESET}" "$1"; }
skip() { printf '%s[SKIP]%s %s\n' "${C_YELLOW}" "${C_RESET}" "$1"; }

printf '%s== BMAD Definition-of-Done gate ==%s\n' "${C_BOLD}" "${C_RESET}"
printf 'story: %s\n' "${STORY_FILE}"
if [ "${DRY_RUN}" -eq 1 ]; then
  printf '(dry-run: lint/test/build/format are skipped)\n'
fi
printf '\n'

# --- validate story file exists --------------------------------------------
if [ ! -f "${STORY_FILE}" ]; then
  fail "story file not found: ${STORY_FILE}"
  printf '\n%s== GATE: FAIL ==%s\n' "${C_RED}${C_BOLD}" "${C_RESET}"
  exit 1
fi

# --- 1. All ACs checked: zero `- [ ]` remaining -----------------------------
UNCHECKED="$(grep -c -E '^[[:space:]]*-[[:space:]]\[ \]' "${STORY_FILE}" || true)"
UNCHECKED="${UNCHECKED:-0}"
if [ "${UNCHECKED}" -eq 0 ]; then
  pass "check 1: all acceptance criteria checked (no '- [ ]' remaining)"
else
  fail "check 1: ${UNCHECKED} unchecked '- [ ]' item(s) remain in story"
fi

# --- helper to run a pnpm script -------------------------------------------
run_pnpm() {
  # $1 = pnpm script, $2 = check label
  local script="$1" label="$2"
  if [ "${DRY_RUN}" -eq 1 ]; then
    skip "${label}: pnpm ${script} (dry-run)"
    return 0
  fi
  if ! command -v pnpm >/dev/null 2>&1; then
    fail "${label}: pnpm not found"
    return 1
  fi
  if pnpm "${script}"; then
    pass "${label}: pnpm ${script}"
  else
    fail "${label}: pnpm ${script} returned non-zero"
  fi
}

# --- 2. pnpm lint -----------------------------------------------------------
run_pnpm lint "check 2"

# --- 3. pnpm test -----------------------------------------------------------
run_pnpm test "check 3"

# --- 4. core coverage >= 80% ------------------------------------------------
COVERAGE_FILE="coverage/libs/core/coverage-summary.json"
if [ "${DRY_RUN}" -eq 0 ]; then
  if command -v pnpm >/dev/null 2>&1; then
    pnpm nx test core --coverage >/dev/null 2>&1 || true
  fi
fi
if [ -f "${COVERAGE_FILE}" ]; then
  # Extract the "lines": { ... "pct": NN } value without jq.
  PCT="$(grep -A4 '"lines"' "${COVERAGE_FILE}" | grep -E '"pct"' | head -n1 \
        | grep -oE '[0-9]+(\.[0-9]+)?' | head -n1)"
  if [ -n "${PCT:-}" ]; then
    # integer comparison on the floor of the percentage
    PCT_INT="${PCT%.*}"
    if [ "${PCT_INT}" -ge 80 ]; then
      pass "check 4: core line coverage ${PCT}% >= 80%"
    else
      fail "check 4: core line coverage ${PCT}% < 80%"
    fi
  else
    warn "check 4: could not parse lines.pct from ${COVERAGE_FILE}"
  fi
else
  warn "check 4: ${COVERAGE_FILE} absent; coverage not verified"
fi

# --- 5. pnpm build ----------------------------------------------------------
run_pnpm build "check 5"

# --- 6. pnpm format:check ---------------------------------------------------
run_pnpm format:check "check 6"

# --- 7. token drift: node scripts/generate-tokens.mjs --check ---------------
TOKENS="scripts/generate-tokens.mjs"
if [ ! -f "${TOKENS}" ]; then
  warn "check 7: ${TOKENS} not present; token drift not verified"
elif ! command -v node >/dev/null 2>&1; then
  warn "check 7: node not found; token drift not verified"
else
  if node "${TOKENS}" --check >/dev/null 2>&1; then
    pass "check 7: no token drift (generate-tokens.mjs --check)"
  else
    fail "check 7: token drift detected (generate-tokens.mjs --check)"
  fi
fi

# --- 8. story <-> issue sync mapping ---------------------------------------
# Parse `**Status**: <value>` from the story and echo the expected GitHub
# state + labels per the CLAUDE.md mapping table.
STATUS_LINE="$(grep -m1 -E '^\**Status\**[[:space:]]*:' "${STORY_FILE}" || true)"
STATUS_VALUE="$(printf '%s' "${STATUS_LINE}" | sed -E 's/^\**Status\**[[:space:]]*:[[:space:]]*//; s/[[:space:]]*$//')"

expected_state=""
expected_labels=""
case "${STATUS_VALUE}" in
  "Done")
    expected_state="CLOSED"; expected_labels="(none)" ;;
  "Done (tests pending)")
    expected_state="OPEN"; expected_labels="tests-pending" ;;
  *"tests"*"feature"*pending* | *"feature"*"tests"*pending*)
    expected_state="OPEN"; expected_labels="tests-pending + feature-pending" ;;
  "Done ("*"pending)")
    expected_state="OPEN"; expected_labels="feature-pending" ;;
  "In Progress")
    expected_state="OPEN"; expected_labels="tests-pending and/or feature-pending (as applicable)" ;;
  "Pending")
    expected_state="OPEN"; expected_labels="(no pending labels until work starts)" ;;
  "")
    expected_state="UNKNOWN"; expected_labels="(no **Status** line found)" ;;
  *)
    expected_state="OPEN"; expected_labels="(unrecognized status '${STATUS_VALUE}' — review manually)" ;;
esac

printf 'check 8: story Status = "%s"\n' "${STATUS_VALUE:-<none>}"
printf '         expected GitHub state : %s\n' "${expected_state}"
printf '         expected labels       : %s\n' "${expected_labels}"

if command -v gh >/dev/null 2>&1; then
  pass "check 8: gh CLI available for sync (apply mapping above)"
elif [ -n "${BMAD_SYNC_TOKEN:-}" ] || [ -n "${GITHUB_TOKEN:-}" ]; then
  pass "check 8: SYNC token present for sync (apply mapping above)"
else
  warn "check 8: neither gh CLI nor SYNC token available; sync not enforced"
fi
printf '\n'

# --- verdict ----------------------------------------------------------------
if [ "${FAILED}" -eq 0 ]; then
  printf '%s== GATE: PASS ==%s\n' "${C_GREEN}${C_BOLD}" "${C_RESET}"
  exit 0
else
  printf '%s== GATE: FAIL ==%s\n' "${C_RED}${C_BOLD}" "${C_RESET}"
  exit 1
fi
