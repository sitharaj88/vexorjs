import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const systemDesignCode = `// System Design: URL Shortener Service
// Requirements: Shorten URLs, redirect, analytics, high throughput
//
// Architecture:
//  Client --> Load Balancer --> API Servers --> Cache (Redis)
//                                    |              |
//                                    v              v
//                              Database (Postgres)
//                                    |
//                                    v
//                            Analytics Pipeline

import { Vexor, Type } from '@vexorjs/core';

// Assume db (Vexor ORM connection) and cache (Redis client)
// are initialized elsewhere and imported here.
const app = new Vexor();

// Base62 encoding for short URLs
function encode(num: number): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  while (num > 0) {
    result = chars[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result || '0';
}

// Shorten a URL
app.post('/api/shorten', {
  body: Type.Object({
    url: Type.String({ format: 'uri' }),
    customAlias: Type.Optional(Type.String({ minLength: 3, maxLength: 20 }))
  })
}, async (ctx) => {
  const { url, customAlias } = await ctx.body();

  const shortCode = customAlias || encode(await getNextId());

  await db.urls.create({
    shortCode,
    originalUrl: url,
    clicks: 0
  });

  // Cache for fast lookups
  await cache.set(\`url:\${shortCode}\`, url, { ttl: 86400 });

  return ctx.status(201).json({
    shortUrl: \`https://short.io/\${shortCode}\`,
    originalUrl: url
  });
});

// Redirect (hot path - must be fast!)
app.get('/:code', async (ctx) => {
  const { code } = ctx.params;

  // 1. Check cache (sub-millisecond)
  let url = await cache.get(\`url:\${code}\`);

  // 2. Cache miss -> check database
  if (!url) {
    const record = await db.urls.where({ shortCode: code }).first();
    if (!record) return ctx.status(404).json({ error: 'Not found' });
    url = record.originalUrl;
    await cache.set(\`url:\${code}\`, url, { ttl: 86400 });
  }

  // 3. Track click asynchronously (don't block the redirect)
  trackClick(code, ctx.headers).catch(console.error);

  return ctx.redirect(url, 301);
});`;

const microservicesCode = `// Microservices Architecture with Vexor
//
// Service Boundaries:
//   [User Service]  <-->  [API Gateway]  <-->  [Order Service]
//        |                     |                     |
//        v                     v                     v
//   [User DB]           [Message Queue]         [Order DB]
//                             |
//                             v
//                     [Notification Service]

// === API Gateway ===
import { Vexor } from '@vexorjs/core';

const gateway = new Vexor();

// Service registry
const services = {
  users: 'http://user-service:3001',
  orders: 'http://order-service:3002',
  notifications: 'http://notification-service:3003',
};

// Proxy requests to downstream services.
// app.group(prefix, callback) registers routes under a shared prefix.
gateway.group('/api/users', (group) => {
  group.all('/*', async (ctx) => {
    const response = await fetch(\`\${services.users}\${ctx.path}\`, {
      method: ctx.method,
      headers: ctx.headers,
      body: ctx.method !== 'GET' ? JSON.stringify(await ctx.body()) : undefined
    });
    const data = await response.json();
    return ctx.status(response.status).json(data);
  });
});

// === User Service (independent) ===
const userService = new Vexor();

userService.get('/api/users/:id', async (ctx) => {
  const user = await userDb.findById(ctx.params.id);
  return ctx.json(user);
});

userService.post('/api/users', async (ctx) => {
  const user = await userDb.create(await ctx.body());

  // Publish event for other services
  await messageQueue.publish('user.created', {
    userId: user.id,
    email: user.email,
    timestamp: Date.now()
  });

  return ctx.status(201).json(user);
});

// === Notification Service (event-driven) ===
// Listen for events from the message queue
messageQueue.subscribe('user.created', async (event) => {
  await sendWelcomeEmail(event.email);
  console.log(\`Welcome email sent to \${event.email}\`);
});

messageQueue.subscribe('order.completed', async (event) => {
  await sendOrderConfirmation(event.userId, event.orderId);
});`;

const eventDrivenCode = `// Event-Driven Architecture
// Pattern: Publish events, react asynchronously

// Event bus implementation
class EventBus {
  private handlers = new Map<string, Function[]>();

  on(event: string, handler: Function) {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler);
  }

  async emit(event: string, data: any) {
    const handlers = this.handlers.get(event) || [];
    await Promise.allSettled(handlers.map(h => h(data)));
  }
}

const events = new EventBus();

// Register event handlers
events.on('user.registered', async (data) => {
  await sendWelcomeEmail(data.email);
});

events.on('user.registered', async (data) => {
  await createDefaultSettings(data.userId);
});

events.on('user.registered', async (data) => {
  await analytics.track('signup', { userId: data.userId });
});

events.on('order.placed', async (data) => {
  await updateInventory(data.items);
  await processPayment(data.paymentDetails);
  await notifyWarehouse(data.orderId);
});

// Usage in routes - clean separation of concerns
app.post('/api/users', async (ctx) => {
  const user = await db.users.create(await ctx.body());

  // Fire and forget - handlers run independently
  events.emit('user.registered', {
    userId: user.id,
    email: user.email,
    name: user.name
  });

  return ctx.status(201).json(user);
});`;

