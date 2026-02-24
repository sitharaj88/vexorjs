import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { Vexor } from '@vexorjs/core';
import { registry, createHttpMetrics } from '@vexorjs/core/metrics';

const app = new Vexor();

// Create standard HTTP request metrics
const httpMetrics = createHttpMetrics(registry);
app.use(httpMetrics.middleware());

// Expose Prometheus-compatible metrics endpoint
app.get('/metrics', async (ctx) => {
  const metrics = await registry.toPrometheus();
  return ctx.text(metrics, {
    headers: { 'Content-Type': 'text/plain; version=0.0.4' },
  });
});

app.listen(3000);`;

const countersCode = `import { registry } from '@vexorjs/core/metrics';
import type { Counter } from '@vexorjs/core/metrics';

// Create a counter (monotonically increasing value)
const requestsTotal: Counter = registry.counter({
  name: 'app_requests_total',
  help: 'Total number of requests processed',
  labels: ['method', 'path', 'status'],
});

// Increment by 1 (default)
requestsTotal.inc({ method: 'GET', path: '/users', status: '200' });

// Increment by a specific value
requestsTotal.inc({ method: 'POST', path: '/orders', status: '201' }, 1);

// Counter without labels
const errorsTotal = registry.counter({
  name: 'app_errors_total',
  help: 'Total number of unhandled errors',
});

errorsTotal.inc(); // no labels needed

// Use in error handler
app.addHook('onError', async (ctx, error) => {
  errorsTotal.inc();
  return ctx.status(500).json({ error: 'Internal server error' });
});`;

const gaugesCode = `import { registry } from '@vexorjs/core/metrics';
import type { Gauge } from '@vexorjs/core/metrics';

// Create a gauge (value that can go up and down)
const activeConnections: Gauge = registry.gauge({
  name: 'app_active_connections',
  help: 'Number of active WebSocket connections',
});

// Set to a specific value
activeConnections.set(42);

// Increment and decrement
activeConnections.inc();   // +1
activeConnections.dec();   // -1

// Gauge with labels
const queueSize = registry.gauge({
  name: 'app_queue_size',
  help: 'Current number of items in the queue',
  labels: ['queue_name'],
});

queueSize.set(150, { queue_name: 'emails' });
queueSize.set(23, { queue_name: 'notifications' });

// Track active connections lifecycle
app.addHook('onRequest', async (ctx) => {
  activeConnections.inc();
});

app.addHook('onResponse', async (ctx) => {
  activeConnections.dec();
});`;

const histogramsCode = `import { registry } from '@vexorjs/core/metrics';
import type { Histogram } from '@vexorjs/core/metrics';

