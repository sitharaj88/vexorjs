import CodeBlock from '../../components/CodeBlock';

const tableDefinitionCode = `import { table, column } from 'vexor-orm';

// Define a table
const users = table('users', {
  // Primary key
  id: column.serial().primaryKey(),

  // String columns
  name: column.varchar(255).notNull(),
  email: column.varchar(255).unique().notNull(),
  bio: column.text(),

  // Numbers
  age: column.integer(),
  balance: column.decimal(10, 2).default(0),

  // Boolean
  active: column.boolean().default(true),

  // Timestamps
  createdAt: column.timestamp().defaultNow(),
  updatedAt: column.timestamp(),

  // JSON
  metadata: column.json<{ tags: string[] }>(),

  // Enum
  role: column.enum(['admin', 'user', 'guest']).default('user'),
});`;

const columnTypesCode = `// String types
column.varchar(length)     // VARCHAR(n)
column.char(length)        // CHAR(n)
column.text()              // TEXT

// Numeric types
column.integer()           // INTEGER
column.smallint()          // SMALLINT
column.bigint()            // BIGINT
column.serial()            // SERIAL (auto-increment)
column.decimal(p, s)       // DECIMAL(precision, scale)
column.real()              // REAL
column.doublePrecision()   // DOUBLE PRECISION

// Boolean
column.boolean()           // BOOLEAN

// Date/Time
column.date()              // DATE
column.time()              // TIME
column.timestamp()         // TIMESTAMP
column.timestamptz()       // TIMESTAMP WITH TIME ZONE

// Binary
column.bytea()             // BYTEA

// JSON
column.json<T>()           // JSON
column.jsonb<T>()          // JSONB (PostgreSQL)

// UUID
column.uuid()              // UUID

// Enum
column.enum(values)        // ENUM`;

const modifiersCode = `column.varchar(255)
  .notNull()               // NOT NULL constraint
  .unique()                // UNIQUE constraint
  .primaryKey()            // PRIMARY KEY
  .default('value')        // DEFAULT value
  .defaultNow()            // DEFAULT NOW() for timestamps
  .references(() => other.id)  // FOREIGN KEY`;

const indexesCode = `const posts = table('posts', {
  id: column.serial().primaryKey(),
  title: column.varchar(255).notNull(),
  slug: column.varchar(255).notNull(),
  authorId: column.integer().notNull(),
  publishedAt: column.timestamp(),
}, (t) => ({
  // Single column index
  slugIndex: t.index('slug'),

  // Unique index
  uniqueSlug: t.uniqueIndex('slug'),

  // Composite index
  authorDate: t.index(['authorId', 'publishedAt']),

  // Foreign key
  authorFk: t.foreignKey('authorId').references(() => users.id),
}));`;

const typeInferenceCode = `import { table, column, InferSelect, InferInsert } from 'vexor-orm';

const users = table('users', {
  id: column.serial().primaryKey(),
  name: column.varchar(255).notNull(),
  email: column.varchar(255).notNull(),
  age: column.integer(),
});

// Infer the SELECT type (what you get from queries)
type User = InferSelect<typeof users>;
// { id: number; name: string; email: string; age: number | null }

// Infer the INSERT type (what you pass to insert)
type NewUser = InferInsert<typeof users>;
// { name: string; email: string; age?: number | null }`;

export default function OrmSchema() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="schema" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Schema Definition
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Define your database schema with TypeScript and get full type inference.
        </p>
      </div>

      <section>
        <h2 id="tables" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Defining Tables
        </h2>
        <CodeBlock code={tableDefinitionCode} showLineNumbers />
      </section>

      <section>
        <h2 id="column-types" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Column Types
        </h2>
        <CodeBlock code={columnTypesCode} />
      </section>

      <section>
        <h2 id="modifiers" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Column Modifiers
        </h2>
        <CodeBlock code={modifiersCode} />
      </section>

      <section>
        <h2 id="indexes" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Indexes & Constraints
        </h2>
        <CodeBlock code={indexesCode} showLineNumbers />
      </section>

      <section>
        <h2 id="type-inference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Type Inference
        </h2>
        <CodeBlock code={typeInferenceCode} />
      </section>
    </div>
  );
}
