import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { Vexor } from '@vexorjs/core';
import { healthCheck, databaseCheck, redisCheck } from '@vexorjs/core/middleware';

const app = new Vexor();

// Basic health check endpoint
app.addHook('onRequest', healthCheck({
  path: '/health',
  version: '1.2.0',
  checks: [
    databaseCheck({ connectionString: process.env.DATABASE_URL! }),
    redisCheck({ url: process.env.REDIS_URL! }),
  ],
}));

// GET /health returns:
// {
//   "status": "healthy",
//   "version": "1.2.0",
//   "uptime": 3600,
//   "timestamp": "2025-01-15T10:30:00.000Z",
//   "checks": {
//     "database": { "status": "healthy", "responseTime": 12 },
//     "redis": { "status": "healthy", "responseTime": 3 }
//   }
// }

app.listen(3000);`;

const builtInChecksCode = `import {
  healthCheck,
  databaseCheck,
  redisCheck,
  httpCheck,
  memoryCheck,
  diskCheck,
} from '@vexorjs/core/middleware';

app.addHook('onRequest', healthCheck({
  path: '/health',
  checks: [
    // Check database connectivity
    databaseCheck({
      connectionString: process.env.DATABASE_URL!,
      timeout: 5000,   // Fail if query takes > 5s
      query: 'SELECT 1',
    }),

    // Check Redis connectivity
    redisCheck({
      url: process.env.REDIS_URL!,
      timeout: 3000,
    }),

    // Check external HTTP dependency
    httpCheck({
      name: 'payment-api',
      url: 'https://api.payments.com/health',
      timeout: 5000,
      expectedStatus: 200,
    }),

    // Check memory usage
    memoryCheck({
      maxHeapUsedPercent: 90,  // Unhealthy if heap > 90%
      maxRssBytes: 512 * 1024 * 1024,  // 512MB RSS limit
    }),

    // Check disk space
    diskCheck({
      path: '/data',
      minFreePercent: 10,   // Unhealthy if disk < 10% free
      minFreeBytes: 1024 * 1024 * 1024,  // 1GB minimum
    }),
  ],
}));`;

const customChecksCode = `import { healthCheck, customCheck } from '@vexorjs/core/middleware';
import type { HealthStatus } from '@vexorjs/core/middleware';

// Create a custom health check
const queueCheck = customCheck({
  name: 'job-queue',
  check: async (): Promise<{ status: HealthStatus; details?: Record<string, unknown> }> => {
    const queueSize = await jobQueue.size();
    const oldestJob = await jobQueue.oldestPendingAge();

    if (queueSize > 10000) {
      return {
        status: 'unhealthy',
        details: { queueSize, message: 'Queue is backed up' },
      };
    }

    if (queueSize > 5000 || oldestJob > 300_000) {
      return {
        status: 'degraded',
        details: { queueSize, oldestJobAge: oldestJob },
      };
    }

    return {
      status: 'healthy',
      details: { queueSize, oldestJobAge: oldestJob },
    };
  },
});

// Check that a critical file exists
const configCheck = customCheck({
  name: 'config',
  check: async () => {
    try {
      await fs.access('/etc/app/config.json');
      return { status: 'healthy' };
    } catch {
      return {
        status: 'unhealthy',
        details: { message: 'Configuration file missing' },
      };
    }
  },
});

app.addHook('onRequest', healthCheck({
  path: '/health',
  checks: [queueCheck, configCheck],
  timeout: 10_000,       // Global timeout for all checks
  cacheTtl: 5_000,       // Cache results for 5 seconds
  includeDetails: true,  // Include check details in response
}));`;

const kubernetesProbesCode = `import { healthCheck, databaseCheck, redisCheck } from '@vexorjs/core/middleware';

// Kubernetes-style health probes
app.addHook('onRequest', healthCheck({
  // Full health check with all dependencies
  path: '/health',

  // Liveness: is the process alive and not deadlocked?
  // Should NOT check external dependencies
  livenessPath: '/health/live',

  // Readiness: is the app ready to serve traffic?
  // Should check all critical dependencies
  readinessPath: '/health/ready',

  version: process.env.APP_VERSION,
  checks: [
    databaseCheck({ connectionString: process.env.DATABASE_URL! }),
    redisCheck({ url: process.env.REDIS_URL! }),
  ],
}));

