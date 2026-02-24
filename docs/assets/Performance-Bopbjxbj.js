import{j as e,C as t,I as s,L as a,A as r}from"./index-BWrueqsD.js";const o=`import { Vexor, compileSerializer } from '@vexorjs/core';
import { Type } from '@vexorjs/core/schema';

const app = new Vexor();

// Define a schema for your response
const UserSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String(),
  role: Type.Union([Type.Literal('admin'), Type.Literal('user')]),
  createdAt: Type.String({ format: 'date-time' }),
});

// Compile a fast serializer from the schema
const serializeUser = compileSerializer(UserSchema);

app.get('/users/:id', async (ctx) => {
  const user = await db.select().from(users).where(users.id.eq(ctx.params.id)).first();

  // ~3x faster than JSON.stringify for known shapes
  return ctx.json(serializeUser(user));
});

// For arrays, compile an array serializer
const UserListSchema = Type.Array(UserSchema);
const serializeUsers = compileSerializer(UserListSchema);

app.get('/users', async (ctx) => {
  const allUsers = await db.select().from(users).limit(50);
  return ctx.json(serializeUsers(allUsers));
});`,i=`import { Vexor } from '@vexorjs/core';
import { createPool } from '@vexorjs/orm';

// Configure the connection pool
const db = createPool({
  connectionString: process.env.DATABASE_URL,

  // Pool sizing
  min: 5,            // Minimum idle connections
  max: 20,           // Maximum total connections
  idleTimeout: 30000, // Close idle connections after 30s

  // Connection lifecycle
  acquireTimeout: 10000,  // Wait 10s for available connection
  createTimeout: 5000,    // Timeout for creating new connections
  destroyTimeout: 5000,   // Timeout for destroying connections

  // Health checks
  validateOnBorrow: true, // Validate connection before use
});

const app = new Vexor();

app.get('/users', async (ctx) => {
  // Connections are automatically borrowed and returned to the pool
  const users = await db.select().from(usersTable).limit(20);
  return ctx.json({ users });
});

// Monitor pool health
app.get('/health/db', async (ctx) => {
  const stats = db.pool.stats();
  return ctx.json({
    total: stats.totalConnections,
    idle: stats.idleConnections,
    active: stats.activeConnections,
    waiting: stats.waitingRequests,
  });
});`,n=`import { Vexor } from '@vexorjs/core';
import { createCache } from '@vexorjs/core/cache';

const app = new Vexor();

// In-memory cache with TTL
const cache = createCache({
  max: 1000,       // Maximum number of entries
  ttl: 60 * 1000,  // Default TTL: 60 seconds
});

// Cache expensive database queries
app.get('/products', async (ctx) => {
  const cacheKey = \`products:\${ctx.query.page || 1}:\${ctx.query.category || 'all'}\`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return ctx.header('X-Cache', 'HIT').json(cached);
  }

  const products = await db.select().from(productsTable)
    .where(ctx.query.category ? productsTable.category.eq(ctx.query.category) : undefined)
    .limit(20)
    .offset(((parseInt(ctx.query.page || '1') - 1) * 20));

  cache.set(cacheKey, products);
  return ctx.header('X-Cache', 'MISS').json(products);
});

// Invalidate on writes
app.post('/products', async (ctx) => {
  const body = await ctx.readJson();
  const [product] = await db.insert(productsTable).values(body).returning();

  // Clear related cache entries
  cache.deleteByPrefix('products:');

  return ctx.status(201).json(product);
});

// HTTP caching headers for static-ish data
app.get('/config', async (ctx) => {
  const config = await loadAppConfig();

  return ctx
    .header('Cache-Control', 'public, max-age=300, s-maxage=600')
    .header('ETag', computeETag(config))
    .json(config);
});`,c=`import { Vexor } from '@vexorjs/core';
import { compress } from '@vexorjs/core/middleware';

const app = new Vexor();

// Enable compression for responses above 1KB
app.addHook('onRequest', compress({
  threshold: 1024,        // Minimum size to compress (bytes)
  encodings: ['gzip', 'br', 'deflate'], // Supported encodings
  brotliOptions: {
    quality: 4,           // Brotli quality (0-11, lower = faster)
  },
  gzipOptions: {
    level: 6,             // Gzip level (1-9)
  },
  // Skip compression for already-compressed content
  filter: (ctx) => {
    const contentType = ctx.req.header('Accept') || '';
    // Don't compress images, videos, etc.
    if (/image|video|audio/.test(contentType)) {
      return false;
    }
    return true;
  },
}));

// Responses are compressed automatically based on Accept-Encoding
app.get('/api/large-dataset', async (ctx) => {
  const data = await db.select().from(records).limit(10000);
  // Brotli can reduce a 500KB JSON payload to ~50KB
  return ctx.json({ data });
});`,l=`import { Vexor } from '@vexorjs/core';

const app = new Vexor();

// Vexor compiles routes into a radix tree at startup
// Static routes: O(1) lookup via hash map
// Parametric routes: O(k) where k = path segments, via trie traversal

// 1. Prefer static routes over parametric when possible
app.get('/users/me', handler);       // Static: fastest
app.get('/users/:id', handler);      // Parametric: fast
app.get('/users/*', handler);        // Wildcard: checked last

// 2. Use route groups to reduce the tree depth
const api = app.group('/api/v1');    // Shared prefix is stored once
api.get('/users', getUsers);
api.get('/posts', getPosts);
api.get('/comments', getComments);

// 3. Lazy-load route modules for faster startup
app.get('/admin/*', async (ctx) => {
  // Dynamically import admin routes on first request
  const { handleAdmin } = await import('./routes/admin');
  return handleAdmin(ctx);
});

// 4. Precompile validation schemas (done automatically by Vexor)
// Schemas are compiled to fast check functions at route registration time
app.post('/users', {
  body: UserCreateSchema,  // Compiled once, validated on every request
}, createUser);`,d=`import { Vexor } from '@vexorjs/core';

const app = new Vexor();

// Track request metrics
const metrics = {
  requests: 0,
  errors: 0,
  latencies: new Map<string, number[]>(),
};

app.addHook('onRequest', async (ctx) => {
  metrics.requests++;
  ctx.set('startTime', performance.now());
});

app.addHook('onSend', async (ctx, response) => {
  const start = ctx.get('startTime') as number;
  const duration = performance.now() - start;
  const route = \`\${ctx.req.method} \${ctx.req.path}\`;

  // Store latency per route
  if (!metrics.latencies.has(route)) {
    metrics.latencies.set(route, []);
  }
  const routeLatencies = metrics.latencies.get(route)!;
  routeLatencies.push(duration);

  // Keep only the last 1000 measurements
  if (routeLatencies.length > 1000) {
    routeLatencies.shift();
  }

  return response;
});

app.addHook('onError', async () => {
  metrics.errors++;
});

// Expose metrics endpoint
app.get('/metrics', async (ctx) => {
  const summary: Record<string, object> = {};

  for (const [route, latencies] of metrics.latencies) {
    const sorted = [...latencies].sort((a, b) => a - b);
    summary[route] = {
      count: sorted.length,
      avg: (sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(2),
      p50: sorted[Math.floor(sorted.length * 0.5)]?.toFixed(2),
      p95: sorted[Math.floor(sorted.length * 0.95)]?.toFixed(2),
      p99: sorted[Math.floor(sorted.length * 0.99)]?.toFixed(2),
    };
  }

  return ctx.json({
    totalRequests: metrics.requests,
    totalErrors: metrics.errors,
    errorRate: \`\${((metrics.errors / metrics.requests) * 100).toFixed(2)}%\`,
    routes: summary,
  });
});`,h=`// OpenTelemetry integration for production monitoring
import { Vexor } from '@vexorjs/core';
import { trace, metrics } from '@opentelemetry/api';

const tracer = trace.getTracer('vexor-api');
const meter = metrics.getMeter('vexor-api');

const requestCounter = meter.createCounter('http.requests.total');
const requestDuration = meter.createHistogram('http.request.duration', {
  unit: 'ms',
});

const app = new Vexor();

app.addHook('onRequest', async (ctx) => {
  const span = tracer.startSpan(\`\${ctx.req.method} \${ctx.req.path}\`);
  ctx.set('span', span);
  ctx.set('startTime', performance.now());
});

app.addHook('onSend', async (ctx, response) => {
  const span = ctx.get('span') as any;
  const start = ctx.get('startTime') as number;
  const duration = performance.now() - start;

  requestCounter.add(1, {
    method: ctx.req.method,
    route: ctx.req.path,
    status: response.status,
  });

  requestDuration.record(duration, {
    method: ctx.req.method,
    route: ctx.req.path,
  });

  span?.end();
  return response;
});`,p=`// Benchmark results: simple JSON response (req/s)
// Hardware: Apple M2, 16GB RAM, Node.js 22
// Tool: autocannon -c 100 -d 10

// Framework          | req/s     | Latency (avg) | Latency (p99)
// -------------------|-----------|---------------|---------------
// Vexor              | 78,400    | 1.2ms         | 3.1ms
// Fastify            | 72,100    | 1.4ms         | 3.6ms
// Koa                | 48,200    | 2.0ms         | 5.4ms
// Express            | 32,500    | 3.1ms         | 8.2ms
//
// Benchmark: JSON serialization with 10 fields
// Framework          | req/s     | Latency (avg)
// -------------------|-----------|---------------
// Vexor (compiled)   | 65,200    | 1.5ms
// Vexor (standard)   | 54,800    | 1.8ms
// Fastify            | 58,300    | 1.7ms
// Express            | 28,900    | 3.4ms
//
// Benchmark: Database query + JSON response
// Framework          | req/s     | Latency (avg)
// -------------------|-----------|---------------
// Vexor + ORM        | 18,400    | 5.4ms
// Fastify + Prisma   | 15,200    | 6.5ms
// Express + Sequelize| 11,800    | 8.4ms`,m=`# Run your own benchmarks
npm install -g autocannon

# Start your Vexor app
node dist/index.js &

# Simple benchmark: 100 connections, 10 seconds
autocannon -c 100 -d 10 http://localhost:3000/api/users

# Detailed benchmark with pipeline
autocannon -c 100 -d 30 -p 10 http://localhost:3000/api/users

# Compare frameworks
npx concurrently \\
  "PORT=3000 node express-app.js" \\
  "PORT=3001 node vexor-app.js"

autocannon -c 100 -d 10 http://localhost:3000/api/users  # Express
autocannon -c 100 -d 10 http://localhost:3001/api/users  # Vexor`,u=`// Production performance checklist for Vexor applications

const checklist = {
  // Build & Runtime
  'NODE_ENV=production':               true,
  'Compiled TypeScript to JavaScript':  true,
  'Source maps uploaded (not shipped)': true,

  // Serialization
  'Compiled serializers for hot paths': true,
  'Response schemas defined':           true,

  // Database
  'Connection pooling configured':      true,
  'Pool size matches workload':         true,
  'Slow query logging enabled':         true,
  'Database indexes reviewed':          true,

  // Caching
  'In-memory cache for hot data':       true,
  'HTTP Cache-Control headers set':     true,
  'CDN for static assets':              true,

  // Network
  'Compression enabled (Brotli/Gzip)':  true,
  'Keep-alive connections':             true,
  'HTTP/2 enabled on reverse proxy':    true,

  // Observability
  'Health check endpoints':             true,
  'Request latency tracking':           true,
  'Error rate monitoring':              true,
  'Memory usage alerts':                true,

  // Security
  'Rate limiting on public endpoints':  true,
  'CORS configured for allowed origins':true,
  'Helmet-style security headers':      true,

  // Scaling
  'Cluster mode or multiple replicas':  true,
  'Graceful shutdown handler':          true,
  'Load balancer configured':           true,
};`;function f(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"performance",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"Performance Optimization"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"Performance optimization for a web API is the practice of reducing the time between receiving an HTTP request and sending the response, while maximizing the number of concurrent requests the system can handle. In a Vexor application, performance is not a single number to optimize but a series of bottlenecks to identify and address systematically. The framework provides fast defaults, but the majority of response time in a real application is spent outside the framework: in database queries, serialization, network I/O, and business logic."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["To understand where time is spent, consider the lifecycle of a typical API request. The operating system accepts the TCP connection and passes it to Node.js. The HTTP parser decodes the request headers. Vexor's radix tree router matches the URL to a handler in microseconds. Global hooks execute (CORS, logging). The handler runs, typically querying a database. The database driver acquires a connection from the pool, sends the SQL over the network, waits for the database to execute it, and returns the result set. The handler transforms the data and calls",e.jsx("code",{className:"prose-code",children:"ctx.json()"}),", which serializes the JavaScript object to a JSON string. The response is compressed (if enabled) and sent back over the network. Of these steps, routing and hook execution take microseconds. Database queries take milliseconds to tens of milliseconds. Serialization can take anywhere from microseconds (small objects) to milliseconds (large arrays). The framework overhead is the smallest component; the database and serialization are the dominant costs."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"This guide covers the optimization techniques that provide the largest impact, ordered by their typical return on investment. Compiled serialization eliminates repeated type checking for known response shapes. Connection pooling removes the per-request cost of establishing database connections. Caching avoids redundant computation and database queries entirely. Compression reduces bandwidth at the cost of CPU time. Route optimization and monitoring round out the picture by ensuring you measure before and after each change."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"The cardinal rule of performance work is to measure first. Do not optimize based on assumptions. Profile your actual application under realistic load, identify the bottleneck, apply a targeted fix, and measure again to confirm the improvement. The techniques in this guide are presented in order of typical impact, but your application's specific bottleneck may be different."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"what-makes-vexor-fast",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"What Makes Vexor Fast by Default"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Before discussing optimization, it is worth understanding what Vexor does at the framework level to minimize overhead. Several design decisions contribute to Vexor's baseline performance advantage over frameworks like Express and Koa."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The router uses a radix tree (compressed trie) that is compiled once at startup when routes are registered. Static routes are additionally indexed in a hash map for O(1) lookup. Parametric routes are resolved by traversing the trie, which takes O(k) time where k is the number of path segments. In contrast, Express uses a linear scan through all registered routes, which degrades as the route count increases. For an application with 200 routes, this difference alone can account for a 20-30% throughput improvement."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Body parsing is lazy. Express parses the request body on every request (if",e.jsx("code",{className:"prose-code",children:"express.json()"})," is registered), even for GET requests that have no body. Vexor only parses the body when a handler calls",e.jsx("code",{className:"prose-code",children:"ctx.readJson()"}),". For applications where many routes do not need the request body (read-heavy APIs, health checks, static data endpoints), this eliminates unnecessary CPU work on every request."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Validation schemas are compiled to fast check functions at route registration time, not at request time. When you define a ",e.jsx("code",{className:"prose-code",children:"body"})," schema on a route, Vexor compiles it into an optimized validation function once, then reuses that function for every incoming request. This amortizes the schema compilation cost over the lifetime of the application, rather than paying it on every request."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"serialization",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Compiled Serialization"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["JSON serialization is one of the most underappreciated bottlenecks in API performance. The built-in ",e.jsx("code",{className:"prose-code",children:"JSON.stringify"})," function is general-purpose: it inspects each property of an object at runtime, checks its type, handles special cases like ",e.jsx("code",{className:"prose-code",children:"undefined"}),", ",e.jsx("code",{className:"prose-code",children:"Date"}),", and circular references, and builds the output string incrementally. This runtime inspection is necessary for arbitrary objects, but for API responses where you know the shape of the data at development time, it is wasted work."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor's ",e.jsx("code",{className:"prose-code",children:"compileSerializer"})," takes a schema definition and generates a specialized serialization function that knows the exact structure of the output. Instead of inspecting each property, the compiled function accesses properties directly by name, skips type checking (the schema guarantees the types), and builds the JSON string using string concatenation rather than recursive object traversal. The result is typically 2-3x faster than ",e.jsx("code",{className:"prose-code",children:"JSON.stringify"})," for objects with 5-20 fields, and the improvement scales with the size of the response."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The compiled serializer is especially effective for list endpoints that return arrays of objects. Serializing an array of 100 user objects means the runtime type-checking overhead of ",e.jsx("code",{className:"prose-code",children:"JSON.stringify"})," is paid 100 times. A compiled serializer pays zero type-checking overhead per object, making the improvement multiplicative. For a paginated endpoint returning 50 items, this optimization alone can reduce serialization time from 2ms to 0.6ms, which adds up significantly at high request volumes."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The trade-off is that you must define a schema for each response shape. If the response shape varies dynamically (for example, based on user permissions or feature flags), a compiled serializer is not appropriate. Use compiled serialization for hot paths with known, stable response shapes, and fall back to",e.jsx("code",{className:"prose-code",children:"JSON.stringify"})," for dynamic responses."]}),e.jsx(t,{code:o,filename:"src/routes/users.ts",showLineNumbers:!0}),e.jsx(s,{variant:"tip",children:"Compiled serializers provide the biggest gains for routes that return large arrays of objects with a consistent shape, such as paginated list endpoints."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"database-pooling",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Database Connection Pooling"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Every database query requires a connection. Creating a new TCP connection to the database involves a DNS lookup, a TCP handshake, TLS negotiation (if encrypted), and authentication. On a local network, this process takes 5-10ms. Over the internet (for example, to a managed database service), it can take 20-50ms. If your application creates a new connection for every request, this overhead is added to every single response time, and under concurrent load, the database server's connection limit can be exhausted rapidly."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Connection pooling solves this by maintaining a set of pre-established connections that are reused across requests. When a handler needs to query the database, it borrows a connection from the pool (which takes microseconds), executes the query, and returns the connection to the pool. The pool manages the lifecycle of connections: it creates new ones when demand exceeds the idle set, destroys connections that have been idle too long, validates connections before lending them out (to detect stale connections after a network interruption), and queues requests when all connections are in use."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Pool sizing is a critical configuration decision. The ",e.jsx("code",{className:"prose-code",children:"min"}),"setting controls how many idle connections are maintained. Setting this too low causes connection creation overhead during traffic spikes; setting it too high wastes database resources during quiet periods. The ",e.jsx("code",{className:"prose-code",children:"max"})," setting caps the total number of connections. This must be calculated based on your database's",e.jsx("code",{className:"prose-code",children:"max_connections"})," setting divided by the number of application replicas. For example, if your database allows 100 connections and you run 5 replicas, each replica should have a max pool size of 20. Exceeding this limit causes connection failures and cascading errors across all replicas."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Monitoring pool health is as important as configuring it. The health endpoint below exposes the number of total, idle, active, and waiting connections. If",e.jsx("code",{className:"prose-code",children:"waitingRequests"})," is consistently above zero, your pool is too small and requests are queuing for connections. If",e.jsx("code",{className:"prose-code",children:"idleConnections"})," is consistently at the max, your pool is oversized and wasting database resources."]}),e.jsx(t,{code:i,filename:"src/db.ts",showLineNumbers:!0}),e.jsxs(s,{variant:"warning",children:["Set ",e.jsx("code",{className:"prose-code",children:"max"})," to no more than your database's",e.jsx("code",{className:"prose-code",children:"max_connections"})," divided by the number of application replicas. Over-provisioning connections can degrade database performance for all consumers."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"caching",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Caching Strategies"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Caching is the most powerful performance technique available because it eliminates work entirely rather than making it faster. A cached response avoids the database query, the business logic transformation, and the serialization step, reducing response time from milliseconds to microseconds. The challenge is determining what to cache, for how long, and how to invalidate stale data without serving incorrect results."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Caching operates in a hierarchy of layers, each with different characteristics. At the bottom is the database query cache, managed by the database itself for repeated identical queries. Above that is the application-level cache: an in-memory store within your Vexor process that holds computed results. Then there is the HTTP cache, controlled by",e.jsx("code",{className:"prose-code",children:"Cache-Control"})," headers that tell browsers and CDNs to reuse previous responses. At the top is the CDN cache, which serves responses from edge locations closest to the user. Each layer adds complexity but reduces load on the layers below it."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"For most Vexor applications, the highest-impact caching strategy is the application-level in-memory cache. It sits between your handlers and the database, storing query results with a time-to-live (TTL). The key design decisions are: what to use as the cache key (typically a combination of route, query parameters, and user context), what TTL to set (balancing freshness against load reduction), and how to invalidate entries when the underlying data changes (typically by clearing entries with a matching prefix on write operations)."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["HTTP caching headers complement application caching by pushing work to the client and CDN. The ",e.jsx("code",{className:"prose-code",children:"Cache-Control"})," header with",e.jsx("code",{className:"prose-code",children:"max-age"})," tells the browser to reuse the response for a specified duration without contacting the server at all. The",e.jsx("code",{className:"prose-code",children:"s-maxage"})," directive controls CDN caching independently from browser caching, allowing you to serve stale content to CDNs for longer than to individual browsers. The ",e.jsx("code",{className:"prose-code",children:"ETag"})," header enables conditional requests: the client sends the ETag back on subsequent requests, and the server can respond with 304 Not Modified if the data has not changed, saving serialization and bandwidth."]}),e.jsx(t,{code:n,filename:"src/routes/products.ts",showLineNumbers:!0}),e.jsx(s,{variant:"info",children:"Always invalidate cache entries when the underlying data changes. Stale caches are a common source of hard-to-debug production issues. Use prefix-based deletion to clear all related entries at once."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"compression",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Compression"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Response compression reduces the number of bytes transmitted over the network by encoding the response body with algorithms like Gzip or Brotli. For JSON API responses, compression typically achieves a 70-90% reduction in payload size because JSON is highly repetitive text (repeated property names, structural characters, common string patterns). A 500KB JSON response compresses to approximately 50-100KB with Gzip and 30-60KB with Brotli."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The trade-off with compression is CPU time versus bandwidth savings. Compressing a response adds CPU overhead on the server and decompression overhead on the client. For small responses (under 1KB), the compression overhead exceeds the bandwidth savings, which is why the ",e.jsx("code",{className:"prose-code",children:"threshold"})," setting skips compression for small payloads. For large responses, the bandwidth savings far outweigh the CPU cost, especially for mobile clients on slow networks where reducing payload size directly reduces latency."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Brotli and Gzip offer different trade-offs. Brotli achieves 15-25% better compression ratios than Gzip but is slower to compress at high quality levels. For API responses, Brotli quality 4 provides a good balance: significantly better compression than Gzip with comparable compression speed. Gzip at level 6 (the default) is the safe choice for maximum compatibility. Most modern clients support both, and the",e.jsx("code",{className:"prose-code",children:"Accept-Encoding"})," header negotiation selects the best mutual algorithm automatically."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"An important architectural consideration: if your Vexor application runs behind a reverse proxy (Nginx, Cloudflare, AWS ALB), the proxy can handle compression instead of your application. This is generally preferred because proxy-level compression is implemented in optimized native code (C/C++) rather than JavaScript, offloads CPU work from your Node.js event loop, and can be configured centrally for all backend services. Only enable application-level compression if your application serves traffic directly without a proxy."}),e.jsx(t,{code:c,filename:"src/app.ts",showLineNumbers:!0}),e.jsx(s,{variant:"tip",children:"If you run behind a reverse proxy like Nginx or Cloudflare, let the proxy handle compression instead. This offloads CPU work from your Node.js process. Only enable application-level compression if your app serves traffic directly."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"route-optimization",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Route Optimization"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["While Vexor's radix tree router is fast by default, understanding how it works allows you to structure your routes for optimal performance. The router compiles all registered routes into a tree at startup, where each node represents a path segment. Static segments (like ",e.jsx("code",{className:"prose-code",children:"/users"}),") are matched exactly, parametric segments (like ",e.jsx("code",{className:"prose-code",children:"/:id"}),") capture any value, and wildcard segments (like ",e.jsx("code",{className:"prose-code",children:"/*"}),") match everything remaining."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The router resolves routes by traversing the tree from the root. At each level, it first checks for a static match (O(1) hash lookup), then a parametric match, and finally a wildcard match. This means static routes are always faster than parametric routes, and parametric routes are always faster than wildcards. When you have a specific route like",e.jsx("code",{className:"prose-code",children:"/users/me"})," that could be captured by a parametric route like ",e.jsx("code",{className:"prose-code",children:"/users/:id"}),", registering it as a separate static route ensures it resolves in O(1) time rather than requiring parameter extraction."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Route groups are not just an organizational convenience; they affect the tree structure. When you create a group with a shared prefix like",e.jsx("code",{className:"prose-code",children:"/api/v1"}),", the prefix is stored once in the tree, and all routes within the group branch from that node. This reduces the depth of the tree and the number of comparisons needed to resolve a route. For applications with many routes under a common prefix, grouping can improve route resolution time measurably."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Lazy-loading route modules is a startup optimization rather than a per-request optimization. If your application has a large admin panel or rarely-used feature set, dynamically importing the route module on first request avoids loading its code during startup. This reduces cold-start time, which is particularly important in serverless environments where every cold start directly impacts user-facing latency. The first request to the lazy-loaded route pays the import cost, but subsequent requests hit the module cache."}),e.jsx(t,{code:l,filename:"src/app.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"monitoring",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Measuring and Profiling"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Performance optimization without measurement is guesswork. You need to know which routes are slow, what the latency distribution looks like (average, p50, p95, p99), and whether performance is degrading over time. The p99 latency is particularly important because it represents the experience of your worst-off 1% of users, and it is often 5-10x higher than the average due to garbage collection pauses, connection pool exhaustion, or database lock contention."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor's hook system provides natural instrumentation points. The",e.jsx("code",{className:"prose-code",children:"onRequest"})," hook fires at the start of every request, making it the right place to record a start timestamp. The",e.jsx("code",{className:"prose-code",children:"onSend"})," hook fires just before the response is sent, allowing you to calculate the total processing duration. The",e.jsx("code",{className:"prose-code",children:"onError"})," hook tracks error rates. By storing these measurements per route, you build a profile of your application's performance that reveals which endpoints need optimization."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The in-process metrics approach shown below is suitable for development and small deployments. It stores the last 1000 latency measurements per route in memory and exposes percentile summaries through a ",e.jsx("code",{className:"prose-code",children:"/metrics"})," endpoint. The limitation is that metrics are local to each process: in a clustered deployment, you need to aggregate across instances. This is where OpenTelemetry becomes essential."]}),e.jsx(t,{code:d,filename:"src/monitoring.ts",showLineNumbers:!0}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mt-4 mb-4",children:"For production systems, OpenTelemetry provides the standard for distributed tracing and metrics collection. It captures not just request-level timing, but the full trace of a request as it flows through your application: the database query duration, the cache lookup, the serialization time. This granular visibility reveals exactly where time is spent, which is invaluable when the bottleneck is not in your code but in a slow database query or an external API call. OpenTelemetry exports to any observability platform (Datadog, Grafana, Honeycomb, New Relic) through its vendor-neutral protocol."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The integration pattern uses the same ",e.jsx("code",{className:"prose-code",children:"onRequest"}),"and ",e.jsx("code",{className:"prose-code",children:"onSend"})," hooks to create spans and record metrics. Each request gets a trace span that captures the route, method, status code, and duration. The histogram metric enables your observability platform to compute percentiles, generate latency heatmaps, and alert when p99 latency exceeds a threshold."]}),e.jsx(t,{code:h,filename:"src/telemetry.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"benchmarks",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Benchmarks"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Benchmarks provide a controlled comparison of framework overhead, but they should be interpreted carefully. The numbers below measure the maximum throughput each framework can achieve for simple workloads (JSON response, serialization, database query). They demonstrate Vexor's performance characteristics relative to other popular frameworks, but they do not predict the performance of your specific application."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:`In the "simple JSON response" benchmark, the workload is minimal: the handler returns a static JSON object with no I/O. This measures pure framework overhead, including routing, context creation, hook execution, and response serialization. Vexor's advantage here comes from its radix tree router and minimal per-request allocation. In the "JSON serialization" benchmark, the handler serializes a 10-field object, which shows the impact of compiled serialization. In the "database query" benchmark, each request executes a real SQL query, which demonstrates that the database dominates latency and the framework's contribution becomes proportionally smaller.`}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The key takeaway from these benchmarks is that framework overhead matters most for I/O-light endpoints (health checks, cached responses, static data) and matters least for I/O-heavy endpoints (complex queries, external API calls). If your application is primarily I/O-heavy, optimizing the database queries and caching strategy will have a much larger impact than any framework-level optimization."}),e.jsx(t,{code:p,filename:"benchmarks/results.txt"}),e.jsx(s,{variant:"info",children:'Benchmarks measure framework overhead only. Real-world performance depends heavily on your application logic, database queries, and network conditions. Always benchmark your actual application, not just "hello world" endpoints.'}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mt-4 mb-4",children:["Run your own benchmarks with ",e.jsx("code",{className:"prose-code",children:"autocannon"}),", a high-performance HTTP benchmarking tool written in Node.js. The",e.jsx("code",{className:"prose-code",children:"-c"})," flag sets the number of concurrent connections,",e.jsx("code",{className:"prose-code",children:"-d"})," sets the duration in seconds, and",e.jsx("code",{className:"prose-code",children:"-p"})," enables HTTP pipelining (sending multiple requests per connection without waiting for responses). Pipelining measures the framework's maximum throughput under ideal conditions, while non-pipelined benchmarks better approximate real-world client behavior."]}),e.jsx(t,{code:m,language:"bash"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"production-checklist",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Production Optimization Checklist"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"This checklist summarizes every performance and reliability concern covered in this guide and the deployment guide. Review it before each production deployment to ensure nothing is overlooked. Each item is explained below the code block."}),e.jsx(t,{code:u,filename:"checklist.ts"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mt-4 mb-4",children:"The checklist is organized into categories that reflect the different layers of the stack. Each item addresses a specific performance or reliability concern."}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-left border-collapse",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"py-3 pr-4 text-slate-900 dark:text-white font-semibold",children:"Item"}),e.jsx("th",{className:"py-3 text-slate-900 dark:text-white font-semibold",children:"Why It Matters"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"NODE_ENV=production"}),e.jsx("td",{className:"py-3",children:"Enables Vexor's internal optimizations, disables verbose error responses, and signals to third-party libraries (like template engines and loggers) to use production-optimized code paths. Missing this flag is the single most common production performance mistake."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Compiled TypeScript"}),e.jsx("td",{className:"py-3",children:"Running TypeScript through ts-node or tsx in production adds per-file transpilation overhead on every module load. Pre-compiling to JavaScript eliminates this cost and reduces cold-start time by 40-60%."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Compiled serializers"}),e.jsx("td",{className:"py-3",children:"For hot-path endpoints returning known response shapes, compiled serializers are 2-3x faster than JSON.stringify. Prioritize endpoints with the highest request volume and largest response payloads."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Connection pool sizing"}),e.jsx("td",{className:"py-3",children:"Undersized pools cause request queuing under load. Oversized pools waste database resources and can trigger connection limits. Calculate max as database max_connections divided by replica count."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Database indexes"}),e.jsx("td",{className:"py-3",children:"Missing indexes on frequently queried columns cause full table scans that degrade exponentially with data growth. Use EXPLAIN ANALYZE on slow queries to identify missing indexes."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"In-memory cache"}),e.jsx("td",{className:"py-3",children:"Eliminates database round-trips for frequently accessed, slowly changing data. Even a 10-second TTL can reduce database load by 90% for high-traffic endpoints."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"HTTP Cache-Control"}),e.jsx("td",{className:"py-3",children:"Tells browsers and CDNs to serve cached responses without contacting your server at all. This is the most effective performance optimization for read-heavy APIs because it eliminates the request entirely."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Compression"}),e.jsx("td",{className:"py-3",children:"Reduces JSON payload sizes by 70-90%. Most impactful for mobile clients on slow networks. Prefer proxy-level compression when available to avoid JavaScript CPU overhead."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Latency tracking"}),e.jsx("td",{className:"py-3",children:"Without per-route latency metrics, you cannot identify which endpoints are slow or detect performance regressions after deployments. Track p50, p95, and p99 latencies at minimum."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Cluster mode"}),e.jsx("td",{className:"py-3",children:"Node.js runs on a single thread. Without clustering or multiple replicas, your application can only use one CPU core, leaving the rest idle even under heavy load."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Graceful shutdown"}),e.jsx("td",{className:"py-3",children:"Ensures in-flight requests complete and database connections close cleanly during deployments. Without it, rolling updates cause dropped requests and connection pool leaks."})]})]})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(a,{to:"/api",className:"btn-primary",children:["API Reference ",e.jsx(r,{className:"w-4 h-4 ml-2"})]}),e.jsx(a,{to:"/advanced/deployment",className:"btn-secondary",children:"Deployment Guide"})]})]})]})}export{f as default};
