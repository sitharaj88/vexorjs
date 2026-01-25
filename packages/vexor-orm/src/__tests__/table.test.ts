/**
 * Table Definition Tests
 */

import { describe, it, expect } from 'vitest';
import { table, Table, index, uniqueIndex } from '../core/table.js';
import { column } from '../core/column.js';

describe('Table Definition', () => {
  describe('table function', () => {
    it('should create a table definition', () => {
      const users = table('users', {
        id: column.serial().primaryKey(),
        name: column.varchar(255).notNull(),
        email: column.varchar(255).unique().notNull(),
      });

      expect(users.tableName).toBe('users');
      expect(users.columns).toHaveProperty('id');
      expect(users.columns).toHaveProperty('name');
      expect(users.columns).toHaveProperty('email');
    });

    it('should handle table options', () => {
      const users = table('users', {
        id: column.serial().primaryKey(),
      }, {
        schema: 'public',
      });

      expect(users.tableName).toBe('users');
      expect(users.schema).toBe('public');
    });

    it('should infer column types correctly', () => {
      const users = table('users', {
        id: column.serial().primaryKey(),
        name: column.varchar(255).notNull(),
        age: column.integer(),
        active: column.boolean().default(true),
      });

      expect(users.columns.id.dataType).toBe('serial');
      expect(users.columns.name.dataType).toBe('varchar');
      expect(users.columns.age.dataType).toBe('integer');
      expect(users.columns.active.dataType).toBe('boolean');
    });
  });

  describe('Table class', () => {
    it('should create table with static definition', () => {
      // When using Table class directly, columns must be built ColumnDef objects
      const users = new Table('users', {
        id: column.serial().primaryKey().build('id'),
        name: column.varchar(255).notNull().build('name'),
      });

      expect(users.tableName).toBe('users');
      expect(users.columns.id.primaryKey).toBe(true);
    });

    it('should allow setting schema', () => {
      const users = new Table('users', {
        id: column.serial().primaryKey().build('id'),
      }, { schema: 'auth' });

      expect(users.schema).toBe('auth');
    });
  });

  describe('index function', () => {
    it('should create an index definition', () => {
      const idx = index('idx_users_email', ['email']);

      expect(idx.name).toBe('idx_users_email');
      expect(idx.columns).toEqual(['email']);
      expect(idx.unique).toBe(false);
    });

    it('should support multiple columns', () => {
      const idx = index('idx_users_name_email', ['name', 'email']);

      expect(idx.columns).toEqual(['name', 'email']);
    });

    it('should support partial index with where clause', () => {
      const idx = index('idx_active_users', ['email'], {
        where: 'active = true',
      });

      expect(idx.where).toBe('active = true');
    });
  });

  describe('uniqueIndex function', () => {
    it('should create a unique index', () => {
      const idx = uniqueIndex('idx_users_email_unique', ['email']);

      expect(idx.unique).toBe(true);
    });
  });

  describe('Table with indexes', () => {
    it('should define table with indexes', () => {
      const users = table('users', {
        id: column.serial().primaryKey(),
        email: column.varchar(255).notNull(),
        name: column.varchar(255),
      }, {
        indexes: [
          uniqueIndex('idx_users_email', ['email']),
          index('idx_users_name', ['name']),
        ],
      });

      expect(users.indexes).toHaveLength(2);
      expect(users.indexes![0].unique).toBe(true);
      expect(users.indexes![1].unique).toBe(false);
    });
  });

  describe('Table with constraints', () => {
    it('should define table with constraints', () => {
      const orders = table('orders', {
        id: column.serial().primaryKey(),
        userId: column.integer().notNull(),
        total: column.decimal(10, 2).notNull(),
      }, {
        constraints: [
          {
            name: 'fk_orders_user',
            type: 'foreign',
            columns: ['userId'],
            references: { table: 'users', columns: ['id'] },
          },
          {
            name: 'chk_positive_total',
            type: 'check',
            check: 'total >= 0',
            columns: ['total'],
          },
        ],
      });

      expect(orders.constraints).toHaveLength(2);
      expect(orders.constraints![0].type).toBe('foreign');
      expect(orders.constraints![1].type).toBe('check');
    });
  });

  describe('Relations', () => {
    it('should define foreign key reference in column', () => {
      const usersTable = table('users', {
        id: column.serial().primaryKey(),
      });

      const posts = table('posts', {
        id: column.serial().primaryKey(),
        userId: column.integer().references(() => ({
          table: usersTable.tableName,
          column: 'id',
        })).notNull(),
      });

      expect(posts.columns.userId.references).toBeDefined();
      expect(posts.columns.userId.references!.table).toBe('users');
    });
  });
});