const cachingCode = `// Caching Strategies
//
// 1. Cache-Aside (Lazy Loading)
//    App checks cache first, falls back to DB, populates cache
//
// 2. Write-Through
//    App writes to cache and DB simultaneously
//
// 3. Write-Behind (Write-Back)
//    App writes to cache, async write to DB later

// In-memory cache with TTL
class Cache {
  private store = new Map<string, { value: any; expires: number }>();

  get(key: string): any | null {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  set(key: string, value: any, ttlSeconds: number) {
    this.store.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
  }

  invalidate(pattern: string) {
    for (const key of this.store.keys()) {
      if (key.startsWith(pattern)) this.store.delete(key);
    }
  }
}

const cache = new Cache();

// Cache-aside pattern in routes.
// Response headers are set on the builder chain:
// ctx.status(...).header(...).json(...)
app.get('/api/products/:id', async (ctx) => {
  const cacheKey = \`product:\${ctx.params.id}\`;

  // 1. Check cache
  let product = cache.get(cacheKey);
  if (product) {
    return ctx.status(200).header('X-Cache', 'HIT').json(product);
  }

  // 2. Cache miss - fetch from DB
  product = await db.products.findById(ctx.params.id);
  if (!product) return ctx.status(404).json({ error: 'Not found' });

  // 3. Populate cache (TTL: 5 minutes)
  cache.set(cacheKey, product, 300);
  return ctx.status(200).header('X-Cache', 'MISS').json(product);
});

// Invalidate on update
app.put('/api/products/:id', async (ctx) => {
  const product = await db.products.update(ctx.params.id, await ctx.body());
  cache.invalidate(\`product:\${ctx.params.id}\`);    // Invalidate specific
  cache.invalidate('products:list');                  // Invalidate list cache
  return ctx.json(product);
});

// HTTP Caching headers
app.get('/api/static-data', async (ctx) => {
  return ctx
    .status(200)
    .header('Cache-Control', 'public, max-age=3600')  // Browser caches for 1 hour
    .header('ETag', 'v1.2.3')                          // Version-based caching
    .json({ data: staticContent });
});`;

const performanceCode = `// Performance Optimization Techniques

import { Vexor, Type, compression } from '@vexorjs/core';
import { createConnection } from '@vexorjs/orm';

// 1. Request timeouts - abort requests that run too long
const app = new Vexor({ requestTimeout: 30000 });

// 2. Connection pooling
// Reuse database connections instead of creating new ones per request
const db = await createConnection({
  driver: 'postgres',
  connectionString: process.env.DATABASE_URL,
  maxConnections: 20,   // Maximum concurrent connections
  idleTimeout: 30000,   // Close idle connections after 30s
});

// 3. Pagination - never return all records
app.get('/api/products', {
  query: Type.Object({
    cursor: Type.Optional(Type.String()),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 }))
  })
}, async (ctx) => {
  const limit = ctx.query.limit ?? 20;
  const cursor = ctx.query.cursor;

  // Fetch one extra row to check if there's a next page
  const products = await fetchProductsAfter(cursor, limit + 1);

  const hasMore = products.length > limit;
  const items = hasMore ? products.slice(0, -1) : products;

  return ctx.json({
    data: items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
    hasMore
  });
});

// 4. Response compression (gzip/brotli for responses > 1KB)
app.use(compression({ threshold: 1024 }));

// 5. Selective field loading - let clients ask for less
app.get('/api/users', {
  query: Type.Object({
    fields: Type.Optional(Type.String())
  })
}, async (ctx) => {
  const fields = ctx.query.fields?.split(',') ?? ['id', 'name', 'email'];
  const users = await loadUsers(fields);
  return ctx.json(users);
});`;

const chapters = [
  { num: '01', title: 'System Design', desc: 'Design scalable systems end-to-end', color: 'from-rose-500 to-red-600' },
  { num: '02', title: 'Microservices', desc: 'Service boundaries and communication', color: 'from-blue-500 to-indigo-600' },
  { num: '03', title: 'Event-Driven', desc: 'Async processing and event buses', color: 'from-green-500 to-emerald-600' },
  { num: '04', title: 'Caching Strategies', desc: 'Cache-aside, write-through, TTL', color: 'from-amber-500 to-orange-600' },
  { num: '05', title: 'Performance', desc: 'Pooling, pagination, compression', color: 'from-violet-500 to-purple-600' },
];

