/**
 * Generate Command Tests
 *
 * Tests for the generate command (module, model, migration, route, service).
 * Private helpers (parseFields, mapFieldType, capitalize, pluralize) are
 * tested indirectly through the exported generateCommand function.
 */

import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { mkdir, writeFile, } from 'node:fs/promises';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  access: vi.fn().mockRejectedValue(new Error('not found')),
}));

// ---------------------------------------------------------------------------
// Imports under test
// ---------------------------------------------------------------------------

import { generateCommand } from '../commands/generate.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_CWD = '/tmp/test-project';

const mockedMkdir = vi.mocked(mkdir);
const mockedWriteFile = vi.mocked(writeFile);

/**
 * Collect all content written for a given filename suffix.
 */
function getWrittenFile(suffix: string): string | undefined {
  for (const call of mockedWriteFile.mock.calls) {
    if (String(call[0]).endsWith(suffix)) {
      return call[1] as string;
    }
  }
  return undefined;
}

/**
 * Get all written file paths.
 */
function getWrittenPaths(): string[] {
  return mockedWriteFile.mock.calls.map((c) => String(c[0]));
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

let exitSpy: MockInstance;
let cwdSpy: MockInstance;
let consoleLogSpy: MockInstance;
let consoleErrorSpy: MockInstance;

beforeEach(() => {
  vi.clearAllMocks();
  cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(TEST_CWD);
  exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
    throw new Error('process.exit');
  }) as never);
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  cwdSpy.mockRestore();
  exitSpy.mockRestore();
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});

// ===========================================================================
// Module generation
// ===========================================================================

describe('generateCommand - module', () => {
  it('should create the module directory with mkdir', async () => {
    await generateCommand('module', 'user', {});

    expect(mockedMkdir).toHaveBeenCalledWith(
      expect.stringContaining(join('src', 'modules', 'user')),
      { recursive: true },
    );
  });

  it('should create 4 files: routes, service, schema, index', async () => {
    await generateCommand('module', 'user', {});

    const paths = getWrittenPaths();
    expect(paths).toHaveLength(4);
    expect(paths.some((p) => p.endsWith('user.routes.ts'))).toBe(true);
    expect(paths.some((p) => p.endsWith('user.service.ts'))).toBe(true);
    expect(paths.some((p) => p.endsWith('user.schema.ts'))).toBe(true);
    expect(paths.some((p) => p.endsWith('index.ts'))).toBe(true);
  });

  it('should generate routes file with capitalized name in schema references', async () => {
    await generateCommand('module', 'product', {});

    const routes = getWrittenFile('product.routes.ts');
    expect(routes).toBeDefined();
    expect(routes).toContain('ProductSchema');
    expect(routes).toContain('CreateProductSchema');
    expect(routes).toContain("app.get('/products'");
    expect(routes).toContain("app.post('/products'");
  });

  it('should generate service file with class using the module name', async () => {
    await generateCommand('module', 'order', {});

    const service = getWrittenFile('order.service.ts');
    expect(service).toBeDefined();
    expect(service).toContain('class orderService');
    expect(service).toContain('findAll');
    expect(service).toContain('findById');
    expect(service).toContain('create');
    expect(service).toContain('update');
    expect(service).toContain('delete');
  });

  it('should generate index file that re-exports routes, service, and schema', async () => {
    await generateCommand('module', 'item', {});

    const index = getWrittenFile('index.ts');
    expect(index).toBeDefined();
    expect(index).toContain("itemRoutes");
    expect(index).toContain("itemService");
    expect(index).toContain("item.schema.js");
  });

  it('should use custom directory when provided', async () => {
    await generateCommand('module', 'auth', { directory: 'lib/mods' });

    expect(mockedMkdir).toHaveBeenCalledWith(
      expect.stringContaining(join('lib', 'mods', 'auth')),
      { recursive: true },
    );
  });

  it('should log success message after generation', async () => {
    await generateCommand('module', 'user', {});

    const allOutput = consoleLogSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(allOutput).toContain('Module generated successfully');
  });
});

// ===========================================================================
// Model generation
// ===========================================================================

