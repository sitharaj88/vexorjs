/**
 * Dev Command Tests
 *
 * Tests for devCommand. The private function findRunner is tested indirectly
 * through the exported devCommand by mocking file system access and child_process.spawn.
 */

import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';

const mockChildOn = vi.fn();
const mockChildKill = vi.fn();
const mockChildInstance = {
  on: mockChildOn,
  kill: mockChildKill,
};

vi.mock('child_process', () => ({
  spawn: vi.fn(() => mockChildInstance),
  execSync: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  access: vi.fn(),
}));

import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { devCommand } from '../commands/dev.js';

const mockedSpawn = vi.mocked(spawn);
const mockedAccess = vi.mocked(access);

let consoleLogSpy: MockInstance;
let consoleErrorSpy: MockInstance;
let processExitSpy: MockInstance;
let processOnSpy: MockInstance;

beforeEach(() => {
  vi.clearAllMocks();
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  processExitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as any);
  processOnSpy = vi.spyOn(process, 'on').mockImplementation((() => process) as any);
});

afterEach(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
  processExitSpy.mockRestore();
  processOnSpy.mockRestore();
});

const defaultOptions = { port: 3000, host: 'localhost', entry: 'src/index.ts' };

// ---------------------------------------------------------------------------
// devCommand - entry file checks
// ---------------------------------------------------------------------------

describe('devCommand - entry file existence', () => {
  it('should check if the entry file exists', async () => {
    // Entry file check rejects, triggering process.exit
    mockedAccess.mockRejectedValue(new Error('ENOENT'));

    await expect(devCommand(defaultOptions)).rejects.toThrow('process.exit');

    // First access call is for the entry file
    expect(mockedAccess).toHaveBeenCalled();
  });

  it('should exit with error when entry file is not found', async () => {
    // First call (entry file check) rejects
    mockedAccess.mockRejectedValueOnce(new Error('ENOENT'));

    await expect(devCommand(defaultOptions)).rejects.toThrow('process.exit(1)');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Entry file not found')
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});

// ---------------------------------------------------------------------------
// devCommand - runner detection
// ---------------------------------------------------------------------------

describe('devCommand - runner detection', () => {
  it('should exit with error when no TypeScript runner is found', async () => {
    // Entry file exists (first access succeeds)
    mockedAccess.mockResolvedValueOnce(undefined);
    // Then all runner checks fail
    mockedAccess.mockRejectedValue(new Error('ENOENT'));
    // Also execSync for bun --version should fail
    const { execSync } = await import('node:child_process');
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('not found');
    });

    await expect(devCommand(defaultOptions)).rejects.toThrow('process.exit(1)');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('No TypeScript runner found')
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should spawn tsx with watch args when tsx is available', async () => {
    // Entry file exists
    mockedAccess.mockResolvedValueOnce(undefined);
    // tsx binary found in node_modules/.bin
    mockedAccess.mockResolvedValueOnce(undefined);

    await devCommand(defaultOptions);

    expect(mockedSpawn).toHaveBeenCalledWith(
      'npx tsx',
      expect.arrayContaining(['watch']),
      expect.objectContaining({
        shell: true,
        stdio: 'inherit',
      })
    );
  });
});

// ---------------------------------------------------------------------------
// devCommand - environment variables
// ---------------------------------------------------------------------------

describe('devCommand - environment variables', () => {
  it('should set PORT and HOST env vars from options', async () => {
    mockedAccess.mockResolvedValueOnce(undefined);
    mockedAccess.mockResolvedValueOnce(undefined);

    await devCommand({ port: 8080, host: '0.0.0.0', entry: 'src/index.ts' });

    const spawnCall = mockedSpawn.mock.calls[0];
    const spawnOptions = spawnCall[2] as { env: Record<string, string> };

    expect(spawnOptions.env.PORT).toBe('8080');
    expect(spawnOptions.env.HOST).toBe('0.0.0.0');
  });

  it('should set NODE_ENV to development', async () => {
    mockedAccess.mockResolvedValueOnce(undefined);
    mockedAccess.mockResolvedValueOnce(undefined);

    await devCommand(defaultOptions);

    const spawnCall = mockedSpawn.mock.calls[0];
    const spawnOptions = spawnCall[2] as { env: Record<string, string> };

    expect(spawnOptions.env.NODE_ENV).toBe('development');
  });
});

// ---------------------------------------------------------------------------
// devCommand - output messages
// ---------------------------------------------------------------------------

describe('devCommand - output', () => {
  it('should display runner name, entry path, and URL', async () => {
    mockedAccess.mockResolvedValueOnce(undefined);
    mockedAccess.mockResolvedValueOnce(undefined);

    await devCommand({ port: 4000, host: '127.0.0.1', entry: 'src/app.ts' });

    const allLogs = consoleLogSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(allLogs).toContain('Runner: tsx');
    expect(allLogs).toContain('Entry: src/app.ts');
    expect(allLogs).toContain('http://127.0.0.1:4000');
  });

  it('should display starting message', async () => {
    mockedAccess.mockResolvedValueOnce(undefined);
    mockedAccess.mockResolvedValueOnce(undefined);

    await devCommand(defaultOptions);

    const allLogs = consoleLogSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(allLogs).toContain('Starting development server');
  });
});
