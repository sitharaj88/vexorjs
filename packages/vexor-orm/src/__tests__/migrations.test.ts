/**
 * Migration System Tests
 */

import { describe, it, expect } from 'vitest';
import { table } from '../core/table.js';
import { column } from '../core/column.js';
import {
  MigrationGenerator,
  createMigrationGenerator,
  generateMigrationFileContent,
} from '../migrations/generator.js';

// Test table
const users = table('users', {
  id: column.serial().primaryKey(),
  name: column.varchar(255).notNull(),
  email: column.varchar(255).unique().notNull(),
  age: column.integer(),
  active: column.boolean().default(true),
  createdAt: column.timestamp().defaultNow(),
});

describe('Migration Generator', () => {
  describe('createTable', () => {
    it('should generate CREATE TABLE migration', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.createTable(users);

      expect(migration.name).toBe('create_users');
      expect(migration.up).toHaveLength(1);
      expect(migration.up[0]).toContain('CREATE TABLE');
      expect(migration.up[0]).toContain('"users"');
    });

    it('should include column definitions', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.createTable(users);

      expect(migration.up[0]).toContain('"id"');
      expect(migration.up[0]).toContain('SERIAL');
      expect(migration.up[0]).toContain('"name"');
      expect(migration.up[0]).toContain('VARCHAR(255)');
      expect(migration.up[0]).toContain('NOT NULL');
    });

    it('should include PRIMARY KEY constraint', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.createTable(users);

      expect(migration.up[0]).toContain('PRIMARY KEY');
    });

    it('should include UNIQUE constraint', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.createTable(users);

      expect(migration.up[0]).toContain('UNIQUE');
    });

    it('should include DEFAULT values', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.createTable(users);

      expect(migration.up[0]).toContain('DEFAULT');
      expect(migration.up[0]).toContain('TRUE');
      expect(migration.up[0]).toContain('CURRENT_TIMESTAMP');
    });

    it('should generate DROP TABLE for down migration', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.createTable(users);

      expect(migration.down).toHaveLength(1);
      expect(migration.down[0]).toContain('DROP TABLE');
      expect(migration.down[0]).toContain('"users"');
    });

    it('should add IF NOT EXISTS when option is set', () => {
      const generator = createMigrationGenerator({
        dialect: 'postgres',
        ifNotExists: true,
      });
      const migration = generator.createTable(users);

      expect(migration.up[0]).toContain('IF NOT EXISTS');
    });
  });

  describe('addColumn', () => {
    it('should generate ADD COLUMN migration', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.addColumn(
        'users',
        'phone',
        column.varchar(20).build('phone')
      );

      expect(migration.name).toBe('add_phone_to_users');
      expect(migration.up[0]).toContain('ALTER TABLE');
      expect(migration.up[0]).toContain('ADD COLUMN');
      expect(migration.up[0]).toContain('"phone"');
    });

    it('should generate DROP COLUMN for down migration', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.addColumn(
        'users',
        'phone',
        column.varchar(20).build('phone')
      );

      expect(migration.down[0]).toContain('DROP COLUMN');
    });
  });

  describe('dropColumn', () => {
    it('should generate DROP COLUMN migration', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.dropColumn('users', 'phone');

      expect(migration.name).toBe('drop_phone_from_users');
      expect(migration.up[0]).toContain('ALTER TABLE');
      expect(migration.up[0]).toContain('DROP COLUMN');
    });
  });

  describe('renameTable', () => {
    it('should generate RENAME TABLE migration', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.renameTable('users', 'accounts');

      expect(migration.name).toBe('rename_users_to_accounts');
      expect(migration.up[0]).toContain('RENAME TO');
      expect(migration.down[0]).toContain('RENAME TO');
    });
  });

  describe('renameColumn', () => {
    it('should generate RENAME COLUMN migration', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.renameColumn('users', 'name', 'full_name');

      expect(migration.name).toBe('rename_name_to_full_name_in_users');
      expect(migration.up[0]).toContain('RENAME COLUMN');
    });
  });

  describe('addIndex', () => {
    it('should generate CREATE INDEX migration', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.addIndex('users', {
        name: 'idx_users_email',
        columns: ['email'],
        unique: false,
      });

      expect(migration.name).toBe('add_index_idx_users_email');
      expect(migration.up[0]).toContain('CREATE INDEX');
      expect(migration.up[0]).toContain('"idx_users_email"');
    });

    it('should generate UNIQUE INDEX', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.addIndex('users', {
        name: 'idx_users_email_unique',
        columns: ['email'],
        unique: true,
      });

      expect(migration.up[0]).toContain('CREATE UNIQUE INDEX');
    });

    it('should support partial index with WHERE clause', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.addIndex('users', {
        name: 'idx_active_users',
        columns: ['email'],
        unique: false,
        where: 'active = true',
      });

      expect(migration.up[0]).toContain('WHERE active = true');
    });
  });

  describe('dropIndex', () => {
    it('should generate DROP INDEX migration', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.dropIndex('idx_users_email');

      expect(migration.name).toBe('drop_index_idx_users_email');
      expect(migration.up[0]).toContain('DROP INDEX');
    });
  });

  describe('Dialect differences', () => {
    it('should use double quotes for PostgreSQL', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.createTable(users);

      expect(migration.up[0]).toContain('"users"');
      expect(migration.up[0]).toContain('"id"');
    });

    it('should use backticks for MySQL', () => {
      const generator = createMigrationGenerator({ dialect: 'mysql' });
      const migration = generator.createTable(users);

      expect(migration.up[0]).toContain('`users`');
      expect(migration.up[0]).toContain('`id`');
    });

    it('should map types correctly for SQLite', () => {
      const generator = createMigrationGenerator({ dialect: 'sqlite' });
      const migration = generator.createTable(users);

      // SQLite uses TEXT instead of VARCHAR
      expect(migration.up[0]).toContain('TEXT');
      // SQLite uses INTEGER instead of SERIAL
      expect(migration.up[0]).toContain('INTEGER');
    });
  });

  describe('generateMigrationFileContent', () => {
    it('should generate TypeScript migration file', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.createTable(users);
      const content = generateMigrationFileContent(migration, 'ts');

      expect(content).toContain("import type { MigrationFile }");
      expect(content).toContain('export const migration');
      expect(content).toContain('version:');
      expect(content).toContain('name:');
      expect(content).toContain('up:');
      expect(content).toContain('down:');
    });

    it('should generate JavaScript migration file', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.createTable(users);
      const content = generateMigrationFileContent(migration, 'js');

      expect(content).not.toContain('import type');
      expect(content).toContain('export const migration');
    });

    it('should generate SQL migration file', () => {
      const generator = createMigrationGenerator({ dialect: 'postgres' });
      const migration = generator.createTable(users);
      const content = generateMigrationFileContent(migration, 'sql');

      expect(content).toContain('-- Migration:');
      expect(content).toContain('-- Up');
      expect(content).toContain('-- Down');
    });
  });
});
