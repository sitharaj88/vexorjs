/**
 * Migration Runner
 *
 * Executes database migrations with version tracking,
 * rollback support, and dry-run capabilities.
 */

import type { DatabaseDriver, Migration, MigrationStatus } from '../core/types.js';

/**
 * Migration file interface
 */
export interface MigrationFile {
  /** Migration version/timestamp */
  version: string;
  /** Migration name */
  name: string;
  /** Up migration SQL or function */
  up: string | ((db: DatabaseDriver) => Promise<void>);
  /** Down migration SQL or function (optional) */
  down?: string | ((db: DatabaseDriver) => Promise<void>);
}

/**
 * Migration runner options
 */
export interface MigrationRunnerOptions {
  /** Migrations table name */
  tableName?: string;
  /** Enable dry-run mode */
  dryRun?: boolean;
  /** Migration directory */
  directory?: string;
  /** Migrations array (alternative to directory) */
  migrations?: MigrationFile[];
}

/**
 * Migration execution result
 */
export interface MigrationResult {
  /** Migration version */
  version: string;
  /** Migration name */
  name: string;
  /** Whether migration was applied */
  applied: boolean;
  /** Error if failed */
  error?: Error;
  /** Execution time in ms */
  duration: number;
}

/**
 * Default options
 */
const DEFAULT_OPTIONS: Required<Omit<MigrationRunnerOptions, 'directory' | 'migrations'>> = {
  tableName: '_vexor_migrations',
  dryRun: false,
};

/**
 * Migration Runner
 *
 * Manages database schema migrations with support for:
 * - Version tracking
 * - Up/down migrations
 * - Dry-run mode
 * - Transaction wrapping
 */
export class MigrationRunner {
  private db: DatabaseDriver;
  private options: MigrationRunnerOptions & typeof DEFAULT_OPTIONS;
  private migrations: MigrationFile[] = [];

  constructor(db: DatabaseDriver, options: MigrationRunnerOptions = {}) {
    this.db = db;
    this.options = { ...DEFAULT_OPTIONS, ...options };

    if (options.migrations) {
      this.migrations = options.migrations.sort((a, b) =>
        a.version.localeCompare(b.version)
      );
    }
  }