export default function LearnArchitecture() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium mb-4">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          Advanced
        </div>
        <h1 id="architecture" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Architecture & System Design
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
          Design systems that scale. Learn system design patterns, microservices, event-driven architecture,
          caching strategies, and performance optimization.
        </p>
      </div>

      {/* Architecture Topics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chapters.map((item) => (
          <div key={item.num} className="relative p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-primary-500/50 transition-colors">
            <span className={`text-xs font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
              CHAPTER {item.num}
            </span>
            <h3 className="font-semibold mt-1 text-slate-900 dark:text-white">{item.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Key Concepts */}
      <section className="p-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Key Concepts to Master</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Scalability', desc: 'Horizontal vs vertical scaling, stateless services, load distribution' },
            { title: 'Reliability', desc: 'Redundancy, failover, circuit breakers, retry strategies' },
            { title: 'Availability', desc: 'SLAs, health checks, graceful degradation, zero-downtime deploys' },
            { title: 'Consistency', desc: 'Strong vs eventual consistency, CAP theorem, distributed consensus' },
          ].map((item) => (
            <div key={item.title} className="p-3 bg-white dark:bg-slate-800/50 rounded-xl">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{item.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Chapter 1: System Design */}
      <section id="system-design">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-rose-500 mr-2">01</span> System Design: URL Shortener
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Walk through designing a real system end-to-end. We'll build a URL shortener covering requirements
          gathering, architecture decisions, database design, caching, and scaling.
        </p>

        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 rounded-xl">
          <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">Design Process</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="space-y-2">
              <p><strong className="text-slate-900 dark:text-white">1. Requirements:</strong> Functional (shorten, redirect) and non-functional (low latency, high availability)</p>
              <p><strong className="text-slate-900 dark:text-white">2. Estimations:</strong> 100M URLs/month, 10:1 read/write ratio, ~40K reads/sec peak</p>
            </div>
            <div className="space-y-2">
              <p><strong className="text-slate-900 dark:text-white">3. Architecture:</strong> API servers + Cache layer + Database + Analytics pipeline</p>
              <p><strong className="text-slate-900 dark:text-white">4. Trade-offs:</strong> Consistency vs availability, cache invalidation strategy</p>
            </div>
          </div>
        </div>

        <CodeBlock code={systemDesignCode} filename="url-shortener.ts" showLineNumbers />
      </section>

      {/* Chapter 2: Microservices */}
      <section id="microservices">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-blue-500 mr-2">02</span> Microservices Architecture
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Break your application into independently deployable services. Each service owns its data,
          communicates via APIs or message queues, and scales independently.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">When to Use</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Large teams, different scaling needs per feature, independent deploy cycles, polyglot tech stack.
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">When NOT to Use</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Small teams, early-stage products, simple CRUD apps. Start monolith, extract services when needed.
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Communication</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sync: REST/gRPC between services. Async: Message queues (RabbitMQ, Kafka) for events.
            </p>
          </div>
        </div>

        <CodeBlock code={microservicesCode} filename="microservices.ts" showLineNumbers />
      </section>

      {/* Chapter 3: Event-Driven */}
      <section id="event-driven">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-green-500 mr-2">03</span> Event-Driven Architecture
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Decouple your application with events. Instead of calling services directly, publish events
          and let interested parties react independently. Vexor ships a built-in{' '}
          <Link to="/realtime/pubsub" className="underline text-primary-600 dark:text-primary-400">Pub/Sub &amp; Event Bus</Link>{' '}
          module -- the minimal implementation below shows the underlying pattern.
        </p>
        <CodeBlock code={eventDrivenCode} filename="events.ts" showLineNumbers />

        <InfoBlock variant="tip" title="Why Events?">
          The user registration handler doesn't need to know about emails,
          analytics, or settings. It just creates the user and announces it happened. Each concern is handled
          independently and can fail without affecting the main flow.
        </InfoBlock>
      </section>

      {/* Chapter 4: Caching */}
      <section id="caching">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-amber-500 mr-2">04</span> Caching Strategies
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Caching is the single most effective way to improve API performance. Learn when to cache,
          how to invalidate, and which strategy fits your use case. For production use, Vexor's{' '}
          <Link to="/infrastructure/caching" className="underline text-primary-600 dark:text-primary-400">caching module</Link>{' '}
          provides memory, LRU, and Redis stores out of the box.
        </p>
        <CodeBlock code={cachingCode} filename="caching.ts" showLineNumbers />
      </section>

      {/* Chapter 5: Performance */}
      <section id="performance">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-violet-500 mr-2">05</span> Performance Optimization
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Squeeze every millisecond out of your APIs. Request timeouts, connection pooling, cursor-based
          pagination, response compression, and selective field loading.
        </p>
        <CodeBlock code={performanceCode} filename="performance.ts" showLineNumbers />

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">Performance Checklist</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Use connection pooling for databases',
              'Implement cursor-based pagination',
              'Enable response compression (gzip/brotli)',
              'Add caching layers (in-memory + Redis)',
              'Use database indexes on queried fields',
              'Avoid N+1 queries with eager loading',
              'Set request timeouts',
              'Use streaming for large payloads',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="text-primary-500 mt-0.5 flex-shrink-0">&#x2713;</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next-steps" className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Go to Production
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You understand how to architect systems. Now learn to deploy, monitor, secure, and scale
          your applications in production environments.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/learn/production" className="btn-primary">
            Continue to Production <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/learn" className="btn-secondary">
            Back to Learning Path
          </Link>
        </div>
      </section>
    </div>
  );
}
