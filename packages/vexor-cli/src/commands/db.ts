/**
 * Database Commands
 *
 * Migration, seeding, and database management.
 */

import { resolve } from 'node:path';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

interface DbOptions {
  steps?: number;
  schema?: string;
  out?: string;
  dialect?: 'postgres' | 'sqlite' | 'mysql';
  name?: string;
}

type DbAction = 'migrate' | 'rollback' | 'status' | 'seed' | 'reset' | 'diff';

/**
 * Database command handler
 */
export async function dbCommand(action: DbAction, options: DbOptions = {}): Promise<void> {
  const actions: Record<DbAction, () => Promise<void>> = {
    migrate: runMigrations,
    rollback: () => rollbackMigrations(options.steps ?? 1),
    status: showMigrationStatus,
    seed: runSeeders,
    reset: resetDatabase,
    diff: () => diffSchemaCommand(options),
  };

  const handler = actions[action];
  if (!handler) {
    console.error(`❌ Unknown database action: ${action}`);
    process.exit(1);
  }

  await handler();
}

/**
 * Run pending migrations
 */
async function runMigrations(): Promise<void> {
  console.log('\n📦 Running migrations...\n');

  try {
    // Try to load the database module from the project
    const dbModule = await loadProjectModule('src/db/index.ts', 'src/db/index.js');

    if (!dbModule?.db) {
      console.log('   ⚠ Database not configured. Create src/db/index.ts first.');
      return;
    }

    const { db } = dbModule;

    // Load migrations
    const migrations = await loadMigrations();

    if (migrations.length === 0) {
      console.log('   No migrations found.');
      return;
    }

    // Get migration runner
    const runner = db.getMigrations(migrations);
    await runner.migrateUp();

    console.log('\n✅ Migrations completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', (error as Error).message);
    process.exit(1);
  }
}

/**
 * Rollback migrations
 */
async function rollbackMigrations(steps: number): Promise<void> {
  console.log(`\n📦 Rolling back ${steps} migration(s)...\n`);

  try {
    const dbModule = await loadProjectModule('src/db/index.ts', 'src/db/index.js');

    if (!dbModule?.db) {
      console.log('   ⚠ Database not configured.');
      return;
    }

    const { db } = dbModule;
    const runner = db.getMigrations();

    for (let i = 0; i < steps; i++) {
      await runner.migrateDown();
      console.log(`   ✓ Rolled back migration ${i + 1}`);
    }

    console.log('\n✅ Rollback completed successfully!\n');
  } catch (error) {
    console.error('❌ Rollback failed:', (error as Error).message);
    process.exit(1);
  }
}

/**
 * Show migration status
 */
async function showMigrationStatus(): Promise<void> {
  console.log('\n📦 Migration Status\n');

  try {
    const dbModule = await loadProjectModule('src/db/index.ts', 'src/db/index.js');

    if (!dbModule?.db) {
      console.log('   ⚠ Database not configured.');
      return;
    }

    const { db } = dbModule;
    const migrations = await loadMigrations();
    const runner = db.getMigrations(migrations);
    const status = await runner.getStatus();

    console.log('   Applied migrations:');
    for (const m of status.applied) {
      console.log(`     ✓ ${m.version} - ${m.name}`);
    }

    console.log('\n   Pending migrations:');
    for (const m of status.pending) {
      console.log(`     ○ ${m.version} - ${m.name}`);
    }

    console.log('');
  } catch (error) {
    console.error('❌ Failed to get status:', (error as Error).message);
    process.exit(1);
  }
}

/**
 * Run database seeders
 */