describe('generateCommand - model', () => {
  it('should create model file with default field when no fields specified', async () => {
    await generateCommand('model', 'user', {});

    const model = getWrittenFile('user.model.ts');
    expect(model).toBeDefined();
    expect(model).toContain("column.varchar(255)()");
    expect(model).toContain('name:');
  });

  it('should parse and map string fields to varchar(255)', async () => {
    await generateCommand('model', 'user', { fields: 'email:string' });

    const model = getWrittenFile('user.model.ts');
    expect(model).toContain('email: column.varchar(255)()');
  });

  it('should parse and map int fields to integer', async () => {
    await generateCommand('model', 'user', { fields: 'age:int' });

    const model = getWrittenFile('user.model.ts');
    expect(model).toContain('age: column.integer()');
  });

  it('should parse and map boolean fields to boolean', async () => {
    await generateCommand('model', 'user', { fields: 'active:boolean' });

    const model = getWrittenFile('user.model.ts');
    expect(model).toContain('active: column.boolean()');
  });

  it('should parse complex fields with options (notNull, unique)', async () => {
    await generateCommand('model', 'user', {
      fields: 'name:string,age:int:notNull,email:string:unique',
    });

    const model = getWrittenFile('user.model.ts');
    expect(model).toBeDefined();
    expect(model).toContain("name: column.varchar(255)()");
    expect(model).toContain("age: column.integer().notNull()");
    expect(model).toContain("email: column.varchar(255)().unique()");
  });

  it('should handle primary key option', async () => {
    await generateCommand('model', 'token', {
      fields: 'code:uuid:primary',
    });

    const model = getWrittenFile('token.model.ts');
    expect(model).toContain('code: column.uuid().primaryKey()');
  });

  it('should map various field types correctly', async () => {
    await generateCommand('model', 'data', {
      fields: 'a:text,b:bigint,c:float,d:double,e:decimal,f:date,g:datetime,h:json,i:jsonb,j:uuid',
    });

    const model = getWrittenFile('data.model.ts');
    expect(model).toContain('column.text()');
    expect(model).toContain('column.bigint()');
    expect(model).toContain('column.real()');
    expect(model).toContain('column.doublePrecision()');
    expect(model).toContain('column.decimal()');
    expect(model).toContain('column.date()');
    expect(model).toContain('column.timestamp()');
    expect(model).toContain('column.json()');
    expect(model).toContain('column.jsonb()');
    expect(model).toContain('column.uuid()');
  });

  it('should map unknown types to varchar(255)', async () => {
    await generateCommand('model', 'custom', { fields: 'data:unknowntype' });

    const model = getWrittenFile('custom.model.ts');
    expect(model).toContain('column.varchar(255)()');
  });

  it('should include id, createdAt, and updatedAt columns', async () => {
    await generateCommand('model', 'user', { fields: 'name:string' });

    const model = getWrittenFile('user.model.ts');
    expect(model).toContain('id: column.serial().primaryKey()');
    expect(model).toContain('createdAt: column.timestamp().defaultNow()');
    expect(model).toContain('updatedAt: column.timestamp().defaultNow()');
  });

  it('should generate capitalized type names', async () => {
    await generateCommand('model', 'product', { fields: 'title:string' });

    const model = getWrittenFile('product.model.ts');
    expect(model).toContain('type Product =');
    expect(model).toContain('type NewProduct =');
  });
});

// ===========================================================================
// Pluralize (indirect through model)
// ===========================================================================

describe('pluralize (indirect through model)', () => {
  it('should pluralize "user" to "users"', async () => {
    await generateCommand('model', 'user', {});
    const model = getWrittenFile('user.model.ts');
    expect(model).toContain("table('users'");
  });

  it('should pluralize "category" to "categories" (y -> ies)', async () => {
    await generateCommand('model', 'category', {});
    const model = getWrittenFile('category.model.ts');
    expect(model).toContain("table('categories'");
  });

  it('should pluralize "bus" to "buses" (s -> ses)', async () => {
    await generateCommand('model', 'bus', {});
    const model = getWrittenFile('bus.model.ts');
    expect(model).toContain("table('buses'");
  });

  it('should pluralize "box" to "boxes" (x -> xes)', async () => {
    await generateCommand('model', 'box', {});
    const model = getWrittenFile('box.model.ts');
    expect(model).toContain("table('boxes'");
  });

  it('should pluralize "dish" to "dishes" (sh -> shes)', async () => {
    await generateCommand('model', 'dish', {});
    const model = getWrittenFile('dish.model.ts');
    expect(model).toContain("table('dishes'");
  });

  it('should pluralize "match" to "matches" (ch -> ches)', async () => {
    await generateCommand('model', 'match', {});
    const model = getWrittenFile('match.model.ts');
    expect(model).toContain("table('matches'");
  });
});

