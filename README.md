<p align="center">
  <img src="site/public/favicon.svg" width="80" height="80" alt="Vexor Logo" />
</p>

<h1 align="center">Vexor</h1>

<p align="center">
  A batteries-included, high-performance, multi-runtime Node.js backend framework with its own blazing-fast ORM.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@vexorjs/core"><img src="https://img.shields.io/npm/v/@vexorjs/core.svg?style=flat-square&color=6366f1" alt="npm version" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0+-blue.svg?style=flat-square" alt="TypeScript" /></a>
  <a href="https://github.com/sitharaj88/vexorjs/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/sitharaj88/vexorjs/ci.yml?style=flat-square&label=CI" alt="CI" /></a>
  <a href="https://github.com/sitharaj88/vexorjs"><img src="https://img.shields.io/github/stars/sitharaj88/vexorjs?style=flat-square" alt="GitHub Stars" /></a>
</p>

<p align="center">
  <a href="https://sitharaj88.github.io/vexorjs/"><strong>Documentation</strong></a> &middot;
  <a href="https://sitharaj88.github.io/vexorjs/getting-started"><strong>Getting Started</strong></a> &middot;
  <a href="https://sitharaj88.github.io/vexorjs/api/vexor-class"><strong>API Reference</strong></a> &middot;
  <a href="https://github.com/sitharaj88/vexorjs/tree/main/examples"><strong>Examples</strong></a>
</p>

---

## Features

