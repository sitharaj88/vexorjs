/**
 * Integration registry — pluggable.
 *
 * Built-in integrations live in `add.ts`. This module exposes the type plus
 * a runtime registry that supports:
 *
 *   1. `registerIntegration(name, def)` — programmatic registration
 *   2. `loadProjectIntegrations(cwd)`   — load user-defined integrations from
 *      `.vexor/integrations/*.json` in the project root
 *
 * The CLI consults the merged registry before failing with "unknown
 * integration", so users can extend `vexor add` without forking the CLI.
 */

import { readdir, readFile, access } from 'node:fs/promises';
import { join, resolve } from 'node:path';

export interface Integration {
  name: string;
  description: string;
  packages: {
    dependencies?: string[];
    devDependencies?: string[];
  };
  files?: Record<string, string>;
  scripts?: Record<string, string>;
  postInstall?: string[];
}

const customRegistry = new Map<string, Integration>();

/**
 * Register an integration at runtime. Returns the registry for chaining.
 * If `name` is already registered, it's overwritten.
 */
export function registerIntegration(
  name: string,
  integration: Integration
): Map<string, Integration> {
  customRegistry.set(name, integration);
  return customRegistry;
}

/**
 * Remove a runtime-registered integration. Built-ins cannot be unregistered.
 */
export function unregisterIntegration(name: string): boolean {
  return customRegistry.delete(name);
}

/** Read-only snapshot of the runtime-registered integrations. */
export function getRegisteredIntegrations(): Record<string, Integration> {
  return Object.fromEntries(customRegistry);
}

/** Reset (test helper). */
export function clearRegistry(): void {
  customRegistry.clear();
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load integration definitions from `<cwd>/.vexor/integrations/*.json`.
 * Each file may declare a single integration or an array of them.
 *
 * Files that fail to parse or that don't match the Integration shape are
 * skipped with a warning collected into the result.
 */
export async function loadProjectIntegrations(
  cwd: string = process.cwd()
): Promise<{
  loaded: Record<string, Integration>;
  warnings: string[];
}> {
  const dir = resolve(cwd, '.vexor', 'integrations');
  const warnings: string[] = [];
  const loaded: Record<string, Integration> = {};

  if (!(await fileExists(dir))) {
    return { loaded, warnings };
  }

  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch (err) {
    warnings.push(`Failed to read ${dir}: ${(err as Error).message}`);
    return { loaded, warnings };
  }

  for (const entry of entries) {
    if (!entry.endsWith('.json')) continue;
    const filePath = join(dir, entry);
    let content: string;
    try {
      content = await readFile(filePath, 'utf-8');
    } catch (err) {
      warnings.push(`Cannot read ${entry}: ${(err as Error).message}`);
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      warnings.push(`${entry}: invalid JSON — ${(err as Error).message}`);
      continue;
    }

    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) {
      const result = validateIntegration(item, entry);
      if (result.kind === 'ok') {
        loaded[result.name] = result.value;
      } else {
        warnings.push(result.message);
      }
    }
  }

  return { loaded, warnings };
}

type ValidationResult =
  | { kind: 'ok'; name: string; value: Integration }
  | { kind: 'err'; message: string };

/**
 * Verify a parsed JSON object matches the Integration contract. Each field
 * is checked individually so users get a precise error pointing at the
 * specific problem (rather than a generic "invalid integration").
 */
export function validateIntegration(
  value: unknown,
  source = 'integration'
): ValidationResult {
  if (typeof value !== 'object' || value === null) {
    return { kind: 'err', message: `${source}: not an object` };
  }
  const v = value as Record<string, unknown>;

  // The on-disk format uses a top-level `key` field for the registry name,
  // separate from the human-readable `name`. Fall back to `name` when no key
  // is provided so simple integrations still register.
  const key = (v.key ?? v.name) as unknown;
  if (typeof key !== 'string' || key.length === 0) {
    return { kind: 'err', message: `${source}: missing string "key" or "name"` };
  }
  if (typeof v.name !== 'string' || v.name.length === 0) {
    return { kind: 'err', message: `${source}: missing string "name"` };
  }
  if (typeof v.description !== 'string') {
    return { kind: 'err', message: `${source}: "description" must be a string` };
  }
  if (typeof v.packages !== 'object' || v.packages === null) {
    return { kind: 'err', message: `${source}: "packages" must be an object` };
  }

  const pkgs = v.packages as Record<string, unknown>;
  if (
    pkgs.dependencies !== undefined &&
    !isStringArray(pkgs.dependencies)
  ) {
    return {
      kind: 'err',
      message: `${source}: "packages.dependencies" must be string[]`,
    };
  }
  if (
    pkgs.devDependencies !== undefined &&
    !isStringArray(pkgs.devDependencies)
  ) {
    return {
      kind: 'err',
      message: `${source}: "packages.devDependencies" must be string[]`,
    };
  }
  if (v.files !== undefined && !isStringRecord(v.files)) {
    return {
      kind: 'err',
      message: `${source}: "files" must be Record<string, string>`,
    };
  }
  if (v.scripts !== undefined && !isStringRecord(v.scripts)) {
    return {
      kind: 'err',
      message: `${source}: "scripts" must be Record<string, string>`,
    };
  }
  if (v.postInstall !== undefined && !isStringArray(v.postInstall)) {
    return {
      kind: 'err',
      message: `${source}: "postInstall" must be string[]`,
    };
  }

  return {
    kind: 'ok',
    name: key,
    value: {
      name: v.name as string,
      description: v.description as string,
      packages: {
        dependencies: pkgs.dependencies as string[] | undefined,
        devDependencies: pkgs.devDependencies as string[] | undefined,
      },
      files: v.files as Record<string, string> | undefined,
      scripts: v.scripts as Record<string, string> | undefined,
      postInstall: v.postInstall as string[] | undefined,
    },
  };
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

function isStringRecord(v: unknown): v is Record<string, string> {
  if (typeof v !== 'object' || v === null) return false;
  return Object.values(v as Record<string, unknown>).every(
    (val) => typeof val === 'string'
  );
}

/**
 * Merge built-in + custom + project-local registries.
 * Project-local definitions override custom which override built-ins.
 */
export async function resolveAllIntegrations(
  builtIns: Record<string, Integration>,
  cwd: string = process.cwd()
): Promise<{ all: Record<string, Integration>; warnings: string[] }> {
  const { loaded, warnings } = await loadProjectIntegrations(cwd);
  return {
    all: {
      ...builtIns,
      ...getRegisteredIntegrations(),
      ...loaded,
    },
    warnings,
  };
}
