import CodeBlock from '../../components/CodeBlock';

const createMigrationCode = `# Generate a new migration
vexor db:migration:generate add_users_table

# This creates a file like:
# migrations/20240115120000_add_users_table.ts`;

const migrationFileCode = `import { Migration } from '@vexorjs/orm';

export const migration: Migration = {
  name: '20240115120000_add_users_table',

  async up(db) {
    await db.schema.createTable('users', (table) => {
      table.serial('id').primaryKey();
      table.varchar('name', 255).notNull();
      table.varchar('email', 255).unique().notNull();
      table.timestamp('created_at').defaultNow();
    });

    // Create index
    await db.schema.createIndex('users', 'email');
  },

  async down(db) {
    await db.schema.dropTable('users');
  },
};`;

const runMigrationsCode = `# Run all pending migrations
vexor db:migrate

# Rollback last migration
vexor db:rollback

# Rollback all migrations
vexor db:rollback --all

# Check migration status
vexor db:status`;

const schemaBuilderCode = `// Create table
await db.schema.createTable('posts', (table) => {
  table.serial('id').primaryKey();
  table.varchar('title', 255).notNull();
  table.text('content');
  table.integer('author_id').references('users', 'id');
  table.timestamp('created_at').defaultNow();
  table.timestamp('updated_at');
});

// Alter table
await db.schema.alterTable('posts', (table) => {
  table.addColumn('slug', 'varchar(255)');
  table.dropColumn('old_column');
  table.renameColumn('title', 'headline');
});

// Create index
await db.schema.createIndex('posts', ['author_id', 'created_at']);

// Create unique index
await db.schema.createUniqueIndex('posts', 'slug');

// Drop table
await db.schema.dropTable('posts');

// Drop index
await db.schema.dropIndex('posts', 'posts_slug_idx');`;

const seedingCode = `// seeds/users.ts
import { db, users } from '../db';

export async function seed() {
  await db.insert(users).values([
    { name: 'Admin', email: 'admin@example.com', role: 'admin' },
    { name: 'User', email: 'user@example.com', role: 'user' },
  ]);
}

// Run with: vexor db:seed`;

export default function OrmMigrations() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="migrations" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Migrations
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Version-controlled database schema changes with automatic rollback support.
        </p>
      </div>

      <section>
        <h2 id="creating" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Creating Migrations
        </h2>
        <CodeBlock code={createMigrationCode} language="bash" />
      </section>

      <section>
        <h2 id="migration-file" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Migration File Structure
        </h2>
        <CodeBlock code={migrationFileCode} showLineNumbers />
      </section>

      <section>
        <h2 id="running" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Running Migrations
        </h2>
        <CodeBlock code={runMigrationsCode} language="bash" />
      </section>

      <section>
        <h2 id="schema-builder" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Schema Builder
        </h2>
        <CodeBlock code={schemaBuilderCode} showLineNumbers />
      </section>

      <section>
        <h2 id="seeding" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Database Seeding
        </h2>
        <CodeBlock code={seedingCode} />
      </section>
    </div>
  );
}
