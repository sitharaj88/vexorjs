import{j as e,C as t,I as s,L as a,A as i}from"./index-Bga0OgzL.js";const r=`import { Vexor } from '@vexorjs/core';
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

app.listen(3000);`,n=`import {
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
}));`,c=`import { healthCheck, customCheck } from '@vexorjs/core/middleware';
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
}));`,l=`import { healthCheck, databaseCheck, redisCheck } from '@vexorjs/core/middleware';

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
//   periodSeconds: 10`,o=`// Health check response format
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
}`;function h(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"health-check",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"Health Check"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:'Health check endpoints are the foundation of production observability. They give your load balancers, container orchestrators, monitoring systems, and operations team a standardized way to answer the most fundamental question about your service: "Is it working?" Without health checks, you are flying blind -- relying on user reports or error spikes to detect outages instead of catching them proactively.'}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[`Vexor's health check middleware goes beyond a simple "200 OK" ping. It aggregates the results of multiple individual checks -- database connectivity, Redis availability, external service dependencies, memory usage, disk space -- into a single structured response that tells you not just whether the service is up, but whether all of its dependencies are functioning correctly. The three-state model (`,e.jsx("code",{className:"prose-code",children:"healthy"}),","," ",e.jsx("code",{className:"prose-code",children:"degraded"}),", ",e.jsx("code",{className:"prose-code",children:"unhealthy"}),') lets you distinguish between "everything is perfect" and "the service is running but some non-critical dependency is struggling" -- a distinction that is critical for effective incident response.']}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"The middleware also supports Kubernetes-style liveness and readiness probes out of the box. The liveness probe tells Kubernetes whether the process is alive and should not be restarted. The readiness probe tells Kubernetes whether the application is ready to receive traffic. By separating these concerns, you prevent cascading failures: if your database goes down, Kubernetes stops routing traffic to your pods (readiness) but does not restart them (liveness), giving the database time to recover without losing your warm application state."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"how-it-works",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"How It Works"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The health check middleware registers an ",e.jsx("code",{className:"prose-code",children:"onRequest"})," hook that intercepts requests to the configured health check paths (by default,"," ",e.jsx("code",{className:"prose-code",children:"/health"}),", ",e.jsx("code",{className:"prose-code",children:"/health/live"}),", and ",e.jsx("code",{className:"prose-code",children:"/health/ready"}),"). When a request matches one of these paths, the middleware runs the appropriate set of checks and returns the aggregated result as a JSON response. Requests to any other path pass through to your normal route handlers with zero overhead."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["For the full health endpoint and the readiness probe, the middleware executes all configured checks concurrently using ",e.jsx("code",{className:"prose-code",children:"Promise.allSettled"}),". Each check runs independently with its own timeout, so a slow database check does not block the Redis check from completing. If any individual check exceeds the global"," ",e.jsx("code",{className:"prose-code",children:"timeout"}),", it is marked as unhealthy with a timeout error. The overall status is determined by the worst individual status: if all checks are healthy, the overall status is healthy; if any check is degraded, the overall status is degraded; if any check is unhealthy, the overall status is unhealthy and the endpoint returns HTTP 503."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The liveness probe, by contrast, does not run any dependency checks. It simply verifies that the Node.js event loop is responsive (the fact that it can respond at all proves the process is alive and not deadlocked). This is intentional: a liveness probe that checks external dependencies would cause Kubernetes to restart your pods when the database is down, which makes the situation worse rather than better."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"cacheTtl"})," option enables response caching for health check results. When set, the middleware caches the aggregated result and serves it from cache for subsequent requests within the TTL window. This is important for high-traffic environments where health checks are called frequently (e.g., every 5 seconds by a load balancer across 50 backend instances). Without caching, each health check request would trigger a database query, Redis ping, and HTTP request to external services, which can create significant load."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"when-to-use",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Designing Effective Health Checks"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{children:"Include checks for all critical dependencies."}),' If your application cannot function without a database, include a database check. If it depends on Redis for caching or session storage, include a Redis check. If it calls an external payment API, include an HTTP check for that service. The goal is that when the health endpoint reports "healthy," you have high confidence that the application can serve user requests end-to-end.']}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{children:'Use "degraded" for non-critical issues.'}),' Not every failing check should make the overall status unhealthy. If a non-critical cache is down but the application can still serve requests (just more slowly), that is a degraded state. If a background job queue is growing large but the API is still responsive, that is degraded. Reserve "unhealthy" for situations where the application genuinely cannot serve user requests. This distinction prevents unnecessary alerting and helps your operations team prioritize their response.']}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{children:"Keep checks lightweight."})," Health check endpoints are called frequently -- by load balancers, Kubernetes probes, monitoring systems, and uptime checkers. Each check should complete in milliseconds, not seconds. Use simple connectivity tests (a lightweight SQL query like"," ",e.jsx("code",{className:"prose-code",children:"SELECT 1"}),", a Redis PING, an HTTP HEAD request) rather than complex queries or operations. Expensive checks defeat the purpose by adding load to the very systems they are trying to monitor."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{children:"Separate liveness from readiness."})," In Kubernetes environments, always configure both probes with appropriate paths. The liveness probe should never check external dependencies -- it only needs to confirm the process is responsive. The readiness probe should check all dependencies that the application needs to serve traffic. This separation prevents cascading failures where a database outage causes Kubernetes to restart all your pods simultaneously."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"basic-usage",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Basic Usage"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"healthCheck"})," middleware registers health endpoints that aggregate the results of all configured checks. Pass an array of check functions and the middleware handles execution, timeout management, status aggregation, and response formatting. The response includes the overall status, application version, uptime in seconds, a timestamp, and the individual check results."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Each check function is an async operation that returns a status and optional details. The built-in checks (",e.jsx("code",{className:"prose-code",children:"databaseCheck"}),","," ",e.jsx("code",{className:"prose-code",children:"redisCheck"}),", etc.) handle the connection logic, timeout, and error handling internally. You just provide the connection parameters and thresholds, and the check produces a structured result."]}),e.jsx(t,{code:r,showLineNumbers:!0}),e.jsxs(s,{variant:"info",title:"Status Aggregation",children:["If all checks are healthy, the overall status is ",e.jsx("code",{className:"prose-code",children:"healthy"}),". If any check is degraded, the overall status is ",e.jsx("code",{className:"prose-code",children:"degraded"}),". If any check is unhealthy, the overall status is ",e.jsx("code",{className:"prose-code",children:"unhealthy"})," ",'and the endpoint returns HTTP 503. This "worst status wins" approach ensures that a single failing dependency surfaces clearly in the aggregate response.']})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"built-in-checks",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Built-in Checks"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor provides ready-made checks for the most common infrastructure dependencies. Each check is designed to be lightweight and fast, testing only connectivity and basic functionality rather than performing complex operations. The built-in checks handle connection management, timeout enforcement, and error translation internally, so you only need to provide configuration."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"databaseCheck"})," verifies database connectivity by executing a simple query (default: ",e.jsx("code",{className:"prose-code",children:"SELECT 1"}),"). The"," ",e.jsx("code",{className:"prose-code",children:"redisCheck"})," sends a PING command and waits for a PONG response. The ",e.jsx("code",{className:"prose-code",children:"httpCheck"})," makes an HTTP request to an external service and verifies the expected status code. The ",e.jsx("code",{className:"prose-code",children:"memoryCheck"})," reads"," ",e.jsx("code",{className:"prose-code",children:"process.memoryUsage()"})," and compares heap and RSS values against configured thresholds. The ",e.jsx("code",{className:"prose-code",children:"diskCheck"})," queries available disk space on the specified path and compares it against minimum free space requirements."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Each check includes its own timeout, independent of the global timeout. This lets you set tighter timeouts for fast checks (Redis should respond within 1-2 seconds) and more generous timeouts for slower checks (a database query under load might take 3-5 seconds). If a check exceeds its timeout, it is automatically marked as unhealthy with a descriptive timeout error."}),e.jsx(t,{code:n,showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"custom-checks",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Custom Checks"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The built-in checks cover common infrastructure, but every application has unique health indicators. A message queue that is growing too large, a critical configuration file that must exist on disk, a machine learning model that must be loaded into memory, an external API with a degraded response time -- these are all valid health signals that the built-in checks cannot capture. The ",e.jsx("code",{className:"prose-code",children:"customCheck"})," function lets you define your own health checks with arbitrary async logic."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["A custom check function must return an object with a ",e.jsx("code",{className:"prose-code",children:"status"})," ","field (",e.jsx("code",{className:"prose-code",children:"'healthy'"}),", ",e.jsx("code",{className:"prose-code",children:"'degraded'"}),", or ",e.jsx("code",{className:"prose-code",children:"'unhealthy'"}),") and an optional"," ",e.jsx("code",{className:"prose-code",children:"details"})," object containing any additional information you want to include in the health check response. The details object can contain any serializable data -- queue sizes, response times, configuration values, version numbers, or diagnostic messages."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Design your custom checks with clear thresholds for each status level. A job queue check might report healthy when the queue is under 5000 items, degraded between 5000 and 10000 (the system is working but falling behind), and unhealthy above 10000 (the system is significantly backed up and needs intervention). Document these thresholds in your runbook so your operations team knows what each status means and how to respond."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"cacheTtl"})," option is especially important for custom checks that involve expensive operations. Setting a cache TTL of 5-10 seconds ensures that rapid-fire health check requests (from load balancers, monitoring, and Kubernetes probes) do not repeatedly trigger your custom logic. The cached result is shared across all health check paths (full, liveness, readiness)."]}),e.jsx(t,{code:c,showLineNumbers:!0}),e.jsxs(s,{variant:"tip",title:"Caching",children:["Use ",e.jsx("code",{className:"prose-code",children:"cacheTtl"})," to avoid running expensive checks on every request. A 5-10 second cache is typically sufficient for monitoring while preventing check overhead from affecting performance. In high-traffic environments where health checks are called hundreds of times per minute, caching is essential."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"kubernetes-probes",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Kubernetes Probes"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Kubernetes uses two types of health probes to manage pod lifecycle:"," ",e.jsx("strong",{children:"liveness probes"})," and ",e.jsx("strong",{children:"readiness probes"}),`. The liveness probe answers "is this process alive and not stuck?" -- if it fails, Kubernetes restarts the pod. The readiness probe answers "is this pod ready to accept traffic?" -- if it fails, Kubernetes removes the pod from the Service's endpoint list so no new requests are routed to it. Understanding the distinction is critical for building resilient services.`]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The Vexor health check middleware maps these concepts to separate endpoints. The"," ",e.jsx("code",{className:"prose-code",children:"livenessPath"})," (default:"," ",e.jsx("code",{className:"prose-code",children:"/health/live"}),") responds with a simple"," ",e.jsx("code",{className:"prose-code",children:'{ "status": "healthy" }'})," as long as the Node.js event loop is responsive. It deliberately does not check external dependencies because a database outage should not cause pod restarts -- the pods are alive, they just cannot serve requests until the database recovers. Restarting pods in this situation creates a thundering herd problem where all pods restart simultaneously and try to reconnect to an already-overloaded database."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"readinessPath"})," (default:"," ",e.jsx("code",{className:"prose-code",children:"/health/ready"}),") runs all configured dependency checks and returns the aggregated status. When any critical dependency is down, the readiness probe fails with a 503, Kubernetes removes the pod from the load balancer, and traffic is routed to healthy pods. When the dependency recovers, the readiness probe succeeds again and Kubernetes adds the pod back to the rotation. This process is automatic and transparent to clients."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Configure your Kubernetes deployment with appropriate timing parameters. The"," ",e.jsx("code",{className:"prose-code",children:"initialDelaySeconds"})," should be long enough for your application to start up and establish its database connections. The"," ",e.jsx("code",{className:"prose-code",children:"periodSeconds"})," for the readiness probe should be shorter than for the liveness probe, since you want to detect dependency recovery quickly. A common starting point is liveness every 15 seconds with a 10-second initial delay, and readiness every 10 seconds with a 5-second initial delay."]}),e.jsx(t,{code:l,showLineNumbers:!0}),e.jsx(s,{variant:"warning",title:"Liveness Probe",children:"Do not include external dependency checks in your liveness probe. If your database is down, Kubernetes should not restart your application -- the application is alive, it just cannot serve traffic. Use the readiness probe to stop routing traffic until dependencies recover. Misconfigured liveness probes are one of the most common causes of cascading failures in Kubernetes."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"response-format",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Response Format"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Health check endpoints return a JSON response with a consistent structure that monitoring tools and dashboards can parse reliably. The top-level fields include the overall"," ",e.jsx("code",{className:"prose-code",children:"status"}),", the application"," ",e.jsx("code",{className:"prose-code",children:"version"})," (if configured), the process"," ",e.jsx("code",{className:"prose-code",children:"uptime"})," in seconds, an ISO 8601"," ",e.jsx("code",{className:"prose-code",children:"timestamp"}),", and a ",e.jsx("code",{className:"prose-code",children:"checks"})," ","object with the individual check results."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The HTTP status code follows a simple rule: 200 for healthy or degraded, 503 (Service Unavailable) for unhealthy. Using 200 for degraded (rather than a 5xx code) is intentional -- a degraded service is still capable of serving requests, so load balancers should continue routing traffic to it. Only unhealthy responses get 503, which signals to load balancers and orchestrators that the instance should be taken out of rotation."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Each individual check result includes a ",e.jsx("code",{className:"prose-code",children:"status"})," field and may include ",e.jsx("code",{className:"prose-code",children:"responseTime"})," (in milliseconds, for connectivity checks), ",e.jsx("code",{className:"prose-code",children:"details"})," (an object with check-specific data), or"," ",e.jsx("code",{className:"prose-code",children:"error"})," (a string describing what went wrong). The"," ",e.jsx("code",{className:"prose-code",children:"includeDetails"})," option (default: true) controls whether the details field is included. In production, you might disable details for the public health endpoint while keeping them for an internal monitoring endpoint, to avoid leaking infrastructure information."]}),e.jsx(t,{code:o,language:"json"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"best-practices",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Best Practices"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{children:"Always include version information."})," Including the application version in the health response makes it trivial to verify that deployments completed successfully. After rolling out a new version, check the health endpoint to confirm the expected version is running. This is especially valuable in blue-green or canary deployments where multiple versions coexist."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{children:"Cache health check results."})," Set ",e.jsx("code",{className:"prose-code",children:"cacheTtl"})," to at least 5 seconds in production. Health endpoints are called frequently by many different systems, and running all checks on every request can create significant overhead. A 5-10 second cache provides near-real-time monitoring without the cost of running checks on every single request."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{children:"Protect detailed health information."})," The health check response can reveal internal details about your infrastructure -- database hostnames, queue sizes, memory usage, disk space. Consider disabling ",e.jsx("code",{className:"prose-code",children:"includeDetails"})," for publicly accessible health endpoints and only exposing full details on an internal or authenticated endpoint."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{children:"Set appropriate timeouts."})," The global timeout should be shorter than your load balancer's health check timeout. If your load balancer waits 10 seconds for a health response, set the global timeout to 8 seconds so the health endpoint returns an unhealthy result rather than timing out at the load balancer level, which typically triggers a more aggressive response (like removing the instance immediately)."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"api-reference",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"API Reference"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-6",children:["The health check module provides the main ",e.jsx("code",{className:"prose-code",children:"healthCheck"})," ","middleware factory, a set of built-in check functions for common dependencies, and a"," ",e.jsx("code",{className:"prose-code",children:"customCheck"})," function for application-specific health indicators."]}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3",children:"healthCheck(options)"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Creates a middleware that registers health check endpoints and aggregates the results of all configured checks. The middleware intercepts requests to the configured paths and returns a structured JSON response with the overall status and individual check results."}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Option"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Type"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Default"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"checks"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"HealthCheck[]"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"[]"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"An array of check functions to execute. Each check is an async function that returns a status and optional details. Built-in checks (databaseCheck, redisCheck, etc.) and custom checks are both valid. All checks run concurrently when the health endpoint is called, and the overall status is determined by the worst individual result."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"path"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"string"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"'/health'"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"The URL path for the full health check endpoint. This endpoint runs all checks and returns the complete health report including version, uptime, timestamp, and individual check results. Use this for monitoring dashboards and detailed health inspection."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"livenessPath"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"string"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"'/health/live'"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"The URL path for the liveness probe endpoint. This endpoint does not run dependency checks -- it only verifies the process is responsive. Use this for Kubernetes livenessProbe configuration. A failure on this endpoint should trigger a pod restart."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"readinessPath"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"string"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"'/health/ready'"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"The URL path for the readiness probe endpoint. This endpoint runs all dependency checks and returns 503 if any critical dependency is unhealthy. Use this for Kubernetes readinessProbe configuration. A failure on this endpoint should stop traffic routing to the pod without restarting it."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"version"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"string"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"-"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"The application version string included in health check responses. Set this from your package.json version, a build-time environment variable, or a Git commit hash. Useful for verifying deployments and correlating health data with specific releases."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"timeout"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"number"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"10000"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"The global timeout in milliseconds for all checks to complete. If the total check execution exceeds this timeout, any still-pending checks are marked as unhealthy with a timeout error. Set this shorter than your load balancer's health check timeout to ensure the health endpoint always returns a response rather than timing out at the infrastructure level."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"cacheTtl"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"number"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"0"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"How long in milliseconds to cache health check results. When set to a non-zero value, the middleware serves cached results for subsequent requests within the TTL window, avoiding the overhead of running all checks on every request. Set to 5000-10000 in production. When set to 0 (default), every request triggers a fresh execution of all checks."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"includeDetails"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"boolean"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"true"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Whether to include the details object in individual check results. When true, custom data from each check (queue sizes, response times, diagnostic info) is included in the response. Disable this for public-facing health endpoints to avoid leaking infrastructure details. Internal monitoring endpoints should keep it enabled."})]})]})]})}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3",children:"Built-in Check Functions"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Each built-in check function creates a check object that tests a specific infrastructure dependency. All checks are designed to be lightweight and fast, testing only connectivity and basic health rather than performing complex operations."}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Function"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"databaseCheck(options)"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Verifies database connectivity by executing a lightweight query (default: SELECT 1). Reports the query execution time as responseTime in the result. Supports a configurable timeout and custom query string. Reports unhealthy if the connection fails or the query exceeds the timeout."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"redisCheck(options)"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Verifies Redis connectivity by sending a PING command and waiting for a PONG response. Reports the round-trip time as responseTime. Supports a configurable timeout. Reports unhealthy if the connection fails, PING times out, or an unexpected response is received."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"httpCheck(options)"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Verifies an external HTTP service is available by making a request to the specified URL and checking for the expected status code. Reports the request round-trip time as responseTime. Use this to monitor critical third-party APIs that your application depends on. Supports configurable timeout and expected status code."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"memoryCheck(options)"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Reads process.memoryUsage() and compares heap usage percentage and RSS bytes against configured thresholds. Reports unhealthy if either threshold is exceeded. The details object includes current heapUsedPercent and rssBytes values. Use this to detect memory leaks and prevent out-of-memory crashes."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"diskCheck(options)"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Queries available disk space on the specified filesystem path. Reports unhealthy if free space drops below the configured minFreePercent or minFreeBytes threshold. Use this for applications that write to disk (logs, uploads, temporary files) where running out of disk space would cause failures."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"customCheck(options)"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Creates a custom check with a user-defined async function. The function must return an object with a status field ('healthy', 'degraded', or 'unhealthy') and an optional details object. Use this for application-specific health indicators that the built-in checks do not cover, such as queue sizes, cache hit rates, or model loading status."})]})]})]})}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3",children:"HealthStatus"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The three-state health model enables nuanced monitoring and alerting. Each status maps to a specific HTTP status code and has different implications for operations and infrastructure management."}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Value"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"HTTP Status"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"'healthy'"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"200"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"All checks are passing and the application is fully operational. All dependencies are reachable and within normal operating parameters. No action needed."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"'degraded'"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"200"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"The service is functional but some non-critical components are underperforming. The application can still serve requests, possibly with reduced functionality or performance. Traffic continues to be routed normally. This status should trigger a warning alert but not a page."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"'unhealthy'"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"503"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"A critical dependency has failed and the application cannot operate correctly. The 503 status code signals to load balancers and Kubernetes readiness probes that the instance should be taken out of the traffic rotation. This status should trigger an urgent alert and immediate investigation."})]})]})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next-steps",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(a,{to:"/middleware/versioning",className:"btn-primary",children:["API Versioning Middleware ",e.jsx(i,{className:"w-4 h-4 ml-2"})]}),e.jsx(a,{to:"/middleware",className:"btn-secondary",children:"Middleware Overview"})]})]})]})}export{h as default};