// GET /health/live  => 200 { "status": "healthy" }
//   Only checks if the process is responsive
//
// GET /health/ready => 200 { "status": "healthy", "checks": { ... } }
//   Checks all dependencies (database, redis, etc.)
//
// GET /health       => 200 { "status": "healthy", "version": "1.2.0", ... }
//   Full detailed health report

// Kubernetes deployment configuration:
// livenessProbe:
//   httpGet:
//     path: /health/live
//     port: 3000
//   initialDelaySeconds: 10
//   periodSeconds: 15
//
// readinessProbe:
//   httpGet:
//     path: /health/ready
//     port: 3000
//   initialDelaySeconds: 5
//   periodSeconds: 10`;

const responseFormatCode = `// Health check response format
// Status codes:
//   200 - healthy or degraded
//   503 - unhealthy

// Healthy response (200):
{
  "status": "healthy",
  "version": "1.2.0",
  "uptime": 86400,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 12
    },
    "redis": {
      "status": "healthy",
      "responseTime": 3
    },
    "memory": {
      "status": "healthy",
      "details": {
        "heapUsedPercent": 45,
        "rssBytes": 134217728
      }
    }
  }
}

// Degraded response (200):
{
  "status": "degraded",
  "version": "1.2.0",
  "uptime": 86400,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "checks": {
    "database": { "status": "healthy", "responseTime": 12 },
    "job-queue": {
      "status": "degraded",
      "details": { "queueSize": 7500, "message": "Queue building up" }
    }
  }
}

// Unhealthy response (503):
{
  "status": "unhealthy",
  "version": "1.2.0",
  "uptime": 86400,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "checks": {
    "database": {
      "status": "unhealthy",
      "error": "Connection refused"
    },
    "redis": { "status": "healthy", "responseTime": 3 }
  }
}`;

