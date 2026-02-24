import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { createPool } from '@vexorjs/orm';
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
);`;

const poolConfigCode = `import { createPool, type PoolOptions } from '@vexorjs/orm';
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
);`;

const healthCheckCode = `import { createPool } from '@vexorjs/orm';
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
});`;

const statsCode = `import type { PoolStats } from '@vexorjs/orm';

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
}, 10000);`;

const acquireReleaseCode = `// Manual connection management
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
}`;

const shutdownCode = `// Graceful shutdown - waits for active queries to finish
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
});`;

export default function OrmPooling() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="connection-pooling" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Connection Pooling
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Every database query your application executes begins with a connection. Opening a new connection to a database server is one of the most expensive operations in backend development: it requires a TCP handshake, authentication negotiation, TLS setup in production, and the allocation of server-side memory for session state. A single connection setup can easily take 20 to 50 milliseconds, and under load, that cost multiplies across every concurrent request your server handles.
        </p>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Connection pooling solves this problem by maintaining a cache of pre-established database connections that can be reused across requests. Rather than opening and closing a connection for each query, your application borrows a connection from the pool, executes its work, and returns the connection for the next caller. This pattern dramatically reduces latency, limits the total number of connections to the database server, and provides a natural throttling mechanism that prevents your application from overwhelming the database during traffic spikes.
        </p>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          The Vexor ORM includes a fully managed connection pool that handles connection lifecycle, health validation, automatic retries, and graceful shutdown. It is driver-agnostic, meaning the same pooling logic works whether you are connecting to PostgreSQL, MySQL, or SQLite. The pool is configured with a minimum and maximum number of connections, and it scales between those bounds based on demand.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Under the hood, the pool maintains two internal structures: a list of idle connections ready for immediate use, and a queue of pending acquisition requests. When your code calls <code className="prose-code">pool.query()</code>, the pool first checks for an idle connection. If one is available, it is immediately handed to the caller. If all connections are busy and the pool has not yet reached its maximum size, a new connection is created on the fly. If the pool is at capacity, the request enters the pending queue and waits until a connection is released or the acquire timeout expires.
        </p>
      </div>

      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The connection pool operates as a state machine with four phases: initialization, acquisition, release, and shutdown. During initialization, the pool creates the minimum number of connections specified by the <code className="prose-code">min</code> option. These connections are validated and placed into the idle list, ensuring that the first queries your application executes do not incur connection setup overhead.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When a query is submitted, the pool runs an acquire cycle. It pops a connection from the idle list, optionally validates it with a health check, and marks it as busy. If the connection fails validation, it is destroyed and a replacement is created. This ensures that stale connections caused by network interruptions, database restarts, or firewall timeouts never reach your application code.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          After the query completes, the connection enters the release cycle. The pool checks whether the connection has exceeded its maximum age (<code className="prose-code">maxAge</code>). If it has, the connection is destroyed rather than returned to the idle list, and a fresh replacement may be created to maintain the minimum count. If the connection is still healthy, it is placed back into the idle list for reuse. This maximum age mechanism prevents issues like memory leaks in long-lived connections and ensures your application gradually rotates its connections over time.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          A background reaper timer runs at the <code className="prose-code">validateInterval</code> frequency to clean up idle connections. Any connection that has been idle longer than <code className="prose-code">idleTimeout</code> is closed, allowing the pool to shrink back toward the minimum during periods of low traffic. This keeps resource consumption proportional to actual demand and frees up database server slots for other applications.
        </p>
      </section>

      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          When to Use Connection Pooling
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Connection pooling is appropriate for virtually every server-side application that communicates with a relational database. It is especially critical for HTTP servers where each incoming request may need one or more database queries. Without a pool, a burst of 100 concurrent requests would attempt to open 100 simultaneous connections, likely exceeding the database server's connection limit and causing cascading failures.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For short-lived scripts, CLI tools, or serverless functions that execute a single query and exit, connection pooling adds unnecessary complexity. In these cases, a direct connection is simpler and sufficient. However, if your serverless function handles multiple queries per invocation or runs in a warm container that persists between invocations, a small pool can still provide meaningful latency improvements.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The key trade-off is between connection count and response latency. A larger pool allows more concurrent queries but consumes more memory on both the application and database servers. A smaller pool reduces resource usage but may cause requests to queue during traffic spikes. The recommended starting point is <code className="prose-code">max = (CPU cores * 2) + 1</code> for the database host, and you should monitor the <code className="prose-code">pending</code> statistic to determine if the pool needs to grow.
        </p>
      </section>

      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          To create a pool, pass your database connection configuration, a driver factory, and an options object to <code className="prose-code">createPool()</code>. The driver factory tells the pool how to establish connections for your specific database engine. Vexor ships with drivers for PostgreSQL, MySQL, and SQLite, and you can implement the driver interface for any database that supports a wire protocol.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          After creating the pool, call <code className="prose-code">pool.initialize()</code> at application startup to pre-create the minimum connections. This is an asynchronous operation because it actually opens real TCP connections to the database. Once initialization completes, use <code className="prose-code">pool.query()</code> for read operations and <code className="prose-code">pool.execute()</code> for write operations. Both methods transparently acquire a connection, run the query, and release the connection back to the pool.
        </p>
        <CodeBlock code={basicUsageCode} filename="src/db.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Always call <code className="prose-code">pool.initialize()</code> at application startup.
          This pre-creates the minimum number of connections so your first queries are fast.
        </InfoBlock>
      </section>

      <section>
        <h2 id="pool-configuration" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Pool Configuration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Fine-tuning pool behavior is essential for matching your application's workload characteristics. The <code className="prose-code">min</code> and <code className="prose-code">max</code> options define the pool's elastic range. In development, a minimum of 1 or 2 connections is usually sufficient. In production, set the minimum high enough to absorb normal traffic without acquisition delays, and set the maximum to a value your database server can comfortably sustain across all application instances.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">idleTimeout</code> and <code className="prose-code">maxAge</code> options serve different purposes and should not be confused. Idle timeout controls how long an unused connection sits in the pool before being closed. This helps the pool shrink during quiet periods. Maximum age, on the other hand, limits the total lifespan of a connection regardless of whether it is idle or actively used. This guards against resource leaks that accumulate over many hours of continuous use, such as growing prepared statement caches or server-side memory fragmentation.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">acquireTimeout</code> determines how long a caller will wait in the pending queue before receiving an error. Setting this too low causes spurious failures during brief traffic spikes. Setting it too high causes requests to hang indefinitely when the database is genuinely unavailable. A value between 10 and 30 seconds works well for most web applications, as it provides enough headroom for transient congestion without masking real outages.
        </p>
        <CodeBlock code={poolConfigCode} filename="src/db.ts" showLineNumbers />
        <InfoBlock variant="warning">
          Setting <code className="prose-code">max</code> too high can overwhelm your database server.
          A good rule of thumb is <code className="prose-code">max = (CPU cores * 2) + 1</code> for
          the database host.
        </InfoBlock>
      </section>

      <section>
        <h2 id="health-checks" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Health Checks
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Database connections can become stale without the pool's knowledge. Network partitions, firewall rules that close idle TCP connections after a timeout, database server restarts, and failover events in clustered deployments all result in connections that appear open from the application's perspective but will fail when used. Health checks protect your application by validating connections before they are handed to your code.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The pool supports two validation strategies. Passive validation runs at the <code className="prose-code">validateInterval</code> frequency and checks every idle connection in the pool. Any connection that fails the check is destroyed and replaced. Active validation occurs at acquire time: before handing a connection to a caller, the pool optionally runs a quick health check query. Passive validation is always enabled; active validation is triggered by providing a <code className="prose-code">healthCheck</code> function.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A well-designed health check should be lightweight. The canonical approach is <code className="prose-code">SELECT 1</code>, which validates that the connection can execute a query round-trip without touching any user tables. For more thorough validation, you can check specific permissions or verify that a particular schema exists. Avoid expensive health checks that query large tables or perform joins, as they run frequently and can add measurable overhead.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Exposing pool statistics through an HTTP health endpoint allows load balancers and orchestration systems like Kubernetes to route traffic away from instances with degraded database connectivity. The example below demonstrates both a custom health check function and an HTTP endpoint that reports pool state.
        </p>
        <CodeBlock code={healthCheckCode} filename="src/health.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="acquire-release" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Manual Acquire and Release
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The convenience methods <code className="prose-code">pool.query()</code> and <code className="prose-code">pool.execute()</code> handle connection acquisition and release automatically, which is ideal for single-statement operations. However, multi-statement transactions require that all statements execute on the same physical connection. If each statement acquired a different connection, the <code className="prose-code">BEGIN</code>, <code className="prose-code">INSERT</code>, and <code className="prose-code">COMMIT</code> would run on different sessions and the transaction would have no effect.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For these cases, use <code className="prose-code">pool.acquire()</code> to obtain a dedicated connection and <code className="prose-code">pool.release(connection)</code> to return it when you are finished. The most important rule is that every acquired connection must be released, regardless of whether the operation succeeds or fails. A connection that is never released is effectively a memory leak that permanently reduces the pool's capacity. Always wrap the acquire-use-release cycle in a try/finally block so that the release happens even if an exception is thrown.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          While a connection is acquired, it is marked as busy in the pool's internal tracking and will not be handed to any other caller. This guarantees isolation for your transaction. However, holding a connection for too long starves other callers. Keep transaction durations as short as possible by doing all non-database work (validation, computation, external API calls) before acquiring the connection, and releasing it immediately after the commit or rollback.
        </p>
        <CodeBlock code={acquireReleaseCode} filename="src/orders.ts" showLineNumbers />
        <InfoBlock variant="warning">
          Failing to release a connection will cause the pool to eventually exhaust all available
          connections. Always wrap manual acquire/release in a try/finally block.
        </InfoBlock>
      </section>

      <section>
        <h2 id="statistics" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Statistics and Monitoring
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Observability is critical for operating a connection pool in production. The pool exposes real-time statistics through <code className="prose-code">pool.getStats()</code> that reveal both its current state and cumulative performance metrics. The <code className="prose-code">total</code>, <code className="prose-code">idle</code>, and <code className="prose-code">busy</code> counts tell you how the pool is utilizing its capacity at any given moment, while <code className="prose-code">pending</code> indicates how many callers are waiting in the acquisition queue.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">pending</code> metric deserves special attention. A consistently non-zero pending count means the pool is saturated and requests are waiting for connections. This is the clearest signal that you need to either increase the <code className="prose-code">max</code> pool size, optimize your query durations, or scale out to additional application instances. Occasional brief spikes in pending are normal during traffic bursts, but a sustained value above zero indicates a bottleneck.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The cumulative metrics <code className="prose-code">totalQueries</code>, <code className="prose-code">failedQueries</code>, and <code className="prose-code">avgQueryTime</code> help you track long-term trends. A rising failure rate may indicate database instability, while increasing average query time could point to missing indexes, table bloat, or lock contention. Feeding these statistics into a monitoring system like Prometheus, Datadog, or Grafana gives you dashboards and alerting for database layer health.
        </p>
        <CodeBlock code={statsCode} filename="src/monitoring.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="graceful-shutdown" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Graceful Shutdown
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When your application receives a termination signal, it must close database connections cleanly to avoid leaving orphaned sessions on the database server. Abruptly killing the process can leave transactions in an ambiguous state, consume database connection slots until the server's own timeout triggers, and potentially cause data corruption if a write was in progress.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">pool.shutdown()</code> method implements a two-phase drain. First, it stops handing out connections to new callers, meaning any subsequent <code className="prose-code">pool.query()</code> call will receive an error immediately rather than waiting. Second, it waits for all currently busy connections to be released, then closes every connection in the pool. This ensures that in-flight transactions have a chance to complete before the process exits.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In production deployments, combine the graceful drain with a hard timeout. If busy connections are not released within a reasonable window (for example, 30 seconds), force the process to exit to prevent hangs during deployments. This dual strategy balances data safety with operational reliability.
        </p>
        <CodeBlock code={shutdownCode} filename="src/server.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Start with conservative pool sizes and scale up based on metrics. A pool of 5 to 10 connections handles a surprising amount of traffic when queries are well-optimized. Only increase the maximum after confirming that the pending queue is regularly non-empty and that the database server has headroom for additional connections.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Always set <code className="prose-code">maxAge</code> in production. Without it, connections can live indefinitely, accumulating server-side state and becoming increasingly fragile. A maximum age of 30 minutes is a reasonable default that balances connection reuse with freshness. For databases behind load balancers or connection proxies like PgBouncer, align the maximum age with the proxy's server-side timeout to avoid unexpected disconnections.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Never share a single pool across unrelated workloads with vastly different query profiles. If your application has both fast OLTP queries (under 10 milliseconds) and slow analytical queries (multiple seconds), the slow queries will monopolize connections and starve the fast path. Create separate pools with different size limits for each workload class.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Log pool statistics at regular intervals and alert on anomalies. A sudden drop in <code className="prose-code">total</code> connections may indicate a network partition. A sustained rise in <code className="prose-code">avgQueryTime</code> may indicate a database performance regression. These signals are often the earliest indicators of production incidents, surfacing well before user-facing errors appear.
        </p>
      </section>

      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Option</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">min</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">2</code></td>
                <td className="py-3 px-4">The minimum number of connections the pool keeps open at all times. These connections are created during <code className="prose-code">pool.initialize()</code> and are replenished automatically if they are destroyed by health checks or maximum age expiry. Set this to the number of connections your application needs during baseline (non-peak) traffic.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">max</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">10</code></td>
                <td className="py-3 px-4">The maximum number of connections the pool is allowed to open simultaneously. Once this limit is reached, additional acquisition requests enter the pending queue. This value should not exceed the database server's per-client connection limit divided by the number of application instances.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">acquireTimeout</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">30000</code></td>
                <td className="py-3 px-4">The maximum time in milliseconds that a caller will wait in the pending queue for a connection to become available. If the timeout expires before a connection is acquired, the pool throws an <code className="prose-code">AcquireTimeoutError</code>. Lower values fail fast; higher values tolerate more congestion.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">idleTimeout</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">60000</code></td>
                <td className="py-3 px-4">The maximum time in milliseconds that a connection may remain idle in the pool before being closed. The background reaper checks idle connections at the <code className="prose-code">validateInterval</code> frequency and destroys any that exceed this duration. Connections are only reaped down to the <code className="prose-code">min</code> threshold.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">validateInterval</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">30000</code></td>
                <td className="py-3 px-4">The frequency in milliseconds at which the background reaper validates idle connections. During each cycle, idle connections are checked for staleness (idle timeout) and age (max age), and any that fail are destroyed. Lower values detect problems faster but add more overhead.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">maxAge</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">undefined</code></td>
                <td className="py-3 px-4">The maximum total lifespan of a connection in milliseconds, measured from the moment it was created. When a connection exceeds this age, it is destroyed upon release rather than returned to the idle list. Omitting this value allows connections to live indefinitely, which is acceptable in development but not recommended in production.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">healthCheck</code></td>
                <td className="py-3 px-4"><code className="prose-code">(conn) =&gt; Promise&lt;boolean&gt;</code></td>
                <td className="py-3 px-4"><code className="prose-code">undefined</code></td>
                <td className="py-3 px-4">A custom asynchronous function that receives a connection and returns a boolean indicating whether the connection is healthy. The pool calls this function during validation cycles and optionally during acquisition. If not provided, the pool relies on TCP-level liveness detection, which may not catch all failure modes.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">maxRetries</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">3</code></td>
                <td className="py-3 px-4">The number of times the pool will retry creating a connection before giving up. Each retry uses the <code className="prose-code">retryDelay</code> interval. This applies to initial connection creation during <code className="prose-code">pool.initialize()</code> and to on-demand connection creation when the pool scales up.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">retryDelay</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">1000</code></td>
                <td className="py-3 px-4">The delay in milliseconds between consecutive retry attempts when a connection creation fails. A fixed delay is used rather than exponential backoff to keep connection recovery predictable. For environments with intermittent connectivity, consider increasing this value to avoid hammering the database server.</td>
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
          <Link to="/orm/soft-deletes" className="btn-primary">
            Soft Deletes <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/orm/queries" className="btn-secondary">
            Query Builder
          </Link>
        </div>
      </section>
    </div>
  );
}
