import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { createLogger, logger } from '@vexorjs/core';

// Use the default logger
logger.info('Server started');
logger.warn('Deprecated API called');
logger.error('Failed to connect to database');

// Create a custom logger
const log = createLogger({
  name: 'my-app',
  level: 'info',
  prettyPrint: process.env.NODE_ENV === 'development',
  timestamp: true,
});

log.info('Application initialized');
log.debug('This will not appear (level is info)');

// Structured logging with context
log.info({ userId: 42, action: 'login' }, 'User logged in');
log.error({ err: error, requestId: 'abc-123' }, 'Request failed');`;

const logLevelsCode = `import { createLogger, type LogLevel } from '@vexorjs/core';

const log = createLogger({ level: 'trace' });

// Log levels (ordered by severity)
log.trace('Entering function');          // 10 - most verbose
log.debug('Variable x = 42');            // 20
log.info('User signed up');              // 30 (default level)
log.warn('Rate limit approaching');      // 40
log.error('Database query failed');      // 50
log.fatal('Cannot bind to port 3000');   // 60 - most severe

// Change level at runtime
log.setLevel('warn');
log.info('This will be suppressed');
log.warn('This will appear');

// Get current level
const current: LogLevel = log.getLevel(); // 'warn'

// Silent mode disables all output
log.setLevel('silent');`;

const childLoggersCode = `import { createLogger } from '@vexorjs/core';

const log = createLogger({ name: 'app', level: 'info' });

// Create a child logger with additional context
const dbLog = log.child({ module: 'database' });
dbLog.info('Connected to PostgreSQL');
// Output: {"name":"app","module":"database","msg":"Connected to PostgreSQL",...}

const authLog = log.child({ module: 'auth' });
authLog.warn({ userId: 1 }, 'Invalid password attempt');
// Output: {"name":"app","module":"auth","userId":1,"msg":"Invalid password attempt",...}

// Children can create their own children (context merges)
const queryLog = dbLog.child({ pool: 'primary' });
queryLog.debug('Executing SELECT query');
// Output: {"name":"app","module":"database","pool":"primary","msg":"Executing SELECT query",...}

// Child loggers inherit the parent level but can override it
const verboseLog = log.child({ module: 'debug-helper' });
verboseLog.setLevel('trace');`;

const transportsCode = `import {
  createLogger,
  ConsoleTransport,
  StreamTransport,
  MultiTransport,
} from '@vexorjs/core';
import { createWriteStream } from 'fs';

// Console transport (default)
const devLogger = createLogger({
  transport: new ConsoleTransport({ prettyPrint: true, colorize: true }),
});

// File transport using streams
const fileStream = createWriteStream('/var/log/app.log', { flags: 'a' });
const fileLogger = createLogger({
  transport: new StreamTransport(fileStream),
});

// Multiple transports: log to console AND file simultaneously
const prodLogger = createLogger({
  level: 'info',
  transport: new MultiTransport([
    new ConsoleTransport({ prettyPrint: false }),
    new StreamTransport(fileStream),
  ]),
});

prodLogger.info('This appears in both console and file');

// Custom transport
const customTransport = {
  write(logEntry: Record<string, unknown>) {
    // Send to external service, database, etc.
    fetch('https://logs.example.com/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry),
    });
  },
};

const remoteLogger = createLogger({
  transport: new MultiTransport([
    new ConsoleTransport(),
    customTransport,
  ]),
});`;

const requestLoggingCode = `import { Vexor, createLogger, createRequestLogger } from '@vexorjs/core';

const app = new Vexor();
const log = createLogger({ name: 'http', level: 'info' });

// Automatic request/response logging
app.addHook('onRequest', async (ctx) => {
  const requestStart = Date.now();

  // Create a request-scoped logger with request context
  const reqLog = createRequestLogger(log, {
    requestId: ctx.req.header('x-request-id') || crypto.randomUUID(),
    method: ctx.req.method,
    url: ctx.req.url,
    ip: ctx.req.header('x-forwarded-for') || 'unknown',
  });

  // Attach to context for use in handlers
  ctx.set('log', reqLog);
  ctx.set('requestStart', requestStart);

  reqLog.info('Request received');
});

app.addHook('onSend', async (ctx, response) => {
  const reqLog = ctx.get('log') as ReturnType<typeof createRequestLogger>;
  const start = ctx.get('requestStart') as number;

  reqLog.info({
    statusCode: response.status,
    duration: Date.now() - start,
  }, 'Request completed');

  return response;
});

