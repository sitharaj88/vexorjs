/**
 * OpenAPI Command Tests
 *
 * Tests for the openapi command (generate spec, validate spec).
 * Private helpers (normalizePath, generateOperationId, getTagFromFile,
 * toYaml, extractTags) are tested indirectly through the exported commands.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFile, writeFile, readdir } from 'fs/promises';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readdir: vi.fn(),
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

// ---------------------------------------------------------------------------
// Imports under test
// ---------------------------------------------------------------------------

import { openapiCommand, validateCommand } from '../commands/openapi.js';
import { logger } from '../utils/logger.js';
import ora from 'ora';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_CWD = '/tmp/test-project';

const mockedReadFile = vi.mocked(readFile);
const mockedWriteFile = vi.mocked(writeFile);
const mockedReaddir = vi.mocked(readdir);
const mockedOra = vi.mocked(ora);

/**
 * Return the spinner mock instance from the last ora() call.
 */
function getSpinner() {
  return mockedOra.mock.results[0]?.value as ReturnType<typeof ora>;
}

/**
 * Get the content written to writeFile.
 */
function getWrittenContent(): string {
  return mockedWriteFile.mock.calls[0]?.[1] as string ?? '';
}

/**
 * Get the parsed JSON from writeFile (for JSON format).
 */
function getWrittenJSON(): Record<string, unknown> {
  return JSON.parse(getWrittenContent());
}

/**
 * Set up route file mocks: readdir returns filenames, readFile returns content.
 */
function mockRouteFiles(files: Record<string, string>) {
  const filenames = Object.keys(files);
  mockedReaddir.mockResolvedValue(filenames as unknown as Awaited<ReturnType<typeof readdir>>);
  mockedReadFile.mockImplementation(async (p) => {
    const pathStr = String(p);
    for (const [name, content] of Object.entries(files)) {
      if (pathStr.endsWith(name)) return content;
    }
    throw new Error(`ENOENT: ${pathStr}`);
  });
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

let exitSpy: ReturnType<typeof vi.spyOn>;
let cwdSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(TEST_CWD);
  exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
    throw new Error('process.exit');
  }) as never);
  mockedWriteFile.mockResolvedValue(undefined);
});

afterEach(() => {
  cwdSpy.mockRestore();
  exitSpy.mockRestore();
});

// ===========================================================================
// openapiCommand - basic generation
// ===========================================================================