export default function Health() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="health-check" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Health Check
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Health check endpoints are the foundation of production observability. They give your load
          balancers, container orchestrators, monitoring systems, and operations team a standardized way
          to answer the most fundamental question about your service: "Is it working?" Without health
          checks, you are flying blind -- relying on user reports or error spikes to detect outages
          instead of catching them proactively.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's health check middleware goes beyond a simple "200 OK" ping. It aggregates the results
          of multiple individual checks -- database connectivity, Redis availability, external service
          dependencies, memory usage, disk space -- into a single structured response that tells you not
          just whether the service is up, but whether all of its dependencies are functioning correctly.
          The three-state model (<code className="prose-code">healthy</code>,{' '}
          <code className="prose-code">degraded</code>, <code className="prose-code">unhealthy</code>)
          lets you distinguish between "everything is perfect" and "the service is running but some
          non-critical dependency is struggling" -- a distinction that is critical for effective incident
          response.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The middleware also supports Kubernetes-style liveness and readiness probes out of the box.
          The liveness probe tells Kubernetes whether the process is alive and should not be restarted.
          The readiness probe tells Kubernetes whether the application is ready to receive traffic.
          By separating these concerns, you prevent cascading failures: if your database goes down,
          Kubernetes stops routing traffic to your pods (readiness) but does not restart them (liveness),
          giving the database time to recover without losing your warm application state.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The health check middleware registers an <code className="prose-code">onRequest</code> hook that
          intercepts requests to the configured health check paths (by default,{' '}
          <code className="prose-code">/health</code>, <code className="prose-code">/health/live</code>,
          and <code className="prose-code">/health/ready</code>). When a request matches one of these paths,
          the middleware runs the appropriate set of checks and returns the aggregated result as a JSON
          response. Requests to any other path pass through to your normal route handlers with zero overhead.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For the full health endpoint and the readiness probe, the middleware executes all configured
          checks concurrently using <code className="prose-code">Promise.allSettled</code>. Each check runs
          independently with its own timeout, so a slow database check does not block the Redis check from
          completing. If any individual check exceeds the global{' '}
          <code className="prose-code">timeout</code>, it is marked as unhealthy with a timeout error. The
          overall status is determined by the worst individual status: if all checks are healthy, the overall
          status is healthy; if any check is degraded, the overall status is degraded; if any check is
          unhealthy, the overall status is unhealthy and the endpoint returns HTTP 503.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The liveness probe, by contrast, does not run any dependency checks. It simply verifies that the
          Node.js event loop is responsive (the fact that it can respond at all proves the process is alive
          and not deadlocked). This is intentional: a liveness probe that checks external dependencies would
          cause Kubernetes to restart your pods when the database is down, which makes the situation worse
          rather than better.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">cacheTtl</code> option enables response caching for health check
          results. When set, the middleware caches the aggregated result and serves it from cache for
          subsequent requests within the TTL window. This is important for high-traffic environments where
          health checks are called frequently (e.g., every 5 seconds by a load balancer across 50 backend
          instances). Without caching, each health check request would trigger a database query, Redis ping,
          and HTTP request to external services, which can create significant load.
        </p>
      </section>

      {/* When to Use */}
      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Designing Effective Health Checks
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Include checks for all critical dependencies.</strong> If your application cannot function
          without a database, include a database check. If it depends on Redis for caching or session
          storage, include a Redis check. If it calls an external payment API, include an HTTP check for that
          service. The goal is that when the health endpoint reports "healthy," you have high confidence that
          the application can serve user requests end-to-end.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use "degraded" for non-critical issues.</strong> Not every failing check should make the
          overall status unhealthy. If a non-critical cache is down but the application can still serve
          requests (just more slowly), that is a degraded state. If a background job queue is growing large
          but the API is still responsive, that is degraded. Reserve "unhealthy" for situations where the
          application genuinely cannot serve user requests. This distinction prevents unnecessary alerting
          and helps your operations team prioritize their response.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Keep checks lightweight.</strong> Health check endpoints are called frequently -- by load
          balancers, Kubernetes probes, monitoring systems, and uptime checkers. Each check should complete
          in milliseconds, not seconds. Use simple connectivity tests (a lightweight SQL query like{' '}
          <code className="prose-code">SELECT 1</code>, a Redis PING, an HTTP HEAD request) rather than
          complex queries or operations. Expensive checks defeat the purpose by adding load to the very
          systems they are trying to monitor.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Separate liveness from readiness.</strong> In Kubernetes environments, always configure both
          probes with appropriate paths. The liveness probe should never check external dependencies -- it
          only needs to confirm the process is responsive. The readiness probe should check all dependencies
          that the application needs to serve traffic. This separation prevents cascading failures where a
          database outage causes Kubernetes to restart all your pods simultaneously.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">healthCheck</code> middleware registers health
          endpoints that aggregate the results of all configured checks. Pass an array of check functions
          and the middleware handles execution, timeout management, status aggregation, and response
          formatting. The response includes the overall status, application version, uptime in seconds,
          a timestamp, and the individual check results.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Each check function is an async operation that returns a status and optional details. The built-in
          checks (<code className="prose-code">databaseCheck</code>,{' '}
          <code className="prose-code">redisCheck</code>, etc.) handle the connection logic, timeout, and
          error handling internally. You just provide the connection parameters and thresholds, and the
          check produces a structured result.
        </p>
        <CodeBlock code={basicUsageCode} showLineNumbers />
        <InfoBlock variant="info" title="Status Aggregation">
          If all checks are healthy, the overall status is <code className="prose-code">healthy</code>.
          If any check is degraded, the overall status is <code className="prose-code">degraded</code>.
          If any check is unhealthy, the overall status is <code className="prose-code">unhealthy</code>{' '}
          and the endpoint returns HTTP 503. This "worst status wins" approach ensures that a single
          failing dependency surfaces clearly in the aggregate response.
        </InfoBlock>
      </section>

      {/* Built-in Checks */}
      <section>
        <h2 id="built-in-checks" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Built-in Checks
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor provides ready-made checks for the most common infrastructure dependencies. Each check
          is designed to be lightweight and fast, testing only connectivity and basic functionality rather
          than performing complex operations. The built-in checks handle connection management, timeout
          enforcement, and error translation internally, so you only need to provide configuration.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">databaseCheck</code> verifies database connectivity by executing
          a simple query (default: <code className="prose-code">SELECT 1</code>). The{' '}
          <code className="prose-code">redisCheck</code> sends a PING command and waits for a PONG response.
          The <code className="prose-code">httpCheck</code> makes an HTTP request to an external service and
          verifies the expected status code. The <code className="prose-code">memoryCheck</code> reads{' '}
          <code className="prose-code">process.memoryUsage()</code> and compares heap and RSS values against
          configured thresholds. The <code className="prose-code">diskCheck</code> queries available disk
          space on the specified path and compares it against minimum free space requirements.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Each check includes its own timeout, independent of the global timeout. This lets you set
          tighter timeouts for fast checks (Redis should respond within 1-2 seconds) and more generous
          timeouts for slower checks (a database query under load might take 3-5 seconds). If a check
          exceeds its timeout, it is automatically marked as unhealthy with a descriptive timeout error.
        </p>
        <CodeBlock code={builtInChecksCode} showLineNumbers />
      </section>

      {/* Custom Checks */}
      <section>
        <h2 id="custom-checks" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Custom Checks
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The built-in checks cover common infrastructure, but every application has unique health
          indicators. A message queue that is growing too large, a critical configuration file that must
          exist on disk, a machine learning model that must be loaded into memory, an external API with
          a degraded response time -- these are all valid health signals that the built-in checks cannot
          capture. The <code className="prose-code">customCheck</code> function lets you define your own
          health checks with arbitrary async logic.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A custom check function must return an object with a <code className="prose-code">status</code>{' '}
          field (<code className="prose-code">'healthy'</code>, <code className="prose-code">'degraded'</code>,
          or <code className="prose-code">'unhealthy'</code>) and an optional{' '}
          <code className="prose-code">details</code> object containing any additional information you want
          to include in the health check response. The details object can contain any serializable data
          -- queue sizes, response times, configuration values, version numbers, or diagnostic messages.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Design your custom checks with clear thresholds for each status level. A job queue check might
          report healthy when the queue is under 5000 items, degraded between 5000 and 10000 (the system
          is working but falling behind), and unhealthy above 10000 (the system is significantly backed up
          and needs intervention). Document these thresholds in your runbook so your operations team knows
          what each status means and how to respond.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">cacheTtl</code> option is especially important for custom checks
          that involve expensive operations. Setting a cache TTL of 5-10 seconds ensures that rapid-fire
          health check requests (from load balancers, monitoring, and Kubernetes probes) do not repeatedly
          trigger your custom logic. The cached result is shared across all health check paths (full, liveness,
          readiness).
        </p>
        <CodeBlock code={customChecksCode} showLineNumbers />
        <InfoBlock variant="tip" title="Caching">
          Use <code className="prose-code">cacheTtl</code> to avoid running expensive checks
          on every request. A 5-10 second cache is typically sufficient for monitoring while
          preventing check overhead from affecting performance. In high-traffic environments
          where health checks are called hundreds of times per minute, caching is essential.
        </InfoBlock>
      </section>

      {/* Kubernetes Probes */}
      <section>
        <h2 id="kubernetes-probes" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Kubernetes Probes
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Kubernetes uses two types of health probes to manage pod lifecycle:{' '}
          <strong>liveness probes</strong> and <strong>readiness probes</strong>. The liveness probe
          answers "is this process alive and not stuck?" -- if it fails, Kubernetes restarts the pod.
          The readiness probe answers "is this pod ready to accept traffic?" -- if it fails, Kubernetes
          removes the pod from the Service's endpoint list so no new requests are routed to it.
          Understanding the distinction is critical for building resilient services.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The Vexor health check middleware maps these concepts to separate endpoints. The{' '}
          <code className="prose-code">livenessPath</code> (default:{' '}
          <code className="prose-code">/health/live</code>) responds with a simple{' '}
          <code className="prose-code">{"{ \"status\": \"healthy\" }"}</code> as long as the Node.js event
          loop is responsive. It deliberately does not check external dependencies because a database outage
          should not cause pod restarts -- the pods are alive, they just cannot serve requests until the
          database recovers. Restarting pods in this situation creates a thundering herd problem where all
          pods restart simultaneously and try to reconnect to an already-overloaded database.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">readinessPath</code> (default:{' '}
          <code className="prose-code">/health/ready</code>) runs all configured dependency checks and
          returns the aggregated status. When any critical dependency is down, the readiness probe fails
          with a 503, Kubernetes removes the pod from the load balancer, and traffic is routed to healthy
          pods. When the dependency recovers, the readiness probe succeeds again and Kubernetes adds the
          pod back to the rotation. This process is automatic and transparent to clients.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Configure your Kubernetes deployment with appropriate timing parameters. The{' '}
          <code className="prose-code">initialDelaySeconds</code> should be long enough for your application
          to start up and establish its database connections. The{' '}
          <code className="prose-code">periodSeconds</code> for the readiness probe should be shorter than
          for the liveness probe, since you want to detect dependency recovery quickly. A common starting
          point is liveness every 15 seconds with a 10-second initial delay, and readiness every 10 seconds
          with a 5-second initial delay.
        </p>
        <CodeBlock code={kubernetesProbesCode} showLineNumbers />
        <InfoBlock variant="warning" title="Liveness Probe">
          Do not include external dependency checks in your liveness probe. If your database
          is down, Kubernetes should not restart your application -- the application is alive, it
          just cannot serve traffic. Use the readiness probe to stop routing traffic until
          dependencies recover. Misconfigured liveness probes are one of the most common causes
          of cascading failures in Kubernetes.
        </InfoBlock>
      </section>

      {/* Response Format */}
      <section>
        <h2 id="response-format" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Response Format
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Health check endpoints return a JSON response with a consistent structure that monitoring tools
          and dashboards can parse reliably. The top-level fields include the overall{' '}
          <code className="prose-code">status</code>, the application{' '}
          <code className="prose-code">version</code> (if configured), the process{' '}
          <code className="prose-code">uptime</code> in seconds, an ISO 8601{' '}
          <code className="prose-code">timestamp</code>, and a <code className="prose-code">checks</code>{' '}
          object with the individual check results.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The HTTP status code follows a simple rule: 200 for healthy or degraded, 503 (Service Unavailable)
          for unhealthy. Using 200 for degraded (rather than a 5xx code) is intentional -- a degraded
          service is still capable of serving requests, so load balancers should continue routing traffic
          to it. Only unhealthy responses get 503, which signals to load balancers and orchestrators that
          the instance should be taken out of rotation.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Each individual check result includes a <code className="prose-code">status</code> field and
          may include <code className="prose-code">responseTime</code> (in milliseconds, for connectivity
          checks), <code className="prose-code">details</code> (an object with check-specific data), or{' '}
          <code className="prose-code">error</code> (a string describing what went wrong). The{' '}
          <code className="prose-code">includeDetails</code> option (default: true) controls whether the
          details field is included. In production, you might disable details for the public health endpoint
          while keeping them for an internal monitoring endpoint, to avoid leaking infrastructure information.
        </p>
        <CodeBlock code={responseFormatCode} language="json" />
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Always include version information.</strong> Including the application version in the
          health response makes it trivial to verify that deployments completed successfully. After rolling
          out a new version, check the health endpoint to confirm the expected version is running. This is
          especially valuable in blue-green or canary deployments where multiple versions coexist.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Cache health check results.</strong> Set <code className="prose-code">cacheTtl</code> to
          at least 5 seconds in production. Health endpoints are called frequently by many different systems,
          and running all checks on every request can create significant overhead. A 5-10 second cache
          provides near-real-time monitoring without the cost of running checks on every single request.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Protect detailed health information.</strong> The health check response can reveal
          internal details about your infrastructure -- database hostnames, queue sizes, memory usage,
          disk space. Consider disabling <code className="prose-code">includeDetails</code> for
          publicly accessible health endpoints and only exposing full details on an internal or
          authenticated endpoint.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Set appropriate timeouts.</strong> The global timeout should be shorter than your load
          balancer's health check timeout. If your load balancer waits 10 seconds for a health response,
          set the global timeout to 8 seconds so the health endpoint returns an unhealthy result rather
          than timing out at the load balancer level, which typically triggers a more aggressive response
          (like removing the instance immediately).
        </p>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The health check module provides the main <code className="prose-code">healthCheck</code>{' '}
          middleware factory, a set of built-in check functions for common dependencies, and a{' '}
          <code className="prose-code">customCheck</code> function for application-specific health
          indicators.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          healthCheck(options)
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Creates a middleware that registers health check endpoints and aggregates the results of all
          configured checks. The middleware intercepts requests to the configured paths and returns a
          structured JSON response with the overall status and individual check results.
        </p>
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
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">checks</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">HealthCheck[]</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">[]</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">An array of check functions to execute. Each check is an async function that returns a status and optional details. Built-in checks (databaseCheck, redisCheck, etc.) and custom checks are both valid. All checks run concurrently when the health endpoint is called, and the overall status is determined by the worst individual result.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">path</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'/health'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The URL path for the full health check endpoint. This endpoint runs all checks and returns the complete health report including version, uptime, timestamp, and individual check results. Use this for monitoring dashboards and detailed health inspection.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">livenessPath</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'/health/live'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The URL path for the liveness probe endpoint. This endpoint does not run dependency checks -- it only verifies the process is responsive. Use this for Kubernetes livenessProbe configuration. A failure on this endpoint should trigger a pod restart.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">readinessPath</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'/health/ready'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The URL path for the readiness probe endpoint. This endpoint runs all dependency checks and returns 503 if any critical dependency is unhealthy. Use this for Kubernetes readinessProbe configuration. A failure on this endpoint should stop traffic routing to the pod without restarting it.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">version</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The application version string included in health check responses. Set this from your package.json version, a build-time environment variable, or a Git commit hash. Useful for verifying deployments and correlating health data with specific releases.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">timeout</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">10000</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The global timeout in milliseconds for all checks to complete. If the total check execution exceeds this timeout, any still-pending checks are marked as unhealthy with a timeout error. Set this shorter than your load balancer's health check timeout to ensure the health endpoint always returns a response rather than timing out at the infrastructure level.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">cacheTtl</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">0</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">How long in milliseconds to cache health check results. When set to a non-zero value, the middleware serves cached results for subsequent requests within the TTL window, avoiding the overhead of running all checks on every request. Set to 5000-10000 in production. When set to 0 (default), every request triggers a fresh execution of all checks.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">includeDetails</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">true</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Whether to include the details object in individual check results. When true, custom data from each check (queue sizes, response times, diagnostic info) is included in the response. Disable this for public-facing health endpoints to avoid leaking infrastructure details. Internal monitoring endpoints should keep it enabled.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Built-in Check Functions
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Each built-in check function creates a check object that tests a specific infrastructure dependency.
          All checks are designed to be lightweight and fast, testing only connectivity and basic health
          rather than performing complex operations.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Function</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">databaseCheck(options)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Verifies database connectivity by executing a lightweight query (default: SELECT 1). Reports the query execution time as responseTime in the result. Supports a configurable timeout and custom query string. Reports unhealthy if the connection fails or the query exceeds the timeout.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">redisCheck(options)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Verifies Redis connectivity by sending a PING command and waiting for a PONG response. Reports the round-trip time as responseTime. Supports a configurable timeout. Reports unhealthy if the connection fails, PING times out, or an unexpected response is received.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">httpCheck(options)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Verifies an external HTTP service is available by making a request to the specified URL and checking for the expected status code. Reports the request round-trip time as responseTime. Use this to monitor critical third-party APIs that your application depends on. Supports configurable timeout and expected status code.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">memoryCheck(options)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Reads process.memoryUsage() and compares heap usage percentage and RSS bytes against configured thresholds. Reports unhealthy if either threshold is exceeded. The details object includes current heapUsedPercent and rssBytes values. Use this to detect memory leaks and prevent out-of-memory crashes.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">diskCheck(options)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Queries available disk space on the specified filesystem path. Reports unhealthy if free space drops below the configured minFreePercent or minFreeBytes threshold. Use this for applications that write to disk (logs, uploads, temporary files) where running out of disk space would cause failures.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">customCheck(options)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a custom check with a user-defined async function. The function must return an object with a status field ('healthy', 'degraded', or 'unhealthy') and an optional details object. Use this for application-specific health indicators that the built-in checks do not cover, such as queue sizes, cache hit rates, or model loading status.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          HealthStatus
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The three-state health model enables nuanced monitoring and alerting. Each status maps to a
          specific HTTP status code and has different implications for operations and infrastructure
          management.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Value</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">HTTP Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">'healthy'</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">200</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">All checks are passing and the application is fully operational. All dependencies are reachable and within normal operating parameters. No action needed.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">'degraded'</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">200</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The service is functional but some non-critical components are underperforming. The application can still serve requests, possibly with reduced functionality or performance. Traffic continues to be routed normally. This status should trigger a warning alert but not a page.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">'unhealthy'</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">503</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">A critical dependency has failed and the application cannot operate correctly. The 503 status code signals to load balancers and Kubernetes readiness probes that the instance should be taken out of the traffic rotation. This status should trigger an urgent alert and immediate investigation.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next-steps" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/middleware/versioning" className="btn-primary">
            API Versioning Middleware <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/middleware" className="btn-secondary">
            Middleware Overview
          </Link>
        </div>
      </section>
    </div>
  );
}
