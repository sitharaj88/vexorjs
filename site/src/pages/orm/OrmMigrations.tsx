import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const autoMigrationCode = `import { readFile, writeFile } from 'node:fs/promises';
import { generateAutoMigration } from '@vexorjs/orm';
import { users, posts } from './schema';

// Load the previous snapshot (null on the very first run)
let previous = null;
try {
  previous = JSON.parse(
    await readFile('src/db/migrations/schema.snapshot.json', 'utf8')
  );
} catch {
  // first run: no snapshot yet — every table is reported as added
}

const result = generateAutoMigration(previous, [users, posts], {
  dialect: 'postgres',
});

if (result.hasChanges) {
  result.up;       // SQL statements that apply the change
  result.down;     // SQL statements that roll it back
  result.warnings; // operations that need manual attention

  // Persist the new snapshot for the next run — commit it!
  await writeFile(
    'src/db/migrations/schema.snapshot.json',
    JSON.stringify(result.snapshot, null, 2)
  );
}`;

const buildingBlocksCode = `import {
  snapshotSchema,
  diffSchemas,
  generateMigrationFromDiff,
} from '@vexorjs/orm';

// 1. Serialize the current table() definitions to plain JSON
const snapshot = snapshotSchema([users, posts]);

// 2. Compute the difference against a previous snapshot
//    (pass null on first run — every table is reported as added)
const diff = diffSchemas(previousSnapshot, [users, posts]);
diff.addedTables;   // tables present now but not in the snapshot
diff.removedTables; // tables present in the snapshot but not now
diff.changedTables; // added/removed/changed columns, index changes
diff.hasChanges;    // boolean

// 3. Turn the diff into executable up/down SQL
if (diff.hasChanges) {
  const migration = generateMigrationFromDiff(diff, { dialect: 'postgres' });
  migration.up;       // string[]
  migration.down;     // string[]
  migration.warnings; // string[]
}`;

const cliDiffCode = `# Diff src/db/schema.ts against the saved snapshot and write
# a timestamped migration into src/db/migrations/
vexor db:diff --schema src/db/schema.ts --dialect postgres

# Output:
#   src/db/migrations/20260704120000_auto.ts   (up/down SQL — review it!)
#   src/db/migrations/schema.snapshot.json    (updated snapshot)

# Both files should be committed together
git add src/db/migrations/`;

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
        <h2 id="auto-migrations" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Auto-Migrations (Schema Diffing)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Instead of writing migrations by hand, Vexor ORM can <strong>generate them from your
          schema</strong>. It compares a saved snapshot of your <code className="prose-code">table()</code>{' '}
          definitions against their current state and produces the SQL that transforms one into
          the other. The one-call convenience is{' '}
          <code className="prose-code">generateAutoMigration(previousSnapshot | null, [tables], {'{ dialect }'})</code>,
          which returns <code className="prose-code">{'{ up, down, warnings, snapshot, hasChanges }'}</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The diff detects <strong>added and removed tables</strong> (the generated{' '}
          <code className="prose-code">down</code> recreates dropped tables from the snapshot, so
          rollbacks restore their structure), <strong>added, removed, and changed columns</strong>,
          and <strong>index changes</strong>. The snapshot is a plain-JSON serialization of the
          table definitions — commit it to your repository (e.g.{' '}
          <code className="prose-code">src/db/migrations/schema.snapshot.json</code>) so the next
          diff runs against the last known state, exactly like drizzle-kit's metadata.
        </p>
        <CodeBlock code={autoMigrationCode} filename="scripts/diff.ts" showLineNumbers />
        <InfoBlock variant="warning" title="Review the Warnings">
          Some operations cannot be generated safely and are surfaced as{' '}
          <code className="prose-code">warnings</code> instead: <strong>SQLite column
          alterations</strong> (SQLite cannot <code className="prose-code">ALTER COLUMN</code> —
          the migration contains a TODO comment and you must rebuild the table manually) and{' '}
          <strong>NOT NULL columns added without a default</strong>, which will fail on tables
          that already contain rows unless you provide a default value.
        </InfoBlock>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          Building Blocks
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="prose-code">generateAutoMigration()</code> is composed from three
          functions you can also use directly: <code className="prose-code">snapshotSchema()</code>{' '}
          serializes table definitions to a snapshot, <code className="prose-code">diffSchemas()</code>{' '}
          computes the difference between a snapshot and the current definitions, and{' '}
          <code className="prose-code">generateMigrationFromDiff()</code> turns a diff into
          executable up/down SQL for a given dialect.
        </p>
        <CodeBlock code={buildingBlocksCode} showLineNumbers />

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          CLI Workflow
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In practice you rarely call these functions yourself — the{' '}
          <code className="prose-code">vexor db:diff</code> command wraps the whole flow: it loads
          your schema module, diffs it against{' '}
          <code className="prose-code">schema.snapshot.json</code> in the migrations directory,
          writes a timestamped migration file, and updates the snapshot. Commit the migration and
          the snapshot together.
        </p>
        <CodeBlock code={cliDiffCode} language="bash" />
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
