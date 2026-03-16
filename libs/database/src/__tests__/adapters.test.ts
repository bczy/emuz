/**
 * Database adapters unit tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseConfig, BaseDatabaseAdapter, detectPlatform } from '../adapters';

/**
 * Mock database adapter for testing
 * Implements the DatabaseAdapter interface with in-memory storage
 */
class MockDatabaseAdapter extends BaseDatabaseAdapter {
  private openCalled = false;
  private closeCalled = false;

  async open(): Promise<void> {
    this.openCalled = true;
    this.connected = true;
  }

  async close(): Promise<void> {
    this.closeCalled = true;
    this.connected = false;
  }

  async execute(_sql: string, _params?: unknown[]): Promise<void> {
    // Simple mock - just track that execute was called
    if (!this.connected) {
      throw new Error('Database is not connected');
    }
    // Store the SQL for verification if needed
  }

  async query<T = unknown>(_sql: string, _params?: unknown[]): Promise<T[]> {
    if (!this.connected) {
      throw new Error('Database is not connected');
    }
    // Return empty array by default
    return [] as T[];
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.connected) {
      throw new Error('Database is not connected');
    }
    return fn();
  }

  // Test helpers
  wasOpened(): boolean {
    return this.openCalled;
  }

  wasClosed(): boolean {
    return this.closeCalled;
  }
}

describe('DatabaseAdapter', () => {
  describe('BaseDatabaseAdapter', () => {
    let adapter: MockDatabaseAdapter;
    const config: DatabaseConfig = {
      path: ':memory:',
      wal: true,
      foreignKeys: true,
    };

    beforeEach(() => {
      adapter = new MockDatabaseAdapter(config);
    });

    afterEach(async () => {
      if (adapter.isConnected()) {
        await adapter.close();
      }
    });

    it('should initialize with default config values', () => {
      const minimalAdapter = new MockDatabaseAdapter({ path: ':memory:' });
      expect(minimalAdapter.isConnected()).toBe(false);
    });

    it('should open connection', async () => {
      await adapter.open();
      expect(adapter.isConnected()).toBe(true);
      expect(adapter.wasOpened()).toBe(true);
    });

    it('should close connection', async () => {
      await adapter.open();
      await adapter.close();
      expect(adapter.isConnected()).toBe(false);
      expect(adapter.wasClosed()).toBe(true);
    });

    it('should execute SQL when connected', async () => {
      await adapter.open();
      await expect(adapter.execute('SELECT 1')).resolves.toBeUndefined();
    });

    it('should throw when executing SQL without connection', async () => {
      await expect(adapter.execute('SELECT 1')).rejects.toThrow('Database is not connected');
    });

    it('should query data when connected', async () => {
      await adapter.open();
      const results = await adapter.query('SELECT 1');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should throw when querying without connection', async () => {
      await expect(adapter.query('SELECT 1')).rejects.toThrow('Database is not connected');
    });

    it('should return null for queryOne with no results', async () => {
      await adapter.open();
      const result = await adapter.queryOne('SELECT * FROM nonexistent');
      expect(result).toBeNull();
    });

    it('should run transactions', async () => {
      await adapter.open();
      let transactionRan = false;

      await adapter.transaction(async () => {
        transactionRan = true;
        return 'success';
      });

      expect(transactionRan).toBe(true);
    });
  });

  describe('detectPlatform', () => {
    afterEach(() => {
      // Restore globals
      vi.unstubAllGlobals();
    });

    it('should detect Node.js on Linux', () => {
      // Mock Node.js environment on Linux
      vi.stubGlobal('process', {
        versions: { node: '20.0.0' },
        platform: 'linux',
      });

      const result = detectPlatform();
      expect(result.type).toBe('desktop');
      expect(result.os).toBe('linux');
      expect(result.isNative).toBe(true);
    });

    it('should detect Node.js on macOS', () => {
      vi.stubGlobal('process', {
        versions: { node: '20.0.0' },
        platform: 'darwin',
      });

      const result = detectPlatform();
      expect(result.type).toBe('desktop');
      expect(result.os).toBe('macos');
    });

    it('should detect Node.js on Windows', () => {
      vi.stubGlobal('process', {
        versions: { node: '20.0.0' },
        platform: 'win32',
      });

      const result = detectPlatform();
      expect(result.type).toBe('desktop');
      expect(result.os).toBe('windows');
    });
  });
});

describe('DatabaseConfig', () => {
  it('should have required path property', () => {
    const config: DatabaseConfig = { path: 'test.db' };
    expect(config.path).toBe('test.db');
  });

  it('should have optional wal property', () => {
    const config: DatabaseConfig = { path: 'test.db', wal: true };
    expect(config.wal).toBe(true);
  });

  it('should have optional foreignKeys property', () => {
    const config: DatabaseConfig = { path: 'test.db', foreignKeys: true };
    expect(config.foreignKeys).toBe(true);
  });
});
