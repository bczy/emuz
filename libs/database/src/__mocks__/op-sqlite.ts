/**
 * Vitest mock for @op-engineering/op-sqlite
 * The real package contains native bindings that cannot run in Node/Vitest.
 */
import { vi } from 'vitest';

export const open = vi.fn(() => ({
  close: vi.fn(),
  execute: vi.fn(),
  executeAsync: vi.fn(),
}));
