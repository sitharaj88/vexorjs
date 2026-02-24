# @vexorjs/orm

Blazing-fast, type-safe ORM for the Vexor framework.

## Features

- **Type-Safe Queries** - Full TypeScript inference for all queries
- **Query Builder** - SQL-like syntax with type safety
- **Migrations** - Version-controlled, reversible migrations
- **Connection Pooling** - Intelligent pooling with health checks
- **Multi-Database** - PostgreSQL, MySQL, SQLite support

## Installation

```bash
npm install @vexorjs/orm

# Install your database driver
npm install pg              # for PostgreSQL
npm install better-sqlite3  # for SQLite
```

## Quick Start

```typescript
import { vexor, eq } from '@vexorjs/orm';
import { PostgresDriver } from '@vexorjs/orm/postgres';

// Define schema
const users = vexor.table('users', {
  id: vexor.serial().primaryKey(),
  name: vexor.varchar(255).notNull(),
  email: vexor.varchar(255).unique().notNull(),
  createdAt: vexor.timestamp().defaultNow()
});

// Create connection
const db = await PostgresDriver.connect({
  connectionString: process.env.DATABASE_URL
});

// Type-safe queries
const user = await db.select()
  .from(users)
  .where(eq(users.id, 1))
  .first();

// Insert with type checking
const newUser = await db.insert(users).values({
  name: 'John Doe',
  email: 'john@example.com'
}).returning();

// Transactions
await db.transaction(async (tx) => {
  await tx.insert(users).values({ name: 'Alice', email: 'alice@example.com' });
  await tx.update(users).set({ name: 'Updated' }).where(eq(users.id, 1));
});
```

## Documentation

Visit [github.com/sitharaj88/vexorjs](https://github.com/sitharaj88/vexorjs) for full documentation.

## License

MIT
