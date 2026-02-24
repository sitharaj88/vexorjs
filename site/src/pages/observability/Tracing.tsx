import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { Vexor } from '@vexorjs/core';
import { createTracer, ConsoleTraceExporter } from '@vexorjs/core/tracing';

const app = new Vexor();

// Create a tracer with console output (development)
const tracer = createTracer({
  serviceName: 'my-api',
  exporter: new ConsoleTraceExporter(),
});

// Automatically trace all HTTP requests
app.use(tracer.middleware());

// Traces are printed to console:
// [TRACE] GET /users 200 12ms
//   └── db.query SELECT * FROM users 8ms
//   └── serialize response 2ms

app.get('/users', async (ctx) => {
  const users = await db.select().from(usersTable);
  return ctx.json({ users });
});

// Shutdown tracer gracefully (flushes pending spans)
app.addHook('onClose', async () => {
  await tracer.shutdown();
});

app.listen(3000);`;

const creatingSpansCode = `import { tracer } from '@vexorjs/core/tracing';
import type { Span, SpanKind } from '@vexorjs/core/tracing';

// Create a span manually
app.get('/users/:id', async (ctx) => {
  const span = tracer.startSpan('fetchUser', {
    kind: 'server',
    attributes: {
      'user.id': ctx.params.id,
      'http.method': ctx.req.method,
    },
  });

  try {
    const user = await db.select().from(users)
      .where(eq(users.id, ctx.params.id))
      .first();

    if (!user) {
      span.setStatus({ code: 'NOT_FOUND', message: 'User not found' });
      return ctx.status(404).json({ error: 'User not found' });
    }

    span.setAttribute('user.role', user.role);
    span.setStatus({ code: 'OK' });
    return ctx.json({ user });
  } catch (error) {
    span.recordException(error as Error);
    span.setStatus({ code: 'ERROR', message: (error as Error).message });
    throw error;
  } finally {
    span.end();
  }
});

// Simpler: use withSpan for automatic lifecycle management
app.get('/orders/:id', async (ctx) => {
  return tracer.withSpan('fetchOrder', { kind: 'server' }, async (span) => {
    span.setAttribute('order.id', ctx.params.id);

    const order = await tracer.withSpan('db.findOrder', { kind: 'client' }, async () => {
      return db.select().from(orders).where(eq(orders.id, ctx.params.id)).first();
    });

    if (!order) {
      span.setStatus({ code: 'NOT_FOUND' });
      return ctx.status(404).json({ error: 'Order not found' });
    }

    return ctx.json({ order });
  });
});`;

const nestedSpansCode = `import { tracer } from '@vexorjs/core/tracing';

// Nested spans create a parent-child hierarchy automatically
app.post('/orders', async (ctx) => {
  return tracer.withSpan('createOrder', { kind: 'server' }, async (rootSpan) => {
    const { items, shippingAddress } = ctx.body;

    // Child span: validate inventory
    const inventory = await tracer.withSpan('validateInventory', { kind: 'internal' }, async (span) => {
      span.setAttribute('item.count', items.length);
      const result = await inventoryService.checkAvailability(items);
      span.addEvent('inventory_checked', { available: result.allAvailable });
      return result;
    });

    if (!inventory.allAvailable) {
      rootSpan.setStatus({ code: 'ERROR', message: 'Items out of stock' });
      return ctx.status(400).json({ error: 'Some items are out of stock' });
    }

    // Child span: calculate pricing
    const pricing = await tracer.withSpan('calculatePricing', { kind: 'internal' }, async (span) => {
      const subtotal = await pricingService.calculate(items);
      const tax = await pricingService.calculateTax(subtotal, shippingAddress);
      span.setAttribute('order.subtotal', subtotal);
      span.setAttribute('order.tax', tax);
      return { subtotal, tax, total: subtotal + tax };
    });

    // Child span: process payment
    const payment = await tracer.withSpan('processPayment', { kind: 'client' }, async (span) => {
      span.setAttribute('payment.amount', pricing.total);
      span.setAttribute('payment.currency', 'USD');
      return paymentService.charge(ctx.body.paymentMethodId, pricing.total);
    });

    // Child span: persist order
    const order = await tracer.withSpan('db.insertOrder', { kind: 'client' }, async () => {
      return db.insert(orders).values({
        userId: ctx.get('user').id,
        items,
        total: pricing.total,
        paymentId: payment.id,
      }).returning();
    });

    rootSpan.setAttribute('order.id', order.id);
    rootSpan.setStatus({ code: 'OK' });
    return ctx.status(201).json({ order });
  });
});

