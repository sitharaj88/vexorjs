import { Link } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

const basicRoutingCode = `import { Vexor } from '@vexorjs/core';

const app = new Vexor();

// GET request
app.get('/users', async (ctx) => {
  return ctx.json({ users: [] });
});

// POST request
app.post('/users', async (ctx) => {
  const body = await ctx.readJson();
  return ctx.status(201).json(body);
});

// PUT request
app.put('/users/:id', async (ctx) => {
  return ctx.json({ id: ctx.params.id, updated: true });
});

// DELETE request
app.delete('/users/:id', async (ctx) => {
  return ctx.status(204).send();
});

// PATCH request
app.patch('/users/:id', async (ctx) => {
  return ctx.json({ id: ctx.params.id, patched: true });
});

// HEAD request
app.head('/users', async (ctx) => {
  return ctx.status(200).send();
});

// OPTIONS request
app.options('/users', async (ctx) => {
  return ctx.header('Allow', 'GET, POST, OPTIONS').status(204).send();
});`;

const paramRoutesCode = `// Single parameter
app.get('/users/:id', async (ctx) => {
  console.log(ctx.params.id); // "123"
  return ctx.json({ id: ctx.params.id });
});

// Multiple parameters
app.get('/users/:userId/posts/:postId', async (ctx) => {
  const { userId, postId } = ctx.params;
  return ctx.json({ userId, postId });
});

// With type-safe schemas
app.get('/users/:id', {
  params: Type.Object({
    id: Type.String({ pattern: '^[0-9]+$' }),
  }),
}, async (ctx) => {
  // ctx.params.id is typed and validated
  return ctx.json({ id: ctx.params.id });
});`;

const wildcardRoutesCode = `// Wildcard route - matches /files/any/path/here
app.get('/files/*', async (ctx) => {
  const filePath = ctx.params['*'];
  console.log(filePath); // "any/path/here"
  return ctx.json({ path: filePath });
});

// A trailing wildcard also matches the bare prefix:
//
//   GET /files        → ctx.params['*'] === ''
//   GET /files/a      → ctx.params['*'] === 'a'
//   GET /files/a/b/c  → ctx.params['*'] === 'a/b/c'

// Named wildcard
app.get('/assets/:path*', async (ctx) => {
  const assetPath = ctx.params.path;
  return ctx.json({ asset: assetPath });
});`;

const typedParamsCode = `// The path string literal drives the type of ctx.params.
// No annotations, no schemas required.

app.get('/users/:id', async (ctx) => {
  ctx.params.id;  // string — inferred from '/users/:id'
  // ctx.params.name;  // ✗ type error: 'name' is not a param of this path
  return ctx.json({ id: ctx.params.id });
});

app.get('/users/:userId/posts/:postId', async (ctx) => {
  // Both inferred as string from the path literal
  const { userId, postId } = ctx.params;
  return ctx.json({ userId, postId });
});

// Wildcard paths expose the catch-all segment as ctx.params['*']
app.get('/files/*', async (ctx) => {
  const rest: string = ctx.params['*'];
  return ctx.json({ rest });
});`;

const methodNotAllowedCode = `app.get('/users', async (ctx) => ctx.json({ users: [] }));
app.post('/users', async (ctx) => ctx.status(201).json({ created: true }));

// DELETE /users → the path exists, but not for this method:
//
//   HTTP/1.1 405 Method Not Allowed
//   Allow: GET, POST, HEAD
//   Content-Type: application/json; charset=utf-8
//
//   {
//     "error": "Method DELETE not allowed for /users",
//     "code": "METHOD_NOT_ALLOWED"
//   }
//
// GET /nowhere → the path exists under no method at all → plain 404`;

