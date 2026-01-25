/**
 * Generate Command
 *
 * Code generation for modules, models, and migrations.
 */

import { mkdir, writeFile, access } from 'fs/promises';
import { join, resolve } from 'path';

interface GenerateOptions {
  fields?: string;
  directory?: string;
}

type GeneratorType = 'module' | 'model' | 'migration' | 'route' | 'service';

/**
 * Generate command handler
 */
export async function generateCommand(
  type: string,
  name: string,
  options: GenerateOptions
): Promise<void> {
  const generators: Record<GeneratorType, (name: string, options: GenerateOptions) => Promise<void>> = {
    module: generateModule,
    model: generateModel,
    migration: generateMigration,
    route: generateRoute,
    service: generateService,
  };

  const generator = generators[type as GeneratorType];
  if (!generator) {
    console.error(`❌ Unknown generator type: ${type}`);
    console.log(`\nAvailable types: ${Object.keys(generators).join(', ')}`);
    process.exit(1);
  }

  await generator(name, options);
}

/**
 * Generate a module (route + service + schema)
 */
async function generateModule(name: string, options: GenerateOptions): Promise<void> {
  const dir = options.directory ?? 'src/modules';
  const modulePath = resolve(process.cwd(), dir, name);

  console.log(`\n📦 Generating module: ${name}\n`);

  await mkdir(modulePath, { recursive: true });

  // Create route file
  const routeContent = `/**
 * ${capitalize(name)} Routes
 */

import { Vexor, Type } from 'vexor';
import { ${name}Service } from './${name}.service.js';
import { ${capitalize(name)}Schema, Create${capitalize(name)}Schema } from './${name}.schema.js';

export function ${name}Routes(app: Vexor): void {
  const service = new ${name}Service();

  // List ${name}s
  app.get('/${name}s', {
    response: {
      200: Type.Array(${capitalize(name)}Schema),
    },
  }, async (ctx) => {
    const items = await service.findAll();
    return ctx.json(items);
  });

  // Get ${name} by ID
  app.get('/${name}s/:id', {
    params: Type.Object({ id: Type.String() }),
    response: {
      200: ${capitalize(name)}Schema,
      404: Type.Object({ error: Type.String() }),
    },
  }, async (ctx) => {
    const item = await service.findById(ctx.params.id);
    if (!item) {
      return ctx.json({ error: '${capitalize(name)} not found' }, 404);
    }
    return ctx.json(item);
  });

  // Create ${name}
  app.post('/${name}s', {
    body: Create${capitalize(name)}Schema,
    response: {
      201: ${capitalize(name)}Schema,
    },
  }, async (ctx) => {
    const item = await service.create(ctx.body);
    return ctx.json(item, 201);
  });

  // Update ${name}
  app.put('/${name}s/:id', {
    params: Type.Object({ id: Type.String() }),
    body: Create${capitalize(name)}Schema,
    response: {
      200: ${capitalize(name)}Schema,
      404: Type.Object({ error: Type.String() }),
    },
  }, async (ctx) => {
    const item = await service.update(ctx.params.id, ctx.body);
    if (!item) {
      return ctx.json({ error: '${capitalize(name)} not found' }, 404);
    }
    return ctx.json(item);
  });

  // Delete ${name}
  app.delete('/${name}s/:id', {
    params: Type.Object({ id: Type.String() }),
    response: {
      204: Type.Null(),
      404: Type.Object({ error: Type.String() }),
    },
  }, async (ctx) => {
    const deleted = await service.delete(ctx.params.id);
    if (!deleted) {
      return ctx.json({ error: '${capitalize(name)} not found' }, 404);
    }
    return ctx.text('', 204);
  });
}
`;

  // Create service file
  const serviceContent = `/**
 * ${capitalize(name)} Service
 */

import type { ${capitalize(name)}, Create${capitalize(name)} } from './${name}.schema.js';

export class ${name}Service {
  private items: ${capitalize(name)}[] = [];
  private nextId = 1;

  async findAll(): Promise<${capitalize(name)}[]> {
    return this.items;
  }

  async findById(id: string): Promise<${capitalize(name)} | null> {
    return this.items.find(item => item.id === parseInt(id)) ?? null;
  }

  async create(data: Create${capitalize(name)}): Promise<${capitalize(name)}> {
    const item: ${capitalize(name)} = {
      id: this.nextId++,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.items.push(item);
    return item;
  }

  async update(id: string, data: Create${capitalize(name)}): Promise<${capitalize(name)} | null> {
    const index = this.items.findIndex(item => item.id === parseInt(id));
    if (index === -1) return null;

    this.items[index] = {
      ...this.items[index],
      ...data,
    };
    return this.items[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.items.findIndex(item => item.id === parseInt(id));
    if (index === -1) return false;

    this.items.splice(index, 1);
    return true;
  }
}
`;

  // Create schema file
  const schemaContent = `/**
 * ${capitalize(name)} Schema
 */

import { Type, type Static } from 'vexor';

export const ${capitalize(name)}Schema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  createdAt: Type.String(),
});

export const Create${capitalize(name)}Schema = Type.Object({
  name: Type.String({ minLength: 1 }),
});

export type ${capitalize(name)} = Static<typeof ${capitalize(name)}Schema>;
export type Create${capitalize(name)} = Static<typeof Create${capitalize(name)}Schema>;
`;

  // Create index file
  const indexContent = `/**
 * ${capitalize(name)} Module
 */

export { ${name}Routes } from './${name}.routes.js';
export { ${name}Service } from './${name}.service.js';
export * from './${name}.schema.js';
`;

  // Write files
  const files = [
    [`${name}.routes.ts`, routeContent],
    [`${name}.service.ts`, serviceContent],
    [`${name}.schema.ts`, schemaContent],
    ['index.ts', indexContent],
  ];

  for (const [filename, content] of files) {
    const filePath = join(modulePath, filename);
    await writeFile(filePath, content);
    console.log(`   ✓ ${dir}/${name}/${filename}`);
  }

  console.log(`\n✅ Module generated successfully!`);
  console.log(`\nTo use this module, add to your app:\n`);
  console.log(`   import { ${name}Routes } from './${dir}/${name}/index.js';`);
  console.log(`   ${name}Routes(app);\n`);
}

