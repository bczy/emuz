/**
 * File system adapters tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectFilePlatform, createFileSystemAdapter } from '../filesystem';

describe('Platform Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect desktop platform by default', () => {
    const info = detectFilePlatform();
    expect(info.platform).toBe('desktop');
    expect(info.isNative).toBeDefined();
  });

  it('should create desktop file system adapter', () => {
    const adapter = createFileSystemAdapter('desktop');
    expect(adapter).toBeDefined();
  });
});

describe('File System Factory', () => {
  it('should create adapter for desktop platform', () => {
    const adapter = createFileSystemAdapter('desktop');
    expect(adapter).toBeDefined();
  });

  it('should create adapter for android platform', () => {
    const adapter = createFileSystemAdapter('android');
    expect(adapter).toBeDefined();
  });

  it('should create adapter for ios platform', () => {
    const adapter = createFileSystemAdapter('ios');
    expect(adapter).toBeDefined();
  });

  it('should auto-detect platform when none specified', () => {
    const adapter = createFileSystemAdapter();
    expect(adapter).toBeDefined();
  });
});

describe('Base File System Adapter', () => {
  it('should implement required read/write methods', () => {
    const adapter = createFileSystemAdapter('desktop');
    expect(typeof adapter.readText).toBe('function');
    expect(typeof adapter.writeText).toBe('function');
    expect(typeof adapter.exists).toBe('function');
    expect(typeof adapter.list).toBe('function');
  });
});