// ===========================================================================
// Migration generation
// ===========================================================================

describe('generateCommand - migration', () => {
  it('should create a timestamped migration file', async () => {
    await generateCommand('migration', 'create_users', {});

    const paths = getWrittenPaths();
    expect(paths).toHaveLength(1);
    // The file should match pattern: YYYYMMDDHHMMSS_create_users.ts
    expect(paths[0]).toMatch(/\d{14}_create_users\.ts$/);
  });

  it('should include up and down migration templates', async () => {
    await generateCommand('migration', 'add_email', {});

    const content = mockedWriteFile.mock.calls[0][1] as string;
    expect(content).toContain('up:');
    expect(content).toContain('down:');
    expect(content).toContain('UP migration SQL');
    expect(content).toContain('DOWN migration SQL');
  });

  it('should include the migration name in the content', async () => {
    await generateCommand('migration', 'add_posts_table', {});

    const content = mockedWriteFile.mock.calls[0][1] as string;
    expect(content).toContain("name: 'add_posts_table'");
  });

  it('should use default directory src/db/migrations', async () => {
    await generateCommand('migration', 'init', {});

    expect(mockedMkdir).toHaveBeenCalledWith(
      expect.stringContaining(join('src', 'db', 'migrations')),
      { recursive: true },
    );
  });

  it('should use custom directory when provided', async () => {
    await generateCommand('migration', 'init', { directory: 'db/migrate' });

    expect(mockedMkdir).toHaveBeenCalledWith(
      expect.stringContaining(join('db', 'migrate')),
      { recursive: true },
    );
  });
});

// ===========================================================================
// Route generation
// ===========================================================================

describe('generateCommand - route', () => {
  it('should create a route file in src/routes by default', async () => {
    await generateCommand('route', 'health', {});

    expect(mockedMkdir).toHaveBeenCalledWith(
      expect.stringContaining(join('src', 'routes')),
      { recursive: true },
    );
    const paths = getWrittenPaths();
    expect(paths[0]).toMatch(/health\.ts$/);
  });

  it('should include a GET endpoint using the route name', async () => {
    await generateCommand('route', 'status', {});

    const content = mockedWriteFile.mock.calls[0][1] as string;
    expect(content).toContain("app.get('/status'");
    expect(content).toContain('Hello from status');
  });

  it('should capitalize name in the function export', async () => {
    await generateCommand('route', 'health', {});

    const content = mockedWriteFile.mock.calls[0][1] as string;
    expect(content).toContain('function healthRoutes');
    expect(content).toContain('Health Routes');
  });
});

// ===========================================================================
// Service generation
// ===========================================================================

describe('generateCommand - service', () => {
  it('should create a service file in src/services by default', async () => {
    await generateCommand('service', 'payment', {});

    expect(mockedMkdir).toHaveBeenCalledWith(
      expect.stringContaining(join('src', 'services')),
      { recursive: true },
    );
    const paths = getWrittenPaths();
    expect(paths[0]).toMatch(/payment\.service\.ts$/);
  });

  it('should generate service class with CRUD methods', async () => {
    await generateCommand('service', 'notification', {});

    const content = mockedWriteFile.mock.calls[0][1] as string;
    expect(content).toContain('class NotificationService');
    expect(content).toContain('findAll');
    expect(content).toContain('findById');
    expect(content).toContain('create');
    expect(content).toContain('update');
    expect(content).toContain('delete');
  });

  it('should capitalize name in comment header', async () => {
    await generateCommand('service', 'email', {});

    const content = mockedWriteFile.mock.calls[0][1] as string;
    expect(content).toContain('Email Service');
  });
});

// ===========================================================================
// Unknown type
// ===========================================================================

describe('generateCommand - unknown type', () => {
  it('should log error and exit for unknown generator type', async () => {
    await expect(
      generateCommand('widget', 'foo', {}),
    ).rejects.toThrow('process.exit');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown generator type: widget'),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('should list available types in the error output', async () => {
    await expect(
      generateCommand('unknown', 'bar', {}),
    ).rejects.toThrow('process.exit');

    const allOutput = consoleLogSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(allOutput).toContain('module');
    expect(allOutput).toContain('model');
    expect(allOutput).toContain('migration');
    expect(allOutput).toContain('route');
    expect(allOutput).toContain('service');
  });
});
