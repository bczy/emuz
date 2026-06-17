#!/usr/bin/env node
// bmad-backlog.mjs — parse + validate the BMAD backlog stories.
// Node ESM, built-ins only. No external dependencies.
//
// Usage:
//   node scripts/bmad-backlog.mjs --validate   # validate + print index (stdout) + summary (stderr)
//   node scripts/bmad-backlog.mjs --json       # emit only the JSON index to stdout
//
// Exit codes: 0 = all stories valid; non-zero = at least one malformed story.

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const BACKLOG_DIR = join(
  REPO_ROOT,
  '_bmad-output',
  'implementation-artifacts',
  'stories',
  'backlog',
);

const VALID_STATUSES = ['backlog', 'ready-for-dev', 'in-progress', 'review', 'done'];
const REQUIRED_SECTIONS = ['## User Story', '## Acceptance Criteria', '## Technical Notes'];

/**
 * Parse a single story markdown file into a structured record.
 * @param {string} filePath
 * @returns {{ file: string, title: string|null, status: string|null, epic: string|null,
 *   reserved: boolean, acTotal: number, acChecked: number, acOpen: number,
 *   missingSections: string[], errors: string[] }}
 */
function parseStory(filePath) {
  const text = readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const errors = [];

  // Title: first H1 of form "# Story <id>: <title>"
  const titleLine = lines.find((l) => /^#\s+Story\s+/.test(l));
  let title = null;
  if (titleLine) {
    title = titleLine.replace(/^#\s+/, '').trim();
  } else {
    errors.push('missing "# Story <id>: <title>" heading');
  }

  // **Status**: <value>
  const statusMatch = text.match(/^\*\*Status\*\*:\s*(.+)$/m);
  const status = statusMatch ? statusMatch[1].trim() : null;
  if (!status) {
    errors.push('missing **Status** line');
  } else if (!VALID_STATUSES.includes(status)) {
    errors.push(
      `invalid status "${status}" (expected one of: ${VALID_STATUSES.join(', ')})`,
    );
  }

  // **Epic**: <value>
  const epicMatch = text.match(/^\*\*Epic\*\*:\s*(.+)$/m);
  const epic = epicMatch ? epicMatch[1].trim() : null;
  if (!epic) errors.push('missing **Epic** line');

  // **Reserved**: supervised  (optional)
  const reserved = /^\*\*Reserved\*\*:\s*supervised\s*$/m.test(text);

  // Acceptance criteria checkboxes.
  let acChecked = 0;
  let acOpen = 0;
  for (const l of lines) {
    if (/^\s*-\s*\[x\]\s+/i.test(l)) acChecked += 1;
    else if (/^\s*-\s*\[ \]\s+/.test(l)) acOpen += 1;
  }
  const acTotal = acChecked + acOpen;
  if (acTotal === 0) errors.push('no acceptance criteria ("- [ ]" / "- [x]") found');

  // Required sections.
  const missingSections = REQUIRED_SECTIONS.filter(
    (sec) => !lines.some((l) => l.trim() === sec),
  );
  for (const sec of missingSections) {
    errors.push(`missing required section "${sec}"`);
  }

  return {
    file: basename(filePath),
    title,
    status,
    epic,
    reserved,
    acTotal,
    acChecked,
    acOpen,
    missingSections,
    errors,
  };
}

function collectStories() {
  let entries;
  try {
    entries = readdirSync(BACKLOG_DIR);
  } catch (err) {
    process.stderr.write(`error: cannot read backlog dir ${BACKLOG_DIR}: ${err.message}\n`);
    process.exit(2);
  }
  const files = entries
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => join(BACKLOG_DIR, f));
  return files.map(parseStory);
}

function main() {
  const args = process.argv.slice(2);
  const jsonOnly = args.includes('--json');
  const validate = args.includes('--validate');

  if (!jsonOnly && !validate) {
    process.stderr.write(
      'usage: node scripts/bmad-backlog.mjs [--validate | --json]\n',
    );
    process.exit(2);
  }

  const stories = collectStories();
  const valid = stories.filter((s) => s.errors.length === 0);
  const invalid = stories.filter((s) => s.errors.length > 0);

  const index = {
    generatedAt: new Date().toISOString(),
    backlogDir: '_bmad-output/implementation-artifacts/stories/backlog',
    total: stories.length,
    valid: valid.length,
    invalid: invalid.length,
    stories: stories.map((s) => ({
      file: s.file,
      title: s.title,
      status: s.status,
      epic: s.epic,
      reserved: s.reserved,
      acceptanceCriteria: { total: s.acTotal, checked: s.acChecked, open: s.acOpen },
      ok: s.errors.length === 0,
      errors: s.errors,
    })),
  };

  // Machine-readable index always goes to stdout.
  process.stdout.write(JSON.stringify(index, null, jsonOnly ? 0 : 2) + '\n');

  if (jsonOnly) {
    process.exit(invalid.length === 0 ? 0 : 1);
  }

  // Human summary to stderr.
  const out = process.stderr;
  out.write('\nBMAD backlog validation\n');
  out.write('=======================\n');
  for (const s of stories) {
    const mark = s.errors.length === 0 ? 'OK ' : 'BAD';
    const reservedTag = s.reserved ? ' [RESERVED:supervised]' : '';
    out.write(
      `[${mark}] ${s.file} — ${s.title ?? '(no title)'} ` +
        `(status=${s.status ?? '?'}, AC ${s.acChecked}/${s.acTotal})${reservedTag}\n`,
    );
    for (const e of s.errors) out.write(`        ! ${e}\n`);
  }
  out.write(
    `\n${valid.length}/${stories.length} stories valid` +
      (invalid.length ? `, ${invalid.length} malformed\n` : '\n'),
  );

  process.exit(invalid.length === 0 && stories.length > 0 ? 0 : 1);
}

main();
