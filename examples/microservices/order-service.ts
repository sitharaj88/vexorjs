/**
 * Order Service
 *
 * Microservice for order management.
 *
 * Run with: npx tsx examples/microservices/order-service.ts
 */

import { Vexor, VexorContext, Tracer } from '@vexorjs/core';

// Simple validation helpers
function isNumber(val: unknown): val is number {
  return typeof val === 'number' && !isNaN(val);
}

function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val);
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

interface ValidationResult<T> {
  valid: boolean;
  value: T;
  errors?: string[];
}

interface OrderItemInput {
  productId: number;
  quantity: number;
  unitPrice: number;
}

function validateCreateOrder(data: unknown): ValidationResult<{ userId: number; items: OrderItemInput[] }> {
  if (!isObject(data)) {
    return { valid: false, value: { userId: 0, items: [] }, errors: ['Invalid body'] };
  }
  const errors: string[] = [];
  if (!isNumber(data.userId)) {
    errors.push('userId is required');
  }
  if (!isArray(data.items) || data.items.length === 0) {
    errors.push('items array is required');
  } else {
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (!isObject(item)) {
        errors.push(`items[${i}] must be an object`);
        continue;
      }
      if (!isNumber(item.productId)) {
        errors.push(`items[${i}].productId is required`);
      }
      if (!isNumber(item.quantity) || item.quantity < 1) {
        errors.push(`items[${i}].quantity must be at least 1`);
      }
      if (!isNumber(item.unitPrice) || item.unitPrice < 0) {
        errors.push(`items[${i}].unitPrice must be >= 0`);
      }
    }
  }
  if (errors.length > 0) {
    return { valid: false, value: { userId: 0, items: [] }, errors };
  }
  return {
    valid: true,
    value: {
      userId: data.userId as number,
      items: (data.items as Record<string, unknown>[]).map(item => ({
        productId: item.productId as number,
        quantity: item.quantity as number,
        unitPrice: item.unitPrice as number,
      })),
    },
  };
}

function validateUpdateStatus(data: unknown): ValidationResult<{ status: 'confirmed' | 'shipped' | 'delivered' | 'cancelled' }> {
  if (!isObject(data)) {
    return { valid: false, value: { status: 'confirmed' }, errors: ['Invalid body'] };
  }
  const validStatuses = ['confirmed', 'shipped', 'delivered', 'cancelled'];
  if (typeof data.status !== 'string' || !validStatuses.includes(data.status)) {
    return { valid: false, value: { status: 'confirmed' }, errors: ['Invalid status'] };
  }
  return { valid: true, value: { status: data.status as 'confirmed' | 'shipped' | 'delivered' | 'cancelled' } };
}

const app = new Vexor({
  port: 3013,
  logging: true,
});

const tracer = new Tracer({
  serviceName: 'order-service',
  enabled: true,
});

// In-memory database
interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const orders = new Map<number, Order>([
  [1, {
    id: 1,
    userId: 1,
    items: [
      { productId: 1, quantity: 1, unitPrice: 999.99 },
      { productId: 3, quantity: 2, unitPrice: 199.99 },
    ],
    status: 'delivered',
    total: 1399.97,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  }],
  [2, {
    id: 2,
    userId: 2,
    items: [
      { productId: 2, quantity: 1, unitPrice: 699.99 },
    ],
    status: 'shipped',
    total: 699.99,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  }],
  [3, {
    id: 3,
    userId: 1,
    items: [
      { productId: 4, quantity: 1, unitPrice: 149.99 },
      { productId: 5, quantity: 1, unitPrice: 79.99 },
    ],
    status: 'pending',
    total: 229.98,
    createdAt: new Date(),
    updatedAt: new Date(),
  }],
]);

let nextId = 4;

// Tracing middleware
app.use(async (ctx: VexorContext) => {
  const traceId = ctx.header('x-trace-id') || crypto.randomUUID();
  const parentSpanId = ctx.header('x-parent-span-id');

  const span = tracer.startSpan(`order-service:${ctx.method}:${ctx.path}`, {
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
app.get('/health', (ctx) => ctx.json({ status: 'healthy', service: 'order-service' }));

app.get('/stats', (ctx) => {
  const allOrders = Array.from(orders.values());
  const statusCounts = allOrders.reduce((acc: Record<string, number>, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const totalRevenue = allOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum: number, o) => sum + o.total, 0);

  return ctx.json({
    service: 'order-service',
    totalOrders: orders.size,
    statusBreakdown: statusCounts,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    averageOrderValue: Math.round((totalRevenue / allOrders.length) * 100) / 100,
  });
});

app.get('/orders', (ctx) => {
  const page = parseInt(ctx.queryParam('page') as string) || 1;
  const limit = parseInt(ctx.queryParam('limit') as string) || 10;
  const userId = ctx.queryParam('userId');
  const status = ctx.queryParam('status');

  let filtered = Array.from(orders.values());

  if (userId) {
    filtered = filtered.filter(o => o.userId === parseInt(userId as string));
  }
  if (status) {
    filtered = filtered.filter(o => o.status === status);
  }

  // Sort by created date desc
  filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return ctx.json({
    data,
    meta: { page, limit, total: filtered.length },
  });
});

app.get('/orders/:id', (ctx) => {
  const order = orders.get(parseInt(ctx.params.id));

  if (!order) {
    return ctx.notFound('Order not found');
  }

  return ctx.json(order);
});

app.post('/orders', async (ctx) => {
  const body = await ctx.readJson();
  const result = validateCreateOrder(body);

  if (!result.valid) {
    return ctx.validationError(result.errors!.map((e: string) => ({
      field: 'body',
      message: e,
    })));
  }

  const { userId, items } = result.value;
  const total = items.reduce((sum: number, item: OrderItemInput) => sum + (item.unitPrice * item.quantity), 0);

  const id = nextId++;
  const order: Order = {
    id,
    userId,
    items,
    status: 'pending',
    total: Math.round(total * 100) / 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  orders.set(id, order);

  return ctx.status(201).json(order);
});

app.put('/orders/:id/status', async (ctx) => {
  const orderId = parseInt(ctx.params.id);
  const order = orders.get(orderId);

  if (!order) {
    return ctx.notFound('Order not found');
  }

  const body = await ctx.readJson();
  const result = validateUpdateStatus(body);

  if (!result.valid) {
    return ctx.validationError(result.errors!.map((e: string) => ({
      field: 'body',
      message: e,
    })));
  }

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  if (!validTransitions[order.status].includes(result.value.status)) {
    return ctx.status(400).json({
      error: `Cannot transition from ${order.status} to ${result.value.status}`,
    });
  }

  order.status = result.value.status;
  order.updatedAt = new Date();

  return ctx.json(order);
});

app.delete('/orders/:id', (ctx) => {
  const orderId = parseInt(ctx.params.id);
  const order = orders.get(orderId);

  if (!order) {
    return ctx.notFound('Order not found');
  }

  if (order.status !== 'pending') {
    return ctx.status(400).json({ error: 'Can only delete pending orders' });
  }

  orders.delete(orderId);
  return ctx.empty();
});

app.listen(3013).then(() => {
  console.log('Order Service started on port 3013');
});
