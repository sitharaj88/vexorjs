# @vexorjs/core

A blazing-fast, batteries-included, multi-runtime Node.js backend framework.

## Features

- **High Performance** - Radix tree router with static route short-circuit
- **Type-Safe** - End-to-end TypeScript with JIT-compiled validation
- **Multi-Runtime** - Works on Node.js, Bun, Deno, and Edge runtimes
- **Batteries Included** - Built-in authentication, logging, real-time, and more

## Installation

```bash
npm install @vexorjs/core
```

## Quick Start

```typescript
import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// Type-safe route with validation
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

app.listen(3000);
```

## Documentation

Visit [github.com/sitharaj88/vexorjs](https://github.com/sitharaj88/vexorjs) for full documentation.

## License

MIT
