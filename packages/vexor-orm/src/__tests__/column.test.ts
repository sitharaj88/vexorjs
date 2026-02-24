/**
 * Column Builder Tests
 */

import { describe, it, expect } from 'vitest';
import { column, col } from '../core/column.js';

describe('Column Builder', () => {
  describe('Basic Types', () => {
    it('should create serial column', () => {
      const colDef = column.serial().build('id');
      expect(colDef.dataType).toBe('serial');
      expect(colDef.hasDefault).toBe(true);
    });

    it('should create bigserial column', () => {
      const colDef = column.bigserial().build('id');
      expect(colDef.dataType).toBe('bigserial');
    });

    it('should create integer column', () => {
      const colDef = column.integer().build('count');
      expect(colDef.dataType).toBe('integer');
    });

    it('should create bigint column', () => {
      const colDef = column.bigint().build('big_count');
      expect(colDef.dataType).toBe('bigint');
    });

    it('should create varchar column with length', () => {
      const colDef = column.varchar(100).build('name');
      expect(colDef.dataType).toBe('varchar');
      expect(colDef.length).toBe(100);
    });

    it('should create text column', () => {
      const colDef = column.text().build('description');
      expect(colDef.dataType).toBe('text');
    });

    it('should create boolean column', () => {
      const colDef = column.boolean().build('active');
      expect(colDef.dataType).toBe('boolean');
    });

    it('should create timestamp column', () => {
      const colDef = column.timestamp().build('created_at');
      expect(colDef.dataType).toBe('timestamp');
    });

    it('should create timestamptz column', () => {
      const colDef = column.timestamptz().build('updated_at');
      expect(colDef.dataType).toBe('timestamptz');
    });

    it('should create date column', () => {
      const colDef = column.date().build('birth_date');
      expect(colDef.dataType).toBe('date');
    });

    it('should create json column', () => {
      const colDef = column.json().build('metadata');
      expect(colDef.dataType).toBe('json');
    });

    it('should create jsonb column', () => {
      const colDef = column.jsonb().build('settings');
      expect(colDef.dataType).toBe('jsonb');
    });

    it('should create uuid column', () => {
      const colDef = column.uuid().build('uuid');
      expect(colDef.dataType).toBe('uuid');
    });

    it('should create decimal column with precision', () => {
      const colDef = column.decimal(10, 2).build('price');
      expect(colDef.dataType).toBe('decimal');
      expect(colDef.precision).toBe(10);
      expect(colDef.scale).toBe(2);
    });
  });

  describe('Column Modifiers', () => {
    it('should set notNull', () => {
      const colDef = column.varchar(255).notNull().build('name');
      expect(colDef.notNull).toBe(true);
    });

    it('should set primaryKey', () => {
      const colDef = column.serial().primaryKey().build('id');
      expect(colDef.primaryKey).toBe(true);
    });

    it('should set unique', () => {
      const colDef = column.varchar(255).unique().build('email');
      expect(colDef.unique).toBe(true);
    });

    it('should set default value', () => {
      const colDef = column.boolean().default(false).build('active');
      expect(colDef.defaultValue).toBe(false);
    });

    it('should set defaultNow for timestamps', () => {
      const colDef = column.timestamp().defaultNow().build('created_at');
      expect(colDef.defaultValue).toBe('CURRENT_TIMESTAMP');
      expect(colDef.hasDefault).toBe(true);
    });

    it('should chain multiple modifiers', () => {
      const colDef = column
        .varchar(255)
        .notNull()
        .unique()
        .default('default_value')
        .build('field');

      expect(colDef.notNull).toBe(true);
      expect(colDef.unique).toBe(true);
      expect(colDef.defaultValue).toBe('default_value');
    });
  });

  describe('References', () => {
    it('should set foreign key reference', () => {
      const colDef = column
        .integer()
        .references(() => ({ table: 'users', column: 'id' }))
        .build('user_id');

      expect(colDef.references).toBeDefined();
      expect(colDef.references!.table).toBe('users');
      expect(colDef.references!.column).toBe('id');
    });
  });

  describe('col shorthand', () => {
    it('should work as alias for column', () => {
      const colDef = col.varchar(100).notNull().build('name');
      expect(colDef.dataType).toBe('varchar');
      expect(colDef.length).toBe(100);
      expect(colDef.notNull).toBe(true);
    });
  });

  describe('Enum type', () => {
    it('should create enum column', () => {
      const colDef = column.enum(['admin', 'user', 'guest']).build('role');
      expect(colDef.dataType).toBe('enum');
      expect(colDef.enumValues).toEqual(['admin', 'user', 'guest']);
    });
  });
});
