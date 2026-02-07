# Vexor

[![npm version](https://img.shields.io/npm/v/@vexorjs/core.svg)](https://www.npmjs.com/package/@vexorjs/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

A batteries-included, high-performance, multi-runtime Node.js backend framework with its own blazing-fast ORM.

**[Documentation](https://sitharaj88.github.io/vexorjs/)** | **[API Reference](https://sitharaj88.github.io/vexorjs/api/vexor-class)** | **[Examples](https://github.com/sitharaj88/vexorjs/tree/main/examples)**

## Features

- **High Performance** - Radix tree router with O(1) static route lookup, JIT-compiled validation
- **Multi-Runtime** - Runs on Node.js, Bun, Deno, and Edge (Cloudflare Workers, Vercel Edge)
- **Type-Safe** - End-to-end TypeScript inference without code generation
- **Batteries Included** - Authentication, logging, observability, real-time support built-in
- **Vexor ORM** - Fast, type-safe database queries with migrations and connection pooling

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [@vexorjs/core](./packages/vexor) | 1.0.0 | Core framework |
| [@vexorjs/orm](./packages/vexor-orm) | 1.0.0 | Type-safe ORM |
| [@vexorjs/cli](./packages/vexor-cli) | 1.0.0 | CLI tool for scaffolding |

## Installation

```bash
# Install the core framework
npm install @vexorjs/core

# Install the ORM (optional)
npm install @vexorjs/orm

# Install the CLI globally (optional)
npm install -g @vexorjs/cli
```

## Quick Start

### Basic API

```typescript
import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// Simple route
app.get('/', async (ctx) => {
  return ctx.json({ message: 'Hello, Vexor!' });
});

// Route with validation
app.get('/users/:id', {
  params: Type.Object({ id: Type.String() }),
  response: {
    200: Type.Object({
      id: Type.String(),
      name: Type.String(),
      email: Type.String()
    })
  }
}, async (ctx) => {
  const user = await findUser(ctx.params.id);
  return ctx.json(user);
});

// POST with body validation
app.post('/users', {
  body: Type.Object({
    name: Type.String({ minLength: 1 }),
    email: Type.String({ format: 'email' })
  })
}, async (ctx) => {
  const user = await createUser(ctx.body);
  return ctx.status(201).json(user);
});

app.listen(3000);
console.log('Server running on http://localhost:3000');
```

### Using Vexor ORM

```typescript
import { table, column, createConnection, eq } from '@vexorjs/orm';

// Define your schema
const users = table('users', {
  id: column.serial().primaryKey(),
  name: column.varchar(255).notNull(),
  email: column.varchar(255).unique().notNull(),
  createdAt: column.timestamp().defaultNow()
});

// Connect to database
const db = await createConnection({
  driver: 'postgres',
  connectionString: process.env.DATABASE_URL
});

// Type-safe queries
const user = await db.select()
  .from(users)
  .where(eq(users.id, 1))
  .first();

// Insert with full type checking
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

# Start development server
vexor dev
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│         (Handlers, Controllers, Services, Modules)          │
├─────────────────────────────────────────────────────────────┤
│                      Framework Core                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Type System │  │ Validation  │  │    Serialization    │  │
│  │   (Schema)  │  │ (JIT Comp.) │  │    (JIT Compile)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                       Vexor ORM                              │
│   (Query Builder, Migrations, Connection Pool, Relations)   │
├─────────────────────────────────────────────────────────────┤
│                    Middleware Pipeline                       │
│    (onRequest → preValidation → preHandler → onSend)        │
├─────────────────────────────────────────────────────────────┤
│                      Router Layer                            │
│         (Radix Tree with Static Route Short-Circuit)        │
├─────────────────────────────────────────────────────────────┤
│                    HTTP Adapter Layer                        │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌─────────────────┐   │
│  │ Node.js│  │  Bun   │  │  Deno  │  │  Edge (CF/Vercel)│   │
│  └────────┘  └────────┘  └────────┘  └─────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                 Web Standards Foundation                     │
│        (Request, Response, Headers, URL, Streams)           │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
vexorjs/
├── packages/
│   ├── vexor/          # @vexorjs/core - Core framework
│   ├── vexor-orm/      # @vexorjs/orm - ORM package
│   └── vexor-cli/      # @vexorjs/cli - CLI tool
├── examples/           # Example applications
├── benchmarks/         # Performance benchmarks
├── site/               # Documentation source
├── docs/               # Built documentation (GitHub Pages)
└── tests/              # Integration tests
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

# Run quick benchmarks
npm run bench:quick

# Run full comparison benchmarks
npm run bench:compare
```

## Benchmarks

Run the performance benchmarks:

```bash
# Quick benchmark (no external dependencies)
npm run bench:quick

# Full HTTP comparison (vs Fastify, Hono, Express)
npm run bench:compare
```

## Documentation

Full documentation is available at [https://sitharaj88.github.io/vexorjs/](https://sitharaj88.github.io/vexorjs/)

- [Getting Started](https://sitharaj88.github.io/vexorjs/getting-started)
- [Routing](https://sitharaj88.github.io/vexorjs/routing)
- [Validation](https://sitharaj88.github.io/vexorjs/validation)
- [ORM Guide](https://sitharaj88.github.io/vexorjs/orm/overview)
- [CLI Reference](https://sitharaj88.github.io/vexorjs/cli/overview)

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [Fastify](https://fastify.io/), [Hono](https://hono.dev/), and [Elysia](https://elysiajs.com/)
- ORM design influenced by [Drizzle](https://orm.drizzle.team/)
- Built with TypeScript and love