// Create a histogram (distribution of values)
const requestDuration: Histogram = registry.histogram({
  name: 'app_request_duration_seconds',
  help: 'Request duration in seconds',
  labels: ['method', 'path'],
  // Custom bucket boundaries (in seconds)
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

// Observe a value
requestDuration.observe(0.123, { method: 'GET', path: '/users' });

// Use a timer helper
app.addHook('onRequest', async (ctx) => {
  ctx.set('requestStart', performance.now());
});

app.addHook('onResponse', async (ctx) => {
  const start = ctx.get('requestStart');
  const duration = (performance.now() - start) / 1000; // convert ms to seconds
  requestDuration.observe(duration, {
    method: ctx.req.method,
    path: ctx.routePath ?? ctx.req.url,
  });
});

// Database query duration
const queryDuration = registry.histogram({
  name: 'app_db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labels: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
});`;

const httpMetricsCode = `import { registry, createHttpMetrics, createProcessMetrics } from '@vexorjs/core/metrics';

// createHttpMetrics automatically tracks:
// - http_requests_total (counter): total requests by method, path, status
// - http_request_duration_seconds (histogram): request latency distribution
// - http_request_size_bytes (histogram): request body size distribution
// - http_response_size_bytes (histogram): response body size distribution
const httpMetrics = createHttpMetrics(registry, {
  // Customize path normalization to avoid high-cardinality labels
  normalizePath: (path: string) => {
    // Replace UUIDs and numeric IDs with placeholders
    return path
      .replace(/\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, '/:uuid')
      .replace(/\\/\\d+/g, '/:id');
  },
  // Exclude health check from metrics
  excludePaths: ['/health', '/metrics', '/ready'],
});

app.use(httpMetrics.middleware());

// createProcessMetrics automatically tracks Node.js runtime metrics:
// - process_cpu_seconds_total (counter)
// - process_resident_memory_bytes (gauge)
// - process_heap_bytes (gauge)
// - process_open_fds (gauge)
// - nodejs_active_handles_total (gauge)
// - nodejs_eventloop_lag_seconds (histogram)
const processMetrics = createProcessMetrics(registry);
processMetrics.start(); // begin collecting at 5-second intervals

// Stop collecting on shutdown
app.addHook('onClose', async () => {
  processMetrics.stop();
});`;

const prometheusEndpointCode = `import { Vexor } from '@vexorjs/core';
import { registry } from '@vexorjs/core/metrics';

const app = new Vexor();

// Serve metrics in Prometheus exposition format
app.get('/metrics', async (ctx) => {
  const output = await registry.toPrometheus();
  return ctx.text(output, {
    headers: { 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' },
  });
});

// Example output:
// # HELP http_requests_total Total number of HTTP requests
// # TYPE http_requests_total counter
// http_requests_total{method="GET",path="/users",status="200"} 1523
// http_requests_total{method="POST",path="/users",status="201"} 42
//
// # HELP http_request_duration_seconds HTTP request duration
// # TYPE http_request_duration_seconds histogram
// http_request_duration_seconds_bucket{method="GET",path="/users",le="0.01"} 890
// http_request_duration_seconds_bucket{method="GET",path="/users",le="0.05"} 1400
// http_request_duration_seconds_bucket{method="GET",path="/users",le="+Inf"} 1523
// http_request_duration_seconds_sum{method="GET",path="/users"} 45.23
// http_request_duration_seconds_count{method="GET",path="/users"} 1523

// Get all metrics as JSON (useful for custom dashboards)
app.get('/metrics/json', async (ctx) => {
  const all = registry.getAll();
  return ctx.json(all);
});

// Reset all metrics (useful for testing)
app.post('/metrics/reset', { preHandler: [adminOnly] }, async (ctx) => {
  registry.reset();
  return ctx.json({ success: true });
});`;

const customLabelsCode = `import { registry } from '@vexorjs/core/metrics';

// Business metrics with custom labels
const ordersTotal = registry.counter({
  name: 'app_orders_total',
  help: 'Total orders placed',
  labels: ['payment_method', 'currency', 'region'],
});

const orderValue = registry.histogram({
  name: 'app_order_value_dollars',
  help: 'Order value distribution in dollars',
  labels: ['payment_method', 'region'],
  buckets: [10, 25, 50, 100, 250, 500, 1000, 5000],
});

app.post('/orders', async (ctx) => {
  const order = await createOrder(ctx.body);

  // Record business metrics
  ordersTotal.inc({
    payment_method: order.paymentMethod,
    currency: order.currency,
    region: order.region,
  });

  orderValue.observe(order.totalUsd, {
    payment_method: order.paymentMethod,
    region: order.region,
  });

  return ctx.status(201).json(order);
});

// Cache hit/miss tracking
const cacheOps = registry.counter({
  name: 'app_cache_operations_total',
  help: 'Cache hit/miss operations',
  labels: ['operation', 'cache_name'],
});

async function cachedQuery<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const cached = await cache.get(key);
  if (cached) {
    cacheOps.inc({ operation: 'hit', cache_name: 'redis' });
    return cached as T;
  }
  cacheOps.inc({ operation: 'miss', cache_name: 'redis' });
  const result = await fn();
  await cache.set(key, result, 300);
  return result;
}`;

export default function Metrics() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="metrics" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Metrics
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Metrics are numerical measurements collected over time that describe the behavior and health
          of your application. Unlike logs, which capture individual events, metrics aggregate data
          into statistical summaries -- request rates, error percentages, latency distributions,
          memory usage -- that allow you to understand system behavior at a glance and detect
          anomalies before they become outages. Metrics are the foundation of alerting, dashboarding,
          and capacity planning.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's metrics module follows the Prometheus data model, which has become the de facto
          standard for application instrumentation in the cloud-native ecosystem. Metrics are
          collected in a <code className="prose-code">MetricsRegistry</code>, which manages named
          metric instances and serializes them into the Prometheus exposition format for scraping.
          This format is compatible with Prometheus, Grafana, Datadog, New Relic, and virtually
          every modern monitoring platform.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The module provides three fundamental metric types -- counters, gauges, and histograms --
          each designed for a different class of measurement. Choosing the right type for each
          measurement is critical: using a gauge where you should use a counter, or a counter where
          you should use a histogram, leads to misleading dashboards and incorrect alerts. This page
          explains each type's semantics, internal mechanics, and appropriate use cases, then shows
          how to wire everything together in a Vexor application.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Beyond infrastructure metrics, Vexor encourages instrumenting business-level events --
          orders placed, payments processed, cache hit rates -- using the same metric primitives.
          This gives operations teams and product teams a shared language for understanding
          application behavior.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How the Collection Pipeline Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's metric collection follows a pull-based model inspired by Prometheus. Your application
          instruments its code by creating metric instances (counters, gauges, histograms) and updating
          them as events occur. These updates are stored in memory in an efficient, lock-free data
          structure within the <code className="prose-code">MetricsRegistry</code>. No data is pushed
          anywhere at this stage -- the registry simply accumulates the latest values.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Periodically (typically every 15-30 seconds), a monitoring system like Prometheus sends an
          HTTP request to your application's <code className="prose-code">/metrics</code> endpoint.
          The registry serializes all registered metrics into the Prometheus exposition format -- a
          text-based protocol where each metric is represented as a name, a set of labels, and a
          value. The monitoring system ingests this data, stores it in a time-series database, and
          makes it available for querying, alerting, and visualization.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          This pull-based model has significant advantages over push-based alternatives. Your
          application does not need to know the address of the monitoring system. If the monitoring
          system goes down, your application continues running without any backlog or memory pressure.
          If your application restarts, the monitoring system simply observes a gap in the time series.
          Labels (key-value pairs attached to each metric) allow you to slice and dice data along
          dimensions like HTTP method, route path, status code, or any custom attribute without
          creating separate metrics for each combination.
        </p>
      </section>

      {/* Metric Types */}
      <section>
        <h2 id="metric-types" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Understanding Metric Types
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Choosing the correct metric type is essential for accurate monitoring. Each type has specific
          mathematical properties that determine how it can be aggregated and queried.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A <strong>counter</strong> is a cumulative metric that represents a single monotonically
          increasing value. It can only go up (or reset to zero when the process restarts). Counters
          are used to measure totals: total requests served, total errors encountered, total bytes
          transferred. The key insight is that the raw counter value is rarely useful on its own --
          what matters is the <em>rate of change</em>. A counter value of 10,000 tells you nothing,
          but "500 requests per second" tells you everything. Monitoring systems compute rates from
          counters automatically using functions like Prometheus's{' '}
          <code className="prose-code">rate()</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A <strong>gauge</strong> is a metric that represents a single numerical value that can
          arbitrarily go up and down. Gauges capture current state: the number of active connections
          right now, the current queue depth, the amount of free memory. Unlike counters, gauge values
          are meaningful at any point in time. Gauges are also used for values that are measured at a
          point in time rather than accumulated, like temperature or CPU utilization. Be cautious with
          gauge aggregation across instances -- summing active connections across 10 servers makes
          sense, but averaging CPU utilization requires understanding the sampling methodology.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A <strong>histogram</strong> tracks the distribution of observed values by counting how many
          observations fall into configurable buckets. For example, a request duration histogram with
          buckets at 10ms, 50ms, 100ms, 250ms, 500ms, and 1s tells you not just the average latency,
          but the full distribution: how many requests completed under 50ms, how many were between
          100ms and 250ms, and so on. Histograms also track the total sum and count of observations,
          enabling computation of averages. They are essential for SLO monitoring because they allow
          you to calculate percentiles (P50, P95, P99) without storing every individual observation.
        </p>
      </section>

      {/* The RED Method */}
      <section>
        <h2 id="red-method" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          The RED Method
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The RED (Rate, Errors, Duration) method is a widely adopted framework for instrumenting
          request-driven services. For every service, you should track three things: the
          <strong> Rate</strong> of requests (a counter tracking total requests, from which you derive
          requests per second), the <strong>Errors</strong> (a counter tracking failed requests, from
          which you derive error rate as a percentage of total requests), and the{' '}
          <strong>Duration</strong> (a histogram tracking how long requests take, from which you
          derive latency percentiles).
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's <code className="prose-code">createHttpMetrics</code> function implements the RED
          method out of the box. It automatically creates the counters and histograms needed to track
          request rate, error rate, and latency distribution for every HTTP endpoint. By adding this
          single middleware call, you get production-grade observability without writing any custom
          instrumentation code.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The RED method is complemented by the USE method (Utilization, Saturation, Errors) for
          infrastructure resources like CPU, memory, and disk. Vexor's{' '}
          <code className="prose-code">createProcessMetrics</code> covers the USE method for Node.js
          process metrics, tracking CPU time, memory usage, event loop lag, and open file descriptors.
          Together, RED and USE give you a comprehensive view of both your application's service-level
          behavior and the underlying resource consumption.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">registry</code> is the default{' '}
          <code className="prose-code">MetricsRegistry</code> instance that serves as the central
          collection point for all metrics. You create metric instances by calling methods on the
          registry (<code className="prose-code">counter</code>, <code className="prose-code">gauge</code>,{' '}
          <code className="prose-code">histogram</code>), update them in your application code, and
          expose them via an HTTP endpoint for Prometheus to scrape.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">createHttpMetrics</code> helper creates a pre-configured
          set of HTTP metrics and returns a middleware function that automatically records request
          rate, duration, and body sizes for every request. This is the fastest path to production-grade
          instrumentation -- a single function call gives you the core RED metrics.
        </p>
        <CodeBlock code={basicUsageCode} filename="src/app.ts" />
      </section>

      {/* Counters */}
      <section>
        <h2 id="counters" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Counters
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Counters are the simplest and most common metric type. Internally, a counter is just a
          64-bit floating-point number that starts at zero and only increases. The{' '}
          <code className="prose-code">inc()</code> method adds to the current value; there is no
          decrement or set method. When the process restarts, the counter resets to zero, but
          Prometheus handles this gracefully by detecting counter resets and adjusting rate
          calculations accordingly.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Labels allow you to create multi-dimensional counters. A single{' '}
          <code className="prose-code">app_requests_total</code> counter with labels for method,
          path, and status code can answer questions like "how many GET requests returned 200 on
          the /users endpoint?" without creating separate counters for each combination. However,
          be mindful of label cardinality: every unique combination of label values creates a
          separate time series in your monitoring system. High-cardinality labels (like user IDs
          or full URL paths with unique parameters) can cause excessive memory usage and slow
          query performance.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use counters for any measurement that accumulates over time: total requests, total errors,
          total bytes sent, total orders placed, total emails sent. If you ever need a value to
          decrease, you need a gauge instead. A common mistake is using a gauge to track "total
          requests" -- this breaks rate calculations because Prometheus cannot distinguish between
          a gauge decrease and a counter reset.
        </p>
        <CodeBlock code={countersCode} filename="src/metrics.ts" />
        <InfoBlock variant="info">
          Counters can only increase. To track values that go up and down (like active
          connections or queue sizes), use a gauge instead.
        </InfoBlock>
      </section>

      {/* Gauges */}
      <section>
        <h2 id="gauges" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Gauges
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A gauge represents a snapshot of a current value. Unlike counters, gauges have no monotonicity
          constraint -- they can be set to any value, incremented, or decremented. This makes them the
          right choice for measurements that reflect current state rather than cumulative totals:
          the number of active WebSocket connections, the current size of a work queue, the amount
          of available disk space, or the temperature of a sensor.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Gauges support three operations: <code className="prose-code">set(value)</code> to replace
          the current value entirely, <code className="prose-code">inc()</code> to add 1 (or a
          specified amount), and <code className="prose-code">dec()</code> to subtract 1 (or a
          specified amount). The increment/decrement pattern is particularly useful for tracking
          concurrent operations: increment when an operation starts, decrement when it ends. If
          your application ever exits without decrementing (for example, due to a crash), the gauge
          will show an inflated value until the next scrape after restart.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When aggregating gauges across multiple instances, think carefully about the aggregation
          function. Summing active connections across instances gives you the total active connections
          for the service. But averaging CPU utilization across instances may be misleading if
          instances have different capacities. Always document the intended aggregation semantics
          in the metric's <code className="prose-code">help</code> description.
        </p>
        <CodeBlock code={gaugesCode} filename="src/metrics.ts" />
      </section>

      {/* Histograms */}
      <section>
        <h2 id="histograms" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Histograms
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Histograms are the most powerful and nuanced metric type. They capture the distribution
          of observed values by maintaining a set of cumulative counters, one for each configured
          bucket boundary. When you call <code className="prose-code">observe(0.15)</code> on a
          histogram with buckets at 0.1, 0.25, 0.5, and 1.0, the counters for the 0.25, 0.5, 1.0,
          and +Infinity buckets are all incremented (because 0.15 is less than or equal to all of
          them). The histogram also maintains a running sum and count of all observed values.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          This cumulative bucket structure enables Prometheus to calculate approximate percentiles
          using the <code className="prose-code">histogram_quantile()</code> function. For example,
          if your P99 latency is 250ms, that means 99% of requests completed in 250ms or less.
          Percentiles are far more useful than averages for understanding user experience -- an
          average latency of 50ms might hide the fact that 1% of users are waiting 5 seconds.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The choice of bucket boundaries directly affects the accuracy of percentile calculations.
          Percentiles are interpolated within buckets, so placing bucket boundaries near your SLO
          thresholds gives the most accurate results at the values that matter most. For an API with
          a 200ms P99 SLO, use dense bucket boundaries between 100ms and 300ms and sparser boundaries
          elsewhere. Vexor provides sensible default buckets, but you should customize them based on
          your application's latency profile and SLO requirements.
        </p>
        <CodeBlock code={histogramsCode} filename="src/metrics.ts" />
        <InfoBlock variant="tip">
          Choose bucket boundaries based on your SLOs. For an API with a 100ms P99 target, use
          fine-grained buckets below 100ms and coarser ones above.
        </InfoBlock>
      </section>

      {/* HTTP Metrics */}
      <section>
        <h2 id="http-metrics" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Built-in HTTP and Process Metrics
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">createHttpMetrics</code> helper generates four metrics that
          cover the RED method and request/response sizing: a counter for total requests (segmented by
          method, normalized path, and status code), a histogram for request duration, a histogram
          for request body size, and a histogram for response body size. These four metrics give you
          comprehensive visibility into your API's traffic patterns, error rates, and latency
          distribution.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">normalizePath</code> option is critical for preventing
          label cardinality explosions. Without normalization, every unique URL (including those with
          UUIDs, numeric IDs, or query parameters in the path) creates a separate time series. On a
          busy API, this can generate thousands of unique time series per endpoint, consuming
          significant memory in both your application and your monitoring system. The normalizer
          replaces dynamic path segments with placeholders like <code className="prose-code">/:id</code>{' '}
          or <code className="prose-code">/:uuid</code>, collapsing all variations of a route into
          a single time series.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">createProcessMetrics</code> helper tracks Node.js runtime
          metrics at 5-second intervals: CPU time consumed, resident and heap memory, open file
          descriptors, active handles, and event loop lag. Event loop lag is a particularly valuable
          metric for Node.js applications because it indicates whether the event loop is being blocked
          by synchronous operations -- a common cause of latency spikes.
        </p>
        <CodeBlock code={httpMetricsCode} filename="src/app.ts" />
        <InfoBlock variant="warning">
          Avoid high-cardinality labels (like full URL paths with unique IDs). Use the{' '}
          <code className="prose-code">normalizePath</code> option to replace dynamic segments
          with placeholders. High cardinality causes excessive memory usage and slow scrapes.
        </InfoBlock>
      </section>

      {/* Prometheus Endpoint */}
      <section>
        <h2 id="prometheus-endpoint" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Prometheus Endpoint
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">/metrics</code> endpoint is the bridge between your
          application and the monitoring system. When Prometheus (or any compatible scraper) sends a
          GET request to this endpoint, the registry serializes all registered metrics into the
          Prometheus exposition format -- a human-readable text format where each time series is
          represented as a single line with the metric name, labels, and value.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The format includes <code className="prose-code"># HELP</code> lines that describe what each
          metric measures and <code className="prose-code"># TYPE</code> lines that declare the metric
          type. Histogram metrics are expanded into multiple lines: one for each bucket (suffixed with{' '}
          <code className="prose-code">_bucket</code>), one for the sum (suffixed with{' '}
          <code className="prose-code">_sum</code>), and one for the count (suffixed with{' '}
          <code className="prose-code">_count</code>). The JSON endpoint is a Vexor convenience for
          building custom dashboards or integrating with non-Prometheus monitoring tools.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In production, the metrics endpoint should be accessible to your monitoring infrastructure
          but not to the public internet. Common patterns include running the metrics server on a
          separate port, restricting access via network policies, or protecting the endpoint with
          basic authentication. The <code className="prose-code">excludePaths</code> option on{' '}
          <code className="prose-code">createHttpMetrics</code> should exclude the metrics endpoint
          itself to prevent recursive metric generation.
        </p>
        <CodeBlock code={prometheusEndpointCode} filename="src/routes/metrics.ts" />
      </section>

      {/* Custom Labels */}
      <section>
        <h2 id="custom-labels" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Business Metrics with Custom Labels
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Infrastructure metrics tell you whether your system is healthy; business metrics tell you
          whether your system is useful. Tracking orders placed, revenue generated, payment methods
          used, cache hit rates, and feature adoption gives product and business teams the same
          real-time visibility that operations teams get from infrastructure metrics.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Custom labels let you slice business metrics along meaningful dimensions. An{' '}
          <code className="prose-code">app_orders_total</code> counter with labels for payment method,
          currency, and region can answer questions like "how many credit card orders were placed in
          Europe this hour?" directly from your monitoring system, without querying your database.
          Histogram metrics on order values let you understand the distribution of purchase amounts
          across different segments.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Cache metrics are another high-value instrumentation target. Tracking cache hit and miss
          rates per cache name and operation tells you whether your caching strategy is effective and
          helps you identify opportunities for optimization. A declining hit rate might indicate that
          your cache TTL is too short, your cache size is too small, or your access patterns have
          changed.
        </p>
        <CodeBlock code={customLabelsCode} filename="src/routes/orders.ts" />
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Following these guidelines helps you build a metrics system that scales and remains useful
          as your application grows.
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li>
            <strong>Use the right metric type.</strong> Counters for totals that accumulate, gauges
            for current state, histograms for distributions and latencies. Using the wrong type
            leads to incorrect dashboards and broken alerts.
          </li>
          <li>
            <strong>Keep label cardinality low.</strong> Every unique label combination creates a
            separate time series. Avoid labels with unbounded values (user IDs, email addresses,
            full URLs). Use path normalization for HTTP metrics.
          </li>
          <li>
            <strong>Name metrics consistently.</strong> Follow the Prometheus naming conventions:
            use snake_case, include the unit as a suffix (e.g.,{' '}
            <code className="prose-code">_seconds</code>,{' '}
            <code className="prose-code">_bytes</code>,{' '}
            <code className="prose-code">_total</code>), and prefix with your application name.
          </li>
          <li>
            <strong>Choose histogram buckets based on SLOs.</strong> Dense buckets near your SLO
            thresholds give accurate percentile calculations where it matters most.
          </li>
          <li>
            <strong>Instrument business events, not just infrastructure.</strong> Orders, payments,
            signups, and feature usage are as important to monitor as request latency and error rates.
          </li>
          <li>
            <strong>Exclude health check and metrics endpoints.</strong> These generate high-frequency,
            low-value time series that clutter dashboards and consume storage.
          </li>
        </ul>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Core methods on the <code className="prose-code">MetricsRegistry</code> instance. The
          registry is the central coordinator for all metric creation, collection, and serialization.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Method</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Returns</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">counter(opts)</code></td>
                <td className="py-3 px-4"><code className="prose-code">Counter</code></td>
                <td className="py-3 px-4">Creates and registers a counter metric. Accepts name (required, must be unique), help (required, human-readable description), and labels (optional array of label names). The returned Counter exposes an inc() method. Throws if a metric with the same name already exists.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">gauge(opts)</code></td>
                <td className="py-3 px-4"><code className="prose-code">Gauge</code></td>
                <td className="py-3 px-4">Creates and registers a gauge metric. Accepts the same options as counter. The returned Gauge exposes set(), inc(), and dec() methods for arbitrary value manipulation. Useful for tracking current state like active connections or queue depth.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">histogram(opts)</code></td>
                <td className="py-3 px-4"><code className="prose-code">Histogram</code></td>
                <td className="py-3 px-4">Creates and registers a histogram metric. In addition to name, help, and labels, accepts a buckets array of numeric boundaries (defaults to [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]). The returned Histogram exposes an observe() method. Each observation increments all buckets whose boundary is greater than or equal to the observed value.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">getAll()</code></td>
                <td className="py-3 px-4"><code className="prose-code">MetricData[]</code></td>
                <td className="py-3 px-4">Returns all registered metrics as a JSON-serializable array. Each entry includes the metric name, type, help text, and current values for all label combinations. Useful for building custom dashboards or exporting to non-Prometheus monitoring systems.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">toPrometheus()</code></td>
                <td className="py-3 px-4"><code className="prose-code">Promise&lt;string&gt;</code></td>
                <td className="py-3 px-4">Serializes all registered metrics into the Prometheus exposition format (text/plain). This is the standard format consumed by Prometheus, Grafana Agent, Datadog Agent, and other compatible scrapers. The output includes HELP and TYPE metadata lines for each metric family.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">reset()</code></td>
                <td className="py-3 px-4"><code className="prose-code">void</code></td>
                <td className="py-3 px-4">Resets all metric values to their initial state (zero for counters and gauges, empty buckets for histograms). Metric registrations are preserved. Primarily useful in test suites to ensure metric isolation between test cases. Use with caution in production as it breaks rate calculations.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/observability/tracing" className="btn-primary">
            Distributed Tracing <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/observability/openapi" className="btn-secondary">
            OpenAPI Generation
          </Link>
        </div>
      </section>
    </div>
  );
}
