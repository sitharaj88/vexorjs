/**
 * Test command — detection + plan tests
 *
 * The runtime spawn path is not exercised here (would require an actual
 * project). We test the pure detection and plan logic.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { mkdtemp, writeFile, rm, } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { detectRunner, planRunner } from '../commands/test.js';

async function makeTempProject(pkgJson: Record<string, unknown>) {
  const dir = await mkdtemp(join(tmpdir(), 'vexor-test-cmd-'));
  await writeFile(join(dir, 'package.json'), JSON.stringify(pkgJson, null, 2));
  return dir;
}

describe('detectRunner', () => {
  let cleanup: string[] = [];

  afterEach(async () => {
    for (const dir of cleanup) {
      await rm(dir, { recursive: true, force: true });
    }
    cleanup = [];
  });

  it('detects vitest from devDependencies', async () => {
    const dir = await makeTempProject({
      name: 'x',
      devDependencies: { vitest: '^2.0.0' },
    });
    cleanup.push(dir);
    expect(await detectRunner(dir)).toBe('vitest');
  });

  it('detects jest from dependencies', async () => {
    const dir = await makeTempProject({
      name: 'x',
      dependencies: { jest: '^29.0.0' },
    });
    cleanup.push(dir);
    expect(await detectRunner(dir)).toBe('jest');
  });

  it('detects mocha from devDependencies', async () => {
    const dir = await makeTempProject({
      name: 'x',
      devDependencies: { mocha: '^10.0.0' },
    });
    cleanup.push(dir);
    expect(await detectRunner(dir)).toBe('mocha');
  });

  it('falls back to vitest when scripts.test mentions vitest', async () => {
    const dir = await makeTempProject({
      name: 'x',
      scripts: { test: 'vitest run' },
    });
    cleanup.push(dir);
    expect(await detectRunner(dir)).toBe('vitest');
  });

  it('falls back to node-test when scripts.test uses "node --test"', async () => {
    const dir = await makeTempProject({
      name: 'x',
      scripts: { test: 'node --test tests/' },
    });
    cleanup.push(dir);
    expect(await detectRunner(dir)).toBe('node-test');
  });

  it('returns npm-script when only a generic test script is present', async () => {
    const dir = await makeTempProject({
      name: 'x',
      scripts: { test: 'echo "no tests"' },
    });
    cleanup.push(dir);
    expect(await detectRunner(dir)).toBe('npm-script');
  });

  it('falls back to node-test when no clue is found', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vexor-test-empty-'));
    cleanup.push(dir);
    await writeFile(join(dir, 'package.json'), JSON.stringify({ name: 'empty' }));
    expect(await detectRunner(dir)).toBe('node-test');
  });

  it('returns npm-script when package.json is unreadable', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vexor-test-broken-'));
    cleanup.push(dir);
    // No package.json present
    expect(await detectRunner(dir)).toBe('npm-script');
  });
});

describe('planRunner', () => {
  it('vitest run by default', () => {
    expect(planRunner('vitest', {})).toEqual({
      runner: 'vitest',
      command: 'npx',
      args: ['vitest', 'run'],
    });
  });

  it('vitest watch + coverage + ui + pattern', () => {
    expect(
      planRunner('vitest', {
        watch: true,
        coverage: true,
        ui: true,
        pattern: 'auth',
      })
    ).toEqual({
      runner: 'vitest',
      command: 'npx',
      args: ['vitest', 'watch', '--coverage', '--ui', 'auth'],
    });
  });

  it('jest with coverage', () => {
    expect(planRunner('jest', { coverage: true })).toEqual({
      runner: 'jest',
      command: 'npx',
      args: ['jest', '--coverage'],
    });
  });

  it('jest with watch + pattern', () => {
    expect(planRunner('jest', { watch: true, pattern: 'users' })).toEqual({
      runner: 'jest',
      command: 'npx',
      args: ['jest', '--watch', 'users'],
    });
  });

  it('mocha with watch + pattern', () => {
    expect(planRunner('mocha', { watch: true, pattern: 'tests/foo.spec.ts' })).toEqual({
      runner: 'mocha',
      command: 'npx',
      args: ['mocha', '--watch', 'tests/foo.spec.ts'],
    });
  });

  it('node-test scans default directories when no pattern is given', () => {
    expect(planRunner('node-test', {})).toEqual({
      runner: 'node-test',
      command: 'node',
      args: ['--test', 'test/', 'tests/', 'src/'],
    });
  });

  it('node-test honors a pattern', () => {
    expect(planRunner('node-test', { pattern: 'tests/single.test.ts' })).toEqual({
      runner: 'node-test',
      command: 'node',
      args: ['--test', 'tests/single.test.ts'],
    });
  });

  it('npm-script falls back to npm test', () => {
    expect(planRunner('npm-script', { coverage: true })).toEqual({
      runner: 'npm-script',
      command: 'npm',
      args: ['test'],
    });
  });
});
