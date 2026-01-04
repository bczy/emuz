/**
 * Emulator launcher tests
 */

import { describe, it, expect } from 'vitest';
import { createLauncher } from '../launcher';

describe('Launcher Factory', () => {
  it('should create desktop launcher', () => {
    const launcher = createLauncher('desktop');
    expect(launcher).toBeDefined();
    expect(typeof launcher.launch).toBe('function');
  });

  it('should create android launcher', () => {
    const launcher = createLauncher('android');
    expect(launcher).toBeDefined();
    expect(typeof launcher.launch).toBe('function');
  });

  it('should create ios launcher', () => {
    const launcher = createLauncher('ios');
    expect(launcher).toBeDefined();
    expect(typeof launcher.launch).toBe('function');
  });

  it('should auto-detect platform when none specified', () => {
    const launcher = createLauncher();
    expect(launcher).toBeDefined();
    expect(typeof launcher.launch).toBe('function');
  });
});

describe('Launcher Methods', () => {
  it('should implement launch method', () => {
    const launcher = createLauncher('desktop');
    expect(typeof launcher.launch).toBe('function');
  });

  it('should have launcher instance methods', () => {
    const launcher = createLauncher('desktop');
    expect(launcher).toBeDefined();
    expect(launcher.launch).toBeDefined();
  });
});
