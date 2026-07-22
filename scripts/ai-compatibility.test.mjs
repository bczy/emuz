import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');

function read(path) {
  return readFileSync(resolve(root, path), 'utf8');
}

function parseCsv(path) {
  const lines = read(path).trim().split(/\r?\n/);
  const headers = parseCsvLine(lines.shift());

  return lines.map((line) =>
    Object.fromEntries(headers.map((header, index) => [header, parseCsvLine(line)[index]])),
  );
}

function parseCsvLine(line) {
  const fields = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      fields.push(field);
      field = '';
    } else {
      field += character;
    }
  }
  fields.push(field);
  return fields;
}

test('AGENTS.md is the canonical cross-tool instruction source', () => {
  assert.ok(existsSync(resolve(root, 'AGENTS.md')));
  assert.match(read('AGENTS.md'), /BMAD/i);
  assert.match(read('CLAUDE.md'), /@AGENTS\.md/);
  assert.match(read('.github/copilot-instructions.md'), /AGENTS\.md/);
  assert.ok(read('CLAUDE.md').split(/\r?\n/).length <= 10, 'CLAUDE.md must remain an adapter');
});

test('every canonical BMAD agent has a Copilot custom-agent adapter', () => {
  const agents = parseCsv('_bmad/_config/agent-manifest.csv');
  assert.equal(agents.length, 9);

  for (const agent of agents) {
    const adapter = `.github/agents/${agent.canonicalId}.agent.md`;
    assert.ok(existsSync(resolve(root, adapter)), `missing ${adapter}`);
    assert.match(read(adapter), new RegExp(agent.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('every canonical BMAD skill has a Copilot prompt adapter', () => {
  const skills = parseCsv('_bmad/_config/skill-manifest.csv');
  assert.equal(skills.length, 36);

  for (const skill of skills) {
    const adapter = `.github/prompts/${skill.canonicalId}.prompt.md`;
    assert.ok(existsSync(resolve(root, adapter)), `missing ${adapter}`);
    assert.match(read(adapter), new RegExp(skill.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('Claude Code and VS Code expose the same MCP servers', () => {
  const claude = JSON.parse(read('.mcp.json')).mcpServers;
  const vscode = JSON.parse(read('.vscode/mcp.json')).servers;

  assert.deepEqual(Object.keys(vscode).sort(), Object.keys(claude).sort());
  assert.deepEqual(Object.keys(claude).sort(), ['context7', 'nx', 'playwright']);
});

test('Claude permissions are portable and least-privilege', () => {
  const settings = read('.claude/settings.json');
  const parsed = JSON.parse(settings);
  const allowed = parsed.permissions?.allow ?? [];

  assert.doesNotMatch(settings, /\/home\/|[A-Z]:\\/);
  assert.ok(!allowed.includes('Bash'), 'unrestricted Bash permission is forbidden');
});

test('repository automation validates generated AI adapters', () => {
  const packageJson = JSON.parse(read('package.json'));

  assert.equal(packageJson.scripts['ai:validate'], 'node scripts/validate-ai-config.mjs');
  assert.ok(existsSync(resolve(root, 'scripts/validate-ai-config.mjs')));
  assert.match(read('.github/workflows/test.yml'), /pnpm ai:validate/);
  assert.match(read('docs/ai-tools.md'), /Claude Code/);
  assert.match(read('docs/ai-tools.md'), /Copilot Coding Agent/);
  assert.match(read('docs/ai-tools.md'), /Copilot Chat/);
});

test('adapter filenames remain portable', () => {
  for (const manifest of ['agent-manifest.csv', 'skill-manifest.csv']) {
    for (const entry of parseCsv(`_bmad/_config/${manifest}`)) {
      assert.equal(basename(entry.canonicalId), entry.canonicalId);
      assert.match(entry.canonicalId, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  }
});