  /**
   * Initialize migrations table
   */
  async initialize(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.options.tableName} (
        version VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_time INTEGER
      )
    `;
    await this.db.query(createTableSQL);
  }

  /**
   * Add migrations
   */
  addMigrations(migrations: MigrationFile[]): void {
    this.migrations.push(...migrations);
    this.migrations.sort((a, b) => a.version.localeCompare(b.version));
  }

  /**
   * Get all migrations
   */
  getMigrations(): MigrationFile[] {
    return [...this.migrations];
  }

  /**
   * Get applied migrations
   */
  async getAppliedMigrations(): Promise<Migration[]> {
    const result = await this.db.query<Migration>(
      `SELECT version, name, applied_at as "appliedAt" FROM ${this.options.tableName} ORDER BY version ASC`
    );
    return result.rows;
  }

  /**
   * Get pending migrations
   */
  async getPendingMigrations(): Promise<MigrationFile[]> {
    const applied = await this.getAppliedMigrations();
    const appliedVersions = new Set(applied.map((m) => m.version));

    return this.migrations.filter((m) => !appliedVersions.has(m.version));
  }

  /**
   * Get migration status
   */
  async getStatus(): Promise<MigrationStatus[]> {
    const applied = await this.getAppliedMigrations();
    const appliedMap = new Map(applied.map((m) => [m.version, m]));

    return this.migrations.map((migration) => {
      const appliedMigration = appliedMap.get(migration.version);
      return {
        version: migration.version,
        name: migration.name,
        applied: !!appliedMigration,
        appliedAt: appliedMigration?.appliedAt,
      };
    });
  }

  /**
   * Run all pending migrations
   */
  async migrateUp(): Promise<MigrationResult[]> {
    await this.initialize();

    const pending = await this.getPendingMigrations();
    const results: MigrationResult[] = [];

    for (const migration of pending) {
      const result = await this.runMigration(migration, 'up');
      results.push(result);

      if (result.error) {
        break; // Stop on first error
      }
    }

    return results;
  }

  /**
   * Run migrations up to a specific version
   */
  async migrateUpTo(version: string): Promise<MigrationResult[]> {
    await this.initialize();

    const pending = await this.getPendingMigrations();
    const toRun = pending.filter((m) => m.version <= version);
    const results: MigrationResult[] = [];

    for (const migration of toRun) {
      const result = await this.runMigration(migration, 'up');
      results.push(result);

      if (result.error) {
        break;
      }
    }

    return results;
  }

  /**
   * Rollback the last migration
   */
  async migrateDown(): Promise<MigrationResult[]> {
    const applied = await this.getAppliedMigrations();
    if (applied.length === 0) {
      return [];
    }

    const lastApplied = applied[applied.length - 1];
    const migration = this.migrations.find((m) => m.version === lastApplied.version);

    if (!migration) {
      throw new Error(`Migration ${lastApplied.version} not found`);
    }

    if (!migration.down) {
      throw new Error(`Migration ${lastApplied.version} has no down migration`);
    }

    const result = await this.runMigration(migration, 'down');
    return [result];
  }

  /**
   * Rollback to a specific version
   */
  async migrateDownTo(version: string): Promise<MigrationResult[]> {
    const applied = await this.getAppliedMigrations();
    const toRollback = applied
      .filter((m) => m.version > version)
      .reverse();

    const results: MigrationResult[] = [];

    for (const appliedMigration of toRollback) {
      const migration = this.migrations.find((m) => m.version === appliedMigration.version);

      if (!migration) {
        throw new Error(`Migration ${appliedMigration.version} not found`);
      }

      if (!migration.down) {
        throw new Error(`Migration ${appliedMigration.version} has no down migration`);
      }

      const result = await this.runMigration(migration, 'down');
      results.push(result);

      if (result.error) {
        break;
      }
    }

    return results;
  }

  /**
   * Rollback all migrations
   */
  async reset(): Promise<MigrationResult[]> {
    const applied = await this.getAppliedMigrations();
    const results: MigrationResult[] = [];

    for (const appliedMigration of [...applied].reverse()) {
      const migration = this.migrations.find((m) => m.version === appliedMigration.version);

      if (!migration || !migration.down) {
        continue;
      }

      const result = await this.runMigration(migration, 'down');
      results.push(result);

      if (result.error) {
        break;
      }
    }

    return results;
  }

  /**
   * Run a single migration
   */
  private async runMigration(
    migration: MigrationFile,
    direction: 'up' | 'down'
  ): Promise<MigrationResult> {
    const startTime = Date.now();
    const migrationFn = direction === 'up' ? migration.up : migration.down;

    if (!migrationFn) {
      return {
        version: migration.version,
        name: migration.name,
        applied: false,
        error: new Error(`No ${direction} migration defined`),
        duration: 0,
      };
    }

    if (this.options.dryRun) {
      console.log(`[DRY RUN] Would ${direction} migration: ${migration.version} - ${migration.name}`);
      if (typeof migrationFn === 'string') {
        console.log(migrationFn);
      }
      return {
        version: migration.version,
        name: migration.name,
        applied: false,
        duration: Date.now() - startTime,
      };
    }

    try {
      // Execute migration
      if (typeof migrationFn === 'string') {
        await this.db.query(migrationFn);
      } else {
        await migrationFn(this.db);
      }

      const duration = Date.now() - startTime;

      // Update migrations table
      if (direction === 'up') {
        await this.db.query(
          `INSERT INTO ${this.options.tableName} (version, name, execution_time) VALUES ($1, $2, $3)`,
          [migration.version, migration.name, duration]
        );
      } else {
        await this.db.query(
          `DELETE FROM ${this.options.tableName} WHERE version = $1`,
          [migration.version]
        );
      }

      return {
        version: migration.version,
        name: migration.name,
        applied: true,
        duration,
      };
    } catch (error) {
      return {
        version: migration.version,
        name: migration.name,
        applied: false,
        error: error as Error,
        duration: Date.now() - startTime,
      };
    }
  }
}

/**
 * Create a migration runner
 */
export function createMigrationRunner(
  db: DatabaseDriver,
  options?: MigrationRunnerOptions
): MigrationRunner {
  return new MigrationRunner(db, options);
}