// Use in route handlers
app.get('/api/users', async (ctx) => {
  const log = ctx.get('log') as ReturnType<typeof createRequestLogger>;
  log.debug('Fetching users from database');

  const users = await db.users.findAll();
  log.info({ count: users.length }, 'Users fetched');

  return ctx.json(users);
});`;

const redactionCode = `import { createLogger } from '@vexorjs/core';

// Automatically redact sensitive fields from log output
const log = createLogger({
  name: 'app',
  level: 'info',
  redact: {
    paths: [
      'password',
      'secret',
      'authorization',
      'creditCard',
      'ssn',
      'user.email',          // Nested paths
      'headers.cookie',
    ],
    censor: '[REDACTED]',    // Default replacement text
  },
  // Built-in serializers for common objects
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: req.headers,    // cookie header will be redacted
    }),
    res: (res) => ({
      statusCode: res.status,
    }),
    err: (err) => ({
      type: err.constructor.name,
      message: err.message,
      stack: err.stack,
    }),
  },
});

// Sensitive fields are automatically replaced
log.info({ user: 'alice', password: 's3cret!' }, 'Login attempt');
// Output: {"user":"alice","password":"[REDACTED]","msg":"Login attempt"}

log.info({ creditCard: '4111-1111-1111-1111' }, 'Payment processed');
// Output: {"creditCard":"[REDACTED]","msg":"Payment processed"}

