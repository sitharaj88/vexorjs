import{j as e,C as t,I as s,L as a,A as r}from"./index-BWrueqsD.js";const o=`import { Vexor } from '@vexorjs/core';
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

app.listen(3000);`,i=`import { registry } from '@vexorjs/core/metrics';
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
});`,n=`import { registry } from '@vexorjs/core/metrics';
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
});`,c=`import { registry } from '@vexorjs/core/metrics';
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
});`,l=`import { registry, createHttpMetrics, createProcessMetrics } from '@vexorjs/core/metrics';

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
});`,d=`import { Vexor } from '@vexorjs/core';
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
});`,u=`import { registry } from '@vexorjs/core/metrics';

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
}`;function m(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"metrics",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"Metrics"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"Metrics are numerical measurements collected over time that describe the behavior and health of your application. Unlike logs, which capture individual events, metrics aggregate data into statistical summaries -- request rates, error percentages, latency distributions, memory usage -- that allow you to understand system behavior at a glance and detect anomalies before they become outages. Metrics are the foundation of alerting, dashboarding, and capacity planning."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor's metrics module follows the Prometheus data model, which has become the de facto standard for application instrumentation in the cloud-native ecosystem. Metrics are collected in a ",e.jsx("code",{className:"prose-code",children:"MetricsRegistry"}),", which manages named metric instances and serializes them into the Prometheus exposition format for scraping. This format is compatible with Prometheus, Grafana, Datadog, New Relic, and virtually every modern monitoring platform."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The module provides three fundamental metric types -- counters, gauges, and histograms -- each designed for a different class of measurement. Choosing the right type for each measurement is critical: using a gauge where you should use a counter, or a counter where you should use a histogram, leads to misleading dashboards and incorrect alerts. This page explains each type's semantics, internal mechanics, and appropriate use cases, then shows how to wire everything together in a Vexor application."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"Beyond infrastructure metrics, Vexor encourages instrumenting business-level events -- orders placed, payments processed, cache hit rates -- using the same metric primitives. This gives operations teams and product teams a shared language for understanding application behavior."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"how-it-works",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"How the Collection Pipeline Works"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor's metric collection follows a pull-based model inspired by Prometheus. Your application instruments its code by creating metric instances (counters, gauges, histograms) and updating them as events occur. These updates are stored in memory in an efficient, lock-free data structure within the ",e.jsx("code",{className:"prose-code",children:"MetricsRegistry"}),". No data is pushed anywhere at this stage -- the registry simply accumulates the latest values."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Periodically (typically every 15-30 seconds), a monitoring system like Prometheus sends an HTTP request to your application's ",e.jsx("code",{className:"prose-code",children:"/metrics"})," endpoint. The registry serializes all registered metrics into the Prometheus exposition format -- a text-based protocol where each metric is represented as a name, a set of labels, and a value. The monitoring system ingests this data, stores it in a time-series database, and makes it available for querying, alerting, and visualization."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"This pull-based model has significant advantages over push-based alternatives. Your application does not need to know the address of the monitoring system. If the monitoring system goes down, your application continues running without any backlog or memory pressure. If your application restarts, the monitoring system simply observes a gap in the time series. Labels (key-value pairs attached to each metric) allow you to slice and dice data along dimensions like HTTP method, route path, status code, or any custom attribute without creating separate metrics for each combination."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"metric-types",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Understanding Metric Types"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Choosing the correct metric type is essential for accurate monitoring. Each type has specific mathematical properties that determine how it can be aggregated and queried."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["A ",e.jsx("strong",{children:"counter"})," is a cumulative metric that represents a single monotonically increasing value. It can only go up (or reset to zero when the process restarts). Counters are used to measure totals: total requests served, total errors encountered, total bytes transferred. The key insight is that the raw counter value is rarely useful on its own -- what matters is the ",e.jsx("em",{children:"rate of change"}),`. A counter value of 10,000 tells you nothing, but "500 requests per second" tells you everything. Monitoring systems compute rates from counters automatically using functions like Prometheus's`," ",e.jsx("code",{className:"prose-code",children:"rate()"}),"."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["A ",e.jsx("strong",{children:"gauge"})," is a metric that represents a single numerical value that can arbitrarily go up and down. Gauges capture current state: the number of active connections right now, the current queue depth, the amount of free memory. Unlike counters, gauge values are meaningful at any point in time. Gauges are also used for values that are measured at a point in time rather than accumulated, like temperature or CPU utilization. Be cautious with gauge aggregation across instances -- summing active connections across 10 servers makes sense, but averaging CPU utilization requires understanding the sampling methodology."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["A ",e.jsx("strong",{children:"histogram"})," tracks the distribution of observed values by counting how many observations fall into configurable buckets. For example, a request duration histogram with buckets at 10ms, 50ms, 100ms, 250ms, 500ms, and 1s tells you not just the average latency, but the full distribution: how many requests completed under 50ms, how many were between 100ms and 250ms, and so on. Histograms also track the total sum and count of observations, enabling computation of averages. They are essential for SLO monitoring because they allow you to calculate percentiles (P50, P95, P99) without storing every individual observation."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"red-method",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"The RED Method"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The RED (Rate, Errors, Duration) method is a widely adopted framework for instrumenting request-driven services. For every service, you should track three things: the",e.jsx("strong",{children:" Rate"})," of requests (a counter tracking total requests, from which you derive requests per second), the ",e.jsx("strong",{children:"Errors"})," (a counter tracking failed requests, from which you derive error rate as a percentage of total requests), and the"," ",e.jsx("strong",{children:"Duration"})," (a histogram tracking how long requests take, from which you derive latency percentiles)."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor's ",e.jsx("code",{className:"prose-code",children:"createHttpMetrics"})," function implements the RED method out of the box. It automatically creates the counters and histograms needed to track request rate, error rate, and latency distribution for every HTTP endpoint. By adding this single middleware call, you get production-grade observability without writing any custom instrumentation code."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The RED method is complemented by the USE method (Utilization, Saturation, Errors) for infrastructure resources like CPU, memory, and disk. Vexor's"," ",e.jsx("code",{className:"prose-code",children:"createProcessMetrics"})," covers the USE method for Node.js process metrics, tracking CPU time, memory usage, event loop lag, and open file descriptors. Together, RED and USE give you a comprehensive view of both your application's service-level behavior and the underlying resource consumption."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"basic-usage",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Basic Usage"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"registry"})," is the default"," ",e.jsx("code",{className:"prose-code",children:"MetricsRegistry"})," instance that serves as the central collection point for all metrics. You create metric instances by calling methods on the registry (",e.jsx("code",{className:"prose-code",children:"counter"}),", ",e.jsx("code",{className:"prose-code",children:"gauge"}),","," ",e.jsx("code",{className:"prose-code",children:"histogram"}),"), update them in your application code, and expose them via an HTTP endpoint for Prometheus to scrape."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"createHttpMetrics"})," helper creates a pre-configured set of HTTP metrics and returns a middleware function that automatically records request rate, duration, and body sizes for every request. This is the fastest path to production-grade instrumentation -- a single function call gives you the core RED metrics."]}),e.jsx(t,{code:o,filename:"src/app.ts"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"counters",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Counters"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Counters are the simplest and most common metric type. Internally, a counter is just a 64-bit floating-point number that starts at zero and only increases. The"," ",e.jsx("code",{className:"prose-code",children:"inc()"})," method adds to the current value; there is no decrement or set method. When the process restarts, the counter resets to zero, but Prometheus handles this gracefully by detecting counter resets and adjusting rate calculations accordingly."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Labels allow you to create multi-dimensional counters. A single"," ",e.jsx("code",{className:"prose-code",children:"app_requests_total"}),' counter with labels for method, path, and status code can answer questions like "how many GET requests returned 200 on the /users endpoint?" without creating separate counters for each combination. However, be mindful of label cardinality: every unique combination of label values creates a separate time series in your monitoring system. High-cardinality labels (like user IDs or full URL paths with unique parameters) can cause excessive memory usage and slow query performance.']}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:'Use counters for any measurement that accumulates over time: total requests, total errors, total bytes sent, total orders placed, total emails sent. If you ever need a value to decrease, you need a gauge instead. A common mistake is using a gauge to track "total requests" -- this breaks rate calculations because Prometheus cannot distinguish between a gauge decrease and a counter reset.'}),e.jsx(t,{code:i,filename:"src/metrics.ts"}),e.jsx(s,{variant:"info",children:"Counters can only increase. To track values that go up and down (like active connections or queue sizes), use a gauge instead."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"gauges",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Gauges"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"A gauge represents a snapshot of a current value. Unlike counters, gauges have no monotonicity constraint -- they can be set to any value, incremented, or decremented. This makes them the right choice for measurements that reflect current state rather than cumulative totals: the number of active WebSocket connections, the current size of a work queue, the amount of available disk space, or the temperature of a sensor."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Gauges support three operations: ",e.jsx("code",{className:"prose-code",children:"set(value)"})," to replace the current value entirely, ",e.jsx("code",{className:"prose-code",children:"inc()"})," to add 1 (or a specified amount), and ",e.jsx("code",{className:"prose-code",children:"dec()"})," to subtract 1 (or a specified amount). The increment/decrement pattern is particularly useful for tracking concurrent operations: increment when an operation starts, decrement when it ends. If your application ever exits without decrementing (for example, due to a crash), the gauge will show an inflated value until the next scrape after restart."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When aggregating gauges across multiple instances, think carefully about the aggregation function. Summing active connections across instances gives you the total active connections for the service. But averaging CPU utilization across instances may be misleading if instances have different capacities. Always document the intended aggregation semantics in the metric's ",e.jsx("code",{className:"prose-code",children:"help"})," description."]}),e.jsx(t,{code:n,filename:"src/metrics.ts"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"histograms",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Histograms"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Histograms are the most powerful and nuanced metric type. They capture the distribution of observed values by maintaining a set of cumulative counters, one for each configured bucket boundary. When you call ",e.jsx("code",{className:"prose-code",children:"observe(0.15)"})," on a histogram with buckets at 0.1, 0.25, 0.5, and 1.0, the counters for the 0.25, 0.5, 1.0, and +Infinity buckets are all incremented (because 0.15 is less than or equal to all of them). The histogram also maintains a running sum and count of all observed values."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["This cumulative bucket structure enables Prometheus to calculate approximate percentiles using the ",e.jsx("code",{className:"prose-code",children:"histogram_quantile()"})," function. For example, if your P99 latency is 250ms, that means 99% of requests completed in 250ms or less. Percentiles are far more useful than averages for understanding user experience -- an average latency of 50ms might hide the fact that 1% of users are waiting 5 seconds."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The choice of bucket boundaries directly affects the accuracy of percentile calculations. Percentiles are interpolated within buckets, so placing bucket boundaries near your SLO thresholds gives the most accurate results at the values that matter most. For an API with a 200ms P99 SLO, use dense bucket boundaries between 100ms and 300ms and sparser boundaries elsewhere. Vexor provides sensible default buckets, but you should customize them based on your application's latency profile and SLO requirements."}),e.jsx(t,{code:c,filename:"src/metrics.ts"}),e.jsx(s,{variant:"tip",children:"Choose bucket boundaries based on your SLOs. For an API with a 100ms P99 target, use fine-grained buckets below 100ms and coarser ones above."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"http-metrics",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Built-in HTTP and Process Metrics"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"createHttpMetrics"})," helper generates four metrics that cover the RED method and request/response sizing: a counter for total requests (segmented by method, normalized path, and status code), a histogram for request duration, a histogram for request body size, and a histogram for response body size. These four metrics give you comprehensive visibility into your API's traffic patterns, error rates, and latency distribution."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"normalizePath"})," option is critical for preventing label cardinality explosions. Without normalization, every unique URL (including those with UUIDs, numeric IDs, or query parameters in the path) creates a separate time series. On a busy API, this can generate thousands of unique time series per endpoint, consuming significant memory in both your application and your monitoring system. The normalizer replaces dynamic path segments with placeholders like ",e.jsx("code",{className:"prose-code",children:"/:id"})," ","or ",e.jsx("code",{className:"prose-code",children:"/:uuid"}),", collapsing all variations of a route into a single time series."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"createProcessMetrics"})," helper tracks Node.js runtime metrics at 5-second intervals: CPU time consumed, resident and heap memory, open file descriptors, active handles, and event loop lag. Event loop lag is a particularly valuable metric for Node.js applications because it indicates whether the event loop is being blocked by synchronous operations -- a common cause of latency spikes."]}),e.jsx(t,{code:l,filename:"src/app.ts"}),e.jsxs(s,{variant:"warning",children:["Avoid high-cardinality labels (like full URL paths with unique IDs). Use the"," ",e.jsx("code",{className:"prose-code",children:"normalizePath"})," option to replace dynamic segments with placeholders. High cardinality causes excessive memory usage and slow scrapes."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"prometheus-endpoint",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Prometheus Endpoint"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"/metrics"})," endpoint is the bridge between your application and the monitoring system. When Prometheus (or any compatible scraper) sends a GET request to this endpoint, the registry serializes all registered metrics into the Prometheus exposition format -- a human-readable text format where each time series is represented as a single line with the metric name, labels, and value."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The format includes ",e.jsx("code",{className:"prose-code",children:"# HELP"})," lines that describe what each metric measures and ",e.jsx("code",{className:"prose-code",children:"# TYPE"})," lines that declare the metric type. Histogram metrics are expanded into multiple lines: one for each bucket (suffixed with"," ",e.jsx("code",{className:"prose-code",children:"_bucket"}),"), one for the sum (suffixed with"," ",e.jsx("code",{className:"prose-code",children:"_sum"}),"), and one for the count (suffixed with"," ",e.jsx("code",{className:"prose-code",children:"_count"}),"). The JSON endpoint is a Vexor convenience for building custom dashboards or integrating with non-Prometheus monitoring tools."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["In production, the metrics endpoint should be accessible to your monitoring infrastructure but not to the public internet. Common patterns include running the metrics server on a separate port, restricting access via network policies, or protecting the endpoint with basic authentication. The ",e.jsx("code",{className:"prose-code",children:"excludePaths"})," option on"," ",e.jsx("code",{className:"prose-code",children:"createHttpMetrics"})," should exclude the metrics endpoint itself to prevent recursive metric generation."]}),e.jsx(t,{code:d,filename:"src/routes/metrics.ts"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"custom-labels",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Business Metrics with Custom Labels"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Infrastructure metrics tell you whether your system is healthy; business metrics tell you whether your system is useful. Tracking orders placed, revenue generated, payment methods used, cache hit rates, and feature adoption gives product and business teams the same real-time visibility that operations teams get from infrastructure metrics."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Custom labels let you slice business metrics along meaningful dimensions. An"," ",e.jsx("code",{className:"prose-code",children:"app_orders_total"}),' counter with labels for payment method, currency, and region can answer questions like "how many credit card orders were placed in Europe this hour?" directly from your monitoring system, without querying your database. Histogram metrics on order values let you understand the distribution of purchase amounts across different segments.']}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Cache metrics are another high-value instrumentation target. Tracking cache hit and miss rates per cache name and operation tells you whether your caching strategy is effective and helps you identify opportunities for optimization. A declining hit rate might indicate that your cache TTL is too short, your cache size is too small, or your access patterns have changed."}),e.jsx(t,{code:u,filename:"src/routes/orders.ts"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"best-practices",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Best Practices"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Following these guidelines helps you build a metrics system that scales and remains useful as your application grows."}),e.jsxs("ul",{className:"list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Use the right metric type."})," Counters for totals that accumulate, gauges for current state, histograms for distributions and latencies. Using the wrong type leads to incorrect dashboards and broken alerts."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Keep label cardinality low."})," Every unique label combination creates a separate time series. Avoid labels with unbounded values (user IDs, email addresses, full URLs). Use path normalization for HTTP metrics."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Name metrics consistently."})," Follow the Prometheus naming conventions: use snake_case, include the unit as a suffix (e.g.,"," ",e.jsx("code",{className:"prose-code",children:"_seconds"}),","," ",e.jsx("code",{className:"prose-code",children:"_bytes"}),","," ",e.jsx("code",{className:"prose-code",children:"_total"}),"), and prefix with your application name."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Choose histogram buckets based on SLOs."})," Dense buckets near your SLO thresholds give accurate percentile calculations where it matters most."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Instrument business events, not just infrastructure."})," Orders, payments, signups, and feature usage are as important to monitor as request latency and error rates."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Exclude health check and metrics endpoints."})," These generate high-frequency, low-value time series that clutter dashboards and consume storage."]})]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"api-reference",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"API Reference"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Core methods on the ",e.jsx("code",{className:"prose-code",children:"MetricsRegistry"})," instance. The registry is the central coordinator for all metric creation, collection, and serialization."]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Method"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Returns"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"counter(opts)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"Counter"})}),e.jsx("td",{className:"py-3 px-4",children:"Creates and registers a counter metric. Accepts name (required, must be unique), help (required, human-readable description), and labels (optional array of label names). The returned Counter exposes an inc() method. Throws if a metric with the same name already exists."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"gauge(opts)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"Gauge"})}),e.jsx("td",{className:"py-3 px-4",children:"Creates and registers a gauge metric. Accepts the same options as counter. The returned Gauge exposes set(), inc(), and dec() methods for arbitrary value manipulation. Useful for tracking current state like active connections or queue depth."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"histogram(opts)"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"Histogram"})}),e.jsx("td",{className:"py-3 px-4",children:"Creates and registers a histogram metric. In addition to name, help, and labels, accepts a buckets array of numeric boundaries (defaults to [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]). The returned Histogram exposes an observe() method. Each observation increments all buckets whose boundary is greater than or equal to the observed value."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"getAll()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"MetricData[]"})}),e.jsx("td",{className:"py-3 px-4",children:"Returns all registered metrics as a JSON-serializable array. Each entry includes the metric name, type, help text, and current values for all label combinations. Useful for building custom dashboards or exporting to non-Prometheus monitoring systems."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"toPrometheus()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"Promise<string>"})}),e.jsx("td",{className:"py-3 px-4",children:"Serializes all registered metrics into the Prometheus exposition format (text/plain). This is the standard format consumed by Prometheus, Grafana Agent, Datadog Agent, and other compatible scrapers. The output includes HELP and TYPE metadata lines for each metric family."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"reset()"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"void"})}),e.jsx("td",{className:"py-3 px-4",children:"Resets all metric values to their initial state (zero for counters and gauges, empty buckets for histograms). Metric registrations are preserved. Primarily useful in test suites to ensure metric isolation between test cases. Use with caution in production as it breaks rate calculations."})]})]})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(a,{to:"/observability/tracing",className:"btn-primary",children:["Distributed Tracing ",e.jsx(r,{className:"w-4 h-4 ml-2"})]}),e.jsx(a,{to:"/observability/openapi",className:"btn-secondary",children:"OpenAPI Generation"})]})]})]})}export{m as default};
