import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const serializationCode = `import { Vexor, compileSerializer } from '@vexorjs/core';
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
});`;

const poolingCode = `import { Vexor } from '@vexorjs/core';
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
});`;

const cachingCode = `import { Vexor } from '@vexorjs/core';
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
});`;

const compressionCode = `import { Vexor } from '@vexorjs/core';
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
});`;

const routeOptimizationCode = `import { Vexor } from '@vexorjs/core';

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
}, createUser);`;

const monitoringCode = `import { Vexor } from '@vexorjs/core';

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
});`;

const otelCode = `// OpenTelemetry integration for production monitoring
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
});`;

const jitValidationCode = `import { Type, compileValidator, compileInterpreted } from '@vexorjs/core';

const UserSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  email: Type.String({ format: 'email' }),
  age: Type.Optional(Type.Number({ minimum: 0 })),
});

// Default path: JIT-compiles a specialized function via codegen.
// On runtimes that forbid runtime code generation (e.g. Cloudflare
// Workers), it automatically falls back to the interpreter.
const validate = compileValidator(UserSchema);

const result = validate(input);
if (result.issues) {
  // Same issues, messages, and paths on both code paths
  console.log(result.issues);
}

// The interpreter is exported separately so you can compare the
// two paths yourself (identical behavior, ~30x slower on valid input)
const validateInterpreted = compileInterpreted(UserSchema);`;

const benchmarkCode = `// HTTP throughput vs other frameworks (higher is better)
// Windows 11 laptop, Node 22, autocannon, 10s runs, 100 connections,
// averaged across 5 route scenarios: static, JSON, params, POST echo,
// and POST validated. Preliminary numbers -- treat relative positions
// as indicative, not absolute.

// Framework | Avg throughput | Avg p99 latency
// ----------|----------------|----------------
// Fastify   | 4,831 req/s    | 424 ms
// Hono      | 4,156 req/s    | 579 ms
// Vexor     | 3,480 req/s    | 694 ms
// Express   | 2,348 req/s    | 945 ms

// Validation: JIT compiler vs interpreter (typical 6-field API body)
// Path                               | Valid input | Invalid input
// -----------------------------------|-------------|---------------
// Interpreter (compileInterpreted)   | 260K ops/s  | 203K ops/s
// JIT (compileValidator, default)    | 7.79M ops/s | 861K ops/s
// Speedup                            | ~30x        | ~4.2x`;

const benchmarkRunCode = `# Run your own benchmarks
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
autocannon -c 100 -d 10 http://localhost:3001/api/users  # Vexor`;

const checklistCode = `// Production performance checklist for Vexor applications

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
};`;

