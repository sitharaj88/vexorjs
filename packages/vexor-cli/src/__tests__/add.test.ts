/**
 * Add Commands Tests
 *
 * Tests for addCommand and listIntegrationsCommand.
 * Private functions (fileExists, detectPackageManager, installPackages,
 * updatePackageScripts) are tested indirectly through the exported commands.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn().mockResolvedValue(undefined),
  access: vi.fn(),
}));

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    text: '',
  })),
}));

vi.mock('prompts', () => ({
  default: vi.fn(),
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

import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { execSync } from 'child_process';
import prompts from 'prompts';
import { logger } from '../utils/logger.js';
import { addCommand, listIntegrationsCommand } from '../commands/add.js';

const mockedAccess = vi.mocked(access);
const mockedReadFile = vi.mocked(readFile);
const mockedWriteFile = vi.mocked(writeFile);
const mockedExecSync = vi.mocked(execSync);
const mockedPrompts = vi.mocked(prompts);

let processExitSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  processExitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
    throw new Error(`process.exit(${code})`);
  }) as any);
});

afterEach(() => {
  processExitSpy.mockRestore();
});

/**
 * Helper: make fileExists return true for package.json, false for lock files.
 * This simulates a valid project directory using npm as the package manager.
 */
function mockProjectWithNpm(): void {
  mockedAccess.mockImplementation(async (path: any) => {
    const p = String(path);
    if (p.endsWith('package.json')) return undefined;
    // Reject lock files so detectPackageManager falls through to 'npm'
    throw new Error('ENOENT');
  });
}

/**
 * Helper: set up mocks for a full successful addCommand flow.
 */
function mockFullAddFlow(): void {
  mockProjectWithNpm();
  mockedReadFile.mockResolvedValue(
    JSON.stringify({ name: 'test-app', scripts: {} }) as any
  );
  mockedWriteFile.mockResolvedValue(undefined);
  mockedExecSync.mockReturnValue('' as any);
}

// ---------------------------------------------------------------------------
// listIntegrationsCommand
// ---------------------------------------------------------------------------

describe('listIntegrationsCommand', () => {
  it('should display a table with all 8 integrations', async () => {
    await listIntegrationsCommand();

    expect(logger.title).toHaveBeenCalledWith('Available Integrations');
    expect(logger.table).toHaveBeenCalledWith(
      ['Command', 'Name', 'Description'],
      expect.any(Array)
    );

    const rows = (logger.table as ReturnType<typeof vi.fn>).mock.calls[0][1] as string[][];
    expect(rows).toHaveLength(8);

    const keys = rows.map(r => r[0]);
    expect(keys).toContain('prisma');
    expect(keys).toContain('redis');
    expect(keys).toContain('vitest');
    expect(keys).toContain('docker');
    expect(keys).toContain('eslint');
    expect(keys).toContain('github');
    expect(keys).toContain('swagger');
    expect(keys).toContain('sentry');
  });

  it('should show usage instructions after the table', async () => {
    await listIntegrationsCommand();

    expect(logger.info).toHaveBeenCalledWith('Usage: vexor add <integration>');
    expect(logger.info).toHaveBeenCalledWith('       vexor add (interactive mode)');
  });
});

// ---------------------------------------------------------------------------
// addCommand - unknown integration
// ---------------------------------------------------------------------------

