import{j as e,C as r,I as t,L as s,A as a}from"./index-BWrueqsD.js";const o=`import { Vexor } from '@vexorjs/core';

const app = new Vexor();

// The onError hook catches ALL unhandled errors from route
// handlers, middleware, and hooks. It is your last line of
// defense before the error reaches the client.
app.addHook('onError', async (ctx, error) => {
  // Generate a unique request ID for tracing
  const requestId = ctx.get('requestId') || crypto.randomUUID();

  // Log with structured context
  console.error({
    requestId,
    error: error.message,
    stack: error.stack,
    method: ctx.req.method,
    path: ctx.req.path,
    ip: ctx.req.ip,
    userAgent: ctx.req.header('user-agent'),
    timestamp: new Date().toISOString(),
  });

  // Determine the status code
  const statusCode = error.statusCode || error.status || 500;

  // Send a safe error response
  return ctx.status(statusCode).json({
    error: error.code || 'INTERNAL_ERROR',
    message: error.expose ? error.message : 'An unexpected error occurred',
    requestId,
  });
});

app.get('/api/data', async (ctx) => {
  // Any thrown error is caught by onError
  const data = await fetchUnreliableService();
  return ctx.json(data);
});`,n=`import { HttpError } from '@vexorjs/core';

// Vexor provides a base HttpError class you can extend
// These errors carry status codes and are automatically
// handled by the onError hook.

class BadRequestError extends HttpError {
  constructor(message = 'Bad Request', public details?: unknown) {
    super(400, message);
    this.code = 'BAD_REQUEST';
    this.expose = true; // Safe to show message to client
  }
}

class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(401, message);
    this.code = 'UNAUTHORIZED';
    this.expose = true;
  }
}

class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(403, message);
    this.code = 'FORBIDDEN';
    this.expose = true;
  }
}

class NotFoundError extends HttpError {
  constructor(resource = 'Resource') {
    super(404, \`\${resource} not found\`);
    this.code = 'NOT_FOUND';
    this.expose = true;
  }
}

class ConflictError extends HttpError {
  constructor(message = 'Resource already exists') {
    super(409, message);
    this.code = 'CONFLICT';
    this.expose = true;
  }
}

class RateLimitError extends HttpError {
  constructor(public retryAfter: number) {
    super(429, 'Too many requests');
    this.code = 'RATE_LIMITED';
    this.expose = true;
  }
}

class ServiceUnavailableError extends HttpError {
  constructor(service: string) {
    super(503, \`\${service} is temporarily unavailable\`);
    this.code = 'SERVICE_UNAVAILABLE';
    this.expose = true;
  }
}

// Use in handlers - clean and readable
app.get('/users/:id', async (ctx) => {
  const user = await db.findUser(ctx.params.id);
  if (!user) throw new NotFoundError('User');
  return ctx.json(user);
});

app.post('/users', async (ctx) => {
  const body = await ctx.req.json();
  const existing = await db.findUserByEmail(body.email);
  if (existing) throw new ConflictError('A user with this email already exists');
  const user = await db.createUser(body);
  return ctx.status(201).json(user);
});`,i=`import { HttpError } from '@vexorjs/core';

// The onError hook can differentiate between known HTTP errors
// and unexpected internal errors, providing appropriate responses
app.addHook('onError', async (ctx, error) => {
  const requestId = ctx.get('requestId') || crypto.randomUUID();

  // Known HTTP errors (thrown intentionally)
  if (error instanceof HttpError) {
    const response: Record<string, unknown> = {
      error: error.code || \`HTTP_\${error.statusCode}\`,
      message: error.message,
      requestId,
    };

    // Include extra details if the error provides them
    if (error.details) response.details = error.details;
    if (error.retryAfter) {
      ctx.header('Retry-After', String(error.retryAfter));
    }

    return ctx.status(error.statusCode).json(response);
  }

  // Database errors
  if (error.code === '23505') {
    return ctx.status(409).json({
      error: 'CONFLICT',
      message: 'A resource with this identifier already exists',
      requestId,
    });
  }

  if (error.code === '23503') {
    return ctx.status(400).json({
      error: 'REFERENCE_ERROR',
      message: 'Referenced resource does not exist',
      requestId,
    });
  }

  // Timeout errors
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return ctx.status(504).json({
      error: 'GATEWAY_TIMEOUT',
      message: 'The upstream service did not respond in time',
      requestId,
    });
  }

  // Unknown errors - log and return generic message
  console.error('Unhandled error:', { requestId, error });

  return ctx.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    requestId,
  });
});`,l=`import { Vexor, schema } from '@vexorjs/core';

const app = new Vexor();

// Vexor's built-in validation throws structured errors
// when request data doesn't match the schema
app.post('/users', {
  schema: {
    body: schema.object({
      name: schema.string().min(2).max(100),
      email: schema.string().email(),
      password: schema.string().min(8).max(128),
      age: schema.number().int().min(13).max(150).optional(),
    }),
  },
}, async (ctx) => {
  // If we reach here, ctx.body is fully validated
  const user = await db.createUser(ctx.body);
  return ctx.status(201).json(user);
});

// Handle validation errors with detailed field-level messages
app.addHook('onError', async (ctx, error) => {
  if (error.name === 'ValidationError') {
    return ctx.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: error.issues.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
        expected: issue.expected,
        received: issue.received,
      })),
    });
  }

  // ... handle other errors
  throw error;
});

// Custom validation in handlers
app.put('/users/:id/role', async (ctx) => {
  const { role } = await ctx.req.json();
  const validRoles = ['admin', 'editor', 'viewer'];

  if (!validRoles.includes(role)) {
    throw new BadRequestError('Invalid role', {
      field: 'role',
      message: \`Role must be one of: \${validRoles.join(', ')}\`,
      received: role,
    });
  }

  const user = await db.updateUserRole(ctx.params.id, role);
  return ctx.json(user);
});`,d=`import { Vexor } from '@vexorjs/core';

const app = new Vexor();

// Register all your routes first
app.get('/api/users', listUsers);
app.get('/api/users/:id', getUser);
app.post('/api/users', createUser);

// Then add a catch-all route for 404s
// This MUST be registered after all other routes
app.all('*', (ctx) => {
  return ctx.status(404).json({
    error: 'NOT_FOUND',
    message: \`Route \${ctx.req.method} \${ctx.req.path} not found\`,
    availableRoutes: '/api/users, /api/users/:id',
  });
});

// For API versioning, provide helpful messages
app.all('/api/v1/*', (ctx) => {
  return ctx.status(410).json({
    error: 'GONE',
    message: 'API v1 has been deprecated. Please use /api/v2/',
    migration: 'https://docs.example.com/migration-guide',
  });
});

// Custom 404 for missing resources within valid routes
app.get('/api/users/:id', async (ctx) => {
  const user = await db.findUser(ctx.params.id);

  if (!user) {
    return ctx.status(404).json({
      error: 'NOT_FOUND',
      message: \`User with ID \${ctx.params.id} not found\`,
      resource: 'User',
      id: ctx.params.id,
    });
  }

  return ctx.json(user);
});`,c=`import { Vexor } from '@vexorjs/core';

const app = new Vexor();
const isDev = process.env.NODE_ENV === 'development';

// In production, NEVER expose stack traces, internal paths,
// or implementation details. In development, include everything
// to make debugging easier.
app.addHook('onError', async (ctx, error) => {
  const requestId = ctx.get('requestId') || crypto.randomUUID();
  const statusCode = error.statusCode || 500;

  // Always log the full error internally
  console.error({
    requestId,
    statusCode,
    error: error.message,
    stack: error.stack,
    method: ctx.req.method,
    path: ctx.req.path,
    body: ctx.req.method !== 'GET' ? await ctx.req.text() : undefined,
    headers: Object.fromEntries(ctx.req.raw.headers),
    timestamp: new Date().toISOString(),
  });

  // Development: verbose errors for debugging
  if (isDev) {
    return ctx.status(statusCode).json({
      error: error.code || error.name || 'Error',
      message: error.message,
      stack: error.stack?.split('\\n'),
      requestId,
      context: {
        method: ctx.req.method,
        path: ctx.req.path,
        params: ctx.req.param(),
        query: ctx.req.query(),
      },
    });
  }

  // Production: safe, minimal response
  const isClientError = statusCode >= 400 && statusCode < 500;

  return ctx.status(statusCode).json({
    error: error.code || (isClientError ? 'CLIENT_ERROR' : 'INTERNAL_ERROR'),
    message: error.expose
      ? error.message
      : isClientError
        ? error.message
        : 'An unexpected error occurred',
    requestId,
  });
});`,h=`import { Vexor } from '@vexorjs/core';

const app = new Vexor();

// Structured error logging for monitoring services
// Works with Datadog, Sentry, Pino, Winston, etc.

// Example with a logging service
interface Logger {
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

function createErrorHandler(logger: Logger) {
  return async (ctx: any, error: any) => {
    const requestId = ctx.get('requestId') || crypto.randomUUID();
    const statusCode = error.statusCode || 500;

    const meta = {
      requestId,
      statusCode,
      method: ctx.req.method,
      path: ctx.req.path,
      ip: ctx.req.ip,
      userAgent: ctx.req.header('user-agent'),
      userId: ctx.get('user')?.id,
      duration: Date.now() - ctx.get('startTime'),
    };

    if (statusCode >= 500) {
      // Server errors: log as error with full stack
      logger.error(error.message, {
        ...meta,
        stack: error.stack,
        name: error.name,
      });
    } else if (statusCode >= 400) {
      // Client errors: log as warning
      logger.warn(error.message, meta);
    }

    return ctx.status(statusCode).json({
      error: error.code || 'ERROR',
      message: error.expose ? error.message : 'An error occurred',
      requestId,
    });
  };
}

// Sentry integration example
import * as Sentry from '@sentry/node';

app.addHook('onError', async (ctx, error) => {
  const statusCode = error.statusCode || 500;

  // Only report server errors to Sentry
  if (statusCode >= 500) {
    Sentry.captureException(error, {
      tags: {
        method: ctx.req.method,
        path: ctx.req.path,
      },
      user: {
        id: ctx.get('user')?.id,
        ip_address: ctx.req.ip,
      },
      extra: {
        requestId: ctx.get('requestId'),
        query: ctx.req.query(),
        params: ctx.req.param(),
      },
    });
  }

  return ctx.status(statusCode).json({
    error: error.code || 'INTERNAL_ERROR',
    message: statusCode >= 500
      ? 'An unexpected error occurred'
      : error.message,
    requestId: ctx.get('requestId'),
  });
});

// Add request timing for error reports
app.addHook('onRequest', async (ctx) => {
  ctx.set('startTime', Date.now());
  ctx.set('requestId', crypto.randomUUID());
});`,u=`import { Vexor } from '@vexorjs/core';

const app = new Vexor();

// Vexor automatically catches async errors.
// You do NOT need try/catch in your handlers unless
// you want to transform the error.
app.get('/api/data', async (ctx) => {
  // This error is caught automatically by onError
  const data = await fetchExternalService();
  return ctx.json(data);
});

// Use try/catch only when you need error transformation
app.get('/api/enriched', async (ctx) => {
  try {
    const [users, stats] = await Promise.all([
      fetchUsers(),
      fetchStats(),
    ]);
    return ctx.json({ users, stats });
  } catch (error) {
    // Transform timeout errors into a friendlier response
    if (error.message?.includes('timeout')) {
      return ctx.status(504).json({
        error: 'UPSTREAM_TIMEOUT',
        message: 'Data source took too long to respond',
      });
    }

    // Partial failure: return what we can
    if (error.message?.includes('stats')) {
      const users = await fetchUsers();
      return ctx.json({
        users,
        stats: null,
        warning: 'Statistics are temporarily unavailable',
      });
    }

    // Unknown error: re-throw for global handler
    throw error;
  }
});

// Errors in middleware and hooks are also caught
app.addHook('onRequest', async (ctx) => {
  const token = ctx.req.header('authorization')?.split(' ')[1];
  if (token) {
    try {
      const user = await verifyToken(token);
      ctx.set('user', user);
    } catch {
      // Invalid token: throw HttpError
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
});`;function p(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"error-handling",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"Error Handling"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"Build resilient APIs with structured error handling. Vexor automatically catches async errors, provides an extensible error class hierarchy, and gives you full control over how errors are logged, formatted, and sent to clients in both development and production."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Error handling in an API framework serves two distinct purposes that are often conflated. The first purpose is protecting the client: ensuring that every error, regardless of where it occurs, results in a well-formed HTTP response with an appropriate status code, a machine-readable error code, and a message that helps the caller understand what went wrong -- without leaking internal implementation details. The second purpose is protecting the operator: ensuring that every error is logged with enough context (request ID, path, method, stack trace, user identity) to diagnose and fix the underlying issue. A good error handling architecture addresses both purposes through a single, composable mechanism."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor's approach is built on three pillars. First, automatic error boundaries: every route handler, middleware function, and hook is wrapped in a try/catch that prevents unhandled exceptions from crashing the process or producing malformed responses. Second, a typed error hierarchy: the ",e.jsx("code",{className:"prose-code",children:"HttpError"})," base class and its subclasses allow you to throw semantically rich errors (like ",e.jsx("code",{className:"prose-code",children:"NotFoundError"})," or",e.jsx("code",{className:"prose-code",children:" RateLimitError"}),") that carry a status code, a machine-readable code, and a flag indicating whether the message is safe to expose to clients. Third, the ",e.jsx("code",{className:"prose-code",children:"onError"})," hook: a centralized error handler that receives every unhandled error along with the request context, giving you a single place to log, transform, and format error responses."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:["This architecture means your route handlers can focus on the happy path. Instead of wrapping every database call in try/catch and manually constructing error responses, you throw typed errors and let the global handler format the response consistently. When a new error type is needed, you add a subclass of ",e.jsx("code",{className:"prose-code",children:"HttpError"})," and the global handler knows how to render it. When you need to change your error response format (adding a field, changing the structure), you change it in one place and every error response across your entire API is updated."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"how-it-works",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"How It Works"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When a request enters Vexor's pipeline, it flows through a sequence of phases:",e.jsx("code",{className:"prose-code",children:" onRequest"})," hooks, route matching, handler execution, and ",e.jsx("code",{className:"prose-code",children:"onResponse"})," hooks. Each phase is wrapped in an error boundary -- a try/catch that intercepts any thrown exception or rejected promise. When an error is caught, the pipeline short-circuits: remaining phases are skipped, and the error is forwarded to the ",e.jsx("code",{className:"prose-code",children:"onError"})," hook along with the current request context."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The error propagation path is deterministic. If a route handler throws, the",e.jsx("code",{className:"prose-code",children:" onResponse"})," hooks do not execute, and the error goes directly to ",e.jsx("code",{className:"prose-code",children:"onError"}),". If an ",e.jsx("code",{className:"prose-code",children:"onRequest"})," hook throws, the route handler does not execute, and the error goes to",e.jsx("code",{className:"prose-code",children:" onError"}),". If ",e.jsx("code",{className:"prose-code",children:"onError"})," itself throws, Vexor returns a bare 500 response as a last resort to prevent the request from hanging. This layered approach ensures that no matter where an error originates in the pipeline, it is caught and handled."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"onError"})," hook receives two arguments: the request context (",e.jsx("code",{className:"prose-code",children:"ctx"}),") and the error object. The context gives you access to everything about the request -- method, path, headers, body, query parameters, and any values set by earlier hooks (like user identity or request ID). The error object is whatever was thrown, which could be an ",e.jsx("code",{className:"prose-code",children:"HttpError"}),", a standard ",e.jsx("code",{className:"prose-code",children:"Error"}),", a database driver error, or any other thrown value. Your handler must return a response, which Vexor sends to the client."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:["The ",e.jsx("code",{className:"prose-code",children:"HttpError"})," class is the bridge between your business logic and the error handler. When you throw an ",e.jsx("code",{className:"prose-code",children:"HttpError"}),", the global handler can read its ",e.jsx("code",{className:"prose-code",children:"statusCode"}),",",e.jsx("code",{className:"prose-code",children:" code"}),", ",e.jsx("code",{className:"prose-code",children:"message"}),",",e.jsx("code",{className:"prose-code",children:" expose"}),", and ",e.jsx("code",{className:"prose-code",children:"details"})," properties to construct an appropriate response. The ",e.jsx("code",{className:"prose-code",children:"expose"}),' flag is particularly important: it indicates whether the error message is safe to include in the client response. Client-facing errors (like "User not found") are marked as exposed; internal errors (like "Connection refused on 10.0.0.5:5432") are not.']})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"when-to-use",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"When to Use Each Pattern"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Throw HttpError subclasses for expected error conditions."})," ","When a user requests a resource that does not exist, when input validation fails, when authentication is missing or invalid, or when a rate limit is exceeded, throw the appropriate HttpError subclass. These are expected conditions that your application handles intentionally, and the error class encodes exactly how the response should look."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Let unexpected errors propagate to the global handler."})," ","When a database connection fails, when a JSON parsing throws, or when a third-party library throws an unexpected exception, do not catch it in the route handler. Let it propagate to the ",e.jsx("code",{className:"prose-code",children:"onError"})," hook, which will log the full error details and return a generic 500 response. This ensures that unexpected errors are always logged and never accidentally swallowed."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Use try/catch in route handlers only for error transformation."})," ","If you need to catch an error from one service, retry with another service, or return a partial response on failure, use a local try/catch. But if the catch block just wraps the error in an HttpError and re-throws, you are better off creating a specialized error class and letting the global handler format it."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Differentiate between client errors and server errors."})," ","Client errors (4xx) indicate that the caller made a mistake -- bad input, missing authentication, requesting a nonexistent resource. Server errors (5xx) indicate that your system failed -- a bug, a crashed dependency, a timeout. Client errors should always include a helpful message explaining what went wrong and how to fix it. Server errors should return a generic message in production (to avoid leaking details) but log the full error internally. The ",e.jsx("code",{className:"prose-code",children:"expose"})," flag on HttpError enforces this distinction automatically."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"global-error-handler",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Global Error Handler"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"onError"})," hook is your application's centralized error handler. It catches all unhandled errors from route handlers, middleware, and other hooks. Every Vexor application should register one to ensure consistent error responses and logging. Without it, unhandled errors result in a bare 500 response with no useful information for either the client or your logging system."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The global error handler is the single place where you define your API's error response format. Whether you use ",e.jsx("code",{className:"prose-code",children:"{ error, message, requestId }"})," or a JSON:API-style ",e.jsx("code",{className:"prose-code",children:"{ errors: [{ status, title, detail }] }"}),", you define it once in the ",e.jsx("code",{className:"prose-code",children:"onError"})," handler and every error across your entire API follows the same format. This consistency is invaluable for API consumers who need to write a single error-handling path in their client code."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The request ID is a critical piece of the error response. By including a unique identifier in both the client response and the server-side log entry, you create a correlation link that allows support teams to look up the full error details (including stack trace, request body, and user context) when a customer reports an error. Generate the request ID early in the pipeline (in an ",e.jsx("code",{className:"prose-code",children:"onRequest"})," hook) and store it in the context so it is available to both the error handler and the route handler."]}),e.jsx(r,{code:o,filename:"app.ts",showLineNumbers:!0}),e.jsxs(t,{variant:"warning",title:"Always Register an Error Handler",children:["Without a custom ",e.jsx("code",{className:"prose-code",children:"onError"})," hook, Vexor returns a generic 500 response with no details. In production, this means losing valuable debugging context. Always register a global error handler that logs the full error and returns a safe response. This should be one of the first things you configure when creating a new Vexor application."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"custom-error-classes",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Custom Error Classes"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Extend ",e.jsx("code",{className:"prose-code",children:"HttpError"})," to create typed error classes for each HTTP status code your API uses. This makes error handling in route handlers clean and self-documenting: ",e.jsx("code",{className:"prose-code",children:"throw new NotFoundError('User')"})," is immediately understandable, carries the correct status code (404), includes a machine-readable code ('NOT_FOUND'), and is marked as safe to expose to clients."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The error class hierarchy serves as an error taxonomy for your application. Each class encodes the HTTP status code, a machine-readable error code (for programmatic handling by API consumers), the ",e.jsx("code",{className:"prose-code",children:"expose"})," flag (whether the message is safe for clients), and optionally additional structured data through the",e.jsx("code",{className:"prose-code",children:" details"})," property. This rich metadata allows the global error handler to produce differentiated responses without any conditional logic per error type."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["A well-designed error taxonomy typically includes classes for every 4xx status code your API returns (BadRequest, Unauthorized, Forbidden, NotFound, Conflict, RateLimit) and optionally for 5xx codes that represent known failure modes (ServiceUnavailable for dependency outages, GatewayTimeout for upstream timeouts). Unexpected 5xx errors (bugs, unknown crashes) should not have a dedicated class -- they are represented by standard",e.jsx("code",{className:"prose-code",children:" Error"})," objects and handled as the default case in your global handler."]}),e.jsx(r,{code:n,filename:"errors.ts",showLineNumbers:!0}),e.jsxs(t,{variant:"tip",title:"The expose Property",children:["Set ",e.jsx("code",{className:"prose-code",children:"expose: true"}),' on errors whose messages are safe to show to clients (like "User not found"). Leave it false for internal errors whose messages might leak implementation details (like database connection strings or file paths). The global error handler uses this flag to decide whether to include the actual message or substitute a generic one.']})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"http-errors",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Error Classification"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Your global error handler should differentiate between several categories of errors, each requiring a different response strategy. Known HTTP errors (HttpError instances) carry their own status code and message. Database errors from your ORM or driver carry vendor-specific codes that you can translate to HTTP semantics. Timeout and network errors indicate upstream dependency issues. And truly unknown errors represent bugs that need investigation."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The classification order matters. Check for the most specific error types first (HttpError, then database-specific codes, then timeout patterns) and fall through to a generic 500 handler for anything unrecognized. This waterfall approach ensures that errors are handled at the most appropriate level of specificity. A PostgreSQL unique constraint violation (code 23505) becomes a 409 Conflict. A foreign key violation (code 23503) becomes a 400 Bad Request. A timeout becomes a 504 Gateway Timeout. Everything else becomes a 500 Internal Server Error."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"This pattern also enables gradual improvement. When you encounter a new error pattern in production logs (a new database error code, a specific third-party API error format), you can add a new classification rule to the handler without touching any route handler code. The centralized handler is the single place where error-to-response mapping lives."}),e.jsx(r,{code:i,filename:"error-handler.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"validation-errors",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Validation Errors"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor's built-in schema validation throws ",e.jsx("code",{className:"prose-code",children:"ValidationError"})," ","with structured issue details when request data does not match the defined schema. These errors are special because they carry an array of field-level issues, each describing exactly what is wrong with a specific part of the input. This structured format enables API consumers to programmatically highlight specific form fields or display targeted error messages in their UI."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The validation pipeline runs before your route handler. When you define a",e.jsx("code",{className:"prose-code",children:" schema"})," option on a route, Vexor validates the request body (and optionally query parameters, headers, and path parameters) against the schema. If validation fails, a ",e.jsx("code",{className:"prose-code",children:"ValidationError"})," is thrown before the handler is called, and the error flows to your ",e.jsx("code",{className:"prose-code",children:"onError"})," hook. The handler code never executes, which means you can safely assume that",e.jsx("code",{className:"prose-code",children:" ctx.body"})," is fully typed and validated whenever it is accessed."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Each validation issue includes a ",e.jsx("code",{className:"prose-code",children:"path"})," (the location of the invalid field, like ",e.jsx("code",{className:"prose-code",children:"['address', 'zip']"}),"), a",e.jsx("code",{className:"prose-code",children:" message"})," (a human-readable description), a",e.jsx("code",{className:"prose-code",children:" code"})," (a machine-readable type like",e.jsx("code",{className:"prose-code",children:" 'too_small'"})," or ",e.jsx("code",{className:"prose-code",children:"'invalid_type'"}),"), and optionally ",e.jsx("code",{className:"prose-code",children:"expected"})," and",e.jsx("code",{className:"prose-code",children:" received"})," values. Map these to your API's error format in the global handler. A common approach is to return a flat list of objects with",e.jsx("code",{className:"prose-code",children:" field"})," (the path joined with dots) and",e.jsx("code",{className:"prose-code",children:" message"}),"."]}),e.jsx(r,{code:l,filename:"validation.ts",showLineNumbers:!0}),e.jsxs(t,{variant:"info",title:"Validation Error Shape",children:["Each validation issue includes ",e.jsx("code",{className:"prose-code",children:"path"})," (field location),"," ",e.jsx("code",{className:"prose-code",children:"message"})," (human-readable description),"," ",e.jsx("code",{className:"prose-code",children:"code"})," (machine-readable type), and optionally"," ",e.jsx("code",{className:"prose-code",children:"expected"})," and ",e.jsx("code",{className:"prose-code",children:"received"})," ","values. Map these to your API's error format for consistent client-side handling. The",e.jsx("code",{className:"prose-code",children:" code"})," field is particularly useful for i18n -- clients can translate machine-readable codes into localized messages."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"not-found-handler",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Not Found Handler"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Register a catch-all route to return structured 404 responses for unmatched paths. Without a catch-all, Vexor returns a minimal 404 response that may not match your API's error format. The catch-all must be the last route registered so it does not shadow other routes -- Vexor matches routes in registration order, and a wildcard registered first would match everything."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:['It is important to distinguish between two types of 404 responses. A "route not found" 404 occurs when the client requests a path that no route matches (e.g.,',e.jsx("code",{className:"prose-code",children:" GET /api/nonexistent"}),'). This is handled by the catch-all route. A "resource not found" 404 occurs when the route matches but the requested entity does not exist (e.g., ',e.jsx("code",{className:"prose-code",children:"GET /api/users/999"})," when user 999 does not exist). This is handled by throwing a ",e.jsx("code",{className:"prose-code",children:"NotFoundError"})," in your route handler. The distinction matters because the error messages and response bodies should be different, and the operational implications are different (route 404s may indicate a client-side bug or an attempted attack, while resource 404s are normal operations)."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"For APIs with versioned paths, the catch-all is also a good place to handle deprecated versions gracefully. Instead of returning a generic 404, return a 410 Gone response with a migration guide URL, helping clients understand that the endpoint existed but has been removed."}),e.jsx(r,{code:d,filename:"routes.ts",showLineNumbers:!0}),e.jsxs(t,{variant:"tip",title:"Resource vs Route 404",children:['Distinguish between "route not found" (no matching path) and "resource not found" (valid route, but the requested ID does not exist). The catch-all handles the former; throw a ',e.jsx("code",{className:"prose-code",children:"NotFoundError"})," in your handler for the latter. Including the resource type and ID in the resource 404 helps clients debug issues."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"production-errors",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Production vs Development Errors"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Your error handler should behave differently in development and production environments. In development, include everything that helps you debug: the full stack trace, request context (method, path, params, query), the error name and code, and any additional metadata. In production, strip all internal information and return only the minimum needed for the client to understand and react to the error."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The security implications are significant. A stack trace reveals your file system layout, framework versions, and code structure. A database error message might include table names, column names, or even query fragments. An environment variable error might leak connection strings or API keys. Attackers actively probe APIs for verbose error responses because this information makes it easier to find and exploit vulnerabilities. The rule is simple: log everything server-side, but return only safe, generic messages to the client."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:`Client errors (4xx) are a special case. Their messages are typically safe to include in the response because they describe problems with the client's request, not with your internal systems. "User not found", "Invalid email format", and "Rate limit exceeded" are all safe messages. However, even for client errors, be careful with messages generated by internal components -- a database "duplicate key" error might include the conflicting value, which could be sensitive.`}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The request ID is the bridge between the safe client response and the verbose server log. When a client reports an error, you look up the request ID in your logging system and get the full context. This is why every error response -- both development and production -- must include the request ID."}),e.jsx(r,{code:c,filename:"error-handler.ts",showLineNumbers:!0}),e.jsxs(t,{variant:"warning",title:"Security",children:["Never expose stack traces, file paths, database queries, or environment variable names in production error responses. Attackers use this information to understand your application's internals. Log everything server-side but return only safe messages to clients. The ",e.jsx("code",{className:"prose-code",children:"expose"})," flag on HttpError is your primary tool for enforcing this boundary."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"error-logging",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Error Logging and Monitoring"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Integrate with logging and monitoring services to track errors in production. The key principle is structured logging: instead of concatenating error information into a single message string, emit a JSON object with well-defined fields (request ID, status code, method, path, user ID, duration). Structured logs are searchable, aggregatable, and can be parsed by monitoring tools to build dashboards and trigger alerts."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The severity of the log entry should match the status code. Server errors (5xx) are logged at the ",e.jsx("code",{className:"prose-code",children:"error"})," level because they represent failures in your system that need investigation. Client errors (4xx) are logged at the",e.jsx("code",{className:"prose-code",children:" warn"})," level because they are expected behavior (clients will inevitably send bad requests) but still worth tracking for abuse detection and API usability analysis. A sudden spike in 400 errors might indicate a client SDK bug or a breaking API change."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"For crash reporting services like Sentry, Bugsnag, or Datadog APM, only report server errors (5xx). Client errors are not bugs in your code and would create noise in your crash reports. Include the request context (method, path, user ID) as tags for filtering, and the request ID as extra data for correlation with your structured logs. This dual approach -- structured logs for all errors, crash reports for server errors -- gives you both broad visibility and focused alerting."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"onRequest"})," hook is where you initialize the metadata that the error handler will use. Setting ",e.jsx("code",{className:"prose-code",children:"startTime"})," at the beginning of the request allows the error handler to compute the request duration at the time of failure, which is invaluable for diagnosing timeout-related errors. Setting",e.jsx("code",{className:"prose-code",children:" requestId"})," early ensures it is available throughout the entire pipeline, including middleware that runs before route matching."]}),e.jsx(r,{code:h,filename:"logging.ts",showLineNumbers:!0}),e.jsx(t,{variant:"tip",title:"Error Budget",children:"Track your 5xx error rate as a percentage of total requests. Set alerting thresholds (e.g., alert if 5xx rate exceeds 1% over 5 minutes) to catch issues early. The request ID makes it easy to trace specific errors from client reports to server logs. Consider implementing an error budget SLO: if your 5xx rate exceeds a monthly budget, prioritize reliability work over feature development."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"async-errors",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Async Error Boundaries"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor automatically wraps all route handlers, middleware, and hooks in error boundaries. You do not need try/catch blocks unless you want to transform or partially handle an error before it reaches the global error handler. This is a deliberate design choice: boilerplate try/catch in every handler obscures business logic, leads to inconsistent error formatting, and creates opportunities for errors to be swallowed silently."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The error boundary works for both synchronous throws and rejected promises. Whether your handler throws an error synchronously, returns a rejected promise, or uses async/await with a failing await expression, the error is caught by the same boundary and forwarded to ",e.jsx("code",{className:"prose-code",children:"onError"}),". This means you can write straightforward async code without defensive programming -- if something fails, the error propagates automatically."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Use local try/catch only when you need to handle an error differently from the default behavior. Common cases include: transforming a timeout error from an upstream service into a user-friendly 504 response, implementing partial failure handling where one of several parallel operations fails but the others succeed, and converting framework-specific error formats (like database driver errors) into application-level errors before re-throwing. In all other cases, let errors propagate naturally."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Errors thrown in hooks are handled identically to errors in route handlers. An",e.jsx("code",{className:"prose-code",children:" onRequest"})," hook that throws (for example, when authentication fails) prevents the route handler from executing, and the error is forwarded to ",e.jsx("code",{className:"prose-code",children:"onError"}),". This is the recommended pattern for authentication: validate the token in a hook, throw an",e.jsx("code",{className:"prose-code",children:" UnauthorizedError"})," if it is invalid, and let the global handler format the 401 response."]}),e.jsx(r,{code:u,filename:"async-errors.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"best-practices",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Best Practices"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Always include a request ID in error responses."})," ",'The request ID is the single most important piece of metadata for error debugging. Without it, a client reporting "I got a 500 error" gives you nothing to search for in your logs. With it, you can look up the full request context, stack trace, and timeline in seconds. Generate the request ID in an ',e.jsx("code",{className:"prose-code",children:"onRequest"})," hook so it is available everywhere."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Use the expose flag consistently."})," ","Mark all client-facing error messages as ",e.jsx("code",{className:"prose-code",children:"expose: true"}),". Never set ",e.jsx("code",{className:"prose-code",children:"expose: true"})," on errors that might contain internal details like database error messages, file paths, or third-party API responses. The global handler should always check this flag before including the message in the response."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Keep error responses consistent."})," ","Every error response from your API should have the same structure, regardless of the error type. If successful responses use ",e.jsx("code",{className:"prose-code",children:"{ data: ... }"}),", error responses should use ",e.jsx("code",{className:"prose-code",children:"{ error: ..., message: ... }"})," consistently. API consumers should be able to write a single error-handling path that works for every error."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Log at the appropriate severity level."})," ","5xx errors are ",e.jsx("code",{className:"prose-code",children:"error"})," level -- they represent bugs or infrastructure failures. 4xx errors are ",e.jsx("code",{className:"prose-code",children:"warn"})," level -- they are expected but worth tracking. Validation errors can be ",e.jsx("code",{className:"prose-code",children:"info"})," level if you want to track API usability without creating noise."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Test your error handler explicitly."})," ","Write tests that trigger each error category (HttpError, database errors, timeouts, unknown errors) and verify that the response format, status code, and logged metadata are correct. The error handler is one of the most critical pieces of your application -- a bug in the error handler can turn a minor issue into a total outage by returning malformed responses or swallowing errors silently."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"api-reference",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"API Reference"}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3",children:"HttpError Class"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Property"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Type"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"statusCode"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"number"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"The HTTP status code for this error (e.g., 400, 401, 404, 500). Set in the constructor and used by the global error handler to set the response status. Must be a valid HTTP status code between 100 and 599."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"message"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"string"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:'Human-readable error description. Inherited from the base Error class. Whether this is included in the client response depends on the expose flag. Keep messages helpful and specific for exposed errors ("User with ID 123 not found") and technical for internal errors ("ECONNREFUSED 10.0.0.5:5432").'})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"code"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"string"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Machine-readable error code for programmatic handling by API consumers (e.g., 'NOT_FOUND', 'UNAUTHORIZED', 'RATE_LIMITED'). Use UPPER_SNAKE_CASE by convention. Clients can switch on this code to implement specific error handling logic without parsing the message string."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"expose"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"boolean"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:'Controls whether the error message is safe to include in client responses. When true, the global error handler can include error.message in the response body. When false, the handler should substitute a generic message like "An unexpected error occurred". Set to true for all client-facing errors (4xx) and false for internal errors (5xx).'})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"details"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"unknown"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Additional structured error data for complex error scenarios. Commonly used for validation errors (field-level issues), conflict errors (the conflicting resource), and rate limit errors (the retry-after duration). The global error handler can include this in the response if the error is marked as exposed."})]})]})]})}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3",children:"ValidationError"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Property"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Type"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"name"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"'ValidationError'"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"The error name, always set to 'ValidationError'. Use this in your onError hook to identify validation errors: error.name === 'ValidationError'. This is more reliable than instanceof checks when errors cross module boundaries."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"issues"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"ValidationIssue[]"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"An array of field-level validation failures. Each issue describes one specific problem with the request data. Multiple issues may exist for the same field (e.g., a value that is both the wrong type and too short). The array is ordered by the path of the invalid field."})]})]})]})}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3",children:"ValidationIssue"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Field"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Type"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"path"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"string[]"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"The path to the invalid field as an array of property names. For top-level fields, this is a single-element array (e.g., ['email']). For nested fields, it includes each level of nesting (e.g., ['address', 'zip']). Join with '.' to produce a dot-notation field reference for client display."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"message"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"string"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:'A human-readable description of the validation failure (e.g., "String must contain at least 8 character(s)", "Invalid email address"). Suitable for displaying directly to end users. Generated by the schema validator based on the constraint that was violated.'})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"code"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"string"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"A machine-readable issue type (e.g., 'too_small', 'too_big', 'invalid_type', 'invalid_string', 'custom'). Useful for i18n: clients can map codes to localized messages instead of displaying the English message. Consistent across all validators."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"expected"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"string"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:`What the validator expected (e.g., 'string', 'number', 'email'). Included for type mismatch and format errors. May be absent for some issue codes. Useful for generating specific error messages like "Expected a string but received a number".`})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"received"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"string"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"What the validator actually received (e.g., 'number', 'undefined', 'null'). Included for type mismatch errors. May be absent for some issue codes. Combined with expected, provides a complete picture of the type mismatch for debugging."})]})]})]})}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3",children:"Error Hooks"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Hook"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Signature"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700",children:e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"onError"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"(ctx, error) => Response"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Global error handler invoked for all unhandled errors from route handlers, middleware, and hooks. Receives the request context (with all values set by earlier hooks) and the error object. Must return a Response to send to the client. If this hook itself throws, Vexor returns a bare 500 response as a last resort. Register exactly one onError hook per application."})]})})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next-steps",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(s,{to:"/advanced/deployment",className:"btn-primary",children:["Deployment Guide ",e.jsx(a,{className:"w-4 h-4 ml-2"})]}),e.jsx(s,{to:"/advanced/serialization",className:"btn-secondary",children:"Fast Serialization"})]})]})]})}export{p as default};