async function runSeeders(): Promise<void> {
  console.log('\n📦 Running seeders...\n');

  try {
    const seedersPath = resolve(process.cwd(), 'src/db/seeders');

    try {
      const files = await readdir(seedersPath);
      const seederFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.js'));

      if (seederFiles.length === 0) {
        console.log('   No seeders found.');
        return;
      }

      for (const file of seederFiles.sort()) {
        const seeder = await import(resolve(seedersPath, file));
        if (seeder.seed) {
          await seeder.seed();
          console.log(`   ✓ ${file}`);
        }
      }

      console.log('\n✅ Seeders completed successfully!\n');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log('   No seeders directory found. Create src/db/seeders/');
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('❌ Seeding failed:', (error as Error).message);
    process.exit(1);
  }
}

/**
 * Reset database (rollback all, migrate, seed)
 */
async function resetDatabase(): Promise<void> {
  console.log('\n📦 Resetting database...\n');

  try {
    const dbModule = await loadProjectModule('src/db/index.ts', 'src/db/index.js');

    if (!dbModule?.db) {
      console.log('   ⚠ Database not configured.');
      return;
    }

    const { db } = dbModule;
    const migrations = await loadMigrations();
    const runner = db.getMigrations(migrations);

    // Rollback all
    console.log('   Rolling back all migrations...');
    const status = await runner.getStatus();
    for (let i = 0; i < status.applied.length; i++) {
      await runner.migrateDown();
    }
    console.log('   ✓ Rollback complete');

    // Migrate
    console.log('   Running migrations...');
    await runner.migrateUp();
    console.log('   ✓ Migrations complete');

    // Seed
    console.log('   Running seeders...');
    await runSeeders();

    console.log('\n✅ Database reset successfully!\n');
  } catch (error) {
    console.error('❌ Reset failed:', (error as Error).message);
    process.exit(1);
  }
}

/**
 * Load project module dynamically
 */
async function loadProjectModule(...paths: string[]): Promise<{ db?: { getMigrations: Function; close: Function } } | null> {
  for (const path of paths) {
    try {
      const fullPath = resolve(process.cwd(), path);
      const module = await import(fullPath);
      return module;
    } catch {
    }
  }
  return null;
}

/**
 * Diff the schema module against the saved snapshot and write a migration.
 * Snapshot lives next to the migrations as schema.snapshot.json.
 */
async function diffSchemaCommand(options: DbOptions): Promise<void> {
  console.log('\n🔍 Diffing schema against the last snapshot...\n');

  const schemaCandidates = options.schema
    ? [options.schema]
    : ['src/db/schema.ts', 'src/db/schema.js', 'src/schema.ts', 'src/schema.js'];

  const schemaModule = (await loadProjectModule(...schemaCandidates)) as Record<
    string,
    unknown
  > | null;
  if (!schemaModule) {
    console.error(`❌ Could not load a schema module (tried: ${schemaCandidates.join(', ')})`);
    console.error('   Pass one explicitly with --schema <path>');
    process.exit(1);
    return;
  }

  const tables = Object.values(schemaModule).filter(
    (value): value is Record<string, unknown> =>
      !!value &&
      typeof value === 'object' &&
      (value as { _brand?: string })._brand === 'TableDef'
  );
  if (tables.length === 0) {
    console.error('❌ The schema module exports no table() definitions');
    process.exit(1);
    return;
  }

  // Load @vexorjs/orm from the user's project, not the CLI's own tree
  let orm: {
    generateAutoMigration: (
      previous: unknown,
      tables: unknown[],
      options: { dialect: string }
    ) => {
      hasChanges: boolean;
      up: string[];
      down: string[];
      warnings: string[];
      snapshot: unknown;
    };
  };
  try {
    const projectRequire = createRequire(resolve(process.cwd(), 'package.json'));
    orm = await import(pathToFileURL(projectRequire.resolve('@vexorjs/orm')).href);
  } catch {
    console.error('❌ @vexorjs/orm is not installed in this project (npm install @vexorjs/orm)');
    process.exit(1);
    return;
  }

  const outDir = resolve(process.cwd(), options.out ?? 'src/db/migrations');
  const snapshotPath = resolve(outDir, 'schema.snapshot.json');

  let previous: unknown = null;
  try {
    previous = JSON.parse(await readFile(snapshotPath, 'utf8'));
  } catch {
    // First run: no snapshot yet
  }

  const dialect = options.dialect ?? 'postgres';
  const result = orm.generateAutoMigration(previous, tables, { dialect });

  if (!result.hasChanges) {
    console.log('✅ No schema changes detected');
    return;
  }

  for (const warning of result.warnings) {
    console.warn(`⚠️  ${warning}`);
  }

  const version = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const name = options.name ?? 'auto';
  const fileName = `${version}_${name}.ts`;

  const content = [
    '/**',
    ' * Generated by `vexor db:diff` — review before applying!',
    ` * Dialect: ${dialect}`,
    ' */',
    'export const migration = {',
    `  version: '${version}',`,
    `  name: '${name}',`,
    `  up: ${JSON.stringify(result.up.join(';\n'))},`,
    `  down: ${JSON.stringify(result.down.join(';\n'))},`,
    '};',
    '',
  ].join('\n');

  await mkdir(outDir, { recursive: true });
  await writeFile(resolve(outDir, fileName), content, 'utf8');
  await writeFile(snapshotPath, JSON.stringify(result.snapshot, null, 2), 'utf8');

  console.log(`✅ Wrote ${fileName} (${result.up.length} up statement(s))`);
  console.log('✅ Updated schema.snapshot.json — commit both files');
}

/**
 * Load migration files from project
 */
async function loadMigrations(): Promise<Array<{ version: string; name: string; up: string; down: string }>> {
  const migrationsPath = resolve(process.cwd(), 'src/db/migrations');
  const migrations: Array<{ version: string; name: string; up: string; down: string }> = [];

  try {
    const files = await readdir(migrationsPath);
    const migrationFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.js')).sort();

    for (const file of migrationFiles) {
      const module = await import(resolve(migrationsPath, file));
      if (module.migration) {
        migrations.push(module.migration);
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  return migrations;
}
