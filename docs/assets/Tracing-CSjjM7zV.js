import{j as e,C as t,I as s,L as a,A as r}from"./index-BWrueqsD.js";const n=`import { Vexor } from '@vexorjs/core';
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

app.listen(3000);`,o=`import { tracer } from '@vexorjs/core/tracing';
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
});`,i=`import { tracer } from '@vexorjs/core/tracing';

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
//   └── db.insertOrder (client, 18ms)`,c=`import { tracer } from '@vexorjs/core/tracing';
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
});`,d=`import {
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
});`,l=`import { createTracer, OTLPTraceExporter } from '@vexorjs/core/tracing';

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
//       COLLECTOR_OTLP_ENABLED: "true"`;function h(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"tracing",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"Distributed Tracing"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"Distributed tracing is an observability technique that tracks the journey of a single request as it flows through multiple services, databases, caches, and message queues in a distributed system. While metrics tell you that your P99 latency is 500ms, and logs tell you that a specific database query failed, a trace tells you exactly which sequence of operations a specific request went through, how long each step took, and where the bottleneck or failure occurred."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The core abstraction in tracing is the ",e.jsx("strong",{children:"span"}),". A span represents a single unit of work: an HTTP request handler, a database query, a cache lookup, a call to an external API. Each span has a name, a start time, a duration, a status (OK, ERROR, or NOT_FOUND), and optional attributes and events that provide additional context. Spans are organized into a tree structure where each span can have a parent, forming a"," ",e.jsx("strong",{children:"trace"})," -- a directed acyclic graph that represents the complete execution path of a request."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor's tracing module integrates with the OpenTelemetry ecosystem, the industry standard for observability instrumentation. It uses the OpenTelemetry Protocol (OTLP) to export traces to backends like Jaeger, Grafana Tempo, Honeycomb, Datadog, and Zipkin. It supports W3C Trace Context for propagating trace identifiers across service boundaries, configurable sampling strategies to control overhead in production, and a developer-friendly API that handles span lifecycle management automatically."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"This page explains the conceptual model behind distributed tracing, how context propagation works across service boundaries, sampling strategies and their trade-offs, and how to instrument your Vexor application for production-grade observability."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"how-it-works",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"How Distributed Tracing Works"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When a request enters your system, the tracing middleware creates a root span and assigns it a globally unique ",e.jsx("strong",{children:"trace ID"})," (a 128-bit random identifier) and a"," ",e.jsx("strong",{children:"span ID"})," (a 64-bit random identifier). As the request handler creates child spans -- for database queries, cache lookups, or calls to downstream services -- each child span receives its own span ID but inherits the same trace ID. The child also records its parent's span ID, establishing the tree structure. When all spans are collected by the tracing backend, the shared trace ID allows the backend to reconstruct the entire tree and display the request's journey as a waterfall diagram."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{children:"Context propagation"})," is the mechanism that carries trace identity across process boundaries. When Service A calls Service B over HTTP, the trace context (trace ID, parent span ID, and sampling decision) must be transmitted in the request headers so that Service B can create child spans that belong to the same trace. Vexor uses the W3C Trace Context standard, which encodes this information in a"," ",e.jsx("code",{className:"prose-code",children:"traceparent"})," header with the format"," ",e.jsx("code",{className:"prose-code",children:"00-<trace-id>-<span-id>-<flags>"}),". The tracing middleware automatically extracts this header from incoming requests and injects it into outgoing requests, making cross-service tracing work transparently."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Without context propagation, each service would create independent traces. You would see that Service A took 200ms and Service B took 150ms, but you would not know that Service B's 150ms was part of Service A's 200ms request. With propagation, the tracing backend can render a single unified trace that shows the entire request lifecycle across all services, making it immediately obvious where time is spent and where failures originate."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"sampling",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Sampling Strategies"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Tracing every single request in a high-throughput production system is prohibitively expensive. Each span consumes memory in your application, network bandwidth to the tracing backend, and storage in the backend's database. At 10,000 requests per second with an average of 5 spans per request, you would generate 50,000 spans per second -- far more than most tracing backends can ingest and store cost-effectively. Sampling solves this by tracing only a fraction of requests while still providing statistically representative data."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor supports three sampling strategies. ",e.jsx("strong",{children:"Always sampling"})," ","(",e.jsx("code",{className:"prose-code",children:"type: 'always'"}),") traces every request and is appropriate for development and low-traffic staging environments. ",e.jsx("strong",{children:"Never sampling"})," ","(",e.jsx("code",{className:"prose-code",children:"type: 'never'"}),") disables tracing entirely, useful for performance benchmarks. ",e.jsx("strong",{children:"Ratio-based sampling"})," ","(",e.jsx("code",{className:"prose-code",children:"type: 'ratio', ratio: 0.1"}),") traces a random percentage of requests -- a 10% ratio means roughly one in ten requests is traced."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["An important property of sampling is that the decision must be made at the entry point (the first service) and propagated to all downstream services. If Service A decides to trace a request, all downstream services must also trace their portion of that request. Otherwise, you get incomplete traces with missing spans. Vexor's W3C Trace Context propagation includes the sampling decision in the ",e.jsx("code",{className:"prose-code",children:"traceparent"})," header flags, ensuring consistent sampling across the entire request path."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"A 10% sampling ratio is a common starting point for production systems. It provides enough traces to debug most issues while keeping overhead manageable. If you need to investigate a specific problem, most tracing backends support on-demand full sampling through configuration changes that do not require a deployment."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"basic-usage",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Basic Usage"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Setting up tracing in Vexor begins with ",e.jsx("code",{className:"prose-code",children:"createTracer"}),", which accepts a service name, an exporter, and optional configuration. The service name identifies your application in the tracing backend and is attached to every span as a resource attribute. The exporter determines where spans are sent -- to the console during development, or to a production tracing backend via OTLP."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Registering the tracer's middleware with ",e.jsx("code",{className:"prose-code",children:"app.use(tracer.middleware())"})," ","automatically creates a root span for every incoming HTTP request. The span captures the HTTP method, URL, status code, and duration. Any child spans created during the request handler are automatically linked to this root span, building a complete trace tree without any manual parent tracking."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Always call ",e.jsx("code",{className:"prose-code",children:"tracer.shutdown()"})," during graceful shutdown. This flushes any buffered spans to the exporter, ensuring that the last few spans before shutdown are not lost. Without this, spans generated in the final moments of the process may be silently discarded."]}),e.jsx(t,{code:n,filename:"src/app.ts"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"creating-spans",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Creating Spans"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["A span represents a single unit of work within a trace. Vexor provides two APIs for creating spans: ",e.jsx("code",{className:"prose-code",children:"startSpan"})," for manual lifecycle control, and"," ",e.jsx("code",{className:"prose-code",children:"withSpan"})," for automatic lifecycle management. The"," ",e.jsx("code",{className:"prose-code",children:"startSpan"})," method returns a span object that you must explicitly end by calling ",e.jsx("code",{className:"prose-code",children:"span.end()"}),'. If you forget to end a span (for example, due to an early return or unhandled exception), it becomes a "span leak" -- an open span that never completes and may cause memory issues.']}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"withSpan"})," method is the preferred API. It wraps an async callback, automatically starts the span before the callback executes, and ends it when the callback resolves or rejects. If the callback throws, the exception is recorded on the span and the status is set to ERROR before the span is ended. This eliminates an entire class of bugs related to span lifecycle management and produces cleaner, more readable code."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Each span has a ",e.jsx("strong",{children:"kind"})," that describes its role in the request flow:"," ",e.jsx("code",{className:"prose-code",children:"'server'"})," for incoming requests,"," ",e.jsx("code",{className:"prose-code",children:"'client'"})," for outgoing calls to external services or databases, and ",e.jsx("code",{className:"prose-code",children:"'internal'"})," for in-process operations like business logic calculations. Tracing backends use span kinds to render different visual styles and to identify service-to-service dependencies in architecture diagrams."]}),e.jsx(t,{code:o,filename:"src/routes/users.ts"}),e.jsxs(s,{variant:"tip",children:["Prefer ",e.jsx("code",{className:"prose-code",children:"withSpan"})," over ",e.jsx("code",{className:"prose-code",children:"startSpan"}),". It automatically ends the span and records exceptions, reducing boilerplate and preventing span leaks."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"nested-spans",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Nested Spans and Trace Trees"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The power of tracing comes from nested spans that form a tree structure. When you call"," ",e.jsx("code",{className:"prose-code",children:"withSpan"})," inside another ",e.jsx("code",{className:"prose-code",children:"withSpan"})," ",'callback, the inner span automatically becomes a child of the outer span. Vexor manages this parent-child relationship using an async context mechanism (Node.js AsyncLocalStorage) that tracks the "current" span across async operations without requiring you to pass span references explicitly.']}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"In the trace tree, the root span represents the overall request, and child spans represent the individual steps: inventory validation, pricing calculation, payment processing, database writes. The duration of each child span is visible in the trace's waterfall view, making it immediately obvious which step is the bottleneck. In the example below, the payment processing span takes 89ms out of a total 145ms, indicating that the payment service is the dominant contributor to request latency."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Trace trees also reveal ",e.jsx("strong",{children:"sequential vs. parallel"})," execution patterns. If two child spans run concurrently (for example, fetching data from two independent services in parallel), the waterfall view shows them overlapping in time. If they run sequentially, they appear stacked end-to-end. This visibility helps identify opportunities for parallelization: if two independent operations are running sequentially when they could run in parallel, the trace makes this inefficiency visible."]}),e.jsx(t,{code:i,filename:"src/routes/orders.ts"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"attributes-events",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Attributes and Events"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Attributes and events are the mechanisms for enriching spans with contextual information."," ",e.jsx("strong",{children:"Attributes"})," are key-value pairs that describe properties of the span's operation: the user ID, HTTP method, database table name, payment amount. They are set once (or updated) and are associated with the span for its entire duration. Tracing backends index attributes, making them searchable -- you can find all traces where"," ",e.jsx("code",{className:"prose-code",children:"user.id = 42"})," or where"," ",e.jsx("code",{className:"prose-code",children:"http.status_code = 500"}),"."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{children:"Events"}),` are timestamped log entries within a span. They record things that happen at a specific point during the span's execution: "validation passed at T+5ms", "user created at T+20ms", "email queued at T+25ms". Events are useful for understanding the sequence of operations within a span without creating separate child spans for each step. The `,e.jsx("code",{className:"prose-code",children:"recordException"})," method is a special case of an event that captures an error's message, type, and stack trace in a structured format that tracing backends render as error details."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["For maximum compatibility with tracing backends, follow the OpenTelemetry Semantic Conventions for attribute naming. Use dotted namespaces like"," ",e.jsx("code",{className:"prose-code",children:"http.method"}),","," ",e.jsx("code",{className:"prose-code",children:"db.system"}),","," ",e.jsx("code",{className:"prose-code",children:"rpc.service"}),". These standardized names allow tracing backends to provide enhanced visualizations and automatic service maps. Custom attributes for your business domain (like ",e.jsx("code",{className:"prose-code",children:"order.total"})," or"," ",e.jsx("code",{className:"prose-code",children:"user.plan"}),") can use any naming convention, but keeping a consistent namespace helps with discoverability."]}),e.jsx(t,{code:c,filename:"src/routes/users.ts"}),e.jsxs(s,{variant:"info",children:["Follow the"," ",e.jsx("a",{href:"https://opentelemetry.io/docs/specs/semconv/",className:"underline",target:"_blank",rel:"noopener noreferrer",children:"OpenTelemetry Semantic Conventions"})," ","for attribute naming (e.g. ",e.jsx("code",{className:"prose-code",children:"http.method"}),","," ",e.jsx("code",{className:"prose-code",children:"db.system"}),") to ensure compatibility with tracing backends."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"exporters",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Exporters"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["An exporter determines where completed spans are sent. Vexor provides three built-in exporters, each optimized for different environments. The"," ",e.jsx("code",{className:"prose-code",children:"ConsoleTraceExporter"})," prints traces to stdout in a human-readable tree format, making it ideal for development where you want immediate visibility without running a tracing backend. The"," ",e.jsx("code",{className:"prose-code",children:"verbose"})," option includes attribute and event details in the output."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"BatchTraceExporter"})," buffers completed spans in memory and sends them in batches at a configurable interval. This is the right choice when sending to a custom backend that accepts spans over HTTP. Batching amortizes the overhead of network calls across many spans, and the configurable queue size provides backpressure if the backend cannot keep up. If the queue fills up, the oldest spans are dropped to prevent memory growth."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"OTLPTraceExporter"})," sends spans using the OpenTelemetry Protocol (OTLP), the standard wire format supported by Jaeger, Grafana Tempo, Honeycomb, Datadog, and virtually every modern tracing backend. OTLP supports both HTTP and gRPC transports; Vexor uses HTTP by default with optional gzip compression. The OTLP exporter also supports authentication headers, making it straightforward to integrate with hosted tracing services."]}),e.jsx(t,{code:d,filename:"src/tracing.ts"}),e.jsx(s,{variant:"warning",children:"In production, always use sampling to reduce overhead. Tracing 100% of requests generates significant data volume. A 10% sampling ratio is a good starting point."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"otlp-integration",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Production OTLP Integration"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["A production tracing setup requires several additional configuration elements beyond the basic exporter. ",e.jsx("strong",{children:"Resource attributes"})," are key-value pairs attached to every span produced by the tracer. They describe the entity producing the spans -- the service name, version, deployment environment, host name, and cloud region. Tracing backends use resource attributes to group spans by service, build service dependency maps, and filter traces by environment."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"propagator"})," setting controls the format of trace context headers used for cross-service propagation. The W3C Trace Context standard (",e.jsx("code",{className:"prose-code",children:"'w3c-tracecontext'"}),") is the recommended choice because it is an open standard supported by all major tracing backends and frameworks. The"," ",e.jsx("code",{className:"prose-code",children:"traceparent"})," header carries the trace ID, parent span ID, and sampling flags in a compact format. When your service receives a request with a"," ",e.jsx("code",{className:"prose-code",children:"traceparent"})," header, the tracer automatically extracts the context and creates child spans that belong to the upstream trace."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["For outgoing HTTP calls, you need to inject the trace context into request headers. The"," ",e.jsx("code",{className:"prose-code",children:"propagationHeaders()"})," method on the active span returns the appropriate headers to include in outgoing requests. Without this step, downstream services create independent traces rather than child spans of the current trace, breaking the end-to-end visibility that makes distributed tracing valuable."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"For local development, Jaeger's all-in-one Docker image provides a complete tracing backend with a web UI. It accepts OTLP data on port 4318 and serves the trace viewer UI on port 16686. This gives you the full production tracing experience on your local machine without any cloud services or complex infrastructure."}),e.jsx(t,{code:l,filename:"src/tracing.ts"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"best-practices",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Best Practices"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Effective tracing requires intentional instrumentation. These guidelines help you build traces that are useful for debugging and performance analysis."}),e.jsxs("ul",{className:"list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Use withSpan for span lifecycle management."})," It automatically handles span ending and exception recording, preventing span leaks and ensuring complete traces."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Name spans descriptively."}),' Use names that describe the operation, not the implementation. "fetchUserProfile" is better than "dbQuery". "processPayment" is better than "httpPost".']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Set span kinds correctly."})," Server for incoming requests, client for outgoing calls, internal for in-process operations. This enables accurate service dependency maps in your tracing backend."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Propagate context across service boundaries."})," Always include trace context headers in outgoing HTTP requests. Without propagation, you get disconnected traces instead of end-to-end visibility."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Use ratio-based sampling in production."})," Start with 10% and adjust based on your tracing backend's capacity and your debugging needs. Trace 100% only in development and staging."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Follow OpenTelemetry Semantic Conventions."})," Standard attribute names enable backend features like auto-generated service maps and error highlighting."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Record exceptions on spans."})," Use recordException to capture error details with stack traces. This makes error traces immediately useful without cross-referencing log files."]})]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"api-reference",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"API Reference"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Configuration options for ",e.jsx("code",{className:"prose-code",children:"createTracer(options)"}),". The service name and exporter are the minimum required configuration for a functional tracing setup."]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Option"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Type"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Default"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"serviceName"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"The name of your service, attached to every span as a resource attribute. Used by tracing backends to group spans, build service maps, and identify the source of traces. Choose a name that uniquely identifies your service within the system (e.g., 'order-service', 'auth-api')."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"serviceVersion"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"The version of your service, attached as a resource attribute. Enables filtering traces by deployment version, which is invaluable for identifying regressions introduced in specific releases."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"exporter"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"TraceExporter"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"ConsoleTraceExporter"})}),e.jsx("td",{className:"py-3 px-4",children:"The destination for completed spans. Use ConsoleTraceExporter for development (prints to stdout), BatchTraceExporter for custom backends (buffers and batches spans), or OTLPTraceExporter for production (sends via OpenTelemetry Protocol to Jaeger, Tempo, Honeycomb, etc.)."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"sampler"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"SamplerConfig"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:'{ type: "always" }'})}),e.jsx("td",{className:"py-3 px-4",children:"Controls which requests are traced. Set to 'always' for development (trace everything), 'never' for benchmarks (trace nothing), or 'ratio' with a ratio value (e.g., 0.1 for 10%) for production. The sampling decision is propagated to downstream services via the traceparent header."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"propagator"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"'w3c-tracecontext'"})}),e.jsx("td",{className:"py-3 px-4",children:"The context propagation format for cross-service tracing. W3C Trace Context is the recommended standard, supported by all major tracing backends. The propagator determines how trace IDs and sampling decisions are encoded in HTTP headers when calls cross service boundaries."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"resource"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"Record<string, string>"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"{}"})}),e.jsx("td",{className:"py-3 px-4",children:"Additional resource attributes attached to every span. Use these to describe the deployment context: environment, namespace, host name, cloud region. These attributes enable filtering and grouping in the tracing backend."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"environment"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"'development'"})}),e.jsx("td",{className:"py-3 px-4",children:"The deployment environment name, added as a resource attribute. Common values are 'development', 'staging', and 'production'. Tracing backends use this to separate traces from different environments in the same backend instance."})]})]})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(a,{to:"/observability/openapi",className:"btn-primary",children:["OpenAPI Generation ",e.jsx(r,{className:"w-4 h-4 ml-2"})]}),e.jsx(a,{to:"/observability/metrics",className:"btn-secondary",children:"Metrics & Monitoring"})]})]})]})}export{h as default};
