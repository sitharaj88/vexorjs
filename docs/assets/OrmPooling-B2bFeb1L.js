import{j as e,C as t,I as s,L as a,A as o}from"./index-Bga0OgzL.js";const n=`import { createPool } from '@vexorjs/orm';
import { PostgresDriver } from '@vexorjs/orm/drivers/postgres';

// Create a connection pool
const pool = createPool(
  {
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    user: 'postgres',
    password: 'secret',
  },
  PostgresDriver,
  {
    min: 2,
    max: 10,
  }
);

// Initialize the pool (pre-creates min connections)
await pool.initialize();

// Run a query through the pool
const users = await pool.query('SELECT * FROM users WHERE active = $1', [true]);

// Execute a statement (INSERT, UPDATE, DELETE)
await pool.execute(
  'UPDATE users SET last_seen = $1 WHERE id = $2',
  [new Date(), userId]
);`,i=`import { createPool, type PoolOptions } from '@vexorjs/orm';
import { PostgresDriver } from '@vexorjs/orm/drivers/postgres';

const pool = createPool(
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production',
  },
  PostgresDriver,
  {
    // Minimum connections to keep alive
    min: 2,

    // Maximum concurrent connections
    max: 20,

    // Time (ms) to wait for a connection before throwing
    acquireTimeout: 30000,

    // Close idle connections after this duration (ms)
    idleTimeout: 60000,

    // How often to validate idle connections (ms)
    validateInterval: 30000,

    // Maximum lifetime of a connection (ms)
    maxAge: 1800000, // 30 minutes

    // Retry configuration
    maxRetries: 3,
    retryDelay: 1000,
  }
);`,r=`import { createPool } from '@vexorjs/orm';
import { PostgresDriver } from '@vexorjs/orm/drivers/postgres';

const pool = createPool(
  { /* connection config */ },
  PostgresDriver,
  {
    min: 2,
    max: 10,
    validateInterval: 15000,

    // Custom health check query
    healthCheck: async (connection) => {
      const result = await connection.query('SELECT 1 AS ok');
      return result.rows[0]?.ok === 1;
    },
  }
);

// Use in an HTTP health check endpoint
app.get('/health', async (ctx) => {
  const stats = pool.getStats();

  if (stats.total === 0) {
    return ctx.status(503).json({
      status: 'unhealthy',
      message: 'No database connections available',
    });
  }

  return ctx.json({
    status: 'healthy',
    pool: {
      total: stats.total,
      idle: stats.idle,
      busy: stats.busy,
      pending: stats.pending,
    },
  });
});`,c=`import type { PoolStats } from '@vexorjs/orm';

// Get current pool statistics
const stats: PoolStats = pool.getStats();

console.log({
  total: stats.total,           // Total connections in the pool
  idle: stats.idle,             // Connections waiting to be used
  busy: stats.busy,             // Connections currently in use
  pending: stats.pending,       // Requests waiting for a connection
  totalQueries: stats.totalQueries,     // Total queries executed
  failedQueries: stats.failedQueries,   // Number of failed queries
  avgQueryTime: stats.avgQueryTime,     // Average query duration (ms)
});

// Monitor pool usage over time
setInterval(() => {
  const s = pool.getStats();
  if (s.pending > 5) {
    console.warn(\`Pool pressure: \${s.pending} requests waiting, \${s.busy}/\${s.total} busy\`);
  }
  if (s.failedQueries > 0) {
    console.warn(\`Failed queries: \${s.failedQueries}, avg time: \${s.avgQueryTime.toFixed(2)}ms\`);
  }
}, 10000);`,l=`// Manual connection management
const connection = await pool.acquire();

try {
  // Run multiple queries on the same connection
  await connection.query('BEGIN');
  await connection.query(
    'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id',
    [userId, total]
  );
  await connection.query(
    'UPDATE inventory SET stock = stock - $1 WHERE product_id = $2',
    [quantity, productId]
  );
  await connection.query('COMMIT');
} catch (error) {
  await connection.query('ROLLBACK');
  throw error;
} finally {
  // Always release the connection back to the pool
  pool.release(connection);
}`,d=`// Graceful shutdown - waits for active queries to finish
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');

  // Stop accepting new requests
  server.close();

  // Drain the pool - waits for busy connections, then closes all
  await pool.shutdown();

  console.log('Pool drained. Exiting.');
  process.exit(0);
});

// Force shutdown after timeout
process.on('SIGTERM', async () => {
  const shutdownTimeout = setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);

  await pool.shutdown();
  clearTimeout(shutdownTimeout);
  process.exit(0);
});`;function m(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"connection-pooling",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"Connection Pooling"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"Every database query your application executes begins with a connection. Opening a new connection to a database server is one of the most expensive operations in backend development: it requires a TCP handshake, authentication negotiation, TLS setup in production, and the allocation of server-side memory for session state. A single connection setup can easily take 20 to 50 milliseconds, and under load, that cost multiplies across every concurrent request your server handles."}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"Connection pooling solves this problem by maintaining a cache of pre-established database connections that can be reused across requests. Rather than opening and closing a connection for each query, your application borrows a connection from the pool, executes its work, and returns the connection for the next caller. This pattern dramatically reduces latency, limits the total number of connections to the database server, and provides a natural throttling mechanism that prevents your application from overwhelming the database during traffic spikes."}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"The Vexor ORM includes a fully managed connection pool that handles connection lifecycle, health validation, automatic retries, and graceful shutdown. It is driver-agnostic, meaning the same pooling logic works whether you are connecting to PostgreSQL, MySQL, or SQLite. The pool is configured with a minimum and maximum number of connections, and it scales between those bounds based on demand."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:["Under the hood, the pool maintains two internal structures: a list of idle connections ready for immediate use, and a queue of pending acquisition requests. When your code calls ",e.jsx("code",{className:"prose-code",children:"pool.query()"}),", the pool first checks for an idle connection. If one is available, it is immediately handed to the caller. If all connections are busy and the pool has not yet reached its maximum size, a new connection is created on the fly. If the pool is at capacity, the request enters the pending queue and waits until a connection is released or the acquire timeout expires."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"how-it-works",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"How It Works"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The connection pool operates as a state machine with four phases: initialization, acquisition, release, and shutdown. During initialization, the pool creates the minimum number of connections specified by the ",e.jsx("code",{className:"prose-code",children:"min"})," option. These connections are validated and placed into the idle list, ensuring that the first queries your application executes do not incur connection setup overhead."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"When a query is submitted, the pool runs an acquire cycle. It pops a connection from the idle list, optionally validates it with a health check, and marks it as busy. If the connection fails validation, it is destroyed and a replacement is created. This ensures that stale connections caused by network interruptions, database restarts, or firewall timeouts never reach your application code."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["After the query completes, the connection enters the release cycle. The pool checks whether the connection has exceeded its maximum age (",e.jsx("code",{className:"prose-code",children:"maxAge"}),"). If it has, the connection is destroyed rather than returned to the idle list, and a fresh replacement may be created to maintain the minimum count. If the connection is still healthy, it is placed back into the idle list for reuse. This maximum age mechanism prevents issues like memory leaks in long-lived connections and ensures your application gradually rotates its connections over time."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:["A background reaper timer runs at the ",e.jsx("code",{className:"prose-code",children:"validateInterval"})," frequency to clean up idle connections. Any connection that has been idle longer than ",e.jsx("code",{className:"prose-code",children:"idleTimeout"})," is closed, allowing the pool to shrink back toward the minimum during periods of low traffic. This keeps resource consumption proportional to actual demand and frees up database server slots for other applications."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"when-to-use",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"When to Use Connection Pooling"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Connection pooling is appropriate for virtually every server-side application that communicates with a relational database. It is especially critical for HTTP servers where each incoming request may need one or more database queries. Without a pool, a burst of 100 concurrent requests would attempt to open 100 simultaneous connections, likely exceeding the database server's connection limit and causing cascading failures."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"For short-lived scripts, CLI tools, or serverless functions that execute a single query and exit, connection pooling adds unnecessary complexity. In these cases, a direct connection is simpler and sufficient. However, if your serverless function handles multiple queries per invocation or runs in a warm container that persists between invocations, a small pool can still provide meaningful latency improvements."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:["The key trade-off is between connection count and response latency. A larger pool allows more concurrent queries but consumes more memory on both the application and database servers. A smaller pool reduces resource usage but may cause requests to queue during traffic spikes. The recommended starting point is ",e.jsx("code",{className:"prose-code",children:"max = (CPU cores * 2) + 1"})," for the database host, and you should monitor the ",e.jsx("code",{className:"prose-code",children:"pending"})," statistic to determine if the pool needs to grow."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"basic-usage",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Basic Usage"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["To create a pool, pass your database connection configuration, a driver factory, and an options object to ",e.jsx("code",{className:"prose-code",children:"createPool()"}),". The driver factory tells the pool how to establish connections for your specific database engine. Vexor ships with drivers for PostgreSQL, MySQL, and SQLite, and you can implement the driver interface for any database that supports a wire protocol."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["After creating the pool, call ",e.jsx("code",{className:"prose-code",children:"pool.initialize()"})," at application startup to pre-create the minimum connections. This is an asynchronous operation because it actually opens real TCP connections to the database. Once initialization completes, use ",e.jsx("code",{className:"prose-code",children:"pool.query()"})," for read operations and ",e.jsx("code",{className:"prose-code",children:"pool.execute()"})," for write operations. Both methods transparently acquire a connection, run the query, and release the connection back to the pool."]}),e.jsx(t,{code:n,filename:"src/db.ts",showLineNumbers:!0}),e.jsxs(s,{variant:"tip",children:["Always call ",e.jsx("code",{className:"prose-code",children:"pool.initialize()"})," at application startup. This pre-creates the minimum number of connections so your first queries are fast."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"pool-configuration",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Pool Configuration"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Fine-tuning pool behavior is essential for matching your application's workload characteristics. The ",e.jsx("code",{className:"prose-code",children:"min"})," and ",e.jsx("code",{className:"prose-code",children:"max"})," options define the pool's elastic range. In development, a minimum of 1 or 2 connections is usually sufficient. In production, set the minimum high enough to absorb normal traffic without acquisition delays, and set the maximum to a value your database server can comfortably sustain across all application instances."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"idleTimeout"})," and ",e.jsx("code",{className:"prose-code",children:"maxAge"})," options serve different purposes and should not be confused. Idle timeout controls how long an unused connection sits in the pool before being closed. This helps the pool shrink during quiet periods. Maximum age, on the other hand, limits the total lifespan of a connection regardless of whether it is idle or actively used. This guards against resource leaks that accumulate over many hours of continuous use, such as growing prepared statement caches or server-side memory fragmentation."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"acquireTimeout"})," determines how long a caller will wait in the pending queue before receiving an error. Setting this too low causes spurious failures during brief traffic spikes. Setting it too high causes requests to hang indefinitely when the database is genuinely unavailable. A value between 10 and 30 seconds works well for most web applications, as it provides enough headroom for transient congestion without masking real outages."]}),e.jsx(t,{code:i,filename:"src/db.ts",showLineNumbers:!0}),e.jsxs(s,{variant:"warning",children:["Setting ",e.jsx("code",{className:"prose-code",children:"max"})," too high can overwhelm your database server. A good rule of thumb is ",e.jsx("code",{className:"prose-code",children:"max = (CPU cores * 2) + 1"})," for the database host."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"health-checks",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Health Checks"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Database connections can become stale without the pool's knowledge. Network partitions, firewall rules that close idle TCP connections after a timeout, database server restarts, and failover events in clustered deployments all result in connections that appear open from the application's perspective but will fail when used. Health checks protect your application by validating connections before they are handed to your code."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The pool supports two validation strategies. Passive validation runs at the ",e.jsx("code",{className:"prose-code",children:"validateInterval"})," frequency and checks every idle connection in the pool. Any connection that fails the check is destroyed and replaced. Active validation occurs at acquire time: before handing a connection to a caller, the pool optionally runs a quick health check query. Passive validation is always enabled; active validation is triggered by providing a ",e.jsx("code",{className:"prose-code",children:"healthCheck"})," function."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["A well-designed health check should be lightweight. The canonical approach is ",e.jsx("code",{className:"prose-code",children:"SELECT 1"}),", which validates that the connection can execute a query round-trip without touching any user tables. For more thorough validation, you can check specific permissions or verify that a particular schema exists. Avoid expensive health checks that query large tables or perform joins, as they run frequently and can add measurable overhead."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Exposing pool statistics through an HTTP health endpoint allows load balancers and orchestration systems like Kubernetes to route traffic away from instances with degraded database connectivity. The example below demonstrates both a custom health check function and an HTTP endpoint that reports pool state."}),e.jsx(t,{code:r,filename:"src/health.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"acquire-release",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Manual Acquire and Release"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The convenience methods ",e.jsx("code",{className:"prose-code",children:"pool.query()"})," and ",e.jsx("code",{className:"prose-code",children:"pool.execute()"})," handle connection acquisition and release automatically, which is ideal for single-statement operations. However, multi-statement transactions require that all statements execute on the same physical connection. If each statement acquired a different connection, the ",e.jsx("code",{className:"prose-code",children:"BEGIN"}),", ",e.jsx("code",{className:"prose-code",children:"INSERT"}),", and ",e.jsx("code",{className:"prose-code",children:"COMMIT"})," would run on different sessions and the transaction would have no effect."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["For these cases, use ",e.jsx("code",{className:"prose-code",children:"pool.acquire()"})," to obtain a dedicated connection and ",e.jsx("code",{className:"prose-code",children:"pool.release(connection)"})," to return it when you are finished. The most important rule is that every acquired connection must be released, regardless of whether the operation succeeds or fails. A connection that is never released is effectively a memory leak that permanently reduces the pool's capacity. Always wrap the acquire-use-release cycle in a try/finally block so that the release happens even if an exception is thrown."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"While a connection is acquired, it is marked as busy in the pool's internal tracking and will not be handed to any other caller. This guarantees isolation for your transaction. However, holding a connection for too long starves other callers. Keep transaction durations as short as possible by doing all non-database work (validation, computation, external API calls) before acquiring the connection, and releasing it immediately after the commit or rollback."}),e.jsx(t,{code:l,filename:"src/orders.ts",showLineNumbers:!0}),e.jsx(s,{variant:"warning",children:"Failing to release a connection will cause the pool to eventually exhaust all available connections. Always wrap manual acquire/release in a try/finally block."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"statistics",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Statistics and Monitoring"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Observability is critical for operating a connection pool in production. The pool exposes real-time statistics through ",e.jsx("code",{className:"prose-code",children:"pool.getStats()"})," that reveal both its current state and cumulative performance metrics. The ",e.jsx("code",{className:"prose-code",children:"total"}),", ",e.jsx("code",{className:"prose-code",children:"idle"}),", and ",e.jsx("code",{className:"prose-code",children:"busy"})," counts tell you how the pool is utilizing its capacity at any given moment, while ",e.jsx("code",{className:"prose-code",children:"pending"})," indicates how many callers are waiting in the acquisition queue."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"pending"})," metric deserves special attention. A consistently non-zero pending count means the pool is saturated and requests are waiting for connections. This is the clearest signal that you need to either increase the ",e.jsx("code",{className:"prose-code",children:"max"})," pool size, optimize your query durations, or scale out to additional application instances. Occasional brief spikes in pending are normal during traffic bursts, but a sustained value above zero indicates a bottleneck."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The cumulative metrics ",e.jsx("code",{className:"prose-code",children:"totalQueries"}),", ",e.jsx("code",{className:"prose-code",children:"failedQueries"}),", and ",e.jsx("code",{className:"prose-code",children:"avgQueryTime"})," help you track long-term trends. A rising failure rate may indicate database instability, while increasing average query time could point to missing indexes, table bloat, or lock contention. Feeding these statistics into a monitoring system like Prometheus, Datadog, or Grafana gives you dashboards and alerting for database layer health."]}),e.jsx(t,{code:c,filename:"src/monitoring.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"graceful-shutdown",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Graceful Shutdown"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"When your application receives a termination signal, it must close database connections cleanly to avoid leaving orphaned sessions on the database server. Abruptly killing the process can leave transactions in an ambiguous state, consume database connection slots until the server's own timeout triggers, and potentially cause data corruption if a write was in progress."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"pool.shutdown()"})," method implements a two-phase drain. First, it stops handing out connections to new callers, meaning any subsequent ",e.jsx("code",{className:"prose-code",children:"pool.query()"})," call will receive an error immediately rather than waiting. Second, it waits for all currently busy connections to be released, then closes every connection in the pool. This ensures that in-flight transactions have a chance to complete before the process exits."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"In production deployments, combine the graceful drain with a hard timeout. If busy connections are not released within a reasonable window (for example, 30 seconds), force the process to exit to prevent hangs during deployments. This dual strategy balances data safety with operational reliability."}),e.jsx(t,{code:d,filename:"src/server.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"best-practices",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Best Practices"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Start with conservative pool sizes and scale up based on metrics. A pool of 5 to 10 connections handles a surprising amount of traffic when queries are well-optimized. Only increase the maximum after confirming that the pending queue is regularly non-empty and that the database server has headroom for additional connections."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Always set ",e.jsx("code",{className:"prose-code",children:"maxAge"})," in production. Without it, connections can live indefinitely, accumulating server-side state and becoming increasingly fragile. A maximum age of 30 minutes is a reasonable default that balances connection reuse with freshness. For databases behind load balancers or connection proxies like PgBouncer, align the maximum age with the proxy's server-side timeout to avoid unexpected disconnections."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Never share a single pool across unrelated workloads with vastly different query profiles. If your application has both fast OLTP queries (under 10 milliseconds) and slow analytical queries (multiple seconds), the slow queries will monopolize connections and starve the fast path. Create separate pools with different size limits for each workload class."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:["Log pool statistics at regular intervals and alert on anomalies. A sudden drop in ",e.jsx("code",{className:"prose-code",children:"total"})," connections may indicate a network partition. A sustained rise in ",e.jsx("code",{className:"prose-code",children:"avgQueryTime"})," may indicate a database performance regression. These signals are often the earliest indicators of production incidents, surfacing well before user-facing errors appear."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"api-reference",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"API Reference"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Option"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Type"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Default"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"min"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"2"})}),e.jsxs("td",{className:"py-3 px-4",children:["The minimum number of connections the pool keeps open at all times. These connections are created during ",e.jsx("code",{className:"prose-code",children:"pool.initialize()"})," and are replenished automatically if they are destroyed by health checks or maximum age expiry. Set this to the number of connections your application needs during baseline (non-peak) traffic."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"max"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"10"})}),e.jsx("td",{className:"py-3 px-4",children:"The maximum number of connections the pool is allowed to open simultaneously. Once this limit is reached, additional acquisition requests enter the pending queue. This value should not exceed the database server's per-client connection limit divided by the number of application instances."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"acquireTimeout"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"30000"})}),e.jsxs("td",{className:"py-3 px-4",children:["The maximum time in milliseconds that a caller will wait in the pending queue for a connection to become available. If the timeout expires before a connection is acquired, the pool throws an ",e.jsx("code",{className:"prose-code",children:"AcquireTimeoutError"}),". Lower values fail fast; higher values tolerate more congestion."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"idleTimeout"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"60000"})}),e.jsxs("td",{className:"py-3 px-4",children:["The maximum time in milliseconds that a connection may remain idle in the pool before being closed. The background reaper checks idle connections at the ",e.jsx("code",{className:"prose-code",children:"validateInterval"})," frequency and destroys any that exceed this duration. Connections are only reaped down to the ",e.jsx("code",{className:"prose-code",children:"min"})," threshold."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"validateInterval"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"30000"})}),e.jsx("td",{className:"py-3 px-4",children:"The frequency in milliseconds at which the background reaper validates idle connections. During each cycle, idle connections are checked for staleness (idle timeout) and age (max age), and any that fail are destroyed. Lower values detect problems faster but add more overhead."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"maxAge"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"undefined"})}),e.jsx("td",{className:"py-3 px-4",children:"The maximum total lifespan of a connection in milliseconds, measured from the moment it was created. When a connection exceeds this age, it is destroyed upon release rather than returned to the idle list. Omitting this value allows connections to live indefinitely, which is acceptable in development but not recommended in production."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"healthCheck"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"(conn) => Promise<boolean>"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"undefined"})}),e.jsx("td",{className:"py-3 px-4",children:"A custom asynchronous function that receives a connection and returns a boolean indicating whether the connection is healthy. The pool calls this function during validation cycles and optionally during acquisition. If not provided, the pool relies on TCP-level liveness detection, which may not catch all failure modes."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"maxRetries"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"3"})}),e.jsxs("td",{className:"py-3 px-4",children:["The number of times the pool will retry creating a connection before giving up. Each retry uses the ",e.jsx("code",{className:"prose-code",children:"retryDelay"})," interval. This applies to initial connection creation during ",e.jsx("code",{className:"prose-code",children:"pool.initialize()"})," and to on-demand connection creation when the pool scales up."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"retryDelay"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"1000"})}),e.jsx("td",{className:"py-3 px-4",children:"The delay in milliseconds between consecutive retry attempts when a connection creation fails. A fixed delay is used rather than exponential backoff to keep connection recovery predictable. For environments with intermittent connectivity, consider increasing this value to avoid hammering the database server."})]})]})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(a,{to:"/orm/soft-deletes",className:"btn-primary",children:["Soft Deletes ",e.jsx(o,{className:"w-4 h-4 ml-2"})]}),e.jsx(a,{to:"/orm/queries",className:"btn-secondary",children:"Query Builder"})]})]})]})}export{m as default};
