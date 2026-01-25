/**
 * User Service
 *
 * Microservice for user management.
 *
 * Run with: npx tsx examples/microservices/user-service.ts
 */

import { Vexor, VexorContext } from '../../packages/vexor/src/index.js';
import { Tracer } from '../../packages/vexor/src/observability/tracer.js';

// Simple validation helpers
function isString(val: unknown): val is string {
  return typeof val === 'string';
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

interface ValidationResult<T> {
  valid: boolean;
  value: T;
  errors?: string[];
}

function validateCreateUser(data: unknown): ValidationResult<{ name: string; email: string; role?: 'admin' | 'user' }> {
  if (!isObject(data)) {
    return { valid: false, value: { name: '', email: '' }, errors: ['Invalid body'] };
  }
  const errors: string[] = [];
  if (!isString(data.name) || data.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!isString(data.email) || !data.email.includes('@')) {
    errors.push('Valid email is required');
  }
  if (data.role !== undefined && data.role !== 'admin' && data.role !== 'user') {
    errors.push('Role must be admin or user');
  }
  if (errors.length > 0) {
    return { valid: false, value: { name: '', email: '' }, errors };
  }
  return {
    valid: true,
    value: {
      name: data.name as string,
      email: data.email as string,
      role: data.role as 'admin' | 'user' | undefined,
    },
  };
}

const app = new Vexor({
  port: 3011,
  logging: true,
});

const tracer = new Tracer({
  serviceName: 'user-service',
  enabled: true,
});

// In-memory database
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

const users = new Map<number, User>([
  [1, { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', createdAt: new Date() }],
  [2, { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user', createdAt: new Date() }],
  [3, { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user', createdAt: new Date() }],
]);

let nextId = 4;

// Tracing middleware
app.use(async (ctx: VexorContext) => {
  const traceId = ctx.header('x-trace-id') || crypto.randomUUID();
  const parentSpanId = ctx.header('x-parent-span-id');

  const span = tracer.startSpan(`user-service:${ctx.method}:${ctx.path}`, {
    parent: parentSpanId ? { traceId, spanId: parentSpanId, traceFlags: 1 } : undefined,
    attributes: {
      'http.method': ctx.method,
      'http.path': ctx.path,
    },
  });

  ctx.set('span', span);
  ctx.set('traceId', span.context.traceId);
  ctx.res.header('X-Trace-Id', span.context.traceId);
});

app.addHook('onSend', async (ctx: VexorContext) => {
  const span = ctx.get('span') as ReturnType<typeof tracer.startSpan>;
  if (span) {
    span.setStatus('ok');
    span.end();
  }
});

// Routes
app.get('/health', (ctx) => ctx.json({ status: 'healthy', service: 'user-service' }));

app.get('/stats', (ctx) => {
  return ctx.json({
    service: 'user-service',
    totalUsers: users.size,
    adminUsers: Array.from(users.values()).filter(u => u.role === 'admin').length,
    regularUsers: Array.from(users.values()).filter(u => u.role === 'user').length,
  });
});

app.get('/users', (ctx) => {
  const page = parseInt(ctx.queryParam('page') as string) || 1;
  const limit = parseInt(ctx.queryParam('limit') as string) || 10;

  const allUsers = Array.from(users.values());
  const start = (page - 1) * limit;
  const data = allUsers.slice(start, start + limit);

  return ctx.json({
    data,
    meta: { page, limit, total: allUsers.length },
  });
});

app.get('/users/:id', (ctx) => {
  const user = users.get(parseInt(ctx.params.id));

  if (!user) {
    return ctx.notFound('User not found');
  }

  return ctx.json(user);
});

app.post('/users', async (ctx) => {
  const body = await ctx.readJson();
  const result = validateCreateUser(body);

  if (!result.valid) {
    return ctx.validationError(result.errors!.map(e => ({ field: 'body', message: e })));
  }

  const id = nextId++;
  const user: User = {
    id,
    name: result.value.name,
    email: result.value.email,
    role: result.value.role || 'user',
    createdAt: new Date(),
  };

  users.set(id, user);

  return ctx.status(201).json(user);
});

app.put('/users/:id', async (ctx) => {
  const userId = parseInt(ctx.params.id);
  const user = users.get(userId);

  if (!user) {
    return ctx.notFound('User not found');
  }

  const body = await ctx.readJson<Partial<User>>();
  const updated = { ...user, ...body, id: userId };
  users.set(userId, updated);

  return ctx.json(updated);
});

app.delete('/users/:id', (ctx) => {
  const userId = parseInt(ctx.params.id);

  if (!users.has(userId)) {
    return ctx.notFound('User not found');
  }

  users.delete(userId);
  return ctx.empty();
});

app.listen(3011).then(() => {
  console.log('User Service started on port 3011');
});
