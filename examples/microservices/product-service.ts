/**
 * Product Service
 *
 * Microservice for product catalog management.
 *
 * Run with: npx tsx examples/microservices/product-service.ts
 */

import { Vexor, VexorContext } from '../../packages/vexor/src/index.js';
import { Tracer } from '../../packages/vexor/src/observability/tracer.js';

// Simple validation helpers
function isString(val: unknown): val is string {
  return typeof val === 'string';
}

function isNumber(val: unknown): val is number {
  return typeof val === 'number' && !isNaN(val);
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

interface ValidationResult<T> {
  valid: boolean;
  value: T;
  errors?: string[];
}

function validateCreateProduct(data: unknown): ValidationResult<{
  name: string;
  description?: string;
  price: number;
  stock?: number;
  category?: string;
}> {
  if (!isObject(data)) {
    return { valid: false, value: { name: '', price: 0 }, errors: ['Invalid body'] };
  }
  const errors: string[] = [];
  if (!isString(data.name) || data.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!isNumber(data.price) || data.price < 0) {
    errors.push('Valid price is required');
  }
  if (errors.length > 0) {
    return { valid: false, value: { name: '', price: 0 }, errors };
  }
  return {
    valid: true,
    value: {
      name: data.name as string,
      description: isString(data.description) ? data.description : undefined,
      price: data.price as number,
      stock: isNumber(data.stock) ? data.stock : undefined,
      category: isString(data.category) ? data.category : undefined,
    },
  };
}

const app = new Vexor({
  port: 3012,
  logging: true,
});

const tracer = new Tracer({
  serviceName: 'product-service',
  enabled: true,
});

// In-memory database
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: Date;
}

const products = new Map<number, Product>([
  [1, { id: 1, name: 'Laptop', description: 'High-performance laptop', price: 999.99, stock: 50, category: 'electronics', createdAt: new Date() }],
  [2, { id: 2, name: 'Smartphone', description: 'Latest smartphone', price: 699.99, stock: 100, category: 'electronics', createdAt: new Date() }],
  [3, { id: 3, name: 'Headphones', description: 'Wireless headphones', price: 199.99, stock: 200, category: 'electronics', createdAt: new Date() }],
  [4, { id: 4, name: 'Keyboard', description: 'Mechanical keyboard', price: 149.99, stock: 75, category: 'accessories', createdAt: new Date() }],
  [5, { id: 5, name: 'Mouse', description: 'Gaming mouse', price: 79.99, stock: 150, category: 'accessories', createdAt: new Date() }],
]);

let nextId = 6;

// Tracing middleware
app.use(async (ctx: VexorContext) => {
  const traceId = ctx.header('x-trace-id') || crypto.randomUUID();
  const parentSpanId = ctx.header('x-parent-span-id');

  const span = tracer.startSpan(`product-service:${ctx.method}:${ctx.path}`, {
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
app.get('/health', (ctx) => ctx.json({ status: 'healthy', service: 'product-service' }));

app.get('/stats', (ctx) => {
  const allProducts = Array.from(products.values());
  const categories = [...new Set(allProducts.map(p => p.category))];
  const totalValue = allProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);

  return ctx.json({
    service: 'product-service',
    totalProducts: products.size,
    categories: categories.length,
    categoryList: categories,
    totalInventoryValue: Math.round(totalValue * 100) / 100,
    lowStockProducts: allProducts.filter(p => p.stock < 10).length,
  });
});

app.get('/products', (ctx) => {
  const page = parseInt(ctx.queryParam('page') as string) || 1;
  const limit = parseInt(ctx.queryParam('limit') as string) || 10;
  const category = ctx.queryParam('category');
  const minPrice = ctx.queryParam('minPrice');
  const maxPrice = ctx.queryParam('maxPrice');
  const search = ctx.queryParam('search');

  let filtered = Array.from(products.values());

  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  if (minPrice) {
    filtered = filtered.filter(p => p.price >= parseFloat(minPrice as string));
  }
  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= parseFloat(maxPrice as string));
  }
  if (search) {
    const searchLower = (search as string).toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    );
  }

  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return ctx.json({
    data,
    meta: { page, limit, total: filtered.length },
  });
});

app.get('/products/:id', (ctx) => {
  const product = products.get(parseInt(ctx.params.id));

  if (!product) {
    return ctx.notFound('Product not found');
  }

  return ctx.json(product);
});

app.post('/products', async (ctx) => {
  const body = await ctx.readJson();
  const result = validateCreateProduct(body);

  if (!result.valid) {
    return ctx.validationError(result.errors!.map(e => ({ field: 'body', message: e })));
  }

  const id = nextId++;
  const product: Product = {
    id,
    name: result.value.name,
    description: result.value.description || '',
    price: result.value.price,
    stock: result.value.stock || 0,
    category: result.value.category || 'general',
    createdAt: new Date(),
  };

  products.set(id, product);

  return ctx.status(201).json(product);
});

app.put('/products/:id', async (ctx) => {
  const productId = parseInt(ctx.params.id);
  const product = products.get(productId);

  if (!product) {
    return ctx.notFound('Product not found');
  }

  const body = await ctx.readJson<Partial<Product>>();
  const updated = { ...product, ...body, id: productId };
  products.set(productId, updated);

  return ctx.json(updated);
});

app.patch('/products/:id/stock', async (ctx) => {
  const productId = parseInt(ctx.params.id);
  const product = products.get(productId);

  if (!product) {
    return ctx.notFound('Product not found');
  }

  const body = await ctx.readJson<{ quantity: number; operation: 'add' | 'subtract' | 'set' }>();

  switch (body.operation) {
    case 'add':
      product.stock += body.quantity;
      break;
    case 'subtract':
      if (product.stock < body.quantity) {
        return ctx.status(400).json({ error: 'Insufficient stock' });
      }
      product.stock -= body.quantity;
      break;
    case 'set':
      product.stock = body.quantity;
      break;
  }

  return ctx.json({ id: productId, stock: product.stock });
});

app.delete('/products/:id', (ctx) => {
  const productId = parseInt(ctx.params.id);

  if (!products.has(productId)) {
    return ctx.notFound('Product not found');
  }

  products.delete(productId);
  return ctx.empty();
});

app.listen(3012).then(() => {
  console.log('Product Service started on port 3012');
});