// Resulting trace tree:
// createOrder (server, 145ms)
//   ├── validateInventory (internal, 23ms)
//   ├── calculatePricing (internal, 12ms)
//   ├── processPayment (client, 89ms)
//   └── db.insertOrder (client, 18ms)`;

const attributesEventsCode = `import { tracer } from '@vexorjs/core/tracing';
import type { Span } from '@vexorjs/core/tracing';

app.post('/users', async (ctx) => {
  return tracer.withSpan('createUser', { kind: 'server' }, async (span: Span) => {
    // Set attributes (key-value metadata)
    span.setAttribute('user.email', ctx.body.email);
    span.setAttribute('http.method', 'POST');
    span.setAttribute('http.url', '/users');
    span.setAttribute('http.status_code', 201);

    // Add events (timestamped log entries within a span)
    span.addEvent('validation_passed', {
      fields: ['email', 'name', 'password'],
    });

    const user = await db.insert(users).values(ctx.body).returning();

    span.addEvent('user_created', {
      'user.id': user.id,
      'user.email': user.email,
    });

    // Send welcome email asynchronously
    span.addEvent('welcome_email_queued', {
      'queue.name': 'emails',
    });
    await emailQueue.add({ userId: user.id, template: 'welcome' });

    // Set span status
    span.setStatus({ code: 'OK' });

    return ctx.status(201).json({ user });
  });
});

// Record exceptions with full stack traces
app.get('/risky-operation', async (ctx) => {
  return tracer.withSpan('riskyOp', async (span) => {
    try {
      const result = await externalService.call();
      return ctx.json(result);
    } catch (error) {
      // Records the exception as a span event with stack trace
      span.recordException(error as Error);
      span.setStatus({ code: 'ERROR', message: (error as Error).message });
      return ctx.status(502).json({ error: 'External service failed' });
    }
  });
});`;

const exportersCode = `import {
  createTracer,
  ConsoleTraceExporter,
  BatchTraceExporter,
  OTLPTraceExporter,
} from '@vexorjs/core/tracing';

// Console exporter: prints traces to stdout (development)
const devTracer = createTracer({
  serviceName: 'my-api',
  exporter: new ConsoleTraceExporter({
    verbose: true, // include attributes and events
  }),
});

// Batch exporter: buffers spans and sends in batches (custom backend)
const batchTracer = createTracer({
  serviceName: 'my-api',
  exporter: new BatchTraceExporter({
    endpoint: 'https://traces.internal.example.com/v1/traces',
    headers: { 'X-API-Key': process.env.TRACE_API_KEY! },
    batchSize: 100,
    flushInterval: 5000, // flush every 5 seconds
    maxQueueSize: 10000,
  }),
});

// OTLP exporter: OpenTelemetry Protocol (Jaeger, Zipkin, Grafana Tempo, etc.)
const prodTracer = createTracer({
  serviceName: 'my-api',
  exporter: new OTLPTraceExporter({
    endpoint: process.env.OTLP_ENDPOINT ?? 'http://localhost:4318/v1/traces',
    headers: {
      Authorization: \`Bearer \${process.env.OTLP_TOKEN}\`,
    },
    compression: 'gzip',
  }),
  // Sampling: only trace a percentage of requests in production
  sampler: {
    type: 'ratio',
    ratio: 0.1, // trace 10% of requests
  },
});`;