describe('openapiCommand', () => {
  it('should generate JSON spec by default', async () => {
    // No routes found (readdir throws)
    mockedReaddir.mockRejectedValue(new Error('ENOENT'));

    await openapiCommand();

    expect(mockedWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('openapi.json'),
      expect.any(String),
    );
    const content = getWrittenContent();
    // Should be valid JSON
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it('should generate YAML output when format is yaml', async () => {
    mockedReaddir.mockRejectedValue(new Error('ENOENT'));

    await openapiCommand({ format: 'yaml' });

    expect(mockedWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('openapi.yaml'),
      expect.any(String),
    );
    const content = getWrittenContent();
    // YAML should NOT be valid JSON
    expect(() => JSON.parse(content)).toThrow();
    // Should contain YAML-like content
    expect(content).toContain('openapi:');
  });

  it('should use custom title when provided', async () => {
    mockedReaddir.mockRejectedValue(new Error('ENOENT'));

    await openapiCommand({ title: 'My Custom API' });

    const spec = getWrittenJSON();
    expect((spec.info as Record<string, unknown>).title).toBe('My Custom API');
  });

  it('should use custom version when provided', async () => {
    mockedReaddir.mockRejectedValue(new Error('ENOENT'));

    await openapiCommand({ version: '2.5.0' });

    const spec = getWrittenJSON();
    expect((spec.info as Record<string, unknown>).version).toBe('2.5.0');
  });

  it('should use default title "Vexor API" when not provided', async () => {
    mockedReaddir.mockRejectedValue(new Error('ENOENT'));

    await openapiCommand();

    const spec = getWrittenJSON();
    expect((spec.info as Record<string, unknown>).title).toBe('Vexor API');
  });

  it('should use default version "1.0.0" when not provided', async () => {
    mockedReaddir.mockRejectedValue(new Error('ENOENT'));

    await openapiCommand();

    const spec = getWrittenJSON();
    expect((spec.info as Record<string, unknown>).version).toBe('1.0.0');
  });

  it('should use custom server URL when provided', async () => {
    mockedReaddir.mockRejectedValue(new Error('ENOENT'));

    await openapiCommand({ server: 'https://api.myapp.com' });

    const spec = getWrittenJSON();
    const servers = spec.servers as Array<{ url: string }>;
    expect(servers).toHaveLength(1);
    expect(servers[0].url).toBe('https://api.myapp.com');
  });

  it('should use default servers (dev + prod) when no server provided', async () => {
    mockedReaddir.mockRejectedValue(new Error('ENOENT'));

    await openapiCommand();

    const spec = getWrittenJSON();
    const servers = spec.servers as Array<{ url: string }>;
    expect(servers).toHaveLength(2);
    expect(servers[0].url).toBe('http://localhost:3000');
    expect(servers[1].url).toBe('https://api.example.com');
  });

  it('should set openapi version to 3.0.3', async () => {
    mockedReaddir.mockRejectedValue(new Error('ENOENT'));

    await openapiCommand();

    const spec = getWrittenJSON();
    expect(spec.openapi).toBe('3.0.3');
  });

  it('should warn user when no routes are found', async () => {
    mockedReaddir.mockRejectedValue(new Error('ENOENT'));

    await openapiCommand();

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('No routes found'),
    );
  });

  it('should write to custom output file when provided', async () => {
    mockedReaddir.mockRejectedValue(new Error('ENOENT'));

    await openapiCommand({ output: 'docs/api-spec.json' });

    expect(mockedWriteFile).toHaveBeenCalledWith(
      resolve(TEST_CWD, 'docs/api-spec.json'),
      expect.any(String),
    );
  });
});

// ===========================================================================
// openapiCommand - route parsing
// ===========================================================================

describe('openapiCommand - route parsing', () => {
  it('should parse GET routes from route files', async () => {
    mockRouteFiles({
      'users.ts': `
        app.get('/users', handler);
      `,
    });

    await openapiCommand();

    const spec = getWrittenJSON();
    const paths = spec.paths as Record<string, Record<string, unknown>>;
    expect(paths['/users']).toBeDefined();
    expect(paths['/users'].get).toBeDefined();
  });

  it('should parse POST routes from route files', async () => {
    mockRouteFiles({
      'users.ts': `
        app.post('/users', handler);
      `,
    });

    await openapiCommand();

    const spec = getWrittenJSON();
    const paths = spec.paths as Record<string, Record<string, unknown>>;
    expect(paths['/users']).toBeDefined();
    expect(paths['/users'].post).toBeDefined();
  });

  it('should parse multiple HTTP methods for the same path', async () => {
    mockRouteFiles({
      'users.ts': `
        app.get('/users', listHandler);
        app.post('/users', createHandler);
      `,
    });

    await openapiCommand();

    const spec = getWrittenJSON();
    const paths = spec.paths as Record<string, Record<string, unknown>>;
    expect(paths['/users'].get).toBeDefined();
    expect(paths['/users'].post).toBeDefined();
  });

  it('should normalize :param to {param} in paths (normalizePath)', async () => {
    mockRouteFiles({
      'users.ts': `
        app.get('/users/:id', getHandler);
      `,
    });

    await openapiCommand();

    const spec = getWrittenJSON();
    const paths = spec.paths as Record<string, Record<string, unknown>>;
    expect(paths['/users/{id}']).toBeDefined();
    expect(paths['/users/:id']).toBeUndefined();
  });

  it('should generate correct operationId (generateOperationId)', async () => {
    mockRouteFiles({
      'users.ts': `
        app.get('/users/:id', getHandler);
      `,
    });

    await openapiCommand();

    const spec = getWrittenJSON();
    const paths = spec.paths as Record<string, Record<string, unknown>>;
    const getOp = paths['/users/{id}']?.get as Record<string, unknown>;
    expect(getOp.operationId).toBe('getUsersById');
  });

  it('should extract tag from file name (getTagFromFile)', async () => {
    mockRouteFiles({
      'products.ts': `
        app.get('/products', listHandler);
      `,
    });

    await openapiCommand();

    const spec = getWrittenJSON();
    const paths = spec.paths as Record<string, Record<string, unknown>>;
    const getOp = paths['/products']?.get as Record<string, unknown>;
    expect((getOp.tags as string[])[0]).toBe('Products');
  });

  it('should collect unique tags in the spec (extractTags)', async () => {
    mockRouteFiles({
      'users.ts': `
        app.get('/users', listUsers);
        app.post('/users', createUser);
      `,
      'orders.ts': `
        app.get('/orders', listOrders);
      `,
    });

    await openapiCommand();

    const spec = getWrittenJSON();
    const tags = spec.tags as Array<{ name: string }>;
    const tagNames = tags.map((t) => t.name);
    expect(tagNames).toContain('Users');
    expect(tagNames).toContain('Orders');
    // Should be unique - no duplicates
    expect(tagNames.filter((n) => n === 'Users')).toHaveLength(1);
  });

  it('should not warn about missing routes when routes are found', async () => {
    mockRouteFiles({
      'health.ts': `
        app.get('/health', handler);
      `,
    });

    await openapiCommand();

    expect(logger.warn).not.toHaveBeenCalledWith(
      expect.stringContaining('No routes found'),
    );
  });
});

// ===========================================================================
// validateCommand
// ===========================================================================

describe('validateCommand', () => {
  it('should validate a correct OpenAPI spec successfully', async () => {
    const validSpec = JSON.stringify({
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            responses: { '200': { description: 'OK' } },
          },
        },
      },
    });
    mockedReadFile.mockResolvedValue(validSpec);

    await validateCommand();

    const spinner = getSpinner();
    expect(spinner.succeed).toHaveBeenCalledWith(expect.stringContaining('valid'));
  });

  it('should report missing openapi version field', async () => {
    const spec = JSON.stringify({
      info: { title: 'Test', version: '1.0.0' },
      paths: { '/test': { get: { responses: { '200': {} } } } },
    });
    mockedReadFile.mockResolvedValue(spec);

    await validateCommand();

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Missing openapi version'));
  });

  it('should report when openapi version is not 3.x', async () => {
    const spec = JSON.stringify({
      openapi: '2.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: { '/test': { get: { responses: { '200': {} } } } },
    });
    mockedReadFile.mockResolvedValue(spec);

    await validateCommand();

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('may not be fully supported'));
  });

  it('should report missing info.title', async () => {
    const spec = JSON.stringify({
      openapi: '3.0.3',
      info: { version: '1.0.0' },
      paths: { '/test': { get: { responses: { '200': {} } } } },
    });
    mockedReadFile.mockResolvedValue(spec);

    await validateCommand();

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Missing info.title'));
  });

  it('should report missing info.version', async () => {
    const spec = JSON.stringify({
      openapi: '3.0.3',
      info: { title: 'Test' },
      paths: { '/test': { get: { responses: { '200': {} } } } },
    });
    mockedReadFile.mockResolvedValue(spec);

    await validateCommand();

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Missing info.version'));
  });

  it('should report when no paths are defined', async () => {
    const spec = JSON.stringify({
      openapi: '3.0.3',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    });
    mockedReadFile.mockResolvedValue(spec);

    await validateCommand();

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('No paths defined'));
  });

  it('should report missing responses in operations', async () => {
    const spec = JSON.stringify({
      openapi: '3.0.3',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/users': {
          get: { summary: 'List users' },
        },
      },
    });
    mockedReadFile.mockResolvedValue(spec);

    await validateCommand();

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('GET /users: Missing responses'),
    );
  });

  it('should use default file openapi.json when none provided', async () => {
    const spec = JSON.stringify({
      openapi: '3.0.3',
      info: { title: 'Test', version: '1.0.0' },
      paths: { '/test': { get: { responses: { '200': {} } } } },
    });
    mockedReadFile.mockResolvedValue(spec);

    await validateCommand();

    expect(mockedReadFile).toHaveBeenCalledWith(
      resolve(TEST_CWD, 'openapi.json'),
      'utf-8',
    );
  });

  it('should use custom file when provided', async () => {
    const spec = JSON.stringify({
      openapi: '3.0.3',
      info: { title: 'Test', version: '1.0.0' },
      paths: { '/test': { get: { responses: { '200': {} } } } },
    });
    mockedReadFile.mockResolvedValue(spec);

    await validateCommand('docs/spec.json');

    expect(mockedReadFile).toHaveBeenCalledWith(
      resolve(TEST_CWD, 'docs/spec.json'),
      'utf-8',
    );
  });

  it('should call process.exit(1) when file cannot be read', async () => {
    mockedReadFile.mockRejectedValue(new Error('ENOENT: file not found'));

    await expect(validateCommand()).rejects.toThrow('process.exit');

    const spinner = getSpinner();
    expect(spinner.fail).toHaveBeenCalledWith(
      expect.stringContaining('Failed to validate'),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should call process.exit(1) when file contains invalid JSON', async () => {
    mockedReadFile.mockResolvedValue('not valid json {{{');

    await expect(validateCommand()).rejects.toThrow('process.exit');

    const spinner = getSpinner();
    expect(spinner.fail).toHaveBeenCalled();
  });

  it('should report issue count via spinner.warn', async () => {
    const spec = JSON.stringify({
      openapi: '3.0.3',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/a': { get: { summary: 'no responses' } },
        '/b': { post: { summary: 'also no responses' } },
      },
    });
    mockedReadFile.mockResolvedValue(spec);

    await validateCommand();

    const spinner = getSpinner();
    expect(spinner.warn).toHaveBeenCalledWith(expect.stringContaining('2 issue(s)'));
  });
});
