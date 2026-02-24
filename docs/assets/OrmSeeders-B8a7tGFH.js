import{j as e,C as s,I as a,L as t,A as r}from"./index-BWrueqsD.js";const n=`import { createFactory, defineSeeder, createSeederRunner, fake } from '@vexorjs/orm';
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
const manyUsers = await userFactory.createMany(10);`,o=`import { createFactory, fake, Sequence } from '@vexorjs/orm';
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
});`,d=`import { fake } from '@vexorjs/orm';

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
fake.jobTitle();       // "Senior Software Engineer"`,c=`import { createFactory, fake } from '@vexorjs/orm';

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
});`,i=`import {
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
await runner.revert();`,l=`import { truncate } from '@vexorjs/orm';
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
});`,m=`import { Sequence } from '@vexorjs/orm';

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
idSeq.next(); // 1001`;function u(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"seeders",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"Seeders & Factories"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"Every application needs data to function, whether it is a developer testing a new feature locally, a QA engineer running regression tests against a staging environment, or a demo that needs to look realistic for a sales presentation. Manually inserting test data through SQL scripts or admin interfaces is tedious, error-prone, and impossible to keep synchronized across team members. Factories and seeders solve this problem by defining how to generate data programmatically, making test data creation repeatable, composable, and version-controlled."}),e.jsxs("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:["A factory is a blueprint for a single database record. It defines which table the record belongs to and provides a function that generates realistic field values using the built-in ",e.jsx("code",{className:"prose-code",children:"fake"})," data generator. Each time the factory is invoked, it produces a new record with unique, randomized data. This is fundamentally different from static fixture files (like JSON or SQL dumps) because factories generate fresh data on every run, exercising your application against a wider variety of inputs and exposing edge cases that a fixed dataset would miss."]}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"A seeder is an orchestration layer that coordinates factory calls to populate an entire database. Seeders define the order in which tables are populated (respecting foreign key dependencies), the volume of records to create, and the relationships between records. They are the bridge between individual factories and a fully populated database environment that mimics production."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:["The Vexor ORM provides a complete toolkit for this workflow: ",e.jsx("code",{className:"prose-code",children:"createFactory()"})," for defining record blueprints, ",e.jsx("code",{className:"prose-code",children:"fake"})," for generating realistic data across dozens of categories, ",e.jsx("code",{className:"prose-code",children:"Sequence"})," for generating unique incrementing values, ",e.jsx("code",{className:"prose-code",children:"defineSeeder()"})," for organizing population logic, and ",e.jsx("code",{className:"prose-code",children:"createSeederRunner()"})," for executing seeders with table truncation and ordering guarantees."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"how-it-works",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"How It Works"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When you call ",e.jsx("code",{className:"prose-code",children:"createFactory()"}),", Vexor registers a factory definition that associates a table reference with a builder function. The builder function is a plain JavaScript function that returns an object whose keys match the table's column names. Each time the factory is invoked, the builder function executes fresh, calling into the ",e.jsx("code",{className:"prose-code",children:"fake"})," module to generate new random values. This means every record is unique by default."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"fake"})," module is a lightweight, zero-dependency data generator built into the ORM. It uses a seeded pseudorandom number generator internally, which means that if you provide a seed value, the sequence of generated data is deterministic and reproducible. This is critical for testing: you can write assertions against specific generated values without worrying about randomness breaking your tests between runs."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Factories support two creation modes. The ",e.jsx("code",{className:"prose-code",children:"make()"})," and ",e.jsx("code",{className:"prose-code",children:"makeMany()"})," methods build objects in memory without touching the database. These are ideal for unit tests where you need typed objects that conform to your schema but do not require persistence. The ",e.jsx("code",{className:"prose-code",children:"create()"})," and ",e.jsx("code",{className:"prose-code",children:"createMany()"})," methods insert records into the database and return the full row including auto-generated fields like primary keys and default timestamps."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:["The seeder runner executes seeders in the order they appear in the ",e.jsx("code",{className:"prose-code",children:"seeders"})," array, which lets you control dependency order. For example, a user seeder must run before a post seeder because posts reference user IDs via foreign keys. If ",e.jsx("code",{className:"prose-code",children:"truncateBefore"})," is enabled, the runner truncates the specified tables in the given order before running any seeders, ensuring a clean starting state. Each seeder's optional ",e.jsx("code",{className:"prose-code",children:"revert()"})," method provides an undo path that can be called independently."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"when-to-use",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"When to Use Factories and Seeders"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Factories are the right tool whenever your tests need database records or typed objects. Use ",e.jsx("code",{className:"prose-code",children:"make()"})," in unit tests to create objects without database overhead, and ",e.jsx("code",{className:"prose-code",children:"create()"})," in integration tests where records must exist in the database for queries, joins, and cascading operations to work correctly. Factories replace ad-hoc object construction with a centralized definition that evolves with your schema."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Seeders are the right tool for populating entire environments. Run seeders against your local development database to have a realistic dataset for manual testing and UI development. Run them against a staging database to prepare for QA and demo sessions. Include them in your CI pipeline to set up database state before integration test suites execute. The key advantage of seeders over SQL dump files is that they are code: they can generate variable amounts of data, create relationships dynamically, and adapt to schema changes without manual editing."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:'For production databases, seeders are occasionally used to insert reference data such as roles, permission sets, country codes, or default configuration records. These "bootstrap seeders" should be idempotent, meaning they can run multiple times without creating duplicate records. Use upsert logic or existence checks inside these seeders to ensure safety.'})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"basic-usage",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Basic Usage"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Define a factory by calling ",e.jsx("code",{className:"prose-code",children:"createFactory()"})," with a database instance, a table reference, and a definition function. The definition function is called each time a record is generated, and it should return an object with values for every required column. Optional columns can be omitted and will use their database defaults."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"fake"})," helper provides generators for common data types. Each generator produces realistic values: ",e.jsx("code",{className:"prose-code",children:"fake.fullName()"})," returns names that look like real names, ",e.jsx("code",{className:"prose-code",children:"fake.email()"})," returns properly formatted email addresses, and ",e.jsxs("code",{className:"prose-code",children:["fake.date(","{ past: true }",")"]}),' returns dates in the past. This realism is important because it helps you spot rendering issues, truncation bugs, and validation edge cases that would be invisible with placeholder data like "test123."']}),e.jsx(s,{code:n,filename:"seeds/index.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"factories",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Factories"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The factory API is designed around two core operations: building objects in memory and persisting records to the database. The ",e.jsx("code",{className:"prose-code",children:"make()"})," method executes the definition function, applies any overrides or states, and returns the resulting plain object. No database call is made. This is fast and suitable for unit tests where you need a correctly shaped object but do not need it to exist in any table."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"create()"})," method does everything ",e.jsx("code",{className:"prose-code",children:"make()"})," does, then inserts the object into the associated table using a SQL ",e.jsx("code",{className:"prose-code",children:"INSERT"})," statement with a ",e.jsx("code",{className:"prose-code",children:"RETURNING"})," clause. The returned object includes auto-generated values like serial IDs, default timestamps, and database-computed columns. This makes it easy to reference the created record's primary key when setting up related records in subsequent factory calls."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Both methods accept an optional overrides object that replaces specific fields in the generated data. Overrides take precedence over the definition function and any applied states. This lets you create variations without defining a new factory: call ",e.jsxs("code",{className:"prose-code",children:["userFactory.create(",'{ role: "admin" }',")"]})," to produce an admin user from the standard user factory."]}),e.jsx(s,{code:o,filename:"seeds/factories.ts",showLineNumbers:!0}),e.jsxs(a,{variant:"tip",children:["Use ",e.jsx("code",{className:"prose-code",children:"make()"})," in unit tests where you need typed objects but do not want database overhead. Use ",e.jsx("code",{className:"prose-code",children:"create()"})," for integration tests that require persisted data."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"fake-data",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Fake Data Generation"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"fake"})," module provides a comprehensive library of data generators organized by category: identity (names, emails, usernames), text (words, sentences, paragraphs), numbers (integers, floats, prices), dates, booleans, addresses, and business data (company names, job titles, phone numbers). Each generator is designed to produce values that look realistic and conform to the expected format for that data type."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Internally, the generators use curated word lists, name databases, and format templates to assemble values. For example, ",e.jsx("code",{className:"prose-code",children:"fake.email()"}),' combines a generated first name, last name, and a random domain to produce addresses like "sarah.johnson@example.com." The ',e.jsx("code",{className:"prose-code",children:"fake.price()"})," generator produces numbers with exactly two decimal places, matching how prices are typically stored and displayed. These details matter because they exercise your application's formatting, validation, and rendering logic with data that resembles what real users would produce."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Unlike heavyweight external libraries, the Vexor ",e.jsx("code",{className:"prose-code",children:"fake"})," module is zero-dependency and lightweight. It is bundled as part of the ORM package and adds negligible size to your development dependencies. When seeded with a fixed value, all generators produce deterministic output, meaning your test assertions can rely on specific generated values without flaking due to randomness."]}),e.jsx(s,{code:d,filename:"fake-examples.ts",showLineNumbers:!0}),e.jsxs(a,{variant:"info",children:["The ",e.jsx("code",{className:"prose-code",children:"fake"})," module is lightweight and has no external dependencies. All generators produce deterministic output when seeded, making tests reproducible."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"states",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"States"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"In real applications, database records often have multiple distinct configurations. A user might be an admin or a regular user, active or inactive, verified or unverified. Rather than defining a separate factory for each configuration, states let you define reusable sets of attribute overrides that can be applied to any factory."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"state()"})," method returns a new factory instance with the specified overrides baked in. The original factory is not modified, following an immutable pattern. You can create multiple state variants from the same base factory and each one operates independently. The ",e.jsx("code",{className:"prose-code",children:"withState()"})," method provides a chainable alternative that applies overrides inline without creating a named variant."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["States compose by merging: when you chain multiple ",e.jsx("code",{className:"prose-code",children:"withState()"})," calls, each subsequent state's overrides are merged on top of the previous ones. If two states set the same field, the last one wins. You can also combine states with per-call overrides passed to ",e.jsx("code",{className:"prose-code",children:"create()"}),", and overrides always take the highest precedence. This layering system -- definition, then states, then overrides -- gives you fine-grained control over the generated data without repetitive factory definitions."]}),e.jsx(s,{code:c,filename:"seeds/factories.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"sequences",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Sequences"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Many database columns require unique values. Emails must be unique across users, slugs must be unique across posts, and external identifiers must not collide. While ",e.jsx("code",{className:"prose-code",children:"fake.email()"})," generates realistic addresses, it does not guarantee uniqueness. If you create 1,000 users, there is a chance that two generated emails will collide, causing a unique constraint violation."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"Sequence"})," class solves this by providing a simple auto-incrementing counter. Each call to ",e.jsx("code",{className:"prose-code",children:"seq.next()"})," returns the next integer in the sequence, guaranteeing uniqueness. By embedding a sequence value into generated fields -- for example, ",e.jsx("code",{className:"prose-code",children:"`user-${seq.next()}@test.com`"})," -- you ensure that every record has a distinct value for that column regardless of how many records are created."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Sequences can be reset between test runs using ",e.jsx("code",{className:"prose-code",children:"seq.reset()"}),", which returns the counter to its starting value. You can also initialize a sequence with a custom starting number, which is useful when you need generated IDs to fall within a specific range or avoid collisions with fixture data that already exists in the database."]}),e.jsx(s,{code:m})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"seeder-runner",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Seeder Runner"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["While factories handle individual record creation, seeders handle the orchestration of populating an entire database. A seeder is a named unit of work that creates records for one or more related tables. It has a ",e.jsx("code",{className:"prose-code",children:"run()"})," method that inserts data and an optional ",e.jsx("code",{className:"prose-code",children:"revert()"})," method that cleans up. This paired structure makes seeders reversible, which is valuable for tearing down test environments or resetting databases to a known state."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"createSeederRunner()"})," function accepts an array of seeders and executes them in the specified order. Ordering matters because of foreign key dependencies: you must seed the users table before the posts table if posts reference user IDs. The runner also supports a ",e.jsx("code",{className:"prose-code",children:"truncateBefore"})," option that clears the specified tables before seeding, ensuring a clean slate. The ",e.jsx("code",{className:"prose-code",children:"truncateTables"})," array must list tables in reverse dependency order (children before parents) to avoid foreign key constraint violations during truncation."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["You can run all seeders at once with ",e.jsx("code",{className:"prose-code",children:"runner.run()"})," or target a specific seeder by name with ",e.jsx("code",{className:"prose-code",children:"runner.run('users')"}),". Running individual seeders is useful during development when you only need to refresh data for the table you are actively working with. The ",e.jsx("code",{className:"prose-code",children:"runner.revert()"})," method calls each seeder's ",e.jsx("code",{className:"prose-code",children:"revert()"})," method in reverse order, ensuring that dependent data is cleaned up before parent data."]}),e.jsx(s,{code:i,filename:"seeds/run.ts",showLineNumbers:!0}),e.jsxs(a,{variant:"warning",children:["When using ",e.jsx("code",{className:"prose-code",children:"truncateBefore"}),", list tables in reverse dependency order (children before parents) to avoid foreign key constraint violations."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"truncation",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Truncation"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"truncate()"})," helper removes all rows from the specified tables using SQL ",e.jsx("code",{className:"prose-code",children:"TRUNCATE"})," statements, which are much faster than ",e.jsx("code",{className:"prose-code",children:"DELETE"})," because they do not generate individual row deletion logs. Truncation resets auto-increment counters and is the preferred way to clean up between test runs."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The order of tables in the array matters when foreign key constraints are present. A table that references another table via a foreign key must be truncated first. For example, if ",e.jsx("code",{className:"prose-code",children:"comments"})," references ",e.jsx("code",{className:"prose-code",children:"posts"})," which references ",e.jsx("code",{className:"prose-code",children:"users"}),", the correct truncation order is ",e.jsx("code",{className:"prose-code",children:"['comments', 'posts', 'users']"}),". Truncating in the wrong order results in a foreign key constraint violation error."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["In test suites, place truncation in ",e.jsx("code",{className:"prose-code",children:"beforeEach()"})," to ensure each test starts with a clean database, or in ",e.jsx("code",{className:"prose-code",children:"afterAll()"})," to clean up after the entire suite completes. The choice depends on your testing strategy: per-test truncation provides the strongest isolation but is slower, while post-suite truncation is faster but means tests can observe each other's data if they share a database."]}),e.jsx(s,{code:l,filename:"tests/helpers.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"best-practices",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Best Practices"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Define factories in a dedicated file that is shared across your test suite and seeder scripts. This prevents duplication and ensures that when a schema column changes, you only need to update the factory definition in one place. Export both the base factory and commonly used state variants so that tests can import them directly."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Prefer ",e.jsx("code",{className:"prose-code",children:"make()"})," over ",e.jsx("code",{className:"prose-code",children:"create()"})," in unit tests. Database operations are the primary bottleneck in test suite performance, and many tests only need a correctly shaped object to pass to a function under test. Reserve ",e.jsx("code",{className:"prose-code",children:"create()"})," for integration tests where the record must exist in the database for queries, joins, or cascading operations to work."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Use sequences for columns with unique constraints instead of relying on random generators. While the probability of a collision from ",e.jsx("code",{className:"prose-code",children:"fake.email()"})," is low for small datasets, it becomes significant when creating hundreds or thousands of records. A sequence-based pattern like ",e.jsx("code",{className:"prose-code",children:"`user-${seq.next()}@test.com`"})," guarantees uniqueness regardless of volume."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"Make production bootstrap seeders idempotent. If a seeder inserts reference data like roles or permission sets, it should check whether the data already exists before inserting. This allows the seeder to be run safely during deployments without creating duplicate records or failing on unique constraint violations."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"api-reference",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"API Reference"}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3",children:"fake Methods"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Method"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Return Type"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Options"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.uuid()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Generates a random UUID v4 string in the standard 8-4-4-4-12 hyphenated format. Each call produces a unique value suitable for primary keys, external identifiers, or correlation IDs."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.firstName()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Returns a randomly selected first name from an internal name database. Names are drawn from a diverse set to provide varied test data across runs."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.lastName()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsxs("td",{className:"py-3 px-4",children:["Returns a randomly selected last name. Pairs with ",e.jsx("code",{className:"prose-code",children:"fake.firstName()"})," to build full names, or use ",e.jsx("code",{className:"prose-code",children:"fake.fullName()"})," for the combined result."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.fullName()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Combines a random first and last name into a single string separated by a space. Useful for display name columns and user profile fields."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.email()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsxs("td",{className:"py-3 px-4",children:["Generates a realistic email address by combining name fragments with a random domain. The result conforms to standard email format but is not guaranteed unique across calls. Use a ",e.jsx("code",{className:"prose-code",children:"Sequence"})," for guaranteed uniqueness."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.username()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Generates a username string combining name fragments with optional numeric suffixes. Suitable for columns that store user handles or login identifiers."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.password()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Generates a random string of alphanumeric and special characters suitable for password fields. Note that this is a plaintext value for test data; in production, passwords should be hashed before storage."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.int(opts?)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:"min: 0, max: 10000"}),e.jsx("td",{className:"py-3 px-4",children:"Returns a random integer within the specified range, inclusive of both bounds. Useful for generating quantities, ages, counts, and other whole-number fields."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.float(opts?)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:"min: 0, max: 1"}),e.jsx("td",{className:"py-3 px-4",children:"Returns a random floating-point number within the specified range. The result has full double-precision accuracy and is suitable for percentages, ratios, and scientific measurements."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.price(opts?)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:"min: 1, max: 1000"}),e.jsx("td",{className:"py-3 px-4",children:"Returns a random number rounded to exactly two decimal places, matching the common format for monetary values. Useful for order totals, product prices, and invoice amounts."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.date(opts?)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"Date"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsxs("td",{className:"py-3 px-4",children:["Returns a random ",e.jsx("code",{className:"prose-code",children:"Date"})," object. Pass ",e.jsx("code",{className:"prose-code",children:"{ past: true }"})," for dates before now, or ",e.jsx("code",{className:"prose-code",children:"{ future: true }"})," for dates after now. Without options, the date can fall anywhere within a reasonable range around the current time."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.boolean()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"boolean"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsxs("td",{className:"py-3 px-4",children:["Returns ",e.jsx("code",{className:"prose-code",children:"true"})," or ",e.jsx("code",{className:"prose-code",children:"false"})," with equal probability. Useful for flag columns like ",e.jsx("code",{className:"prose-code",children:"active"}),", ",e.jsx("code",{className:"prose-code",children:"published"}),", or ",e.jsx("code",{className:"prose-code",children:"verified"}),"."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.word()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Returns a single random word from an internal dictionary. Useful for generating tags, categories, and slug components."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.sentence()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Returns a randomly constructed sentence with proper capitalization and punctuation. Suitable for titles, subject lines, and short description fields."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.paragraph()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Returns a multi-sentence paragraph of generated text. Useful for body content fields, descriptions, and any text column that typically holds longer-form content."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.url()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Returns a randomly generated HTTPS URL with a realistic domain and path. Suitable for website fields, avatar URLs, and callback configurations."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.companyName()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Returns a randomly generated company name combining common business name patterns. Useful for organization fields, billing names, and B2B application data."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"fake.jobTitle()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"Returns a randomly generated professional title combining seniority levels, departments, and role names. Suitable for profile fields and HR application test data."})]})]})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(t,{to:"/realtime/sse",className:"btn-primary",children:["Server-Sent Events ",e.jsx(r,{className:"w-4 h-4 ml-2"})]}),e.jsx(t,{to:"/orm/soft-deletes",className:"btn-secondary",children:"Soft Deletes"})]})]})]})}export{u as default};