export default function Performance() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="performance" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Performance Optimization
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Performance optimization for a web API is the practice of reducing the time between
          receiving an HTTP request and sending the response, while maximizing the number of
          concurrent requests the system can handle. In a Vexor application, performance is not
          a single number to optimize but a series of bottlenecks to identify and address
          systematically. The framework provides fast defaults, but the majority of response
          time in a real application is spent outside the framework: in database queries,
          serialization, network I/O, and business logic.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          To understand where time is spent, consider the lifecycle of a typical API request.
          The operating system accepts the TCP connection and passes it to Node.js. The HTTP
          parser decodes the request headers. Vexor's radix tree router matches the URL to a
          handler in microseconds. Global hooks execute (CORS, logging). The handler runs,
          typically querying a database. The database driver acquires a connection from the pool,
          sends the SQL over the network, waits for the database to execute it, and returns the
          result set. The handler transforms the data and calls
          <code className="prose-code">ctx.json()</code>, which serializes the JavaScript object
          to a JSON string. The response is compressed (if enabled) and sent back over the
          network. Of these steps, routing and hook execution take microseconds. Database queries
          take milliseconds to tens of milliseconds. Serialization can take anywhere from
          microseconds (small objects) to milliseconds (large arrays). The framework overhead is
          the smallest component; the database and serialization are the dominant costs.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          This guide covers the optimization techniques that provide the largest impact, ordered
          by their typical return on investment. Compiled serialization eliminates repeated type
          checking for known response shapes. Connection pooling removes the per-request cost of
          establishing database connections. Caching avoids redundant computation and database
          queries entirely. Compression reduces bandwidth at the cost of CPU time. Route
          optimization and monitoring round out the picture by ensuring you measure before and
          after each change.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The cardinal rule of performance work is to measure first. Do not optimize based on
          assumptions. Profile your actual application under realistic load, identify the
          bottleneck, apply a targeted fix, and measure again to confirm the improvement. The
          techniques in this guide are presented in order of typical impact, but your application's
          specific bottleneck may be different.
        </p>
      </div>

      <section>
        <h2 id="what-makes-vexor-fast" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          What Makes Vexor Fast by Default
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Before discussing optimization, it is worth understanding what Vexor does at the framework
          level to minimize overhead. Several design decisions contribute to Vexor's baseline
          performance advantage over frameworks like Express (see the honest comparison in the{' '}
          <a href="#benchmarks" className="text-primary-600 dark:text-primary-400 hover:underline">
            Benchmarks
          </a>{' '}
          section below).
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The router uses a radix tree (compressed trie) that is compiled once at startup when routes
          are registered. Static routes are additionally indexed in a hash map for O(1) lookup.
          Parametric routes are resolved by traversing the trie, which takes O(k) time where k is
          the number of path segments. In contrast, Express uses a linear scan through all registered
          routes, which degrades as the route count increases. For an application with 200 routes,
          this difference alone can account for a 20-30% throughput improvement.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Body parsing is lazy. Express parses the request body on every request (if
          <code className="prose-code">express.json()</code> is registered), even for GET requests
          that have no body. Vexor only parses the body when a handler calls
          <code className="prose-code">ctx.readJson()</code>. For applications where many routes
          do not need the request body (read-heavy APIs, health checks, static data endpoints),
          this eliminates unnecessary CPU work on every request.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Validation schemas are compiled to fast check functions at route registration time, not
          at request time. When you define a <code className="prose-code">body</code> schema on a
          route, Vexor JIT-compiles it into a specialized validation function once, then reuses
          that function for every incoming request. This amortizes the schema compilation cost
          over the lifetime of the application, rather than paying it on every request. The next
          section covers how the JIT compiler works in detail.
        </p>
      </section>

      <section>
        <h2 id="jit-validation" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          JIT-Compiled Validation
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's validator does not walk the schema tree at request time. Instead, each schema is
          compiled via code generation (<code className="prose-code">new Function</code>) into a
          specialized validator that reads like hand-written checks for exactly that shape: direct
          property access, inlined type checks, no dispatch, and no path bookkeeping on the happy
          path. On a typical 6-field API body on Node 22, the JIT path validates valid input at
          about 7.79M ops/s versus 260K ops/s for the tree-walking interpreter — roughly a 30&times;
          speedup. Invalid input, which has to construct issue objects, is about 4&times; faster.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Some runtimes forbid runtime code generation — Cloudflare Workers is the most common
          example. On those platforms <code className="prose-code">new Function</code> throws, and
          Vexor automatically falls back to the interpreter. The two paths are guaranteed to produce
          identical output (the same issues, messages, and paths), and that parity is enforced by a
          dedicated test suite. Your application code does not change either way; the fallback is
          transparent.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Both compilers are exported. <code className="prose-code">compileValidator</code> is the
          default (JIT where the runtime allows it, interpreter elsewhere), and{' '}
          <code className="prose-code">compileInterpreted</code> always uses the interpreter, which
          is mainly useful for benchmarking one against the other.
        </p>
        <CodeBlock code={jitValidationCode} filename="src/validation.ts" showLineNumbers />
        <InfoBlock variant="info">
          Route schemas get this behavior automatically — you only need
          <code className="prose-code">compileValidator</code> or
          <code className="prose-code">compileInterpreted</code> directly when validating data
          outside of route handling or when measuring the two paths.
        </InfoBlock>
      </section>

      <section>
        <h2 id="serialization" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Compiled Serialization
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          JSON serialization is one of the most underappreciated bottlenecks in API performance.
          The built-in <code className="prose-code">JSON.stringify</code> function is general-purpose:
          it inspects each property of an object at runtime, checks its type, handles special cases
          like <code className="prose-code">undefined</code>, <code className="prose-code">Date</code>,
          and circular references, and builds the output string incrementally. This runtime inspection
          is necessary for arbitrary objects, but for API responses where you know the shape of the
          data at development time, it is wasted work.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's <code className="prose-code">compileSerializer</code> takes a schema definition
          and generates a specialized serialization function that knows the exact structure of the
          output. Instead of inspecting each property, the compiled function accesses properties
          directly by name, skips type checking (the schema guarantees the types), and builds the
          JSON string using string concatenation rather than recursive object traversal. The result
          is typically 2-3x faster than <code className="prose-code">JSON.stringify</code> for
          objects with 5-20 fields, and the improvement scales with the size of the response.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The compiled serializer is especially effective for list endpoints that return arrays of
          objects. Serializing an array of 100 user objects means the runtime type-checking overhead
          of <code className="prose-code">JSON.stringify</code> is paid 100 times. A compiled
          serializer pays zero type-checking overhead per object, making the improvement multiplicative.
          For a paginated endpoint returning 50 items, this optimization alone can reduce serialization
          time from 2ms to 0.6ms, which adds up significantly at high request volumes.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The trade-off is that you must define a schema for each response shape. If the response
          shape varies dynamically (for example, based on user permissions or feature flags), a
          compiled serializer is not appropriate. Use compiled serialization for hot paths with
          known, stable response shapes, and fall back to
          <code className="prose-code">JSON.stringify</code> for dynamic responses.
        </p>
        <CodeBlock code={serializationCode} filename="src/routes/users.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Compiled serializers provide the biggest gains for routes that return large arrays
          of objects with a consistent shape, such as paginated list endpoints.
        </InfoBlock>
      </section>

      <section>
        <h2 id="database-pooling" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Database Connection Pooling
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every database query requires a connection. Creating a new TCP connection to the database
          involves a DNS lookup, a TCP handshake, TLS negotiation (if encrypted), and authentication.
          On a local network, this process takes 5-10ms. Over the internet (for example, to a managed
          database service), it can take 20-50ms. If your application creates a new connection for
          every request, this overhead is added to every single response time, and under concurrent
          load, the database server's connection limit can be exhausted rapidly.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Connection pooling solves this by maintaining a set of pre-established connections that are
          reused across requests. When a handler needs to query the database, it borrows a connection
          from the pool (which takes microseconds), executes the query, and returns the connection
          to the pool. The pool manages the lifecycle of connections: it creates new ones when demand
          exceeds the idle set, destroys connections that have been idle too long, validates connections
          before lending them out (to detect stale connections after a network interruption), and
          queues requests when all connections are in use.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Pool sizing is a critical configuration decision. The <code className="prose-code">min</code>
          setting controls how many idle connections are maintained. Setting this too low causes
          connection creation overhead during traffic spikes; setting it too high wastes database
          resources during quiet periods. The <code className="prose-code">max</code> setting caps
          the total number of connections. This must be calculated based on your database's
          <code className="prose-code">max_connections</code> setting divided by the number of
          application replicas. For example, if your database allows 100 connections and you run 5
          replicas, each replica should have a max pool size of 20. Exceeding this limit causes
          connection failures and cascading errors across all replicas.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Monitoring pool health is as important as configuring it. The health endpoint below
          exposes the number of total, idle, active, and waiting connections. If
          <code className="prose-code">waitingRequests</code> is consistently above zero, your
          pool is too small and requests are queuing for connections. If
          <code className="prose-code">idleConnections</code> is consistently at the max, your
          pool is oversized and wasting database resources.
        </p>
        <CodeBlock code={poolingCode} filename="src/db.ts" showLineNumbers />
        <InfoBlock variant="warning">
          Set <code className="prose-code">max</code> to no more than your database's
          <code className="prose-code">max_connections</code> divided by the number of
          application replicas. Over-provisioning connections can degrade database performance
          for all consumers.
        </InfoBlock>
      </section>

      <section>
        <h2 id="caching" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Caching Strategies
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Caching is the most powerful performance technique available because it eliminates work
          entirely rather than making it faster. A cached response avoids the database query, the
          business logic transformation, and the serialization step, reducing response time from
          milliseconds to microseconds. The challenge is determining what to cache, for how long,
          and how to invalidate stale data without serving incorrect results.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Caching operates in a hierarchy of layers, each with different characteristics. At the
          bottom is the database query cache, managed by the database itself for repeated identical
          queries. Above that is the application-level cache: an in-memory store within your Vexor
          process that holds computed results. Then there is the HTTP cache, controlled by
          <code className="prose-code">Cache-Control</code> headers that tell browsers and CDNs to
          reuse previous responses. At the top is the CDN cache, which serves responses from edge
          locations closest to the user. Each layer adds complexity but reduces load on the layers
          below it.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For most Vexor applications, the highest-impact caching strategy is the application-level
          in-memory cache. It sits between your handlers and the database, storing query results
          with a time-to-live (TTL). The key design decisions are: what to use as the cache key
          (typically a combination of route, query parameters, and user context), what TTL to set
          (balancing freshness against load reduction), and how to invalidate entries when the
          underlying data changes (typically by clearing entries with a matching prefix on write
          operations).
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          HTTP caching headers complement application caching by pushing work to the client and CDN.
          The <code className="prose-code">Cache-Control</code> header with
          <code className="prose-code">max-age</code> tells the browser to reuse the response for
          a specified duration without contacting the server at all. The
          <code className="prose-code">s-maxage</code> directive controls CDN caching independently
          from browser caching, allowing you to serve stale content to CDNs for longer than to
          individual browsers. The <code className="prose-code">ETag</code> header enables conditional
          requests: the client sends the ETag back on subsequent requests, and the server can respond
          with 304 Not Modified if the data has not changed, saving serialization and bandwidth.
        </p>
        <CodeBlock code={cachingCode} filename="src/routes/products.ts" showLineNumbers />
        <InfoBlock variant="info">
          Always invalidate cache entries when the underlying data changes. Stale caches
          are a common source of hard-to-debug production issues. Use prefix-based deletion
          to clear all related entries at once.
        </InfoBlock>
      </section>

      <section>
        <h2 id="compression" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Compression
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Response compression reduces the number of bytes transmitted over the network by encoding
          the response body with algorithms like Gzip or Brotli. For JSON API responses, compression
          typically achieves a 70-90% reduction in payload size because JSON is highly repetitive
          text (repeated property names, structural characters, common string patterns). A 500KB
          JSON response compresses to approximately 50-100KB with Gzip and 30-60KB with Brotli.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The trade-off with compression is CPU time versus bandwidth savings. Compressing a response
          adds CPU overhead on the server and decompression overhead on the client. For small
          responses (under 1KB), the compression overhead exceeds the bandwidth savings, which is
          why the <code className="prose-code">threshold</code> setting skips compression for small
          payloads. For large responses, the bandwidth savings far outweigh the CPU cost, especially
          for mobile clients on slow networks where reducing payload size directly reduces latency.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Brotli and Gzip offer different trade-offs. Brotli achieves 15-25% better compression ratios
          than Gzip but is slower to compress at high quality levels. For API responses, Brotli quality
          4 provides a good balance: significantly better compression than Gzip with comparable
          compression speed. Gzip at level 6 (the default) is the safe choice for maximum
          compatibility. Most modern clients support both, and the
          <code className="prose-code">Accept-Encoding</code> header negotiation selects the best
          mutual algorithm automatically.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          An important architectural consideration: if your Vexor application runs behind a reverse
          proxy (Nginx, Cloudflare, AWS ALB), the proxy can handle compression instead of your
          application. This is generally preferred because proxy-level compression is implemented in
          optimized native code (C/C++) rather than JavaScript, offloads CPU work from your Node.js
          event loop, and can be configured centrally for all backend services. Only enable
          application-level compression if your application serves traffic directly without a proxy.
        </p>
        <CodeBlock code={compressionCode} filename="src/app.ts" showLineNumbers />
        <InfoBlock variant="tip">
          If you run behind a reverse proxy like Nginx or Cloudflare, let the proxy handle
          compression instead. This offloads CPU work from your Node.js process. Only enable
          application-level compression if your app serves traffic directly.
        </InfoBlock>
      </section>

      <section>
        <h2 id="route-optimization" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Route Optimization
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          While Vexor's radix tree router is fast by default, understanding how it works allows you
          to structure your routes for optimal performance. The router compiles all registered routes
          into a tree at startup, where each node represents a path segment. Static segments
          (like <code className="prose-code">/users</code>) are matched exactly, parametric segments
          (like <code className="prose-code">/:id</code>) capture any value, and wildcard segments
          (like <code className="prose-code">/*</code>) match everything remaining.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The router resolves routes by traversing the tree from the root. At each level, it first
          checks for a static match (O(1) hash lookup), then a parametric match, and finally a
          wildcard match. This means static routes are always faster than parametric routes, and
          parametric routes are always faster than wildcards. When you have a specific route like
          <code className="prose-code">/users/me</code> that could be captured by a parametric
          route like <code className="prose-code">/users/:id</code>, registering it as a separate
          static route ensures it resolves in O(1) time rather than requiring parameter extraction.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Route groups are not just an organizational convenience; they affect the tree structure.
          When you create a group with a shared prefix like
          <code className="prose-code">/api/v1</code>, the prefix is stored once in the tree,
          and all routes within the group branch from that node. This reduces the depth of the
          tree and the number of comparisons needed to resolve a route. For applications with
          many routes under a common prefix, grouping can improve route resolution time measurably.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Lazy-loading route modules is a startup optimization rather than a per-request optimization.
          If your application has a large admin panel or rarely-used feature set, dynamically
          importing the route module on first request avoids loading its code during startup. This
          reduces cold-start time, which is particularly important in serverless environments where
          every cold start directly impacts user-facing latency. The first request to the lazy-loaded
          route pays the import cost, but subsequent requests hit the module cache.
        </p>
        <CodeBlock code={routeOptimizationCode} filename="src/app.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="monitoring" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Measuring and Profiling
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Performance optimization without measurement is guesswork. You need to know which routes
          are slow, what the latency distribution looks like (average, p50, p95, p99), and whether
          performance is degrading over time. The p99 latency is particularly important because it
          represents the experience of your worst-off 1% of users, and it is often 5-10x higher
          than the average due to garbage collection pauses, connection pool exhaustion, or database
          lock contention.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's hook system provides natural instrumentation points. The
          <code className="prose-code">onRequest</code> hook fires at the start of every request,
          making it the right place to record a start timestamp. The
          <code className="prose-code">onSend</code> hook fires just before the response is sent,
          allowing you to calculate the total processing duration. The
          <code className="prose-code">onError</code> hook tracks error rates. By storing these
          measurements per route, you build a profile of your application's performance that
          reveals which endpoints need optimization.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The in-process metrics approach shown below is suitable for development and small
          deployments. It stores the last 1000 latency measurements per route in memory and exposes
          percentile summaries through a <code className="prose-code">/metrics</code> endpoint.
          The limitation is that metrics are local to each process: in a clustered deployment, you
          need to aggregate across instances. This is where OpenTelemetry becomes essential.
        </p>
        <CodeBlock code={monitoringCode} filename="src/monitoring.ts" showLineNumbers />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          For production systems, OpenTelemetry provides the standard for distributed tracing and
          metrics collection. It captures not just request-level timing, but the full trace of a
          request as it flows through your application: the database query duration, the cache
          lookup, the serialization time. This granular visibility reveals exactly where time is
          spent, which is invaluable when the bottleneck is not in your code but in a slow
          database query or an external API call. OpenTelemetry exports to any observability
          platform (Datadog, Grafana, Honeycomb, New Relic) through its vendor-neutral protocol.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The integration pattern uses the same <code className="prose-code">onRequest</code>
          and <code className="prose-code">onSend</code> hooks to create spans and record
          metrics. Each request gets a trace span that captures the route, method, status code,
          and duration. The histogram metric enables your observability platform to compute
          percentiles, generate latency heatmaps, and alert when p99 latency exceeds a threshold.
        </p>
        <CodeBlock code={otelCode} filename="src/telemetry.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="benchmarks" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Benchmarks
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor publishes honest, reproducible benchmark numbers — including the comparisons it
          does not win. Where Vexor currently stands on the Node adapter: clearly faster than
          Express (~48% higher average throughput), but ~16% behind Hono and ~28% behind Fastify
          on raw throughput. On the schema-validated POST scenario the gap to Hono narrows to
          about 9% (2,628 vs 2,897 req/s), thanks to JIT-compiled validation. Closing the
          remaining adapter overhead is tracked, ongoing work — the published numbers get updated
          as it lands, not massaged.
        </p>
        <CodeBlock code={benchmarkCode} filename="benchmarks/results.txt" />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          A few methodology caveats to keep in mind when reading these numbers. Load is generated
          with autocannon; each framework runs in its own process, measured sequentially on the
          same machine, and all frameworks serve identical route sets. Vexor is currently measured
          from TypeScript source via tsx while the competitors run their published builds — a
          small handicap for Vexor. The numbers come from short runs on a single laptop, so treat
          the relative positions as indicative rather than absolute. CI runs a relative
          performance gate (Vexor must stay within a fixed ratio of Fastify) to catch regressions.
          The full, current tables and instructions to reproduce them yourself are in{' '}
          <a
            href="https://github.com/sitharaj88/vexorjs/blob/main/BENCHMARKS.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            BENCHMARKS.md
          </a>{' '}
          on GitHub.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The broader takeaway is unchanged: framework overhead matters most for I/O-light
          endpoints (health checks, cached responses, static data) and matters least for
          I/O-heavy endpoints (complex queries, external API calls). If your application is
          primarily I/O-heavy, optimizing the database queries and caching strategy will have a
          much larger impact than any framework-level optimization.
        </p>
        <InfoBlock variant="info">
          Benchmarks measure framework overhead only. Real-world performance depends heavily
          on your application logic, database queries, and network conditions. Always benchmark
          your actual application, not just "hello world" endpoints.
        </InfoBlock>
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          Run your own benchmarks with <code className="prose-code">autocannon</code>, a
          high-performance HTTP benchmarking tool written in Node.js. The
          <code className="prose-code">-c</code> flag sets the number of concurrent connections,
          <code className="prose-code">-d</code> sets the duration in seconds, and
          <code className="prose-code">-p</code> enables HTTP pipelining (sending multiple requests
          per connection without waiting for responses). Pipelining measures the framework's
          maximum throughput under ideal conditions, while non-pipelined benchmarks better
          approximate real-world client behavior.
        </p>
        <CodeBlock code={benchmarkRunCode} language="bash" />
      </section>

      <section>
        <h2 id="production-checklist" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Production Optimization Checklist
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          This checklist summarizes every performance and reliability concern covered in this guide
          and the deployment guide. Review it before each production deployment to ensure nothing
          is overlooked. Each item is explained below the code block.
        </p>
        <CodeBlock code={checklistCode} filename="checklist.ts" />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          The checklist is organized into categories that reflect the different layers of the stack.
          Each item addresses a specific performance or reliability concern.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 pr-4 text-slate-900 dark:text-white font-semibold">Item</th>
                <th className="py-3 text-slate-900 dark:text-white font-semibold">Why It Matters</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">NODE_ENV=production</td>
                <td className="py-3">Enables Vexor's internal optimizations, disables verbose error responses, and signals to third-party libraries (like template engines and loggers) to use production-optimized code paths. Missing this flag is the single most common production performance mistake.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Compiled TypeScript</td>
                <td className="py-3">Running TypeScript through ts-node or tsx in production adds per-file transpilation overhead on every module load. Pre-compiling to JavaScript eliminates this cost and reduces cold-start time by 40-60%.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Compiled serializers</td>
                <td className="py-3">For hot-path endpoints returning known response shapes, compiled serializers are 2-3x faster than JSON.stringify. Prioritize endpoints with the highest request volume and largest response payloads.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Connection pool sizing</td>
                <td className="py-3">Undersized pools cause request queuing under load. Oversized pools waste database resources and can trigger connection limits. Calculate max as database max_connections divided by replica count.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Database indexes</td>
                <td className="py-3">Missing indexes on frequently queried columns cause full table scans that degrade exponentially with data growth. Use EXPLAIN ANALYZE on slow queries to identify missing indexes.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">In-memory cache</td>
                <td className="py-3">Eliminates database round-trips for frequently accessed, slowly changing data. Even a 10-second TTL can reduce database load by 90% for high-traffic endpoints.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">HTTP Cache-Control</td>
                <td className="py-3">Tells browsers and CDNs to serve cached responses without contacting your server at all. This is the most effective performance optimization for read-heavy APIs because it eliminates the request entirely.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Compression</td>
                <td className="py-3">Reduces JSON payload sizes by 70-90%. Most impactful for mobile clients on slow networks. Prefer proxy-level compression when available to avoid JavaScript CPU overhead.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Latency tracking</td>
                <td className="py-3">Without per-route latency metrics, you cannot identify which endpoints are slow or detect performance regressions after deployments. Track p50, p95, and p99 latencies at minimum.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Cluster mode</td>
                <td className="py-3">Node.js runs on a single thread. Without clustering or multiple replicas, your application can only use one CPU core, leaving the rest idle even under heavy load.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Graceful shutdown</td>
                <td className="py-3">Ensures in-flight requests complete and database connections close cleanly during deployments. Without it, rolling updates cause dropped requests and connection pool leaks.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/api" className="btn-primary">
            API Reference <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/advanced/deployment" className="btn-secondary">
            Deployment Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
