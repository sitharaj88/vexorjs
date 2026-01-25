# Vexor

A batteries-included, high-performance, multi-runtime Node.js backend framework with its own blazing-fast ORM.

## Features

- **High Performance** - Radix tree router, JIT-compiled validation, optimized query builder
- **Multi-Runtime** - Runs on Node.js, Bun, Deno, and Edge (Cloudflare Workers, Vercel Edge)
- **Type-Safe** - End-to-end TypeScript inference without code generation
- **Batteries Included** - Authentication, logging, observability, real-time support
- **Vexor ORM** - Fast, type-safe database queries with migrations

## Packages

| Package | Description |
|---------|-------------|
| `vexor` | Core framework |
| `vexor-orm` | Type-safe ORM |
| `vexor-cli` | CLI tool for scaffolding |

## Quick Start

```typescript
import { Vexor, Type } from 'vexor';

const app = new Vexor();

app.get('/hello/:name', {
  params: Type.Object({ name: Type.String() }),
}, async (ctx) => {
  return ctx.json({ message: `Hello, ${ctx.params.name}!` });
});

app.listen(3000);
```

## Development

```bash
# Install dependencies
npm install

# Run benchmarks
npm run bench:quick

# Run tests
npm test

# Build all packages
npm run build
```

## Project Structure

```
vexor/
├── packages/
│   ├── vexor/          # Core framework
│   ├── vexor-orm/      # ORM package
│   └── vexor-cli/      # CLI tool
├── examples/           # Example applications
├── benchmarks/         # Performance benchmarks
├── docs/               # Documentation
└── tests/              # Integration tests
```

## Benchmarks

Run quick performance benchmarks:

```bash
npm run bench:quick
```

Run full HTTP comparison benchmarks:

```bash
npm run bench:compare
```

## License

MIT
