import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { createFactory, defineSeeder, createSeederRunner, fake } from '@vexorjs/orm';
import { db } from './db';
import { users, posts } from './schema';

// Define a factory for creating user records
const userFactory = createFactory(db, {
  table: users,
  definition: () => ({
    name: fake.fullName(),
    email: fake.email(),
    password: fake.password(),
    role: 'user',
    createdAt: fake.date({ past: true }),
  }),
});

// Create a single user
const user = await userFactory.create();

// Create multiple users
const manyUsers = await userFactory.createMany(10);`;

const factoryCode = `import { createFactory, fake, Sequence } from '@vexorjs/orm';
import { db } from './db';
import { users, posts, comments } from './schema';

const seq = new Sequence();

const userFactory = createFactory(db, {
  table: users,
  definition: () => ({
    name: fake.fullName(),
    email: \`user-\${seq.next()}@example.com\`,
    username: fake.username(),
    bio: fake.sentence(),
    role: 'user',
    active: true,
    createdAt: fake.date({ past: true }),
  }),
});

const postFactory = createFactory(db, {
  table: posts,
  definition: () => ({
    title: fake.sentence(),
    slug: fake.word() + '-' + fake.word() + '-' + Date.now(),
    content: fake.paragraph(),
    published: fake.boolean(),
    authorId: 1, // Override with state or explicit value
    createdAt: fake.date({ past: true }),
  }),
});

// make() builds the object in memory without inserting
const userData = userFactory.make();
console.log(userData.name); // "John Smith"

// makeMany() builds multiple objects without inserting
const userDataList = userFactory.makeMany(5);

// create() inserts into the database and returns the record
const user = await userFactory.create();

// createMany() inserts multiple records
const users = await userFactory.createMany(20);

// Override specific fields
const admin = await userFactory.create({
  role: 'admin',
  email: 'admin@example.com',
});`;

const fakeDataCode = `import { fake } from '@vexorjs/orm';

// Identity
fake.uuid();          // "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
fake.firstName();     // "Sarah"
fake.lastName();      // "Johnson"
fake.fullName();      // "Sarah Johnson"
fake.email();         // "sarah.johnson@example.com"
fake.username();      // "sjohnson42"
fake.password();      // "kX9$mP2nQ7"

// Text
fake.word();          // "ephemeral"
fake.sentence();      // "The quick brown fox jumps over the lazy dog."
fake.paragraph();     // "Lorem ipsum dolor sit amet..."

// Numbers
fake.int({ min: 1, max: 100 });   // 42
fake.float({ min: 0, max: 1 });   // 0.7312
fake.price({ min: 10, max: 500 }); // 129.99

// Date & Boolean
fake.date();                        // 2024-06-15T10:30:00.000Z
fake.date({ past: true });          // 2023-02-10T08:15:00.000Z
fake.date({ future: true });        // 2025-11-20T14:45:00.000Z
fake.boolean();                     // true

// Address
fake.streetAddress();  // "123 Main Street"
fake.city();           // "Portland"
fake.state();          // "Oregon"
fake.zipCode();        // "97201"

// Contact & Business
fake.phoneNumber();    // "+1-555-867-5309"
fake.url();            // "https://example.com/page"
fake.companyName();    // "Acme Corporation"
fake.jobTitle();       // "Senior Software Engineer"`;

const statesCode = `import { createFactory, fake } from '@vexorjs/orm';

const userFactory = createFactory(db, {
  table: users,
  definition: () => ({
    name: fake.fullName(),
    email: fake.email(),
    password: fake.password(),
    role: 'user',
    active: true,
    emailVerifiedAt: null,
    createdAt: fake.date({ past: true }),
  }),
});

// Define reusable states
const adminFactory = userFactory.state({
  role: 'admin',
  active: true,
  emailVerifiedAt: new Date(),
});

const inactiveFactory = userFactory.state({
  active: false,
});

const unverifiedFactory = userFactory.state({
  emailVerifiedAt: null,
});

// Use states
const admin = await adminFactory.create();
const inactiveUser = await inactiveFactory.create();

// Chain states with withState()
const inactiveAdmin = await userFactory
  .withState({ role: 'admin' })
  .withState({ active: false })
  .create();

// Combine state with overrides
const specificAdmin = await adminFactory.create({
  name: 'Super Admin',
  email: 'superadmin@example.com',
});`;

const seederRunnerCode = `import {
  defineSeeder,
  createSeederRunner,
  truncate,
  fake,
} from '@vexorjs/orm';
import { db } from './db';
import { users, posts, comments } from './schema';

// Define individual seeders
const userSeeder = defineSeeder({
  name: 'users',

  async run(db) {
    // Create 50 regular users
    await userFactory.createMany(50);

    // Create 3 admin users
    await adminFactory.createMany(3);

    console.log('Seeded 53 users');
  },

  async revert(db) {
    await truncate(db, ['users']);
  },
});

const postSeeder = defineSeeder({
  name: 'posts',

  async run(db) {
    const allUsers = await db.select({ id: users.id }).from(users);

    for (const user of allUsers) {
      const count = fake.int({ min: 1, max: 5 });
      await postFactory.createMany(count, {
        authorId: user.id,
      });
    }

    console.log('Seeded posts for all users');
  },

  async revert(db) {
    await truncate(db, ['posts']);
  },
});

// Create and run the seeder runner
const runner = createSeederRunner({
  db,
  seeders: [userSeeder, postSeeder],
  // Truncate tables before seeding
  truncateBefore: true,
  // Tables to truncate (in order, respecting foreign keys)
  truncateTables: ['comments', 'posts', 'users'],
});

// Run all seeders
await runner.run();

// Run a specific seeder
await runner.run('users');

// Revert all seeders
await runner.revert();`;

const truncateCode = `import { truncate } from '@vexorjs/orm';
import { db } from './db';

// Truncate a single table
await truncate(db, ['users']);

// Truncate multiple tables (order matters for foreign keys)
await truncate(db, ['comments', 'posts', 'users']);

// Use in tests for clean state
beforeEach(async () => {
  await truncate(db, ['comments', 'posts', 'users']);
});

afterAll(async () => {
  await truncate(db, ['comments', 'posts', 'users']);
});`;

const sequenceCode = `import { Sequence } from '@vexorjs/orm';

// Auto-incrementing sequence
const seq = new Sequence();
seq.next();    // 1
seq.next();    // 2
seq.current(); // 2
seq.reset();
seq.next();    // 1

// Use in factories for unique values
const userFactory = createFactory(db, {
  table: users,
  definition: () => ({
    email: \`user-\${seq.next()}@test.com\`,
    name: fake.fullName(),
  }),
});

// Custom starting value
const idSeq = new Sequence(1000);
idSeq.next(); // 1000
idSeq.next(); // 1001`;

export default function OrmSeeders() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="seeders" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Seeders &amp; Factories
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Every application needs data to function, whether it is a developer testing a new feature locally, a QA engineer running regression tests against a staging environment, or a demo that needs to look realistic for a sales presentation. Manually inserting test data through SQL scripts or admin interfaces is tedious, error-prone, and impossible to keep synchronized across team members. Factories and seeders solve this problem by defining how to generate data programmatically, making test data creation repeatable, composable, and version-controlled.
        </p>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          A factory is a blueprint for a single database record. It defines which table the record belongs to and provides a function that generates realistic field values using the built-in <code className="prose-code">fake</code> data generator. Each time the factory is invoked, it produces a new record with unique, randomized data. This is fundamentally different from static fixture files (like JSON or SQL dumps) because factories generate fresh data on every run, exercising your application against a wider variety of inputs and exposing edge cases that a fixed dataset would miss.
        </p>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          A seeder is an orchestration layer that coordinates factory calls to populate an entire database. Seeders define the order in which tables are populated (respecting foreign key dependencies), the volume of records to create, and the relationships between records. They are the bridge between individual factories and a fully populated database environment that mimics production.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The Vexor ORM provides a complete toolkit for this workflow: <code className="prose-code">createFactory()</code> for defining record blueprints, <code className="prose-code">fake</code> for generating realistic data across dozens of categories, <code className="prose-code">Sequence</code> for generating unique incrementing values, <code className="prose-code">defineSeeder()</code> for organizing population logic, and <code className="prose-code">createSeederRunner()</code> for executing seeders with table truncation and ordering guarantees.
        </p>
      </div>

      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When you call <code className="prose-code">createFactory()</code>, Vexor registers a factory definition that associates a table reference with a builder function. The builder function is a plain JavaScript function that returns an object whose keys match the table's column names. Each time the factory is invoked, the builder function executes fresh, calling into the <code className="prose-code">fake</code> module to generate new random values. This means every record is unique by default.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">fake</code> module is a lightweight, zero-dependency data generator built into the ORM. It uses a seeded pseudorandom number generator internally, which means that if you provide a seed value, the sequence of generated data is deterministic and reproducible. This is critical for testing: you can write assertions against specific generated values without worrying about randomness breaking your tests between runs.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Factories support two creation modes. The <code className="prose-code">make()</code> and <code className="prose-code">makeMany()</code> methods build objects in memory without touching the database. These are ideal for unit tests where you need typed objects that conform to your schema but do not require persistence. The <code className="prose-code">create()</code> and <code className="prose-code">createMany()</code> methods insert records into the database and return the full row including auto-generated fields like primary keys and default timestamps.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The seeder runner executes seeders in the order they appear in the <code className="prose-code">seeders</code> array, which lets you control dependency order. For example, a user seeder must run before a post seeder because posts reference user IDs via foreign keys. If <code className="prose-code">truncateBefore</code> is enabled, the runner truncates the specified tables in the given order before running any seeders, ensuring a clean starting state. Each seeder's optional <code className="prose-code">revert()</code> method provides an undo path that can be called independently.
        </p>
      </section>

      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          When to Use Factories and Seeders
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Factories are the right tool whenever your tests need database records or typed objects. Use <code className="prose-code">make()</code> in unit tests to create objects without database overhead, and <code className="prose-code">create()</code> in integration tests where records must exist in the database for queries, joins, and cascading operations to work correctly. Factories replace ad-hoc object construction with a centralized definition that evolves with your schema.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Seeders are the right tool for populating entire environments. Run seeders against your local development database to have a realistic dataset for manual testing and UI development. Run them against a staging database to prepare for QA and demo sessions. Include them in your CI pipeline to set up database state before integration test suites execute. The key advantage of seeders over SQL dump files is that they are code: they can generate variable amounts of data, create relationships dynamically, and adapt to schema changes without manual editing.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          For production databases, seeders are occasionally used to insert reference data such as roles, permission sets, country codes, or default configuration records. These "bootstrap seeders" should be idempotent, meaning they can run multiple times without creating duplicate records. Use upsert logic or existence checks inside these seeders to ensure safety.
        </p>
      </section>

      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Define a factory by calling <code className="prose-code">createFactory()</code> with a database instance, a table reference, and a definition function. The definition function is called each time a record is generated, and it should return an object with values for every required column. Optional columns can be omitted and will use their database defaults.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">fake</code> helper provides generators for common data types. Each generator produces realistic values: <code className="prose-code">fake.fullName()</code> returns names that look like real names, <code className="prose-code">fake.email()</code> returns properly formatted email addresses, and <code className="prose-code">fake.date({'{ past: true }'})</code> returns dates in the past. This realism is important because it helps you spot rendering issues, truncation bugs, and validation edge cases that would be invisible with placeholder data like "test123."
        </p>
        <CodeBlock code={basicUsageCode} filename="seeds/index.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="factories" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Factories
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The factory API is designed around two core operations: building objects in memory and persisting records to the database. The <code className="prose-code">make()</code> method executes the definition function, applies any overrides or states, and returns the resulting plain object. No database call is made. This is fast and suitable for unit tests where you need a correctly shaped object but do not need it to exist in any table.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">create()</code> method does everything <code className="prose-code">make()</code> does, then inserts the object into the associated table using a SQL <code className="prose-code">INSERT</code> statement with a <code className="prose-code">RETURNING</code> clause. The returned object includes auto-generated values like serial IDs, default timestamps, and database-computed columns. This makes it easy to reference the created record's primary key when setting up related records in subsequent factory calls.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Both methods accept an optional overrides object that replaces specific fields in the generated data. Overrides take precedence over the definition function and any applied states. This lets you create variations without defining a new factory: call <code className="prose-code">userFactory.create({'{ role: "admin" }'})</code> to produce an admin user from the standard user factory.
        </p>
        <CodeBlock code={factoryCode} filename="seeds/factories.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Use <code className="prose-code">make()</code> in unit tests where you need typed objects
          but do not want database overhead. Use <code className="prose-code">create()</code> for
          integration tests that require persisted data.
        </InfoBlock>
      </section>

      <section>
        <h2 id="fake-data" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Fake Data Generation
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">fake</code> module provides a comprehensive library of data generators organized by category: identity (names, emails, usernames), text (words, sentences, paragraphs), numbers (integers, floats, prices), dates, booleans, addresses, and business data (company names, job titles, phone numbers). Each generator is designed to produce values that look realistic and conform to the expected format for that data type.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Internally, the generators use curated word lists, name databases, and format templates to assemble values. For example, <code className="prose-code">fake.email()</code> combines a generated first name, last name, and a random domain to produce addresses like "sarah.johnson@example.com." The <code className="prose-code">fake.price()</code> generator produces numbers with exactly two decimal places, matching how prices are typically stored and displayed. These details matter because they exercise your application's formatting, validation, and rendering logic with data that resembles what real users would produce.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Unlike heavyweight external libraries, the Vexor <code className="prose-code">fake</code> module is zero-dependency and lightweight. It is bundled as part of the ORM package and adds negligible size to your development dependencies. When seeded with a fixed value, all generators produce deterministic output, meaning your test assertions can rely on specific generated values without flaking due to randomness.
        </p>
        <CodeBlock code={fakeDataCode} filename="fake-examples.ts" showLineNumbers />
        <InfoBlock variant="info">
          The <code className="prose-code">fake</code> module is lightweight and has no external
          dependencies. All generators produce deterministic output when seeded, making tests
          reproducible.
        </InfoBlock>
      </section>

      <section>
        <h2 id="states" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          States
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In real applications, database records often have multiple distinct configurations. A user might be an admin or a regular user, active or inactive, verified or unverified. Rather than defining a separate factory for each configuration, states let you define reusable sets of attribute overrides that can be applied to any factory.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">state()</code> method returns a new factory instance with the specified overrides baked in. The original factory is not modified, following an immutable pattern. You can create multiple state variants from the same base factory and each one operates independently. The <code className="prose-code">withState()</code> method provides a chainable alternative that applies overrides inline without creating a named variant.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          States compose by merging: when you chain multiple <code className="prose-code">withState()</code> calls, each subsequent state's overrides are merged on top of the previous ones. If two states set the same field, the last one wins. You can also combine states with per-call overrides passed to <code className="prose-code">create()</code>, and overrides always take the highest precedence. This layering system -- definition, then states, then overrides -- gives you fine-grained control over the generated data without repetitive factory definitions.
        </p>
        <CodeBlock code={statesCode} filename="seeds/factories.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="sequences" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Sequences
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Many database columns require unique values. Emails must be unique across users, slugs must be unique across posts, and external identifiers must not collide. While <code className="prose-code">fake.email()</code> generates realistic addresses, it does not guarantee uniqueness. If you create 1,000 users, there is a chance that two generated emails will collide, causing a unique constraint violation.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">Sequence</code> class solves this by providing a simple auto-incrementing counter. Each call to <code className="prose-code">seq.next()</code> returns the next integer in the sequence, guaranteeing uniqueness. By embedding a sequence value into generated fields -- for example, <code className="prose-code">{"`user-${seq.next()}@test.com`"}</code> -- you ensure that every record has a distinct value for that column regardless of how many records are created.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Sequences can be reset between test runs using <code className="prose-code">seq.reset()</code>, which returns the counter to its starting value. You can also initialize a sequence with a custom starting number, which is useful when you need generated IDs to fall within a specific range or avoid collisions with fixture data that already exists in the database.
        </p>
        <CodeBlock code={sequenceCode} />
      </section>

      <section>
        <h2 id="seeder-runner" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Seeder Runner
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          While factories handle individual record creation, seeders handle the orchestration of populating an entire database. A seeder is a named unit of work that creates records for one or more related tables. It has a <code className="prose-code">run()</code> method that inserts data and an optional <code className="prose-code">revert()</code> method that cleans up. This paired structure makes seeders reversible, which is valuable for tearing down test environments or resetting databases to a known state.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">createSeederRunner()</code> function accepts an array of seeders and executes them in the specified order. Ordering matters because of foreign key dependencies: you must seed the users table before the posts table if posts reference user IDs. The runner also supports a <code className="prose-code">truncateBefore</code> option that clears the specified tables before seeding, ensuring a clean slate. The <code className="prose-code">truncateTables</code> array must list tables in reverse dependency order (children before parents) to avoid foreign key constraint violations during truncation.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You can run all seeders at once with <code className="prose-code">runner.run()</code> or target a specific seeder by name with <code className="prose-code">runner.run('users')</code>. Running individual seeders is useful during development when you only need to refresh data for the table you are actively working with. The <code className="prose-code">runner.revert()</code> method calls each seeder's <code className="prose-code">revert()</code> method in reverse order, ensuring that dependent data is cleaned up before parent data.
        </p>
        <CodeBlock code={seederRunnerCode} filename="seeds/run.ts" showLineNumbers />
        <InfoBlock variant="warning">
          When using <code className="prose-code">truncateBefore</code>, list tables in reverse
          dependency order (children before parents) to avoid foreign key constraint violations.
        </InfoBlock>
      </section>

      <section>
        <h2 id="truncation" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Truncation
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">truncate()</code> helper removes all rows from the specified tables using SQL <code className="prose-code">TRUNCATE</code> statements, which are much faster than <code className="prose-code">DELETE</code> because they do not generate individual row deletion logs. Truncation resets auto-increment counters and is the preferred way to clean up between test runs.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The order of tables in the array matters when foreign key constraints are present. A table that references another table via a foreign key must be truncated first. For example, if <code className="prose-code">comments</code> references <code className="prose-code">posts</code> which references <code className="prose-code">users</code>, the correct truncation order is <code className="prose-code">['comments', 'posts', 'users']</code>. Truncating in the wrong order results in a foreign key constraint violation error.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In test suites, place truncation in <code className="prose-code">beforeEach()</code> to ensure each test starts with a clean database, or in <code className="prose-code">afterAll()</code> to clean up after the entire suite completes. The choice depends on your testing strategy: per-test truncation provides the strongest isolation but is slower, while post-suite truncation is faster but means tests can observe each other's data if they share a database.
        </p>
        <CodeBlock code={truncateCode} filename="tests/helpers.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Define factories in a dedicated file that is shared across your test suite and seeder scripts. This prevents duplication and ensures that when a schema column changes, you only need to update the factory definition in one place. Export both the base factory and commonly used state variants so that tests can import them directly.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Prefer <code className="prose-code">make()</code> over <code className="prose-code">create()</code> in unit tests. Database operations are the primary bottleneck in test suite performance, and many tests only need a correctly shaped object to pass to a function under test. Reserve <code className="prose-code">create()</code> for integration tests where the record must exist in the database for queries, joins, or cascading operations to work.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use sequences for columns with unique constraints instead of relying on random generators. While the probability of a collision from <code className="prose-code">fake.email()</code> is low for small datasets, it becomes significant when creating hundreds or thousands of records. A sequence-based pattern like <code className="prose-code">{"`user-${seq.next()}@test.com`"}</code> guarantees uniqueness regardless of volume.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Make production bootstrap seeders idempotent. If a seeder inserts reference data like roles or permission sets, it should check whether the data already exists before inserting. This allows the seeder to be run safely during deployments without creating duplicate records or failing on unique constraint violations.
        </p>
      </section>

      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          fake Methods
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Method</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Return Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Options</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.uuid()</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Generates a random UUID v4 string in the standard 8-4-4-4-12 hyphenated format. Each call produces a unique value suitable for primary keys, external identifiers, or correlation IDs.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.firstName()</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Returns a randomly selected first name from an internal name database. Names are drawn from a diverse set to provide varied test data across runs.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.lastName()</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Returns a randomly selected last name. Pairs with <code className="prose-code">fake.firstName()</code> to build full names, or use <code className="prose-code">fake.fullName()</code> for the combined result.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.fullName()</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Combines a random first and last name into a single string separated by a space. Useful for display name columns and user profile fields.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.email()</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Generates a realistic email address by combining name fragments with a random domain. The result conforms to standard email format but is not guaranteed unique across calls. Use a <code className="prose-code">Sequence</code> for guaranteed uniqueness.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.username()</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Generates a username string combining name fragments with optional numeric suffixes. Suitable for columns that store user handles or login identifiers.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.password()</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Generates a random string of alphanumeric and special characters suitable for password fields. Note that this is a plaintext value for test data; in production, passwords should be hashed before storage.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.int(opts?)</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4">min: 0, max: 10000</td>
                <td className="py-3 px-4">Returns a random integer within the specified range, inclusive of both bounds. Useful for generating quantities, ages, counts, and other whole-number fields.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.float(opts?)</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4">min: 0, max: 1</td>
                <td className="py-3 px-4">Returns a random floating-point number within the specified range. The result has full double-precision accuracy and is suitable for percentages, ratios, and scientific measurements.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.price(opts?)</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4">min: 1, max: 1000</td>
                <td className="py-3 px-4">Returns a random number rounded to exactly two decimal places, matching the common format for monetary values. Useful for order totals, product prices, and invoice amounts.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.date(opts?)</code></td>
                <td className="py-3 px-4"><code className="prose-code">Date</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Returns a random <code className="prose-code">Date</code> object. Pass <code className="prose-code">{'{ past: true }'}</code> for dates before now, or <code className="prose-code">{'{ future: true }'}</code> for dates after now. Without options, the date can fall anywhere within a reasonable range around the current time.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.boolean()</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Returns <code className="prose-code">true</code> or <code className="prose-code">false</code> with equal probability. Useful for flag columns like <code className="prose-code">active</code>, <code className="prose-code">published</code>, or <code className="prose-code">verified</code>.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.word()</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Returns a single random word from an internal dictionary. Useful for generating tags, categories, and slug components.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.sentence()</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Returns a randomly constructed sentence with proper capitalization and punctuation. Suitable for titles, subject lines, and short description fields.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.paragraph()</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Returns a multi-sentence paragraph of generated text. Useful for body content fields, descriptions, and any text column that typically holds longer-form content.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.url()</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Returns a randomly generated HTTPS URL with a realistic domain and path. Suitable for website fields, avatar URLs, and callback configurations.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">fake.companyName()</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Returns a randomly generated company name combining common business name patterns. Useful for organization fields, billing names, and B2B application data.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">fake.jobTitle()</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Returns a randomly generated professional title combining seniority levels, departments, and role names. Suitable for profile fields and HR application test data.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/realtime/sse" className="btn-primary">
            Server-Sent Events <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/orm/soft-deletes" className="btn-secondary">
            Soft Deletes
          </Link>
        </div>
      </section>
    </div>
  );
}
