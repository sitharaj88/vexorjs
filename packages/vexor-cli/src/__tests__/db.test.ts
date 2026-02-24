/**
 * Database Commands Tests
 *
 * Tests for db:migrate, db:rollback, db:status, db:seed, and db:reset.
 * Private functions (loadProjectModule, loadMigrations, runSeeders) are tested
 * indirectly through the exported dbCommand by mocking dependencies.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
}));

vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    title: vi.fn(),
    subtitle: vi.fn(),
    blank: vi.fn(),
    table: vi.fn(),
    box: vi.fn(),
    list: vi.fn(),
    keyValue: vi.fn(),
    command: vi.fn(),
    banner: vi.fn(),
    step: vi.fn(),
  },
}));

import { readdir } from 'fs/promises';
import { dbCommand } from '../commands/db.js';

const mockedReaddir = vi.mocked(readdir);

let consoleLogSpy: ReturnType<typeof vi.spyOn>;
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
let processExitSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  processExitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as any);
});

afterEach(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
  processExitSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// dbCommand('migrate')
// ---------------------------------------------------------------------------

describe('dbCommand - migrate', () => {
  it('should handle when db module is not found', async () => {
    // loadProjectModule will fail for all paths because dynamic import will reject
    // in test environment. This triggers the error path.
    await dbCommand('migrate');

    // When loadProjectModule returns null, it prints a warning about db not configured
    const allLogCalls = consoleLogSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(allLogCalls).toContain('Running migrations');
  });

  it('should log the "Running migrations" header', async () => {
    await dbCommand('migrate');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Running migrations')
    );
  });
});

// ---------------------------------------------------------------------------
// dbCommand('rollback')
// ---------------------------------------------------------------------------

describe('dbCommand - rollback', () => {
  it('should attempt rollback with default step count of 1', async () => {
    await dbCommand('rollback');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Rolling back 1 migration(s)')
    );
  });

  it('should attempt rollback with custom step count', async () => {
    await dbCommand('rollback', { steps: 2 });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Rolling back 2 migration(s)')
    );
  });
});

// ---------------------------------------------------------------------------
// dbCommand('status')
// ---------------------------------------------------------------------------

describe('dbCommand - status', () => {
  it('should attempt to show migration status', async () => {
    await dbCommand('status');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Migration Status')
    );
  });
});

// ---------------------------------------------------------------------------
// dbCommand('seed')
// ---------------------------------------------------------------------------

describe('dbCommand - seed', () => {
  it('should handle when seeders directory does not exist (ENOENT)', async () => {
    const enoentError = new Error('ENOENT') as NodeJS.ErrnoException;
    enoentError.code = 'ENOENT';
    mockedReaddir.mockRejectedValueOnce(enoentError);

    await dbCommand('seed');

    const allLogCalls = consoleLogSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(allLogCalls).toContain('No seeders directory found');
  });

  it('should handle when no seeder files are found', async () => {
    mockedReaddir.mockResolvedValueOnce([] as any);

    await dbCommand('seed');

    const allLogCalls = consoleLogSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(allLogCalls).toContain('No seeders found');
  });

  it('should filter out non-ts/js files from seeders directory', async () => {
    // Return a mix of files; only .ts and .js should be considered
    mockedReaddir.mockResolvedValueOnce([
      'README.md',
      '.gitkeep',
      'data.json',
    ] as any);

    await dbCommand('seed');

    // With no .ts/.js files, it should report no seeders found
    const allLogCalls = consoleLogSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(allLogCalls).toContain('No seeders found');
  });

  it('should log the "Running seeders" header', async () => {
    const enoentError = new Error('ENOENT') as NodeJS.ErrnoException;
    enoentError.code = 'ENOENT';
    mockedReaddir.mockRejectedValueOnce(enoentError);

    await dbCommand('seed');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Running seeders')
    );
  });
});

// ---------------------------------------------------------------------------
// dbCommand('reset')
// ---------------------------------------------------------------------------

describe('dbCommand - reset', () => {
  it('should handle when db module is not found during reset', async () => {
    await dbCommand('reset');

    const allLogCalls = consoleLogSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(allLogCalls).toContain('Resetting database');
  });
});

// ---------------------------------------------------------------------------
// dbCommand with unknown action
// ---------------------------------------------------------------------------

describe('dbCommand - unknown action', () => {
  it('should exit with error for an unknown action', async () => {
    await expect(dbCommand('purge' as any)).rejects.toThrow('process.exit(1)');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown database action: purge')
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should exit with error for another invalid action', async () => {
    await expect(dbCommand('destroy' as any)).rejects.toThrow('process.exit(1)');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown database action: destroy')
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
