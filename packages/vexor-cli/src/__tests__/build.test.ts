/**
 * Build Command Tests
 *
 * Tests for buildCommand. The private functions (detectBuildTool, runBuild,
 * buildWithTsup) are tested indirectly through the exported buildCommand
 * by mocking file system access and child_process.spawn.
 */

import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';

type SpawnOnHandler = (event: string, cb: (...args: any[]) => void) => void;

const mockSpawnOn = vi.fn();
const mockSpawnInstance = {
  on: mockSpawnOn,
  stdout: null,
  stderr: null,
};

vi.mock('child_process', () => ({
  spawn: vi.fn(() => mockSpawnInstance),
}));

vi.mock('fs/promises', () => ({
  access: vi.fn(),
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
}));

import { spawn } from 'child_process';
import { access, readFile, writeFile } from 'fs/promises';
import { buildCommand } from '../commands/build.js';

const mockedSpawn = vi.mocked(spawn);
const mockedAccess = vi.mocked(access);
const mockedReadFile = vi.mocked(readFile);
const mockedWriteFile = vi.mocked(writeFile);

let consoleLogSpy: MockInstance;

beforeEach(() => {
  vi.clearAllMocks();
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  // Default: make spawn call exit(0) on the 'exit' event listener
  mockSpawnOn.mockImplementation((event: string, cb: (...args: any[]) => void) => {
    if (event === 'exit') {
      setTimeout(() => cb(0), 10);
    }
  });
});

afterEach(() => {
  consoleLogSpy.mockRestore();
});

/**
 * Helper: mock no config files found and no tsup in dependencies.
 * This causes detectBuildTool to return null, triggering the fallback.
 */
function mockNoBuildTool(): void {
  mockedAccess.mockRejectedValue(new Error('ENOENT'));
  mockedReadFile.mockRejectedValue(new Error('ENOENT'));
}

/**
 * Helper: mock tsup.config.ts found.
 */
function mockTsupConfigExists(): void {
  mockedAccess.mockImplementation(async (path: any) => {
    const p = String(path);
    if (p.endsWith('tsup.config.ts')) return undefined;
    throw new Error('ENOENT');
  });
}

/**
 * Helper: mock esbuild.config.js found.
 */
function mockEsbuildConfigExists(): void {
  mockedAccess.mockImplementation(async (path: any) => {
    const p = String(path);
    if (p.endsWith('esbuild.config.js')) return undefined;
    throw new Error('ENOENT');
  });
  // readFile for package.json should fail so we don't detect tsup from deps
  mockedReadFile.mockRejectedValue(new Error('ENOENT'));
}

/**
 * Helper: mock tsup in devDependencies (no config file).
 */
function mockTsupInDeps(): void {
  mockedAccess.mockRejectedValue(new Error('ENOENT'));
  mockedReadFile.mockResolvedValue(
    JSON.stringify({ devDependencies: { tsup: '^8.0.0' } }) as any
  );
}

// ---------------------------------------------------------------------------
// buildCommand with tsup config detected
// ---------------------------------------------------------------------------

describe('buildCommand - tsup config detected', () => {
  it('should detect tsup.config.ts and use tsup as the build tool', async () => {
    mockTsupConfigExists();

    const buildPromise = buildCommand({ output: 'dist', target: 'node', minify: false });
    await buildPromise;

    expect(mockedSpawn).toHaveBeenCalledWith(
      'npx',
      expect.arrayContaining(['tsup']),
      expect.any(Object)
    );

    const allLogs = consoleLogSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(allLogs).toContain('Build tool: tsup');
  });

  it('should pass --outDir with the resolved output path', async () => {
    mockTsupConfigExists();

    const buildPromise = buildCommand({ output: 'dist', target: 'node' });
    await buildPromise;

    const args = mockedSpawn.mock.calls[0][1] as string[];
    expect(args).toContain('--outDir');
  });
});

// ---------------------------------------------------------------------------
// buildCommand with no build tool (fallback to tsup)
// ---------------------------------------------------------------------------

describe('buildCommand - fallback to tsup', () => {
  it('should fall back to tsup when no build tool is detected', async () => {
    mockNoBuildTool();

    const buildPromise = buildCommand({ output: 'dist', target: 'node' });
    await buildPromise;

    const allLogs = consoleLogSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(allLogs).toContain('Using tsup for build');

    // Should write a temporary tsup config
    expect(mockedWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('tsup.config.temp.ts'),
      expect.stringContaining('defineConfig')
    );
  });

  it('should create temp config with node20 target for node target', async () => {
    mockNoBuildTool();

    const buildPromise = buildCommand({ output: 'dist', target: 'node' });
    await buildPromise;

    const configContent = mockedWriteFile.mock.calls[0][1] as string;
    expect(configContent).toContain('node20');
  });
});

// ---------------------------------------------------------------------------
// buildCommand with edge target
// ---------------------------------------------------------------------------

describe('buildCommand - edge target', () => {
  it('should set es2022 target when target is edge', async () => {
    mockTsupConfigExists();

    const buildPromise = buildCommand({ output: 'dist', target: 'edge' });
    await buildPromise;

    const args = mockedSpawn.mock.calls[0][1] as string[];
    expect(args).toContain('es2022');
  });

  it('should include browser platform config in fallback for edge target', async () => {
    mockNoBuildTool();

    const buildPromise = buildCommand({ output: 'dist', target: 'edge' });
    await buildPromise;

    const configContent = mockedWriteFile.mock.calls[0][1] as string;
    expect(configContent).toContain('es2022');
    expect(configContent).toContain('browser');
  });
});

// ---------------------------------------------------------------------------
// buildCommand with minify option
// ---------------------------------------------------------------------------

describe('buildCommand - minify option', () => {
  it('should pass --minify flag when minify is true', async () => {
    mockTsupConfigExists();

    const buildPromise = buildCommand({ output: 'dist', target: 'node', minify: true });
    await buildPromise;

    const args = mockedSpawn.mock.calls[0][1] as string[];
    expect(args).toContain('--minify');

    const allLogs = consoleLogSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(allLogs).toContain('Minify: enabled');
  });

  it('should include minify in fallback temp config when minify is true', async () => {
    mockNoBuildTool();

    const buildPromise = buildCommand({ output: 'dist', target: 'node', minify: true });
    await buildPromise;

    const configContent = mockedWriteFile.mock.calls[0][1] as string;
    expect(configContent).toContain('minify: true');
  });
});

// ---------------------------------------------------------------------------
// buildCommand - detectBuildTool indirectly (esbuild, tsup in deps)
// ---------------------------------------------------------------------------

describe('buildCommand - esbuild config detection', () => {
  it('should detect esbuild.config.js and use esbuild as the build tool', async () => {
    mockEsbuildConfigExists();

    const buildPromise = buildCommand({ output: 'dist', target: 'node' });
    await buildPromise;

    const allLogs = consoleLogSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(allLogs).toContain('Build tool: esbuild');

    const args = mockedSpawn.mock.calls[0][1] as string[];
    expect(args).toContain('esbuild');
    expect(args).toContain('--bundle');
  });
});

describe('buildCommand - tsup in dependencies', () => {
  it('should detect tsup in devDependencies when no config file exists', async () => {
    mockTsupInDeps();

    const buildPromise = buildCommand({ output: 'dist', target: 'node' });
    await buildPromise;

    const allLogs = consoleLogSpy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(allLogs).toContain('Build tool: tsup');
  });
});