/**
 * Generate a model (table schema)
 */
async function generateModel(name: string, options: GenerateOptions): Promise<void> {
  const dir = options.directory ?? 'src/db';
  const modelsPath = resolve(process.cwd(), dir);

  console.log(`\n📦 Generating model: ${name}\n`);

  // Parse fields
  const fields = parseFields(options.fields ?? 'name:string');

  // Generate column definitions
  const columnDefs = fields.map(field => {
    const colType = mapFieldType(field.type);
    let def = `  ${field.name}: column.${colType}()`;

    if (field.options.includes('notNull')) def += '.notNull()';
    if (field.options.includes('unique')) def += '.unique()';
    if (field.options.includes('primary')) def += '.primaryKey()';

    return def + ',';
  }).join('\n');

  const content = `/**
 * ${capitalize(name)} Model
 */

import { table, column } from 'vexor-orm';

export const ${pluralize(name)} = table('${pluralize(name)}', {
  id: column.serial().primaryKey(),
${columnDefs}
  createdAt: column.timestamp().defaultNow(),
  updatedAt: column.timestamp().defaultNow(),
});

export type ${capitalize(name)} = typeof ${pluralize(name)}.$inferSelect;
export type New${capitalize(name)} = typeof ${pluralize(name)}.$inferInsert;
`;

  await mkdir(modelsPath, { recursive: true });
  const filePath = join(modelsPath, `${name}.model.ts`);
  await writeFile(filePath, content);

  console.log(`   ✓ ${dir}/${name}.model.ts`);
  console.log(`\n✅ Model generated successfully!\n`);
}

/**
 * Generate a migration
 */
