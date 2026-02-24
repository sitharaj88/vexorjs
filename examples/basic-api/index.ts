/**
 * Basic API Example
 *
 * Demonstrates the core features of Vexor framework.
 *
 * Run with: npx tsx examples/basic-api/index.ts
 * Or with Bun: bun run examples/basic-api/index.ts
 */

import { Vexor, VexorContext } from '@vexorjs/core';

// Create Vexor app
const app = new Vexor({
  port: 3000,
  logging: true,
});

// In-memory data store (for demo)
interface User {
  id: string;
  name: string;
  email: string;
}

const users: Map<string, User> = new Map([
  ['1', { id: '1', name: 'John Doe', email: 'john@example.com' }],
  ['2', { id: '2', name: 'Jane Smith', email: 'jane@example.com' }],
]);

// Middleware: Request logging
app.use(async (ctx: VexorContext) => {
  console.log(`[${new Date().toISOString()}] ${ctx.method} ${ctx.path}`);
});

// Middleware: Add request ID to response
app.addHook('onSend', async (ctx: VexorContext) => {
  ctx.res.header('X-Request-Id', ctx.requestId);
});

// Routes

// Health check
app.get('/health', (ctx) => {
  return ctx.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root route
app.get('/', (ctx) => {
  return ctx.json({
    name: 'Vexor API',
    version: '0.0.1',
    endpoints: [
      'GET /health',
      'GET /users',
      'GET /users/:id',
      'POST /users',
      'PUT /users/:id',
      'DELETE /users/:id',
    ],
  });
});

// List all users
app.get('/users', (ctx) => {
  const page = parseInt(ctx.queryParam('page') as string) || 1;
  const limit = parseInt(ctx.queryParam('limit') as string) || 10;

  const allUsers = Array.from(users.values());
  const start = (page - 1) * limit;
  const paginatedUsers = allUsers.slice(start, start + limit);

  return ctx.json({
    data: paginatedUsers,
    meta: {
      page,
      limit,
      total: allUsers.length,
      totalPages: Math.ceil(allUsers.length / limit),
    },
  });
});

// Get user by ID
app.get('/users/:id', (ctx) => {
  const user = users.get(ctx.params.id);

  if (!user) {
    return ctx.notFound(`User ${ctx.params.id} not found`);
  }

  return ctx.json(user);
});

// Create user
app.post('/users', async (ctx) => {
  try {
    const body = await ctx.readJson<{ name: string; email: string }>();

    if (!body.name || !body.email) {
      return ctx.validationError([
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Email is required' },
      ]);
    }

    const id = String(Date.now());
    const user: User = { id, name: body.name, email: body.email };
    users.set(id, user);

    return ctx.status(201).json(user);
  } catch {
    return ctx.badRequest('Invalid JSON body');
  }
});

// Update user
app.put('/users/:id', async (ctx) => {
  const user = users.get(ctx.params.id);

  if (!user) {
    return ctx.notFound(`User ${ctx.params.id} not found`);
  }

  try {
    const body = await ctx.readJson<Partial<User>>();

    const updatedUser = { ...user, ...body, id: user.id };
    users.set(user.id, updatedUser);

    return ctx.json(updatedUser);
  } catch {
    return ctx.badRequest('Invalid JSON body');
  }
});

// Delete user
app.delete('/users/:id', (ctx) => {
  if (!users.has(ctx.params.id)) {
    return ctx.notFound(`User ${ctx.params.id} not found`);
  }

  users.delete(ctx.params.id);
  return ctx.empty();
});

// Route groups example
app.group('/api/v1', (api) => {
  api.get('/info', (ctx) => {
    return ctx.json({
      version: 'v1',
      description: 'API Version 1',
    });
  });
});

// Error handling
app.setErrorHandler(async (error, ctx) => {
  console.error(`Error handling ${ctx.method} ${ctx.path}:`, error);

  return ctx.status(500).json({
    error: error.message || 'Internal Server Error',
    code: 'INTERNAL_ERROR',
    requestId: ctx.requestId,
  });
});

// Print registered routes
app.printRoutes();

// Start server
app.listen(3000).then((server) => {
  const addr = app.address();
  if (addr) {
    console.log(`
    Try these commands:

    # Health check
    curl http://localhost:${addr.port}/health

    # List users
    curl http://localhost:${addr.port}/users

    # Get user
    curl http://localhost:${addr.port}/users/1

    # Create user
    curl -X POST http://localhost:${addr.port}/users \\
      -H "Content-Type: application/json" \\
      -d '{"name": "New User", "email": "new@example.com"}'

    # Update user
    curl -X PUT http://localhost:${addr.port}/users/1 \\
      -H "Content-Type: application/json" \\
      -d '{"name": "Updated Name"}'

    # Delete user
    curl -X DELETE http://localhost:${addr.port}/users/1
    `);
  }
});
