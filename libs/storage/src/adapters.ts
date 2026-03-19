import type { FileIO } from './types.js';

/**
 * Node.js FileIO implementation for the desktop (Electron) app.
 * Uses node:fs/promises for all I/O and node:path for path joining.
 */
export function createNodeFileIO(): FileIO {
  // Dynamic imports keep this module tree-shakeable and avoid bundling
  // Node built-ins into non-Node environments.

  const fs = require('node:fs/promises') as typeof import('node:fs/promises');

  const nodePath = require('node:path') as typeof import('node:path');

  return {
    readText: (p: string) => fs.readFile(p, 'utf8').catch(() => ''),

    writeText: (p: string, c: string) => fs.writeFile(p, c, 'utf8'),

    rename: (from: string, to: string) => fs.rename(from, to),

    exists: (p: string) =>
      fs
        .access(p)
        .then(() => true)
        .catch(() => false),

    mkdir: (p: string) => fs.mkdir(p, { recursive: true }).then(() => undefined),

    joinPath: (...parts: string[]) => nodePath.join(...parts),
  };
}