async function generateMigration(name: string, options: GenerateOptions): Promise<void> {
  const dir = options.directory ?? 'src/db/migrations';
  const migrationsPath = resolve(process.cwd(), dir);

  console.log(`\n📦 Generating migration: ${name}\n`);

  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const filename = `${timestamp}_${name}.ts`;

  const content = `/**
 * Migration: ${name}
 * Created at: ${new Date().toISOString()}
 */

import type { MigrationFile } from 'vexor-orm';

export const migration: MigrationFile = {
  version: '${timestamp}',
  name: '${name}',
  up: \`
    -- Add your UP migration SQL here
  \`,
  down: \`
    -- Add your DOWN migration SQL here
  \`,
};
`;

  await mkdir(migrationsPath, { recursive: true });
  const filePath = join(migrationsPath, filename);
  await writeFile(filePath, content);

  console.log(`   ✓ ${dir}/${filename}`);
  console.log(`\n✅ Migration generated successfully!\n`);
}

/**
 * Generate a route file
 */
async function generateRoute(name: string, options: GenerateOptions): Promise<void> {
  const dir = options.directory ?? 'src/routes';
  const routesPath = resolve(process.cwd(), dir);

  console.log(`\n📦 Generating route: ${name}\n`);

  const content = `/**
 * ${capitalize(name)} Routes
 */

import { Vexor, Type } from 'vexor';

export function ${name}Routes(app: Vexor): void {
  app.get('/${name}', {
    response: {
      200: Type.Object({
        message: Type.String(),
      }),
    },
  }, async (ctx) => {
    return ctx.json({ message: 'Hello from ${name}!' });
  });
}
`;

  await mkdir(routesPath, { recursive: true });
  const filePath = join(routesPath, `${name}.ts`);
  await writeFile(filePath, content);

  console.log(`   ✓ ${dir}/${name}.ts`);
  console.log(`\n✅ Route generated successfully!\n`);
}

/**
 * Generate a service file
 */
async function generateService(name: string, options: GenerateOptions): Promise<void> {
  const dir = options.directory ?? 'src/services';
  const servicesPath = resolve(process.cwd(), dir);

  console.log(`\n📦 Generating service: ${name}\n`);

  const content = `/**
 * ${capitalize(name)} Service
 */

export class ${capitalize(name)}Service {
  async findAll(): Promise<unknown[]> {
    // Implement
    return [];
  }

  async findById(id: string): Promise<unknown | null> {
    // Implement
    return null;
  }

  async create(data: unknown): Promise<unknown> {
    // Implement
    return data;
  }

  async update(id: string, data: unknown): Promise<unknown | null> {
    // Implement
    return data;
  }

  async delete(id: string): Promise<boolean> {
    // Implement
    return true;
  }
}
`;

  await mkdir(servicesPath, { recursive: true });
  const filePath = join(servicesPath, `${name}.service.ts`);
  await writeFile(filePath, content);

  console.log(`   ✓ ${dir}/${name}.service.ts`);
  console.log(`\n✅ Service generated successfully!\n`);
}

/**
 * Parse field definitions
 */
function parseFields(fieldsStr: string): Array<{ name: string; type: string; options: string[] }> {
  return fieldsStr.split(',').map(field => {
    const parts = field.trim().split(':');
    return {
      name: parts[0],
      type: parts[1] ?? 'string',
      options: parts.slice(2),
    };
  });
}

/**
 * Map field type to column type
 */
function mapFieldType(type: string): string {
  const typeMap: Record<string, string> = {
    string: 'varchar(255)',
    text: 'text',
    number: 'integer',
    int: 'integer',
    integer: 'integer',
    bigint: 'bigint',
    float: 'real',
    double: 'doublePrecision',
    decimal: 'decimal',
    boolean: 'boolean',
    bool: 'boolean',
    date: 'date',
    datetime: 'timestamp',
    timestamp: 'timestamp',
    json: 'json',
    jsonb: 'jsonb',
    uuid: 'uuid',
  };
  return typeMap[type] ?? 'varchar(255)';
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Simple pluralize
 */
function pluralize(str: string): string {
  if (str.endsWith('y')) {
    return str.slice(0, -1) + 'ies';
  }
  if (str.endsWith('s') || str.endsWith('x') || str.endsWith('ch') || str.endsWith('sh')) {
    return str + 'es';
  }
  return str + 's';
}
