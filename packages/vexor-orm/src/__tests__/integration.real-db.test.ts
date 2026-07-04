/**
 * Real-database integration tests.
 *
 * These run only when connection URLs are provided (CI service containers):
 *   VEXOR_TEST_POSTGRES_URL=postgres://user:pass@localhost:5432/db
 *   VEXOR_TEST_MYSQL_URL=mysql://user:pass@localhost:3306/db
 *
 * Locally without databases they are skipped.
 */

import { describe, it, expect, afterAll } from 'vitest';
import { connect, type Database } from '../database.js';
import { table } from '../core/table.js';
import { column } from '../core/column.js';
import { generateAutoMigration } from '../migrations/diff.js';

const PG_URL = process.env.VEXOR_TEST_POSTGRES_URL;
const MYSQL_URL = process.env.VEXOR_TEST_MYSQL_URL;

const items = table('vexor_it_items', {
  id: column.serial().primaryKey(),
  name: column.varchar(100).notNull(),
  qty: column.integer().notNull(),
});

function suite(dialect: 'postgres' | 'mysql', url: string) {
  describe(`${dialect} integration (real database)`, () => {
    let db: Database;

    async function getDb(): Promise<Database> {
      db ??= await connect(
        { driver: dialect, connectionString: url },
        { pool: { min: 1, max: 2 } }
      );
      return db;
    }

    afterAll(async () => {
      if (db) {
        try {
          await db.query('DROP TABLE IF EXISTS vexor_it_items');
        } finally {
          await db.close();
        }
      }
    });

    it('connects and executes a simple query', async () => {
      const database = await getDb();
      const result = await database.query<{ x: number | string }>('SELECT 1 AS x');
      expect(Number(result.rows[0].x)).toBe(1);
    });

    it('applies an auto-generated migration', async () => {
      const database = await getDb();
      await database.query('DROP TABLE IF EXISTS vexor_it_items');

      const migration = generateAutoMigration(null, [items], { dialect });
      expect(migration.hasChanges).toBe(true);
      for (const sql of migration.up) {
        await database.query(sql);
      }

      // Table exists and accepts writes
      await database.query(
        'INSERT INTO vexor_it_items (name, qty) VALUES ($1, $2)',
        ['widget', 3]
      );
      const rows = await database.query<{ name: string; qty: number }>(
        'SELECT name, qty FROM vexor_it_items WHERE name = $1',
        ['widget']
      );
      expect(rows.rows).toHaveLength(1);
      expect(rows.rows[0].name).toBe('widget');
      expect(Number(rows.rows[0].qty)).toBe(3);
    });

    it('parameter placeholders are translated per dialect', async () => {
      const database = await getDb();
      await database.query(
        'INSERT INTO vexor_it_items (name, qty) VALUES ($1, $2)',
        ['gadget', 7]
      );
      const result = await database.query<{ qty: number }>(
        'SELECT qty FROM vexor_it_items WHERE name = $1 AND qty > $2',
        ['gadget', 1]
      );
      expect(Number(result.rows[0].qty)).toBe(7);
    });

    it('transactions commit and roll back with savepoints', async () => {
      const database = await getDb();

      await database.transaction(async (tx) => {
        await tx.query('INSERT INTO vexor_it_items (name, qty) VALUES ($1, $2)', [
          'tx-keep',
          1,
        ]);

        const sp = await tx.savepoint();
        await tx.query('INSERT INTO vexor_it_items (name, qty) VALUES ($1, $2)', [
          'tx-discard',
          2,
        ]);
        await tx.rollbackTo(sp);
      });

      const kept = await database.query(
        "SELECT name FROM vexor_it_items WHERE name LIKE 'tx-%'"
      );
      expect(kept.rows).toHaveLength(1);
      expect((kept.rows[0] as { name: string }).name).toBe('tx-keep');
    });

    it('rolls back the whole transaction on error', async () => {
      const database = await getDb();

      await expect(
        database.transaction(async (tx) => {
          await tx.query('INSERT INTO vexor_it_items (name, qty) VALUES ($1, $2)', [
            'tx-error',
            1,
          ]);
          throw new Error('boom');
        })
      ).rejects.toThrow('boom');

      const rows = await database.query(
        "SELECT name FROM vexor_it_items WHERE name = 'tx-error'"
      );
      expect(rows.rows).toHaveLength(0);
    });
  });
}

if (PG_URL) {
  suite('postgres', PG_URL);
} else {
  describe.skip('postgres integration (real database)', () => {
    it('skipped — set VEXOR_TEST_POSTGRES_URL to enable', () => {});
  });
}

if (MYSQL_URL) {
  suite('mysql', MYSQL_URL);
} else {
  describe.skip('mysql integration (real database)', () => {
    it('skipped — set VEXOR_TEST_MYSQL_URL to enable', () => {});
  });
}