const otlpIntegrationCode = `import { createTracer, OTLPTraceExporter } from '@vexorjs/core/tracing';

// Full production setup with OTLP
const tracer = createTracer({
  serviceName: 'order-service',
  serviceVersion: '1.2.0',
  environment: process.env.NODE_ENV ?? 'development',
  exporter: new OTLPTraceExporter({
    endpoint: process.env.OTLP_ENDPOINT!,
    headers: {
      Authorization: \`Bearer \${process.env.OTLP_TOKEN}\`,
    },
  }),
  // Resource attributes (attached to all spans)
  resource: {
    'deployment.environment': process.env.NODE_ENV,
    'service.namespace': 'ecommerce',
    'host.name': process.env.HOSTNAME,
    'cloud.region': process.env.AWS_REGION,
  },
  // Propagate trace context across service boundaries
  propagator: 'w3c-tracecontext', // W3C Trace Context headers
  sampler: {
    type: 'ratio',
    ratio: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  },
});

// Trace context is automatically propagated via headers:
// traceparent: 00-<trace-id>-<span-id>-01
// tracestate: vexor=...

// Outgoing HTTP calls carry the trace context
app.get('/orders/:id', async (ctx) => {
  return tracer.withSpan('getOrderDetails', { kind: 'server' }, async (span) => {
    // The active span's context is injected into outgoing requests
    const order = await fetch('http://inventory-service/items', {
      headers: tracer.getActiveSpan()?.propagationHeaders() ?? {},
    }).then(r => r.json());

    return ctx.json(order);
  });
});

// docker-compose.yml for local development with Jaeger:
// services:
//   jaeger:
//     image: jaegertracing/all-in-one:latest
//     ports:
//       - "16686:16686"  # Jaeger UI
//       - "4318:4318"    # OTLP HTTP
//     environment:
//       COLLECTOR_OTLP_ENABLED: "true"`;