const headFallbackCode = `app.get('/report', async (ctx) => {
  return ctx.json({ rows: await loadReport() });
});

// HEAD /report is served by the GET handler automatically:
// same status and headers (including Content-Type), body stripped.
//
//   HEAD /report
//   → 200 OK
//   → Content-Type: application/json; charset=utf-8
//   → (no body)

// An explicit HEAD route takes precedence over the GET fallback
app.head('/report', async (ctx) => {
  return ctx.header('X-Report-Rows', String(await countRows())).status(200).send();
});`;

const routeGroupsCode = `// Create a route group with a prefix
const api = app.group('/api/v1');

// Routes are prefixed with /api/v1
api.get('/users', async (ctx) => {
  return ctx.json({ users: [] });
});

api.get('/posts', async (ctx) => {
  return ctx.json({ posts: [] });
});

// Nested groups
const admin = api.group('/admin');

admin.get('/stats', async (ctx) => {
  // Route: /api/v1/admin/stats
  return ctx.json({ stats: {} });
});

// Groups can have their own middleware
const auth = app.group('/auth', {
  preHandler: [authMiddleware],
});

auth.get('/profile', async (ctx) => {
  return ctx.json({ user: ctx.user });
});`;

const routeOptionsCode = `app.get('/users/:id', {
  // URL parameters schema
  params: Type.Object({
    id: Type.String(),
  }),

  // Query string schema
  query: Type.Object({
    include: Type.Optional(Type.String()),
    fields: Type.Optional(Type.Array(Type.String())),
  }),

  // Response schema (for OpenAPI docs)
  response: {
    200: UserSchema,
    404: ErrorSchema,
  },

  // Route-specific hooks
  preHandler: [authMiddleware],

  // Custom config
  config: {
    rateLimit: { max: 100, window: '1m' },
  },
}, async (ctx) => {
  // Fully typed ctx.params and ctx.query
  const { id } = ctx.params;
  const { include, fields } = ctx.query;

  return ctx.json({ id, include, fields });
});`;

const routePriorityCode = `// Routes are matched in order of specificity

// 1. Static routes (highest priority)
app.get('/users/me', handler);      // Matches first

// 2. Parametric routes
app.get('/users/:id', handler);     // Matches second

// 3. Wildcard routes (lowest priority)
app.get('/users/*', handler);       // Matches last

// Example matching:
// GET /users/me     → /users/me (static)
// GET /users/123    → /users/:id (parametric)
// GET /users/a/b/c  → /users/* (wildcard)`;

const allMethodsCode = `// Match all HTTP methods
app.all('/webhook', async (ctx) => {
  console.log(\`Received \${ctx.req.method} request\`);
  return ctx.json({ method: ctx.req.method });
});

// Useful for:
// - Webhooks that might use different methods
// - CORS preflight handling
// - Method-agnostic endpoints`;