- **High Performance** — Radix tree router with O(1) static route lookup, an LRU match cache, precompiled schema validation, and object-pooled request contexts
- **Multi-Runtime** — Runs on Node.js, Bun, Deno, Cloudflare Workers, Vercel Edge, and AWS Lambda (smoke-tested on Node, Bun, and Deno in CI)
- **Type-Safe** — End-to-end handler inference without code generation: `ctx.params` is typed from the route path, `ctx.body()` and `ctx.query` from the route schema; Standard Schema interop included
- **Batteries Included** — Authentication, rate limiting, CORS, static files, caching, logging, observability, real-time support, graceful shutdown, and more
- **Vexor ORM** — Built-in type-safe ORM with query builder, migrations, relations, and connection pooling
- **Powerful CLI** — Scaffold projects, generate modules, run migrations, and manage environments

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [@vexorjs/core](./packages/vexor) | ![npm](https://img.shields.io/npm/v/@vexorjs/core?style=flat-square&color=6366f1) | Core framework — routing, middleware, validation, adapters |
| [@vexorjs/orm](./packages/vexor-orm) | ![npm](https://img.shields.io/npm/v/@vexorjs/orm?style=flat-square&color=6366f1) | Type-safe ORM — queries, migrations, pooling |
| [@vexorjs/cli](./packages/vexor-cli) | ![npm](https://img.shields.io/npm/v/@vexorjs/cli?style=flat-square&color=6366f1) | CLI tool — scaffolding, code generation, dev tools |

## Quick Start

```bash
# Install the core framework
npm install @vexorjs/core

# Install the ORM (optional)
npm install @vexorjs/orm

# Install the CLI globally (optional)
npm install -g @vexorjs/cli
```

### Create Your First API

```typescript
import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// Simple route
app.get('/', async (ctx) => {
  return ctx.json({ message: 'Hello, Vexor!' });
});

// Route with validation — the handler is fully typed from the schema
app.post('/users', {
  body: Type.Object({
    name: Type.String({ minLength: 1 }),
    email: Type.String({ format: 'email' })
  })
}, async (ctx) => {
  const body = await ctx.body(); // { name: string; email: string }
  const user = await createUser(body);
  return ctx.status(201).json(user);
});

// Path params are inferred from the route string
app.get('/users/:id', async (ctx) => {
  return ctx.json({ id: ctx.params.id }); // ctx.params: { id: string }
});

app.listen(3000);
console.log('Server running on http://localhost:3000');
```

### Using Vexor ORM

```typescript
import { table, column, createConnection, eq } from '@vexorjs/orm';

const users = table('users', {
  id: column.serial().primaryKey(),
  name: column.varchar(255).notNull(),
  email: column.varchar(255).unique().notNull(),
  createdAt: column.timestamp().defaultNow()
});

const db = await createConnection({
  driver: 'postgres',
  connectionString: process.env.DATABASE_URL
});

// Type-safe queries
const user = await db.select()
  .from(users)
  .where(eq(users.id, 1))
  .first();

// Transactions
await db.transaction(async (tx) => {
  await tx.insert(users).values({ name: 'Alice', email: 'alice@example.com' });
  await tx.update(users).set({ name: 'Updated' }).where(eq(users.id, 1));
});
```

### Using the CLI

```bash
# Create a new project
vexor new my-app

# Generate a module
vexor generate module users

# Generate a model
vexor generate model User name:string email:string:unique

# Run migrations
vexor db:migrate

# Run the test suite (auto-detects vitest / jest / mocha / node:test)
vexor test

# Validate .env against env.schema.json
vexor env:check

# Start development server
vexor dev
```

## Capabilities

### ORM

- **Drivers**: Postgres, SQLite, **MySQL** — all routed through one `Database` client with PostgreSQL-style `$N` placeholders translated per driver.
- **Relations**: `hasOne`, `hasMany`, `belongsTo`, `belongsToMany` with eager loading via `db.loadRelations(rows, relations, spec)` — one IN-query per relation, no N+1.
  ```ts
  await db.loadRelations(
    users,
    { posts: hasMany(postsTable, { foreignKey: 'user_id' }) },
    { posts: true }
  );
  ```
- **Schema as code**: `db.createTable(tableDef)` and `db.dropTable(target)` materialize tables and indexes from `table()` definitions without writing migrations.
- **Query result cache**: `createQueryCache({ defaultTtlMs })` with TTL, LRU eviction, in-flight de-duplication, and a pluggable `QueryCacheStore` for Redis/etc.
- **Migrations + soft delete + seeding** — covered by the existing test suites.

### Framework

- **GraphQL adapter**: `createGraphQLHandler({ schema | executor, contextFactory, graphiql })` — pure HTTP plumbing, lazy-loads the `graphql` package only when used, optional GraphiQL playground.
- **gRPC-Web**: `createGrpcHandler({ services, codec })` — full gRPC-Web wire format on plain HTTP/1.1+, JSON codec by default, pluggable for Protobuf.
  ```ts
  const greeter = new GrpcService('Greeter')
    .unary<HelloRequest, HelloResponse>('SayHello', async (req) => ({
      message: `hi ${req.name}`,
    }));
  app.post('/Greeter/:method', createGrpcHandler({ services: [greeter] }));
  ```
- **OAuth state stores**: `RedisStateStore` and `RedisSessionStore` for multi-instance deployments. Compatible with `ioredis`, `node-redis` v4+, `@upstash/redis`, or any client conforming to `RedisLike`.
- **Edge runtimes**: First-class adapters for **Cloudflare Workers** (`createCloudflareWorker`) and **Vercel Edge** (`createVercelEdgeHandler`) — see [examples/cloudflare-workers](./examples/cloudflare-workers) and [examples/vercel-edge](./examples/vercel-edge).
- **HTTP semantics**: automatic `405 Method Not Allowed` with an `Allow` header, `HEAD` served from `GET` handlers, and hook short-circuiting (return a `Response` from any hook to end the request — CORS preflight uses this).
- **Static files**: `serveStatic({ root })` on a wildcard route — ETag/304, Cache-Control, index files, dotfile policy, and path-traversal protection.
- **Graceful shutdown**: `new Vexor({ gracefulShutdown: true })` drains in-flight requests on SIGTERM/SIGINT with a configurable timeout.
- **Plugins**: `app.registerPlugin(plugin, { prefix })` with dependency resolution, decorators, and lifecycle hooks wired into the request pipeline.

### CLI

- **`vexor test`** — auto-detects vitest, jest, mocha, or `node --test` and runs accordingly.
- **`vexor env:check`** — validates `.env` against `env.schema.json` (string/integer/number/boolean/url/email/enum + min/max/pattern).
- **Pluggable integrations**: extend `vexor add` programmatically with `registerIntegration()` or by dropping JSON into `.vexor/integrations/`.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                       │
│         (Handlers, Controllers, Services, Modules)          │
├─────────────────────────────────────────────────────────────┤
│                      Framework Core                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Type System  │  │ Validation  │  │    Serialization    │ │
│  │   (Schema)   │  │ (JIT Comp.) │  │    (JIT Compile)    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                       Vexor ORM                             │
│   (Query Builder, Migrations, Connection Pool, Relations)   │
├─────────────────────────────────────────────────────────────┤
│                    Middleware Pipeline                       │
│    (onRequest → preValidation → preHandler → onSend)        │
├─────────────────────────────────────────────────────────────┤
│                      Router Layer                           │
│         (Radix Tree with Static Route Short-Circuit)        │
├─────────────────────────────────────────────────────────────┤
│                    HTTP Adapter Layer                        │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌─────────────────┐  │
│  │ Node.js│  │  Bun   │  │  Deno  │  │ Edge (CF/Vercel) │  │
│  └────────┘  └────────┘  └────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                 Web Standards Foundation                     │
│        (Request, Response, Headers, URL, Streams)           │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
vexorjs/
├── packages/
│   ├── vexor/          # @vexorjs/core — Core framework
│   ├── vexor-orm/      # @vexorjs/orm — ORM package
│   └── vexor-cli/      # @vexorjs/cli — CLI tool
├── examples/           # Example applications
├── benchmarks/         # Performance benchmarks
├── site/               # Documentation site (React + Vite)
└── .github/            # CI/CD workflows
```

## Development

```bash
# Clone the repository
git clone https://github.com/sitharaj88/vexorjs.git
cd vexorjs

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Run benchmarks
npm run bench:quick
```

## Documentation

Full documentation is available at [sitharaj88.github.io/vexorjs](https://sitharaj88.github.io/vexorjs/)

- [Getting Started](https://sitharaj88.github.io/vexorjs/getting-started)
- [Routing](https://sitharaj88.github.io/vexorjs/routing)
- [Middleware](https://sitharaj88.github.io/vexorjs/middleware/rate-limiting)
- [Auth & Security](https://sitharaj88.github.io/vexorjs/auth/authentication)
- [Vexor ORM](https://sitharaj88.github.io/vexorjs/orm/overview)
- [CLI Reference](https://sitharaj88.github.io/vexorjs/cli/overview)
- [Advanced Guides](https://sitharaj88.github.io/vexorjs/advanced/adapters)

## Acknowledgments

Inspired by [Fastify](https://fastify.io/), [Hono](https://hono.dev/), and [Elysia](https://elysiajs.com/). ORM design influenced by [Drizzle](https://orm.drizzle.team/).

## Author

**Sitharaj Seenivasan**

- Website: [sitharaj.in](https://sitharaj.in)
- LinkedIn: [sitharaj08](https://linkedin.com/in/sitharaj08)
- GitHub: [sitharaj88](https://github.com/sitharaj88)

## Support

If you find Vexor useful, consider buying me a coffee!

<a href="https://buymeacoffee.com/sitharaj88"><img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=flat-square&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me a Coffee" /></a>

## License

MIT License - see the [LICENSE](LICENSE) file for details.
