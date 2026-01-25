/**
 * Query Builder Tests
 */

import { describe, it, expect } from 'vitest';
import { table } from '../core/table.js';
import { column } from '../core/column.js';
import {
  select,
  insert,
  update,
  deleteFrom,
  eq,
  ne,
  lt,
  gt,
  lte,
  gte,
  like,
  ilike,
  inArray,
  notInArray,
  isNull,
  isNotNull,
  and,
  or,
  sql,
} from '../query/builder.js';

// Test tables
const users = table('users', {
  id: column.serial().primaryKey(),
  name: column.varchar(255).notNull(),
  email: column.varchar(255).unique().notNull(),
  age: column.integer(),
  active: column.boolean().default(true),
});

const posts = table('posts', {
  id: column.serial().primaryKey(),
  title: column.varchar(255).notNull(),
  content: column.text(),
  userId: column.integer().notNull(),
  published: column.boolean().default(false),
});

describe('Query Builder', () => {
  describe('SELECT queries', () => {
    it('should build basic SELECT query', () => {
      const builder = select(users);
      const query = builder.toSQL();
      const params = builder.getValues();

      expect(query).toContain('SELECT');
      expect(query).toContain('FROM users');
      expect(params).toHaveLength(0);
    });

    it('should select specific columns', () => {
      const builder = select(users).select('name', 'email');
      const query = builder.toSQL();

      expect(query).toContain('name');
      expect(query).toContain('email');
    });

    it('should add WHERE clause', () => {
      const builder = select(users).where(eq('id', 1));
      const query = builder.toSQL();
      const params = builder.getValues();

      expect(query).toContain('WHERE');
      expect(query).toContain('id = $1');
      expect(params).toEqual([1]);
    });

    it('should combine WHERE conditions with AND', () => {
      const builder = select(users).where(and(eq('active', true), gt('age', 18)));
      const query = builder.toSQL();
      const params = builder.getValues();

      expect(query).toContain('AND');
      expect(params).toContain(true);
      expect(params).toContain(18);
    });

    it('should combine WHERE conditions with OR', () => {
      const builder = select(users).where(or(eq('name', 'John'), eq('name', 'Jane')));
      const query = builder.toSQL();

      expect(query).toContain('OR');
    });

    it('should add ORDER BY', () => {
      const builder = select(users).orderBy('name', 'asc');
      const query = builder.toSQL();

      expect(query).toContain('ORDER BY name ASC');
    });

    it('should add LIMIT', () => {
      const builder = select(users).limit(10);
      const query = builder.toSQL();

      expect(query).toContain('LIMIT 10');
    });

    it('should add OFFSET', () => {
      const builder = select(users).offset(20);
      const query = builder.toSQL();

      expect(query).toContain('OFFSET 20');
    });

    it('should add LIMIT and OFFSET together', () => {
      const builder = select(users).limit(10).offset(20);
      const query = builder.toSQL();

      expect(query).toContain('LIMIT 10');
      expect(query).toContain('OFFSET 20');
    });

    it('should add INNER JOIN', () => {
      const builder = select(users).join(posts, 'users.id = posts.userId', 'inner');
      const query = builder.toSQL();

      expect(query).toContain('INNER JOIN posts');
      expect(query).toContain('ON users.id = posts.userId');
    });

    it('should add LEFT JOIN', () => {
      const builder = select(users).leftJoin(posts, 'users.id = posts.userId');
      const query = builder.toSQL();

      expect(query).toContain('LEFT JOIN');
    });

    it('should add GROUP BY', () => {
      const builder = select(users).groupBy('active');
      const query = builder.toSQL();

      expect(query).toContain('GROUP BY active');
    });

    it('should add HAVING', () => {
      const builder = select(users)
        .groupBy('active')
        .having(gt('COUNT(*)', 5));
      const query = builder.toSQL();

      expect(query).toContain('HAVING');
    });

    it('should add DISTINCT', () => {
      const builder = select(users).distinct();
      const query = builder.toSQL();

      expect(query).toContain('DISTINCT');
    });
  });

  describe('INSERT queries', () => {
    it('should build basic INSERT query', () => {
      const builder = insert(users).values({ name: 'John', email: 'john@example.com' });
      const query = builder.toSQL();
      const params = builder.getValues();

      expect(query).toContain('INSERT INTO users');
      expect(query).toContain('VALUES');
      expect(params).toContain('John');
      expect(params).toContain('john@example.com');
    });

    it('should add RETURNING all columns clause', () => {
      const builder = insert(users)
        .values({ name: 'John', email: 'john@example.com' })
        .returningAll();
      const query = builder.toSQL();

      expect(query).toContain('RETURNING *');
    });

    it('should return specific columns', () => {
      const builder = insert(users)
        .values({ name: 'John', email: 'john@example.com' })
        .returning('id', 'name');
      const query = builder.toSQL();

      expect(query).toContain('RETURNING id, name');
    });

    it('should handle ON CONFLICT DO NOTHING', () => {
      const builder = insert(users)
        .values({ name: 'John', email: 'john@example.com' })
        .onConflictDoNothing(['email']);
      const query = builder.toSQL();

      expect(query).toContain('ON CONFLICT (email)');
      expect(query).toContain('DO NOTHING');
    });

    it('should handle ON CONFLICT DO UPDATE', () => {
      const builder = insert(users)
        .values({ name: 'John', email: 'john@example.com' })
        .onConflictDoUpdate(['email'], { name: 'John Updated' });
      const query = builder.toSQL();

      expect(query).toContain('ON CONFLICT (email)');
      expect(query).toContain('DO UPDATE SET');
    });
  });

  describe('UPDATE queries', () => {
    it('should build basic UPDATE query', () => {
      const builder = update(users).set({ name: 'Jane' }).where(eq('id', 1));
      const query = builder.toSQL();
      const params = builder.getValues();

      expect(query).toContain('UPDATE users');
      expect(query).toContain('SET');
      expect(query).toContain('name = $1');
      expect(params).toContain('Jane');
    });

    it('should update multiple columns', () => {
      const builder = update(users).set({ name: 'Jane', age: 30 }).where(eq('id', 1));
      const params = builder.getValues();

      expect(params).toContain('Jane');
      expect(params).toContain(30);
    });

    it('should add RETURNING clause', () => {
      const builder = update(users)
        .set({ name: 'Jane' })
        .where(eq('id', 1))
        .returningAll();
      const query = builder.toSQL();

      expect(query).toContain('RETURNING');
    });
  });

  describe('DELETE queries', () => {
    it('should build basic DELETE query', () => {
      const builder = deleteFrom(users).where(eq('id', 1));
      const query = builder.toSQL();
      const params = builder.getValues();

      expect(query).toContain('DELETE FROM users');
      expect(query).toContain('WHERE');
      expect(params).toContain(1);
    });

    it('should add RETURNING clause', () => {
      const builder = deleteFrom(users).where(eq('id', 1)).returningAll();
      const query = builder.toSQL();

      expect(query).toContain('RETURNING');
    });
  });

  describe('Comparison operators', () => {
    it('should handle eq', () => {
      const condition = eq('name', 'John');
      const sql = condition.toSQL();
      expect(sql).toContain('=');
    });

    it('should handle ne', () => {
      const condition = ne('status', 'inactive');
      const sql = condition.toSQL();
      expect(sql).toContain('!=');
    });

    it('should handle lt', () => {
      const condition = lt('age', 18);
      const sql = condition.toSQL();
      expect(sql).toContain('<');
    });

    it('should handle gt', () => {
      const condition = gt('age', 21);
      const sql = condition.toSQL();
      expect(sql).toContain('>');
    });

    it('should handle lte', () => {
      const condition = lte('age', 18);
      const sql = condition.toSQL();
      expect(sql).toContain('<=');
    });

    it('should handle gte', () => {
      const condition = gte('age', 21);
      const sql = condition.toSQL();
      expect(sql).toContain('>=');
    });

    it('should handle like', () => {
      const condition = like('name', '%John%');
      const sql = condition.toSQL();
      expect(sql).toContain('LIKE');
    });

    it('should handle ilike', () => {
      const condition = ilike('name', '%john%');
      const sql = condition.toSQL();
      expect(sql).toContain('ILIKE');
    });

    it('should handle inArray', () => {
      const condition = inArray('status', ['active', 'pending']);
      const sql = condition.toSQL();
      const values = condition.getValues();
      expect(sql).toContain('IN');
      expect(values).toEqual(['active', 'pending']);
    });

    it('should handle notInArray', () => {
      const condition = notInArray('status', ['deleted', 'banned']);
      const sql = condition.toSQL();
      expect(sql).toContain('NOT IN');
    });

    it('should handle isNull', () => {
      const condition = isNull('deleted_at');
      const sql = condition.toSQL();
      expect(sql).toContain('IS NULL');
    });

    it('should handle isNotNull', () => {
      const condition = isNotNull('email');
      const sql = condition.toSQL();
      expect(sql).toContain('IS NOT NULL');
    });
  });

  describe('sql template literal', () => {
    it('should create raw SQL expression', () => {
      const expr = sql`NOW()`;
      expect(expr.sql).toBe('NOW()');
    });

    it('should handle parameters in template', () => {
      const value = 'test';
      const expr = sql`LOWER(${value})`;
      expect(expr.sql).toContain('LOWER');
      expect(expr.values).toContain('test');
    });
  });
});