export default function Routing() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="routing" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Routing
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Vexor uses a high-performance radix tree router that provides O(1) lookups for
          static routes and efficient parameter matching.
        </p>
      </div>

      {/* Basic Routing */}
      <section>
        <h2 id="basic-routing" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Routing
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Define routes using HTTP method shortcuts. Each method takes a path and a handler function.
        </p>
        <CodeBlock code={basicRoutingCode} filename="routes.ts" showLineNumbers />
      </section>

      {/* Route Parameters */}
      <section>
        <h2 id="route-parameters" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Route Parameters
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use <code className="prose-code">:param</code> syntax to capture dynamic segments.
          Parameters are available on <code className="prose-code">ctx.params</code>.
        </p>
        <CodeBlock code={paramRoutesCode} />
      </section>

      {/* Typed Path Parameters */}
      <section>
        <h2 id="typed-path-parameters" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Typed Path Parameters
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor infers the shape of <code className="prose-code">ctx.params</code> directly from
          the path string literal. Writing <code className="prose-code">app.get('/users/:id', ...)</code>{' '}
          gives the handler a context where <code className="prose-code">ctx.params.id</code> is
          typed as <code className="prose-code">string</code> -- and accessing a parameter that
          does not appear in the path is a compile-time error. This works with any number of
          parameters and requires no annotations or schemas; TypeScript reads the parameter names
          out of the literal itself.
        </p>
        <CodeBlock code={typedParamsCode} />
        <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Tip:</strong> Inference relies on the path being a string literal. If you
              build paths dynamically, the parameter type widens -- add a{' '}
              <code className="prose-code">params</code> schema to the route options to restore
              precise types (and get runtime validation too).
            </div>
          </div>
        </div>
      </section>

      {/* Wildcard Routes */}
      <section>
        <h2 id="wildcard-routes" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Wildcard Routes
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use <code className="prose-code">*</code> to match any path segment(s). Wildcards
          must be the last segment in the route. A trailing wildcard also matches the bare
          prefix itself: <code className="prose-code">/files/*</code> matches{' '}
          <code className="prose-code">/files</code> with{' '}
          <code className="prose-code">ctx.params['*']</code> set to the empty string, so
          handlers like static file servers can treat the mount point as the root directory.
        </p>
        <CodeBlock code={wildcardRoutesCode} />
      </section>

      {/* Route Groups */}
      <section>
        <h2 id="route-groups" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Route Groups
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Group related routes under a common prefix. Groups can have their own middleware.
        </p>
        <CodeBlock code={routeGroupsCode} />
      </section>

      {/* Route Options */}
      <section>
        <h2 id="route-options" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Route Options
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Routes accept an options object for schemas, middleware, and configuration.
        </p>
        <CodeBlock code={routeOptionsCode} />
      </section>

      {/* Route Priority */}
      <section>
        <h2 id="route-priority" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Route Priority
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor matches routes by specificity. Static routes always have priority over parametric routes.
        </p>
        <CodeBlock code={routePriorityCode} />
        <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Tip:</strong> Define more specific routes before general ones for predictable matching.
            </div>
          </div>
        </div>
      </section>

      {/* All Methods */}
      <section>
        <h2 id="all-methods" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Matching All Methods
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use <code className="prose-code">app.all()</code> to match any HTTP method.
        </p>
        <CodeBlock code={allMethodsCode} />
      </section>

      {/* 405 Method Not Allowed */}
      <section>
        <h2 id="method-not-allowed" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          405 Method Not Allowed
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When a request path is registered under other HTTP methods but not the one being used,
          Vexor automatically responds with <code className="prose-code">405 Method Not Allowed</code>{' '}
          instead of a generic 404. The response includes an{' '}
          <code className="prose-code">Allow</code> header listing every method the path supports
          (with <code className="prose-code">HEAD</code> included whenever{' '}
          <code className="prose-code">GET</code> is registered, since HEAD falls back to the GET
          handler) and a JSON body with the <code className="prose-code">METHOD_NOT_ALLOWED</code>{' '}
          error code. This matches what HTTP clients and API tooling expect and makes typo'd
          methods immediately obvious, while paths that exist under no method at all still
          return a 404.
        </p>
        <CodeBlock code={methodNotAllowedCode} />
      </section>

      {/* HEAD Requests */}
      <section>
        <h2 id="head-requests" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          HEAD Requests
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Per the HTTP specification, HEAD must behave exactly like GET but return no body.
          Vexor implements this for you: a HEAD request with no explicit HEAD route is routed
          to the matching GET handler, the handler and all hooks run normally, and the body is
          stripped from the final response -- status and headers (including{' '}
          <code className="prose-code">Content-Type</code>) are preserved. If you register an
          explicit <code className="prose-code">app.head()</code> route for the path, it takes
          precedence over the GET fallback, which is useful when computing the full body is
          expensive and a cheaper existence check will do.
        </p>
        <CodeBlock code={headFallbackCode} />
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/middleware" className="btn-primary">
            Learn about Middleware <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/api/router" className="btn-secondary">
            Router API Reference
          </Link>
        </div>
      </section>
    </div>
  );
}
