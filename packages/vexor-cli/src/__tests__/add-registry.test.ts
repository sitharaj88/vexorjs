/**
 * Pluggable integration registry tests.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  registerIntegration,
  unregisterIntegration,
  getRegisteredIntegrations,
  clearRegistry,
  loadProjectIntegrations,
  resolveAllIntegrations,
  validateIntegration,
  type Integration,
} from '../commands/add-registry.js';

const sampleIntegration: Integration = {
  name: 'Custom Logger',
  description: 'Adds a structured logger',
  packages: { dependencies: ['pino'] },
};

describe('registerIntegration', () => {
  beforeEach(() => clearRegistry());

  it('registers an integration and exposes it via getRegisteredIntegrations', () => {
    registerIntegration('logger', sampleIntegration);
    expect(getRegisteredIntegrations()).toEqual({ logger: sampleIntegration });
  });

  it('unregisterIntegration removes it', () => {
    registerIntegration('logger', sampleIntegration);
    expect(unregisterIntegration('logger')).toBe(true);
    expect(getRegisteredIntegrations()).toEqual({});
  });

  it('overwrites prior registration with the same name', () => {
    registerIntegration('x', sampleIntegration);
    registerIntegration('x', { ...sampleIntegration, name: 'Renamed' });
    expect(getRegisteredIntegrations().x.name).toBe('Renamed');
  });
});

describe('validateIntegration', () => {
  it('accepts a well-formed integration', () => {
    const result = validateIntegration(sampleIntegration);
    expect(result.kind).toBe('ok');
  });

  it('rejects non-objects', () => {
    expect(validateIntegration('hello').kind).toBe('err');
    expect(validateIntegration(null).kind).toBe('err');
  });

  it('requires "name"', () => {
    const r = validateIntegration({
      key: 'x',
      description: 'd',
      packages: {},
    });
    expect(r.kind).toBe('err');
  });

  it('requires "description" to be a string', () => {
    const r = validateIntegration({
      name: 'x',
      packages: {},
    });
    expect(r.kind).toBe('err');
  });

  it('requires "packages" to be an object', () => {
    const r = validateIntegration({
      name: 'x',
      description: 'd',
      packages: 'no',
    });
    expect(r.kind).toBe('err');
  });

  it('rejects non-string-array dependencies', () => {
    const r = validateIntegration({
      name: 'x',
      description: 'd',
      packages: { dependencies: [42] },
    });
    expect(r.kind).toBe('err');
  });

  it('uses "key" when provided, otherwise falls back to "name"', () => {
    const withKey = validateIntegration({
      key: 'cool-key',
      name: 'Cool',
      description: 'd',
      packages: {},
    });
    expect(withKey).toMatchObject({ kind: 'ok', name: 'cool-key' });

    const noKey = validateIntegration({
      name: 'Just A Name',
      description: 'd',
      packages: {},
    });
    expect(noKey).toMatchObject({ kind: 'ok', name: 'Just A Name' });
  });

  it('rejects scripts that are not Record<string,string>', () => {
    const r = validateIntegration({
      name: 'x',
      description: 'd',
      packages: {},
      scripts: { build: 1 },
    });
    expect(r.kind).toBe('err');
  });
});

describe('loadProjectIntegrations', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'vexor-add-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('returns empty when .vexor/integrations does not exist', async () => {
    const result = await loadProjectIntegrations(tmpDir);
    expect(result.loaded).toEqual({});
    expect(result.warnings).toEqual([]);
  });

  it('loads a single integration from a JSON file', async () => {
    const dir = join(tmpDir, '.vexor', 'integrations');
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, 'pino.json'),
      JSON.stringify({
        key: 'pino',
        name: 'Pino logger',
        description: 'Fast logger',
        packages: { dependencies: ['pino'] },
      })
    );

    const result = await loadProjectIntegrations(tmpDir);
    expect(result.loaded).toHaveProperty('pino');
    expect(result.loaded.pino.name).toBe('Pino logger');
  });

  it('loads multiple integrations from an array file', async () => {
    const dir = join(tmpDir, '.vexor', 'integrations');
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, 'extras.json'),
      JSON.stringify([
        {
          key: 'a',
          name: 'A',
          description: 'A pkg',
          packages: {},
        },
        {
          key: 'b',
          name: 'B',
          description: 'B pkg',
          packages: {},
        },
      ])
    );

    const result = await loadProjectIntegrations(tmpDir);
    expect(Object.keys(result.loaded).sort()).toEqual(['a', 'b']);
  });

  it('skips non-JSON files', async () => {
    const dir = join(tmpDir, '.vexor', 'integrations');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'README.md'), '# notes');
    const result = await loadProjectIntegrations(tmpDir);
    expect(result.warnings).toEqual([]);
    expect(result.loaded).toEqual({});
  });

  it('warns on invalid JSON', async () => {
    const dir = join(tmpDir, '.vexor', 'integrations');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'bad.json'), '{not json');
    const result = await loadProjectIntegrations(tmpDir);
    expect(result.warnings.some((w) => w.includes('bad.json'))).toBe(true);
    expect(result.loaded).toEqual({});
  });

  it('warns on schema-invalid integrations and skips them', async () => {
    const dir = join(tmpDir, '.vexor', 'integrations');
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, 'broken.json'),
      JSON.stringify({ name: 'x' /* missing description, packages */ })
    );
    const result = await loadProjectIntegrations(tmpDir);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.loaded).toEqual({});
  });
});

describe('resolveAllIntegrations', () => {
  let tmpDir: string;

  beforeEach(async () => {
    clearRegistry();
    tmpDir = await mkdtemp(join(tmpdir(), 'vexor-add-resolve-'));
  });

  afterEach(async () => {
    clearRegistry();
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('merges built-ins, runtime registrations, and project-local definitions', async () => {
    const builtIns = {
      base: {
        name: 'Base',
        description: 'built-in',
        packages: {},
      } satisfies Integration,
    };

    registerIntegration('runtime', sampleIntegration);

    const dir = join(tmpDir, '.vexor', 'integrations');
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, 'project.json'),
      JSON.stringify({
        key: 'project',
        name: 'Project-only',
        description: 'd',
        packages: {},
      })
    );

    const { all } = await resolveAllIntegrations(builtIns, tmpDir);
    expect(Object.keys(all).sort()).toEqual([
      'base',
      'project',
      'runtime',
    ]);
  });

  it('project-local integrations override runtime which override built-ins', async () => {
    const builtIns = {
      same: {
        name: 'BuiltIn',
        description: 'b',
        packages: {},
      } satisfies Integration,
    };
    registerIntegration('same', {
      name: 'Runtime',
      description: 'r',
      packages: {},
    });

    const dir = join(tmpDir, '.vexor', 'integrations');
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, 'same.json'),
      JSON.stringify({
        key: 'same',
        name: 'Project',
        description: 'p',
        packages: {},
      })
    );

    const { all } = await resolveAllIntegrations(builtIns, tmpDir);
    expect(all.same.name).toBe('Project');
  });
});