// Serializers format complex objects
log.info({ req: incomingRequest }, 'Request details');
log.error({ err: new Error('DB timeout') }, 'Operation failed');`;

export default function Logging() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="logging" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Logging
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Logging is the primary observability tool for any server-side application. It provides a persistent record of what your application did, when, and why -- information that is indispensable for debugging production issues, auditing security events, tracking performance regressions, and understanding user behavior. Vexor includes a structured, high-performance logging system designed for the demands of production API services, where you need both machine-readable output for log aggregation pipelines and human-readable output during development.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Unlike traditional string-based logging where messages are plain text, Vexor's logger produces structured JSON output by default. Every log entry is a JSON object containing the message, severity level, timestamp, logger name, and any additional context fields you attach. This structured format is critical for production systems because it allows log aggregation tools (Datadog, Elasticsearch, Splunk, CloudWatch) to index, search, and filter your logs by any field. Instead of parsing free-form text with regex, you can query for all errors from the "auth" module in the last hour, or all requests that took more than 500ms.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's logging architecture is built around three core concepts: loggers, levels, and transports. A <strong>logger</strong> is an instance that exposes methods for each severity level. <strong>Levels</strong> control which messages are emitted and which are suppressed, letting you increase verbosity for debugging without modifying code. <strong>Transports</strong> determine where log output goes -- the console, a file, a remote service, or multiple destinations simultaneously. These three concepts compose cleanly: you create a logger, configure its level and transport, then use child loggers to propagate context through your application.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The logging system also includes built-in support for sensitive data redaction, custom serializers for complex objects, request-scoped loggers that automatically attach request context to every entry, and runtime level adjustment for controlling log volume without restarting your application. Together, these features provide a complete logging solution that works from development through production.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When you call a logging method like <code className="prose-code">log.info(context, message)</code>, the logger first checks whether the message's severity level meets or exceeds the configured minimum level. If the level check fails, the method returns immediately with no work done -- this is why setting an appropriate log level in production is important for performance. There is no string formatting, no serialization, and no I/O for suppressed messages.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          If the level check passes, the logger constructs a log entry object. It merges the base context (set during logger creation), any child logger bindings, the per-call context object, the message string, the severity level (as both a string name and numeric value), and an ISO 8601 timestamp. If redaction paths are configured, the logger walks the entry object and replaces values at matching paths with the censor string before the entry reaches the transport. If serializers are configured, they are applied to matching top-level keys to transform complex objects (like HTTP request or error objects) into clean, serializable representations.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The fully assembled and sanitized entry is then passed to the transport's <code className="prose-code">write</code> method. The <code className="prose-code">ConsoleTransport</code> serializes it to JSON (or pretty-prints it with colors in development mode) and writes to <code className="prose-code">stdout</code> or <code className="prose-code">stderr</code>. The <code className="prose-code">StreamTransport</code> serializes to JSON and writes to a Node.js writable stream. The <code className="prose-code">MultiTransport</code> fans the entry out to multiple underlying transports, allowing you to simultaneously write to the console and a file, or to a local file and a remote log aggregation service.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Child loggers are lightweight wrappers that share the parent's transport and configuration but prepend additional context fields. When you create a child logger with <code className="prose-code">log.child({'{ module: "auth" }'})</code>, the child does not clone the parent's internal state. Instead, it holds a reference to the parent and a shallow bindings object. On each log call, the child merges its bindings into the entry before delegating to the parent's transport. This makes creating child loggers essentially free, which is important because the recommended pattern is to create one per request.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor provides a default <code className="prose-code">logger</code> singleton that you can import and use immediately with no configuration. For most applications, you will want to create a custom logger with <code className="prose-code">createLogger</code> to set the application name, configure the appropriate log level for your environment, and enable or disable pretty-printing.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every logging method accepts two calling conventions. You can pass just a message string (<code className="prose-code">log.info('Server started')</code>) for simple messages, or you can pass a context object followed by a message string (<code className="prose-code">log.info({'{ userId: 42 }'}, 'Login successful')</code>) to attach structured data to the log entry. The context object's properties are merged into the top level of the JSON output, making them directly queryable in log aggregation systems.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">prettyPrint</code> option controls output formatting. When enabled, log entries are formatted with colors, indentation, and human-readable timestamps -- ideal for reading in a terminal during development. When disabled (the default), output is single-line JSON suitable for machine consumption. A common pattern is to toggle this based on the <code className="prose-code">NODE_ENV</code> environment variable, as shown in the example below.
        </p>
        <CodeBlock code={basicUsageCode} filename="app.ts" showLineNumbers />
      </section>

      {/* Log Levels */}
      <section>
        <h2 id="log-levels" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Log Levels
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Log levels form a severity hierarchy that controls which messages are emitted and which are suppressed. Vexor supports six standard levels, each assigned a numeric value: <code className="prose-code">trace</code> (10), <code className="prose-code">debug</code> (20), <code className="prose-code">info</code> (30), <code className="prose-code">warn</code> (40), <code className="prose-code">error</code> (50), and <code className="prose-code">fatal</code> (60). When you set a logger's level, only messages at that level or above are output. Setting the level to <code className="prose-code">info</code> (the default) means <code className="prose-code">trace</code> and <code className="prose-code">debug</code> calls are silently discarded.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Choosing the right level for each message is important for maintaining a useful signal-to-noise ratio. <code className="prose-code">trace</code> is for extremely detailed diagnostic output, such as entering and exiting functions or individual loop iterations -- useful for hunting down specific bugs but far too verbose for normal operation. <code className="prose-code">debug</code> is for information that is helpful during development, such as variable values, cache states, or decision branches. <code className="prose-code">info</code> is for normal operational events that you want to see in production: server startup, request handling summaries, scheduled job completions. <code className="prose-code">warn</code> signals a potential problem that is not yet an error, like approaching a rate limit or using a deprecated API. <code className="prose-code">error</code> indicates a definite failure that affected a specific operation. <code className="prose-code">fatal</code> is reserved for unrecoverable situations that require the process to exit.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A powerful feature of Vexor's logger is runtime level adjustment with <code className="prose-code">setLevel</code>. In production, you typically run at <code className="prose-code">info</code> or <code className="prose-code">warn</code> to keep log volume manageable. When investigating an issue, you can temporarily lower the level to <code className="prose-code">debug</code> or <code className="prose-code">trace</code> without restarting the process, capture the diagnostic output you need, then raise the level back. This is especially useful when paired with an admin endpoint that lets you adjust log levels via an HTTP request.
        </p>
        <CodeBlock code={logLevelsCode} filename="levels.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Use <code className="prose-code">trace</code> and <code className="prose-code">debug</code> during
          development, <code className="prose-code">info</code> in production, and
          dynamically raise to <code className="prose-code">warn</code> or <code className="prose-code">error</code> to
          reduce log volume under load. A good rule of thumb: if you would not want to see a message on every request in production, it should be <code className="prose-code">debug</code> or lower.
        </InfoBlock>
      </section>

      {/* Child Loggers */}
      <section>
        <h2 id="child-loggers" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Child Loggers
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Child loggers are one of the most important features for organizing log output in a complex application. A child logger inherits all of its parent's configuration -- level, transport, redaction rules, serializers -- but adds additional context fields (called "bindings") that are automatically included in every log entry it produces. This lets you create a hierarchy of loggers where each level adds more specific context, without repeating that context in every log call.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The most common pattern is to create child loggers for each module or subsystem of your application. A database module gets a logger with <code className="prose-code">{'{ module: "database" }'}</code>, an authentication module gets <code className="prose-code">{'{ module: "auth" }'}</code>, and so on. When you read logs in production, the <code className="prose-code">module</code> field immediately tells you which part of the application generated each entry, making it trivial to filter logs from a specific subsystem during investigation.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Child loggers can create their own children, forming a tree. Context fields merge at each level, so a child of the database logger with <code className="prose-code">{'{ pool: "primary" }'}</code> produces entries containing both <code className="prose-code">module: "database"</code> and <code className="prose-code">pool: "primary"</code>. This composability is particularly valuable for request-scoped logging, where you start with a request logger (containing the request ID, method, and URL) and pass it through your middleware and handlers, each potentially adding more context via additional child loggers.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Child loggers are extremely lightweight -- they do not copy the parent's internal state or allocate new transports. They simply hold a reference to the parent and a small bindings object. This means you can freely create child loggers per request, per database query, or per loop iteration without worrying about memory or performance overhead. The recommendation is to prefer creating child loggers over passing context objects on every log call, as it makes your logging code cleaner and ensures context is never accidentally omitted.
        </p>
        <CodeBlock code={childLoggersCode} filename="child-loggers.ts" showLineNumbers />
        <InfoBlock variant="info">
          Child loggers are lightweight. They share the parent transport and only add a thin
          context wrapper, so creating many children has minimal overhead. Create them freely for requests, modules, and subsystems.
        </InfoBlock>
      </section>

      {/* Transports */}
      <section>
        <h2 id="transports" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Transports
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Transports are the output layer of the logging system -- they determine where your log entries end up. Vexor ships with three built-in transports and supports custom transports via a simple interface. The transport abstraction decouples log generation from log delivery, so your application code does not need to know or care whether logs are going to the console, a file, a remote service, or all three simultaneously.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">ConsoleTransport</code> writes to <code className="prose-code">stdout</code> (for levels below <code className="prose-code">error</code>) and <code className="prose-code">stderr</code> (for <code className="prose-code">error</code> and <code className="prose-code">fatal</code>). It supports pretty-printing with colors for development, and compact single-line JSON for production. The <code className="prose-code">StreamTransport</code> writes JSON-serialized entries to any Node.js writable stream, which is typically a file stream but could also be a network socket, a compression stream, or any other writable. The <code className="prose-code">MultiTransport</code> wraps an array of transports and fans each log entry out to all of them, allowing you to write to multiple destinations without duplicating log calls in your application code.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For production deployments, the most common setup is a <code className="prose-code">MultiTransport</code> that writes to both the console (for container log collection via <code className="prose-code">stdout</code>) and a file (for local persistence and rotation). For cloud-native deployments using container orchestrators like Kubernetes, writing to <code className="prose-code">stdout</code> alone is often sufficient because the orchestrator captures and forwards container output to the central logging system.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Creating a custom transport is straightforward. Any object with a <code className="prose-code">write(entry)</code> method can serve as a transport. The entry parameter is a plain JavaScript object containing all the log fields. You can use this to send logs directly to an external service, a database, a message queue, or any other destination. For production custom transports, consider implementing buffering and retry logic to handle temporary network failures without dropping log entries.
        </p>
        <CodeBlock code={transportsCode} filename="transports.ts" showLineNumbers />
        <InfoBlock variant="warning">
          File-based transports write synchronously to the stream. In high-throughput scenarios,
          consider using an asynchronous transport or buffered stream to avoid blocking the event loop. For most applications, writing to <code className="prose-code">stdout</code> and letting the container runtime handle log collection is both simpler and more performant.
        </InfoBlock>
      </section>

      {/* Request Logging */}
      <section>
        <h2 id="request-logging" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Request Logging
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In an HTTP API, the most important logs are those associated with individual requests. Knowing the request ID, HTTP method, URL, client IP, response status, and duration for every request is essential for debugging production issues, identifying slow endpoints, and auditing access patterns. Vexor's <code className="prose-code">createRequestLogger</code> helper creates a child logger pre-loaded with these request-scoped fields, so every log entry within the request lifecycle automatically includes the full request context.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The recommended pattern is to create a request logger in the <code className="prose-code">onRequest</code> hook, attach it to the request context, and log the request completion in the <code className="prose-code">onSend</code> hook. Route handlers and middleware can then retrieve the logger from the context and use it to log application-level events. Because the logger carries the request ID automatically, you can correlate all log entries for a single request across all services in a distributed system -- a technique known as distributed tracing.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The request logger records the start time in the <code className="prose-code">onRequest</code> hook and computes the total duration in the <code className="prose-code">onSend</code> hook, giving you accurate latency measurements for every request. Combined with the status code, this data lets you identify slow endpoints, track error rates, and detect performance regressions over time. For production systems, consider exporting these metrics to a time-series database for dashboarding and alerting.
        </p>
        <CodeBlock code={requestLoggingCode} filename="request-logging.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Always generate a request ID (using <code className="prose-code">crypto.randomUUID()</code> or the incoming <code className="prose-code">x-request-id</code> header) and include it in every log entry. This is the single most important practice for debugging production issues, as it lets you trace a single request's journey through your entire system. Return the request ID in the response headers so clients can reference it in bug reports.
        </InfoBlock>
      </section>

      {/* Redaction */}
      <section>
        <h2 id="redaction" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Redaction and Serializers
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Logging sensitive data is one of the most common security mistakes in production applications. Passwords, API keys, credit card numbers, session tokens, and personally identifiable information (PII) can all end up in log output if developers are not careful about what they pass to the logger. Once sensitive data is in your logs, it may be stored for weeks or months in log aggregation systems, visible to anyone with log access, and potentially subject to compliance violations (GDPR, PCI-DSS, HIPAA).
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's redaction system provides a safety net by automatically censoring specified fields before they reach the transport. You configure a list of field paths (including support for nested paths like <code className="prose-code">user.email</code> or <code className="prose-code">headers.cookie</code>), and the logger replaces the values at those paths with a censor string (defaulting to <code className="prose-code">[REDACTED]</code>) on every log call. This happens in-place on the log entry object before serialization, so the sensitive data never reaches the transport layer or the output destination.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Serializers complement redaction by transforming complex objects into clean, loggable representations. When you log an HTTP request object directly, it may contain circular references, large buffers, or unnecessary internal properties that produce noisy or broken JSON output. A serializer for the <code className="prose-code">req</code> key extracts just the fields you care about (method, URL, selected headers) and returns a clean object. Similarly, an error serializer can extract the error type, message, and stack trace into a standardized format. Serializers run before redaction, so redacted fields in serialized output are still censored.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The combination of redaction and serializers means you can log rich context objects without worrying about accidentally exposing secrets or producing malformed output. Configure redaction paths once at the application level, and every logger (including all child loggers) inherits the configuration automatically.
        </p>
        <CodeBlock code={redactionCode} filename="redaction.ts" showLineNumbers />
        <InfoBlock variant="warning">
          Always configure redaction in production. Logging unredacted passwords, tokens, or PII
          can create serious security and compliance issues. Audit your redaction paths regularly -- as your API evolves, new sensitive fields may be introduced that need to be added to the redaction list.
        </InfoBlock>
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use structured logging consistently.</strong> Always pass context data as an object rather than interpolating values into message strings. Writing <code className="prose-code">log.info({'{ userId: 42 }'}, 'Login successful')</code> produces a <code className="prose-code">userId</code> field that log aggregation tools can index and query. Writing <code className="prose-code">log.info('User 42 logged in')</code> buries the user ID in free-form text that requires regex parsing to extract.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Create child loggers per module and per request.</strong> Module-level child loggers add a <code className="prose-code">module</code> field that makes filtering straightforward. Request-level child loggers add the request ID, method, and URL. Together, they let you filter to "all database logs for request abc-123" in a single query. The overhead of creating child loggers is negligible compared to the diagnostic value they provide.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Log at the right level.</strong> Over-logging at <code className="prose-code">info</code> creates noise and increases log storage costs. Under-logging means missing critical diagnostic data when you need it most. A practical guideline: if you would want to see the message on every single request in production, use <code className="prose-code">info</code>. If it is only useful when debugging a specific issue, use <code className="prose-code">debug</code>. If it indicates something is wrong, use <code className="prose-code">warn</code> or <code className="prose-code">error</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Include error objects in error logs.</strong> When logging errors, always include the full error object: <code className="prose-code">log.error({'{ err: error }'}, 'Operation failed')</code>. With an error serializer configured, this captures the error type, message, and stack trace in structured fields. Without the error object, you lose the stack trace, making it much harder to locate the source of the failure.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          <strong>Use <code className="prose-code">flush()</code> before process exit.</strong> Transports may buffer log entries internally. If your process crashes or exits without flushing, the most recent (and often most important) log entries could be lost. Call <code className="prose-code">log.flush()</code> in your graceful shutdown handler and in unhandled exception/rejection handlers to ensure all buffered entries are written.
        </p>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          <code className="prose-code">createLogger(options)</code>
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Creates a new logger instance with the specified configuration. The returned logger exposes methods for each severity level, as well as utilities for creating child loggers, changing the level at runtime, and flushing buffered output.
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
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">level</code></td>
                <td className="py-3 px-4"><code className="prose-code">LogLevel</code></td>
                <td className="py-3 px-4"><code className="prose-code">'info'</code></td>
                <td className="py-3 px-4">The minimum severity level for log output. Messages below this level are silently discarded with no performance overhead. Valid values are <code className="prose-code">'trace'</code>, <code className="prose-code">'debug'</code>, <code className="prose-code">'info'</code>, <code className="prose-code">'warn'</code>, <code className="prose-code">'error'</code>, <code className="prose-code">'fatal'</code>, and <code className="prose-code">'silent'</code> (which disables all output). Can be changed at runtime with <code className="prose-code">setLevel()</code>.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">name</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4"><code className="prose-code">undefined</code></td>
                <td className="py-3 px-4">A human-readable name for the logger, included as the <code className="prose-code">name</code> field in every log entry. Typically set to the application name or service name. Useful for distinguishing logs when multiple services write to the same log aggregation system.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">base</code></td>
                <td className="py-3 px-4"><code className="prose-code">Record&lt;string, unknown&gt;</code></td>
                <td className="py-3 px-4"><code className="prose-code">{'{}'}</code></td>
                <td className="py-3 px-4">A set of key-value pairs that are automatically merged into every log entry produced by this logger and all of its children. Use this for global context like the application version, deployment environment, or hostname.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">transport</code></td>
                <td className="py-3 px-4"><code className="prose-code">Transport</code></td>
                <td className="py-3 px-4"><code className="prose-code">ConsoleTransport</code></td>
                <td className="py-3 px-4">The transport instance responsible for delivering log entries to their destination. Pass a <code className="prose-code">ConsoleTransport</code> for terminal output, a <code className="prose-code">StreamTransport</code> for file output, a <code className="prose-code">MultiTransport</code> to write to multiple destinations, or any object implementing the <code className="prose-code">write(entry)</code> method for custom delivery.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">timestamp</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4"><code className="prose-code">true</code></td>
                <td className="py-3 px-4">Whether to include an ISO 8601 timestamp in every log entry. Disabling this is uncommon but may be useful when your transport or log aggregation system adds its own timestamps and you want to avoid duplication.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">prettyPrint</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4"><code className="prose-code">false</code></td>
                <td className="py-3 px-4">Enables human-readable formatted output with indentation, colors, and readable timestamps instead of compact single-line JSON. Intended for local development only -- do not enable in production, as pretty-printed output is significantly larger and harder for machines to parse.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">redact</code></td>
                <td className="py-3 px-4"><code className="prose-code">RedactOptions</code></td>
                <td className="py-3 px-4"><code className="prose-code">undefined</code></td>
                <td className="py-3 px-4">Configuration for automatic sensitive data redaction. The <code className="prose-code">paths</code> array lists dot-notation field paths to censor (e.g., <code className="prose-code">'password'</code>, <code className="prose-code">'user.email'</code>). The <code className="prose-code">censor</code> string (default <code className="prose-code">'[REDACTED]'</code>) is the replacement value. Redaction is applied to every log entry before it reaches the transport, ensuring sensitive data never appears in log output.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">serializers</code></td>
                <td className="py-3 px-4"><code className="prose-code">Record&lt;string, (val: any) =&gt; any&gt;</code></td>
                <td className="py-3 px-4"><code className="prose-code">undefined</code></td>
                <td className="py-3 px-4">Custom functions that transform specific top-level fields in the log context before serialization. When a log entry contains a key matching a serializer name, the serializer function is called with the raw value and its return value replaces the original. Common serializers include <code className="prose-code">req</code> (HTTP request), <code className="prose-code">res</code> (HTTP response), and <code className="prose-code">err</code> (Error objects).</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Logger Instance Methods
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          All logging methods accept either a message string, or a context object followed by a message string. The context object's fields are merged into the log entry.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Method</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">trace</code></td>
                <td className="py-3 px-4"><code className="prose-code">trace(obj?, msg?, ...args): void</code></td>
                <td className="py-3 px-4">Log at trace level (10). The most verbose level, intended for extremely detailed diagnostic output such as function entry/exit, loop iterations, or raw data dumps. Typically suppressed in all environments except when actively debugging a specific issue.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">debug</code></td>
                <td className="py-3 px-4"><code className="prose-code">debug(obj?, msg?, ...args): void</code></td>
                <td className="py-3 px-4">Log at debug level (20). For information useful during development and debugging, such as variable values, decision branches, or cache states. Suppressed in production by default but can be enabled at runtime for targeted troubleshooting.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">info</code></td>
                <td className="py-3 px-4"><code className="prose-code">info(obj?, msg?, ...args): void</code></td>
                <td className="py-3 px-4">Log at info level (30). The default production level. Use for normal operational events: server startup, request summaries, job completions, and significant state changes. Every <code className="prose-code">info</code> message should provide value when reviewing production logs.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">warn</code></td>
                <td className="py-3 px-4"><code className="prose-code">warn(obj?, msg?, ...args): void</code></td>
                <td className="py-3 px-4">Log at warn level (40). Signals a potential issue that is not yet a failure: approaching resource limits, deprecated API usage, fallback behavior activated, or unexpected but recoverable conditions. Warnings should be investigated but do not necessarily require immediate action.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">error</code></td>
                <td className="py-3 px-4"><code className="prose-code">error(obj?, msg?, ...args): void</code></td>
                <td className="py-3 px-4">Log at error level (50). Indicates a definite failure that affected a specific operation, such as a failed database query, an unhandled exception in a request handler, or a failed external API call. Include the error object in the context for full stack trace capture.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">fatal</code></td>
                <td className="py-3 px-4"><code className="prose-code">fatal(obj?, msg?, ...args): void</code></td>
                <td className="py-3 px-4">Log at fatal level (60). Reserved for unrecoverable errors that require the process to exit: inability to bind to a port, corrupted critical data, or exhausted essential resources. After logging a fatal message, the application should typically initiate a graceful shutdown.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">child</code></td>
                <td className="py-3 px-4"><code className="prose-code">child(bindings: Record&lt;string, unknown&gt;): Logger</code></td>
                <td className="py-3 px-4">Creates a new child logger that inherits the parent's configuration (level, transport, redaction, serializers) and merges the provided bindings into every log entry it produces. Child loggers are lightweight and share the parent's transport instance. Use them to add persistent context like module name, request ID, or user ID.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">setLevel</code></td>
                <td className="py-3 px-4"><code className="prose-code">setLevel(level: LogLevel): void</code></td>
                <td className="py-3 px-4">Changes the minimum log level at runtime without restarting the process. This affects only this logger instance (not the parent or siblings). Useful for temporarily increasing verbosity to diagnose a production issue, then restoring the original level afterward.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getLevel</code></td>
                <td className="py-3 px-4"><code className="prose-code">getLevel(): LogLevel</code></td>
                <td className="py-3 px-4">Returns the current minimum log level for this logger instance as a string (e.g., <code className="prose-code">'info'</code>, <code className="prose-code">'warn'</code>). Useful for conditional logic or admin endpoints that report the current logging configuration.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">flush</code></td>
                <td className="py-3 px-4"><code className="prose-code">flush(): Promise&lt;void&gt;</code></td>
                <td className="py-3 px-4">Flushes any buffered log entries to the underlying transport. Some transports buffer entries for performance; call this method during graceful shutdown, in error handlers, or before process exit to ensure no log entries are lost. The returned Promise resolves when all buffered entries have been written.</td>
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
          <Link to="/infrastructure/dependency-injection" className="btn-primary">
            Dependency Injection <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/infrastructure/caching" className="btn-secondary">
            Caching
          </Link>
        </div>
      </section>
    </div>
  );
}
