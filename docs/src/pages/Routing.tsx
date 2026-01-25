import { Link } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

const basicRoutingCode = `import { Vexor } from 'vexor';

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

// Named wildcard
app.get('/assets/:path*', async (ctx) => {
  const assetPath = ctx.params.path;
  return ctx.json({ asset: assetPath });
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

      {/* Wildcard Routes */}
      <section>
        <h2 id="wildcard-routes" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Wildcard Routes
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use <code className="prose-code">*</code> to match any path segment(s). Wildcards
          must be the last segment in the route.
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
