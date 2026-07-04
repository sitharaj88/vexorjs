/**
 * Database Commands
 *
 * Migration, seeding, and database management.
 */

import { resolve } from 'node:path';
import { readdir } from 'node:fs/promises';

interface DbOptions {
  steps?: number;
}

type DbAction = 'migrate' | 'rollback' | 'status' | 'seed' | 'reset';

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