export default function Tracing() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="tracing" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Distributed Tracing
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Distributed tracing is an observability technique that tracks the journey of a single
          request as it flows through multiple services, databases, caches, and message queues in a
          distributed system. While metrics tell you that your P99 latency is 500ms, and logs tell
          you that a specific database query failed, a trace tells you exactly which sequence of
          operations a specific request went through, how long each step took, and where the
          bottleneck or failure occurred.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The core abstraction in tracing is the <strong>span</strong>. A span represents a single
          unit of work: an HTTP request handler, a database query, a cache lookup, a call to an
          external API. Each span has a name, a start time, a duration, a status (OK, ERROR, or
          NOT_FOUND), and optional attributes and events that provide additional context. Spans are
          organized into a tree structure where each span can have a parent, forming a{' '}
          <strong>trace</strong> -- a directed acyclic graph that represents the complete execution
          path of a request.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's tracing module integrates with the OpenTelemetry ecosystem, the industry standard
          for observability instrumentation. It uses the OpenTelemetry Protocol (OTLP) to export
          traces to backends like Jaeger, Grafana Tempo, Honeycomb, Datadog, and Zipkin. It supports
          W3C Trace Context for propagating trace identifiers across service boundaries, configurable
          sampling strategies to control overhead in production, and a developer-friendly API that
          handles span lifecycle management automatically.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          This page explains the conceptual model behind distributed tracing, how context propagation
          works across service boundaries, sampling strategies and their trade-offs, and how to
          instrument your Vexor application for production-grade observability.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How Distributed Tracing Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When a request enters your system, the tracing middleware creates a root span and assigns
          it a globally unique <strong>trace ID</strong> (a 128-bit random identifier) and a{' '}
          <strong>span ID</strong> (a 64-bit random identifier). As the request handler creates child
          spans -- for database queries, cache lookups, or calls to downstream services -- each child
          span receives its own span ID but inherits the same trace ID. The child also records its
          parent's span ID, establishing the tree structure. When all spans are collected by the
          tracing backend, the shared trace ID allows the backend to reconstruct the entire tree and
          display the request's journey as a waterfall diagram.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Context propagation</strong> is the mechanism that carries trace identity across
          process boundaries. When Service A calls Service B over HTTP, the trace context (trace ID,
          parent span ID, and sampling decision) must be transmitted in the request headers so that
          Service B can create child spans that belong to the same trace. Vexor uses the W3C Trace
          Context standard, which encodes this information in a{' '}
          <code className="prose-code">traceparent</code> header with the format{' '}
          <code className="prose-code">00-&lt;trace-id&gt;-&lt;span-id&gt;-&lt;flags&gt;</code>.
          The tracing middleware automatically extracts this header from incoming requests and injects
          it into outgoing requests, making cross-service tracing work transparently.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Without context propagation, each service would create independent traces. You would see
          that Service A took 200ms and Service B took 150ms, but you would not know that Service B's
          150ms was part of Service A's 200ms request. With propagation, the tracing backend can
          render a single unified trace that shows the entire request lifecycle across all services,
          making it immediately obvious where time is spent and where failures originate.
        </p>
      </section>

      {/* Sampling Strategies */}
      <section>
        <h2 id="sampling" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Sampling Strategies
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Tracing every single request in a high-throughput production system is prohibitively
          expensive. Each span consumes memory in your application, network bandwidth to the tracing
          backend, and storage in the backend's database. At 10,000 requests per second with an
          average of 5 spans per request, you would generate 50,000 spans per second -- far more
          than most tracing backends can ingest and store cost-effectively. Sampling solves this by
          tracing only a fraction of requests while still providing statistically representative data.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor supports three sampling strategies. <strong>Always sampling</strong>{' '}
          (<code className="prose-code">type: 'always'</code>) traces every request and is appropriate
          for development and low-traffic staging environments. <strong>Never sampling</strong>{' '}
          (<code className="prose-code">type: 'never'</code>) disables tracing entirely, useful for
          performance benchmarks. <strong>Ratio-based sampling</strong>{' '}
          (<code className="prose-code">type: 'ratio', ratio: 0.1</code>) traces a random percentage
          of requests -- a 10% ratio means roughly one in ten requests is traced.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          An important property of sampling is that the decision must be made at the entry point (the
          first service) and propagated to all downstream services. If Service A decides to trace a
          request, all downstream services must also trace their portion of that request. Otherwise,
          you get incomplete traces with missing spans. Vexor's W3C Trace Context propagation includes
          the sampling decision in the <code className="prose-code">traceparent</code> header flags,
          ensuring consistent sampling across the entire request path.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A 10% sampling ratio is a common starting point for production systems. It provides enough
          traces to debug most issues while keeping overhead manageable. If you need to investigate
          a specific problem, most tracing backends support on-demand full sampling through
          configuration changes that do not require a deployment.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Setting up tracing in Vexor begins with <code className="prose-code">createTracer</code>,
          which accepts a service name, an exporter, and optional configuration. The service name
          identifies your application in the tracing backend and is attached to every span as a
          resource attribute. The exporter determines where spans are sent -- to the console during
          development, or to a production tracing backend via OTLP.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Registering the tracer's middleware with <code className="prose-code">app.use(tracer.middleware())</code>{' '}
          automatically creates a root span for every incoming HTTP request. The span captures the
          HTTP method, URL, status code, and duration. Any child spans created during the request
          handler are automatically linked to this root span, building a complete trace tree without
          any manual parent tracking.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Always call <code className="prose-code">tracer.shutdown()</code> during graceful shutdown.
          This flushes any buffered spans to the exporter, ensuring that the last few spans before
          shutdown are not lost. Without this, spans generated in the final moments of the process
          may be silently discarded.
        </p>
        <CodeBlock code={basicUsageCode} filename="src/app.ts" />
      </section>

      {/* Creating Spans */}
      <section>
        <h2 id="creating-spans" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Creating Spans
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A span represents a single unit of work within a trace. Vexor provides two APIs for creating
          spans: <code className="prose-code">startSpan</code> for manual lifecycle control, and{' '}
          <code className="prose-code">withSpan</code> for automatic lifecycle management. The{' '}
          <code className="prose-code">startSpan</code> method returns a span object that you must
          explicitly end by calling <code className="prose-code">span.end()</code>. If you forget to
          end a span (for example, due to an early return or unhandled exception), it becomes a "span
          leak" -- an open span that never completes and may cause memory issues.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">withSpan</code> method is the preferred API. It wraps an
          async callback, automatically starts the span before the callback executes, and ends it when
          the callback resolves or rejects. If the callback throws, the exception is recorded on the
          span and the status is set to ERROR before the span is ended. This eliminates an entire
          class of bugs related to span lifecycle management and produces cleaner, more readable code.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Each span has a <strong>kind</strong> that describes its role in the request flow:{' '}
          <code className="prose-code">'server'</code> for incoming requests,{' '}
          <code className="prose-code">'client'</code> for outgoing calls to external services or
          databases, and <code className="prose-code">'internal'</code> for in-process operations
          like business logic calculations. Tracing backends use span kinds to render different
          visual styles and to identify service-to-service dependencies in architecture diagrams.
        </p>
        <CodeBlock code={creatingSpansCode} filename="src/routes/users.ts" />
        <InfoBlock variant="tip">
          Prefer <code className="prose-code">withSpan</code> over <code className="prose-code">startSpan</code>.
          It automatically ends the span and records exceptions, reducing boilerplate and preventing
          span leaks.
        </InfoBlock>
      </section>

      {/* Nested Spans */}
      <section>
        <h2 id="nested-spans" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Nested Spans and Trace Trees
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The power of tracing comes from nested spans that form a tree structure. When you call{' '}
          <code className="prose-code">withSpan</code> inside another <code className="prose-code">withSpan</code>{' '}
          callback, the inner span automatically becomes a child of the outer span. Vexor manages this
          parent-child relationship using an async context mechanism (Node.js AsyncLocalStorage) that
          tracks the "current" span across async operations without requiring you to pass span
          references explicitly.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In the trace tree, the root span represents the overall request, and child spans represent
          the individual steps: inventory validation, pricing calculation, payment processing, database
          writes. The duration of each child span is visible in the trace's waterfall view, making it
          immediately obvious which step is the bottleneck. In the example below, the payment
          processing span takes 89ms out of a total 145ms, indicating that the payment service is the
          dominant contributor to request latency.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Trace trees also reveal <strong>sequential vs. parallel</strong> execution patterns. If two
          child spans run concurrently (for example, fetching data from two independent services in
          parallel), the waterfall view shows them overlapping in time. If they run sequentially, they
          appear stacked end-to-end. This visibility helps identify opportunities for parallelization:
          if two independent operations are running sequentially when they could run in parallel, the
          trace makes this inefficiency visible.
        </p>
        <CodeBlock code={nestedSpansCode} filename="src/routes/orders.ts" />
      </section>

      {/* Attributes & Events */}
      <section>
        <h2 id="attributes-events" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Attributes and Events
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Attributes and events are the mechanisms for enriching spans with contextual information.{' '}
          <strong>Attributes</strong> are key-value pairs that describe properties of the span's
          operation: the user ID, HTTP method, database table name, payment amount. They are set once
          (or updated) and are associated with the span for its entire duration. Tracing backends
          index attributes, making them searchable -- you can find all traces where{' '}
          <code className="prose-code">user.id = 42</code> or where{' '}
          <code className="prose-code">http.status_code = 500</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Events</strong> are timestamped log entries within a span. They record things that
          happen at a specific point during the span's execution: "validation passed at T+5ms",
          "user created at T+20ms", "email queued at T+25ms". Events are useful for understanding the
          sequence of operations within a span without creating separate child spans for each step.
          The <code className="prose-code">recordException</code> method is a special case of an event
          that captures an error's message, type, and stack trace in a structured format that tracing
          backends render as error details.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For maximum compatibility with tracing backends, follow the OpenTelemetry Semantic
          Conventions for attribute naming. Use dotted namespaces like{' '}
          <code className="prose-code">http.method</code>,{' '}
          <code className="prose-code">db.system</code>,{' '}
          <code className="prose-code">rpc.service</code>. These standardized names allow tracing
          backends to provide enhanced visualizations and automatic service maps. Custom attributes
          for your business domain (like <code className="prose-code">order.total</code> or{' '}
          <code className="prose-code">user.plan</code>) can use any naming convention, but keeping
          a consistent namespace helps with discoverability.
        </p>
        <CodeBlock code={attributesEventsCode} filename="src/routes/users.ts" />
        <InfoBlock variant="info">
          Follow the{' '}
          <a href="https://opentelemetry.io/docs/specs/semconv/" className="underline" target="_blank" rel="noopener noreferrer">
            OpenTelemetry Semantic Conventions
          </a>{' '}
          for attribute naming (e.g. <code className="prose-code">http.method</code>,{' '}
          <code className="prose-code">db.system</code>) to ensure compatibility with tracing backends.
        </InfoBlock>
      </section>

      {/* Exporters */}
      <section>
        <h2 id="exporters" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Exporters
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          An exporter determines where completed spans are sent. Vexor provides three built-in
          exporters, each optimized for different environments. The{' '}
          <code className="prose-code">ConsoleTraceExporter</code> prints traces to stdout in a
          human-readable tree format, making it ideal for development where you want immediate
          visibility without running a tracing backend. The{' '}
          <code className="prose-code">verbose</code> option includes attribute and event details
          in the output.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">BatchTraceExporter</code> buffers completed spans in memory
          and sends them in batches at a configurable interval. This is the right choice when sending
          to a custom backend that accepts spans over HTTP. Batching amortizes the overhead of network
          calls across many spans, and the configurable queue size provides backpressure if the backend
          cannot keep up. If the queue fills up, the oldest spans are dropped to prevent memory growth.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">OTLPTraceExporter</code> sends spans using the
          OpenTelemetry Protocol (OTLP), the standard wire format supported by Jaeger, Grafana
          Tempo, Honeycomb, Datadog, and virtually every modern tracing backend. OTLP supports both
          HTTP and gRPC transports; Vexor uses HTTP by default with optional gzip compression. The
          OTLP exporter also supports authentication headers, making it straightforward to integrate
          with hosted tracing services.
        </p>
        <CodeBlock code={exportersCode} filename="src/tracing.ts" />
        <InfoBlock variant="warning">
          In production, always use sampling to reduce overhead. Tracing 100% of requests generates
          significant data volume. A 10% sampling ratio is a good starting point.
        </InfoBlock>
      </section>

      {/* OTLP Integration */}
      <section>
        <h2 id="otlp-integration" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Production OTLP Integration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A production tracing setup requires several additional configuration elements beyond the
          basic exporter. <strong>Resource attributes</strong> are key-value pairs attached to every
          span produced by the tracer. They describe the entity producing the spans -- the service
          name, version, deployment environment, host name, and cloud region. Tracing backends use
          resource attributes to group spans by service, build service dependency maps, and filter
          traces by environment.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">propagator</code> setting controls the format of trace
          context headers used for cross-service propagation. The W3C Trace Context standard
          (<code className="prose-code">'w3c-tracecontext'</code>) is the recommended choice because
          it is an open standard supported by all major tracing backends and frameworks. The{' '}
          <code className="prose-code">traceparent</code> header carries the trace ID, parent span
          ID, and sampling flags in a compact format. When your service receives a request with a{' '}
          <code className="prose-code">traceparent</code> header, the tracer automatically extracts
          the context and creates child spans that belong to the upstream trace.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For outgoing HTTP calls, you need to inject the trace context into request headers. The{' '}
          <code className="prose-code">propagationHeaders()</code> method on the active span returns
          the appropriate headers to include in outgoing requests. Without this step, downstream
          services create independent traces rather than child spans of the current trace, breaking
          the end-to-end visibility that makes distributed tracing valuable.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For local development, Jaeger's all-in-one Docker image provides a complete tracing backend
          with a web UI. It accepts OTLP data on port 4318 and serves the trace viewer UI on port
          16686. This gives you the full production tracing experience on your local machine without
          any cloud services or complex infrastructure.
        </p>
        <CodeBlock code={otlpIntegrationCode} filename="src/tracing.ts" />
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Effective tracing requires intentional instrumentation. These guidelines help you build
          traces that are useful for debugging and performance analysis.
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li>
            <strong>Use withSpan for span lifecycle management.</strong> It automatically handles
            span ending and exception recording, preventing span leaks and ensuring complete traces.
          </li>
          <li>
            <strong>Name spans descriptively.</strong> Use names that describe the operation, not the
            implementation. "fetchUserProfile" is better than "dbQuery". "processPayment" is better
            than "httpPost".
          </li>
          <li>
            <strong>Set span kinds correctly.</strong> Server for incoming requests, client for
            outgoing calls, internal for in-process operations. This enables accurate service
            dependency maps in your tracing backend.
          </li>
          <li>
            <strong>Propagate context across service boundaries.</strong> Always include trace context
            headers in outgoing HTTP requests. Without propagation, you get disconnected traces
            instead of end-to-end visibility.
          </li>
          <li>
            <strong>Use ratio-based sampling in production.</strong> Start with 10% and adjust based
            on your tracing backend's capacity and your debugging needs. Trace 100% only in
            development and staging.
          </li>
          <li>
            <strong>Follow OpenTelemetry Semantic Conventions.</strong> Standard attribute names
            enable backend features like auto-generated service maps and error highlighting.
          </li>
          <li>
            <strong>Record exceptions on spans.</strong> Use recordException to capture error details
            with stack traces. This makes error traces immediately useful without cross-referencing
            log files.
          </li>
        </ul>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Configuration options for <code className="prose-code">createTracer(options)</code>. The
          service name and exporter are the minimum required configuration for a functional tracing
          setup.
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
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">serviceName</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">The name of your service, attached to every span as a resource attribute. Used by tracing backends to group spans, build service maps, and identify the source of traces. Choose a name that uniquely identifies your service within the system (e.g., 'order-service', 'auth-api').</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">serviceVersion</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">The version of your service, attached as a resource attribute. Enables filtering traces by deployment version, which is invaluable for identifying regressions introduced in specific releases.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">exporter</code></td>
                <td className="py-3 px-4"><code className="prose-code">TraceExporter</code></td>
                <td className="py-3 px-4"><code className="prose-code">ConsoleTraceExporter</code></td>
                <td className="py-3 px-4">The destination for completed spans. Use ConsoleTraceExporter for development (prints to stdout), BatchTraceExporter for custom backends (buffers and batches spans), or OTLPTraceExporter for production (sends via OpenTelemetry Protocol to Jaeger, Tempo, Honeycomb, etc.).</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">sampler</code></td>
                <td className="py-3 px-4"><code className="prose-code">SamplerConfig</code></td>
                <td className="py-3 px-4"><code className="prose-code">{'{ type: "always" }'}</code></td>
                <td className="py-3 px-4">Controls which requests are traced. Set to 'always' for development (trace everything), 'never' for benchmarks (trace nothing), or 'ratio' with a ratio value (e.g., 0.1 for 10%) for production. The sampling decision is propagated to downstream services via the traceparent header.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">propagator</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4"><code className="prose-code">'w3c-tracecontext'</code></td>
                <td className="py-3 px-4">The context propagation format for cross-service tracing. W3C Trace Context is the recommended standard, supported by all major tracing backends. The propagator determines how trace IDs and sampling decisions are encoded in HTTP headers when calls cross service boundaries.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">resource</code></td>
                <td className="py-3 px-4"><code className="prose-code">Record&lt;string, string&gt;</code></td>
                <td className="py-3 px-4"><code className="prose-code">{'{}'}</code></td>
                <td className="py-3 px-4">Additional resource attributes attached to every span. Use these to describe the deployment context: environment, namespace, host name, cloud region. These attributes enable filtering and grouping in the tracing backend.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">environment</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4"><code className="prose-code">'development'</code></td>
                <td className="py-3 px-4">The deployment environment name, added as a resource attribute. Common values are 'development', 'staging', and 'production'. Tracing backends use this to separate traces from different environments in the same backend instance.</td>
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
          <Link to="/observability/openapi" className="btn-primary">
            OpenAPI Generation <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/observability/metrics" className="btn-secondary">
            Metrics & Monitoring
          </Link>
        </div>
      </section>
    </div>
  );
}
