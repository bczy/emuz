#!/usr/bin/env bash
#
# bmad-cycle.sh — BMAD harness chain validator (component A, issue #54)
# ---------------------------------------------------------------------------
# Validates that every link in the guarded BMAD harness chain is present,
# executable, and self-consistent before any story is driven through the
# Definition-of-Done gate. It prints a clear RED/GREEN line per check and a
# final verdict, exiting non-zero if ANY check is RED.
#
# Checks performed:
#   1. Presence + executability of the sibling harness scripts:
#        - scripts/bmad-gate-check.sh   (component A, issue #54)
#        - scripts/generate-tokens.mjs  (component B, issue #55)
#        - scripts/bmad-backlog.mjs     (component C, issue #56)
#        - scripts/bmad-labels.sh       (component D, issue #57)
#   2. `scripts/bmad-gate-check.sh --dry-run` exits 0   (only if present)
#   3. `node scripts/generate-tokens.mjs --check` exits 0 (only if present)
#   4. `node scripts/bmad-backlog.mjs --validate` exits 0 (only if present)
#   5. package.json declares the lint/test/test:coverage/build scripts (grep)
#   6. git working tree clean (informational WARN under --dry-run, else RED)
#
# Usage:
#   scripts/bmad-cycle.sh            # full validation
#   scripts/bmad-cycle.sh --dry-run  # tree-clean check is informational only
#
# Exit status: 0 when all checks are GREEN, non-zero otherwise.
# ---------------------------------------------------------------------------

set -uo pipefail

# --- locate repo root (script lives in <root>/scripts) ----------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${ROOT_DIR}"

# --- argument parsing -------------------------------------------------------
DRY_RUN=0
for arg in "$@"; do
  case "${arg}" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      sed -n '2,33p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "bmad-cycle: unknown argument '${arg}'" >&2
      exit 2
      ;;
  esac
done

# --- colorization (tput when available, plain otherwise) --------------------
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

green() { printf '%s[GREEN]%s %s\n' "${C_GREEN}" "${C_RESET}" "$1"; }
red()   { printf '%s[ RED ]%s %s\n' "${C_RED}"   "${C_RESET}" "$1"; FAILED=1; }
warn()  { printf '%s[WARN ]%s %s\n' "${C_YELLOW}" "${C_RESET}" "$1"; }

printf '%s== BMAD cycle chain validator ==%s\n' "${C_BOLD}" "${C_RESET}"
if [ "${DRY_RUN}" -eq 1 ]; then
  printf '(dry-run: tree-clean check is informational only)\n'
fi
printf '\n'

# --- 1. presence + executability of sibling scripts -------------------------
check_present_exec() {
  # $1 = path, $2 = description
  # .sh scripts are invoked directly and must be executable; .mjs scripts are
  # invoked via `node <file>` (see the package.json npm scripts) and only need
  # to be present + readable.
  local path="$1" desc="$2"
  if [ ! -e "${path}" ]; then
    red "${desc} missing: ${path}"
    return 1
  fi
  case "${path}" in
    *.mjs)
      if [ ! -r "${path}" ]; then
        red "${desc} present but not readable: ${path}"
        return 1
      fi
      green "${desc} present + readable (run via node): ${path}"
      return 0
      ;;
    *)
      if [ ! -x "${path}" ]; then
        red "${desc} present but not executable: ${path}"
        return 1
      fi
      green "${desc} present + executable: ${path}"
      return 0
      ;;
  esac
}

GATE="scripts/bmad-gate-check.sh"
TOKENS="scripts/generate-tokens.mjs"
BACKLOG="scripts/bmad-backlog.mjs"
LABELS="scripts/bmad-labels.sh"

check_present_exec "${GATE}"    "gate-check (component A, #54)"
GATE_OK=$?
check_present_exec "${TOKENS}"  "token generator (component B, #55)"
TOKENS_OK=$?
check_present_exec "${BACKLOG}" "backlog tool (component C, #56)"
BACKLOG_OK=$?
check_present_exec "${LABELS}"  "labels tool (component E, #58)"
# label executability is checked but not used to gate later runs
printf '\n'

# --- 2. gate-check --dry-run exits 0 ---------------------------------------
if [ "${GATE_OK}" -eq 0 ]; then
  if bash "${GATE}" --dry-run >/dev/null 2>&1; then
    green "bmad-gate-check.sh --dry-run exits 0"
  else
    red "bmad-gate-check.sh --dry-run returned non-zero"
  fi
else
  red "skip: bmad-gate-check.sh --dry-run (script unavailable)"
fi

# --- 3. generate-tokens.mjs --check exits 0 --------------------------------
if [ "${TOKENS_OK}" -eq 0 ]; then
  if command -v node >/dev/null 2>&1; then
    if node "${TOKENS}" --check >/dev/null 2>&1; then
      green "node generate-tokens.mjs --check exits 0 (no token drift)"
    else
      red "node generate-tokens.mjs --check returned non-zero (token drift?)"
    fi
  else
    warn "node not found; cannot run generate-tokens.mjs --check"
  fi
else
  red "skip: generate-tokens.mjs --check (script unavailable)"
fi

# --- 4. bmad-backlog.mjs --validate exits 0 --------------------------------
if [ "${BACKLOG_OK}" -eq 0 ]; then
  if command -v node >/dev/null 2>&1; then
    if node "${BACKLOG}" --validate >/dev/null 2>&1; then
      green "node bmad-backlog.mjs --validate exits 0"
    else
      red "node bmad-backlog.mjs --validate returned non-zero"
    fi
  else
    warn "node not found; cannot run bmad-backlog.mjs --validate"
  fi
else
  red "skip: bmad-backlog.mjs --validate (script unavailable)"
fi
printf '\n'

# --- 5. package.json declares required scripts ------------------------------
if [ -f package.json ]; then
  for s in lint test test:coverage build; do
    if grep -Eq "\"${s}\"[[:space:]]*:" package.json; then
      green "package.json declares \"${s}\" script"
    else
      red "package.json missing \"${s}\" script"
    fi
  done
else
  red "package.json not found at repo root"
fi
printf '\n'

# --- 6. git tree clean ------------------------------------------------------
if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if [ -z "$(git status --porcelain)" ]; then
    green "git working tree clean"
  else
    if [ "${DRY_RUN}" -eq 1 ]; then
      warn "git working tree has uncommitted changes (informational under --dry-run)"
    else
      red "git working tree has uncommitted changes"
    fi
  fi
else
  warn "not a git work tree; skipping tree-clean check"
fi
printf '\n'

# --- final verdict ----------------------------------------------------------
if [ "${FAILED}" -eq 0 ]; then
  printf '%s== VERDICT: GREEN — chain is consistent ==%s\n' "${C_GREEN}${C_BOLD}" "${C_RESET}"
  exit 0
else
  printf '%s== VERDICT: RED — one or more checks failed ==%s\n' "${C_RED}${C_BOLD}" "${C_RESET}"
  exit 1
fi