describe('addCommand - unknown integration', () => {
  it('should exit with error for an unknown integration name', async () => {
    mockProjectWithNpm();

    await expect(addCommand('unknown-pkg')).rejects.toThrow('process.exit(1)');

    expect(logger.error).toHaveBeenCalledWith('Unknown integration: unknown-pkg');
    expect(logger.list).toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});

// ---------------------------------------------------------------------------
// addCommand - no package.json
// ---------------------------------------------------------------------------

describe('addCommand - no package.json', () => {
  it('should exit with error when package.json does not exist', async () => {
    mockedAccess.mockRejectedValue(new Error('ENOENT'));

    await expect(addCommand('prisma')).rejects.toThrow('process.exit(1)');

    expect(logger.error).toHaveBeenCalledWith(
      'Not in a Vexor project. Run this command from your project root.'
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});

// ---------------------------------------------------------------------------
// addCommand - prisma integration
// ---------------------------------------------------------------------------

describe('addCommand - prisma', () => {
  it('should install dependencies, devDependencies, create files, add scripts, and run postInstall', async () => {
    mockFullAddFlow();

    await addCommand('prisma');

    expect(logger.title).toHaveBeenCalledWith('Adding Prisma ORM');

    // Should install @prisma/client as a dependency
    expect(mockedExecSync).toHaveBeenCalledWith(
      expect.stringContaining('@prisma/client'),
      expect.any(Object)
    );

    // Should install prisma as a devDependency
    expect(mockedExecSync).toHaveBeenCalledWith(
      expect.stringContaining('prisma'),
      expect.any(Object)
    );

    // Should create the prisma schema file
    expect(mockedWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('prisma/schema.prisma'),
      expect.stringContaining('generator client')
    );

    // Should update package.json with scripts
    expect(mockedWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('package.json'),
      expect.stringContaining('db:generate')
    );

    // Should run postInstall command
    expect(mockedExecSync).toHaveBeenCalledWith(
      'npx prisma generate',
      expect.any(Object)
    );

    expect(logger.success).toHaveBeenCalledWith('Prisma ORM added successfully!');
  });
});

// ---------------------------------------------------------------------------
// addCommand - docker integration
// ---------------------------------------------------------------------------

describe('addCommand - docker', () => {
  it('should create Dockerfile, docker-compose.yml, and .dockerignore', async () => {
    mockFullAddFlow();

    await addCommand('docker');

    expect(logger.title).toHaveBeenCalledWith('Adding Docker');

    // Verify that the three Docker files are created
    const writeFileCalls = mockedWriteFile.mock.calls.map(c => String(c[0]));

    const hasDockerfile = writeFileCalls.some(p => p.endsWith('Dockerfile'));
    const hasDockerCompose = writeFileCalls.some(p => p.endsWith('docker-compose.yml'));
    const hasDockerIgnore = writeFileCalls.some(p => p.endsWith('.dockerignore'));

    expect(hasDockerfile).toBe(true);
    expect(hasDockerCompose).toBe(true);
    expect(hasDockerIgnore).toBe(true);

    expect(logger.success).toHaveBeenCalledWith('Docker added successfully!');
  });
});

// ---------------------------------------------------------------------------
// addCommand - vitest integration
// ---------------------------------------------------------------------------

describe('addCommand - vitest', () => {
  it('should install devDependencies, create config and example test', async () => {
    mockFullAddFlow();

    await addCommand('vitest');

    expect(logger.title).toHaveBeenCalledWith('Adding Vitest');

    // Should install vitest, @vitest/coverage-v8, @vitest/ui as devDeps
    expect(mockedExecSync).toHaveBeenCalledWith(
      expect.stringContaining('vitest'),
      expect.any(Object)
    );

    // Should create vitest.config.ts
    expect(mockedWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('vitest.config.ts'),
      expect.stringContaining('defineConfig')
    );

    // Should create example test file
    expect(mockedWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('example.test.ts'),
      expect.stringContaining('should pass')
    );

    expect(logger.success).toHaveBeenCalledWith('Vitest added successfully!');
  });
});

// ---------------------------------------------------------------------------
// addCommand - interactive mode (no name)
// ---------------------------------------------------------------------------

describe('addCommand - interactive mode', () => {
  it('should use prompts when no integration name is provided', async () => {
    mockFullAddFlow();
    mockedPrompts.mockResolvedValueOnce({ integration: 'sentry' } as any);

    await addCommand();

    expect(mockedPrompts).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'select',
        name: 'integration',
        message: 'Which integration would you like to add?',
      })
    );

    expect(logger.title).toHaveBeenCalledWith('Adding Sentry');
    expect(logger.success).toHaveBeenCalledWith('Sentry added successfully!');
  });

  it('should exit gracefully when no integration is selected in interactive mode', async () => {
    mockProjectWithNpm();
    mockedPrompts.mockResolvedValueOnce({} as any);

    await addCommand();

    expect(logger.info).toHaveBeenCalledWith('No integration selected');
    expect(processExitSpy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// addCommand - package manager detection
// ---------------------------------------------------------------------------

describe('addCommand - package manager detection', () => {
  it('should use pnpm when pnpm-lock.yaml exists', async () => {
    mockedAccess.mockImplementation(async (path: any) => {
      const p = String(path);
      if (p.endsWith('package.json')) return undefined;
      if (p.endsWith('pnpm-lock.yaml')) return undefined;
      throw new Error('ENOENT');
    });
    mockedReadFile.mockResolvedValue(
      JSON.stringify({ name: 'test-app', scripts: {} }) as any
    );
    mockedWriteFile.mockResolvedValue(undefined);
    mockedExecSync.mockReturnValue('' as any);

    await addCommand('sentry');

    // sentry has only dependencies (no devDependencies)
    expect(mockedExecSync).toHaveBeenCalledWith(
      expect.stringContaining('pnpm add'),
      expect.any(Object)
    );
  });

  it('should use yarn when yarn.lock exists', async () => {
    mockedAccess.mockImplementation(async (path: any) => {
      const p = String(path);
      if (p.endsWith('package.json')) return undefined;
      if (p.endsWith('yarn.lock')) return undefined;
      throw new Error('ENOENT');
    });
    mockedReadFile.mockResolvedValue(
      JSON.stringify({ name: 'test-app', scripts: {} }) as any
    );
    mockedWriteFile.mockResolvedValue(undefined);
    mockedExecSync.mockReturnValue('' as any);

    await addCommand('sentry');

    expect(mockedExecSync).toHaveBeenCalledWith(
      expect.stringContaining('yarn add'),
      expect.any(Object)
    );
  });

  it('should use bun when bun.lockb exists', async () => {
    mockedAccess.mockImplementation(async (path: any) => {
      const p = String(path);
      if (p.endsWith('package.json')) return undefined;
      if (p.endsWith('bun.lockb')) return undefined;
      throw new Error('ENOENT');
    });
    mockedReadFile.mockResolvedValue(
      JSON.stringify({ name: 'test-app', scripts: {} }) as any
    );
    mockedWriteFile.mockResolvedValue(undefined);
    mockedExecSync.mockReturnValue('' as any);

    await addCommand('sentry');

    expect(mockedExecSync).toHaveBeenCalledWith(
      expect.stringContaining('bun add'),
      expect.any(Object)
    );
  });
});

// ---------------------------------------------------------------------------
// addCommand - scripts added to package.json
// ---------------------------------------------------------------------------

describe('addCommand - scripts update', () => {
  it('should merge new scripts into existing package.json scripts', async () => {
    mockProjectWithNpm();
    mockedReadFile.mockResolvedValue(
      JSON.stringify({
        name: 'test-app',
        scripts: { dev: 'tsx watch src/index.ts', build: 'tsup' },
      }) as any
    );
    mockedWriteFile.mockResolvedValue(undefined);
    mockedExecSync.mockReturnValue('' as any);

    await addCommand('vitest');

    // Find the writeFile call for package.json
    const pkgWriteCall = mockedWriteFile.mock.calls.find(c =>
      String(c[0]).endsWith('package.json')
    );
    expect(pkgWriteCall).toBeDefined();

    const writtenPkg = JSON.parse(pkgWriteCall![1] as string);
    // Original scripts should still exist
    expect(writtenPkg.scripts.dev).toBe('tsx watch src/index.ts');
    expect(writtenPkg.scripts.build).toBe('tsup');
    // New scripts should be added
    expect(writtenPkg.scripts.test).toBe('vitest');
    expect(writtenPkg.scripts['test:ui']).toBe('vitest --ui');
    expect(writtenPkg.scripts['test:coverage']).toBe('vitest run --coverage');
  });
});
