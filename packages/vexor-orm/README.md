# @vexorjs/orm

Blazing-fast, type-safe ORM for Node.js with full TypeScript inference.

```bash
npm install @vexorjs/orm

# Plus your driver:
npm install pg              # PostgreSQL
npm install better-sqlite3  # SQLite
npm install mysql2          # MySQL / MariaDB
```

---

## Highlights

- **Three drivers, one client** — `Database` works with PostgreSQL, SQLite, and MySQL. PostgreSQL-style `$N` placeholders translate per driver automatically.
- **Type-safe query builder** — `select`/`insert`/`update`/`delete`/CTEs/subqueries/`UNION`/`INTERSECT`
- **Relations + eager loading** — `hasOne`, `hasMany`, `belongsTo`, `belongsToMany` with single IN-query loading (no N+1)
- **Soft-delete-aware relations** — `softDeletable(table)` auto-filters `deleted_at IS NULL`
- **Schema as code** — `db.createTable()`, `db.dropTable()`, `db.addColumn()`, `db.dropColumn()` materialize schemas with declared indexes
- **Query result cache** — TTL + LRU + in-flight de-duplication; pluggable backend (in-memory or your own Redis adapter)
- **Migrations** — version tracking, dry-run, rollback
- **Soft delete** — table column injection, query filtering, restore
- **Seeding** — factories, sequences, fake data
- **Connection pooling** — health checks, prepared statement caching, transactions with isolation levels

---

## Quick start

```ts
import { connect, table, column, eq } from '@vexorjs/orm';

const users = table('users', {
  id: column.serial().primaryKey(),
  email: column.varchar(255).notNull().unique(),
  name: column.varchar(255).notNull(),
  created_at: column.timestamp().defaultNow(),
});

const db = await connect({
  driver: 'postgres',
  connectionString: process.env.DATABASE_URL,
});

await db.createTable(users);

await db.insertInto(users, { email: 'a@b.com', name: 'Alice' });

const alice = await db.findOne(users, eq('email', 'a@b.com'));
```

---

## Drivers

```ts
// PostgreSQL
const db = await connect({
  driver: 'postgres',
  connectionString: 'postgres://user:pass@host/db',
  pool: true,
});

// SQLite
const db = await connect({ driver: 'sqlite', filename: ':memory:' });

// MySQL
const db = await connect({
  driver: 'mysql',
  host: 'localhost',
  database: 'app',
  user: 'root',
  password: '',
});
```

The shared query builder emits PostgreSQL-style `$N` placeholders — SQLite and MySQL drivers translate to `?` automatically.

---

## Schema as code

Generate `CREATE TABLE` (with declared indexes) directly from a `TableDef`:

```ts
import { table, column, index, uniqueIndex } from '@vexorjs/orm';

const events = table('events', {
  id: column.serial().primaryKey(),
  user_id: column.integer().notNull(),
  email: column.text().notNull(),
}, {
  indexes: [
    index('idx_events_user', 'user_id'),
    uniqueIndex('uq_events_email', 'email'),
  ],
});

await db.createTable(events, { ifNotExists: true });
await db.dropTable(events, { ifExists: true });
await db.addColumn(events, 'archived_at', column.timestamp());
await db.dropColumn(events, 'archived_at');
```

---

## Relations + eager loading

One IN-query per relation across all parents — never one query per parent.

```ts
import { hasMany, hasOne, belongsTo, belongsToMany } from '@vexorjs/orm';

const usersRows = await db.findMany(users);

await db.loadRelations(
  usersRows,
  {
    posts: hasMany(posts, { foreignKey: 'user_id' }),
    profile: hasOne(profiles, { foreignKey: 'user_id' }),
    company: belongsTo(companies, { foreignKey: 'company_id' }),
    tags: belongsToMany(tags, {
      through: userTags,
      sourceKey: 'user_id',
      targetKey: 'tag_id',
    }),
  },
  { posts: true, profile: true, company: true, tags: true }
);

// usersRows[0].posts → Post[]
// usersRows[0].profile → Profile | null
// usersRows[0].company → Company | null
// usersRows[0].tags → Tag[]
```

### Soft-delete-aware

Pass `softDeletable(table)` as the relation target to auto-filter deleted rows:

```ts
import { softDeletable, hasMany } from '@vexorjs/orm';

await db.loadRelations(
  usersRows,
  { posts: hasMany(softDeletable(posts), { foreignKey: 'user_id' }) },
  { posts: true }
);
// → SELECT * FROM "posts" WHERE "user_id" IN (...) AND "deleted_at" IS NULL
```

Custom column, boolean-flag mode, and `includeDeleted: true` are all honored.

---

## Query result cache

Wire a cache into `Database` and use `db.cached()` for opt-in caching:

```ts
import { connect, createQueryCache } from '@vexorjs/orm';

const db = await connect(config, {
  cache: createQueryCache({ defaultTtlMs: 30_000 }),
});

const popular = await db.cached(
  'SELECT * FROM products WHERE qty > $1',
  [0],
  { ttlMs: 60_000 }
);

// Invalidate after writes
await db.invalidateCache(/* optional key */);
```

Concurrent callers share a single in-flight DB call. For Redis-backed caching, implement `QueryCacheStore` against your client and pass `new QueryCache({ store })`.

---

## Transactions

```ts
await db.transaction(async (tx) => {
  await tx.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [100, 1]);
  await tx.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [100, 2]);
}, { isolationLevel: 'serializable' });
```

Isolation levels: `read uncommitted`, `read committed`, `repeatable read`, `serializable`.

---

## Migrations

```ts
import type { MigrationFile } from '@vexorjs/orm';

const migrations: MigrationFile[] = [
  {
    version: '001',
    name: 'create_users',
    up: 'CREATE TABLE users (...)',
    down: 'DROP TABLE users',
  },
];

await db.migrate(migrations);
await db.rollback();

// Status
const runner = db.getMigrations(migrations);
const status = await runner.status();
```

---

## Soft delete

```ts
import { softDeletable, addSoftDeleteColumn } from '@vexorjs/orm';

await addSoftDeleteColumn(db, 'users');

const usersTable = softDeletable(users);
// Use the wrapper anywhere a TableDef is accepted to get auto-filtering.
```

---

## Seeding

```ts
import { createFactory, createSeederRunner, fake } from '@vexorjs/orm';

const userFactory = createFactory(users, () => ({
  name: fake.name(),
  email: fake.email(),
}));

const runner = createSeederRunner(db);
await runner.run('users-seeder', async () => {
  await userFactory.createMany(100);
});
```

---

## Documentation

- **Full docs**: <https://sitharaj88.github.io/vexorjs/orm>
- **Examples**: [`examples/orm-relations`](../../examples/orm-relations), [`examples/orm-query-cache`](../../examples/orm-query-cache)

## License

MIT
