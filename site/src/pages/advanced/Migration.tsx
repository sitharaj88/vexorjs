import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const expressRouteCode = `// Express
const express = require('express');
const app = express();

app.get('/users', (req, res) => {
  res.json({ users: [] });
});

app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id });
});

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  res.status(201).json({ name, email });
});

app.listen(3000);`;

const vexorRouteCode = `// Vexor
import { Vexor } from '@vexorjs/core';
const app = new Vexor();

app.get('/users', async (ctx) => {
  return ctx.json({ users: [] });
});

app.get('/users/:id', async (ctx) => {
  const { id } = ctx.params;
  return ctx.json({ id });
});

app.post('/users', async (ctx) => {
  const { name, email } = await ctx.readJson();
  return ctx.status(201).json({ name, email });
});

app.listen(3000);`;

const expressMiddlewareCode = `// Express middleware
const express = require('express');
const app = express();

// Global middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Route-specific middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/profile', auth, (req, res) => {
  res.json({ user: req.user });
});

// Error middleware (4 args)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});`;

const vexorMiddlewareCode = `// Vexor middleware (hook-based)
import { Vexor } from '@vexorjs/core';
const app = new Vexor();

// Global hooks (no app.use needed for JSON parsing)
// Vexor parses JSON automatically via ctx.readJson()
app.addHook('onRequest', cors());
app.addHook('onRequest', logger());

// Route-specific middleware via preHandler
async function auth(ctx: Context) {
  const token = ctx.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return ctx.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const user = await verifyToken(token);
    ctx.set('user', user);
  } catch (err) {
    return ctx.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/profile', { preHandler: [auth] }, async (ctx) => {
  return ctx.json({ user: ctx.get('user') });
});

// Error hook (replaces error middleware)
app.addHook('onError', async (ctx, error) => {
  console.error(error.stack);
  return ctx.status(500).json({ error: 'Server error' });
});`;

const expressReqResCode = `// Express: req and res are separate objects

app.get('/search', (req, res) => {
  // Query parameters
  const { q, page } = req.query;

  // Headers
  const userAgent = req.get('User-Agent');
  const contentType = req.get('Content-Type');

  // Body (requires express.json() middleware)
  // Parsed automatically by middleware

  // Set response headers
  res.set('X-Request-Id', '123');
  res.set('Cache-Control', 'no-cache');

  // Set status and send
  res.status(200).json({ query: q, page });
});

app.post('/upload', (req, res) => {
  // Body is already parsed
  const data = req.body;

  // Redirect
  res.redirect(301, '/new-location');
});`;

const vexorReqResCode = `// Vexor: unified context object

app.get('/search', async (ctx) => {
  // Query parameters
  const { q, page } = ctx.query;

  // Headers
  const userAgent = ctx.req.header('User-Agent');
  const contentType = ctx.req.header('Content-Type');

  // Body (parsed on demand, no middleware needed)
  // Use ctx.readJson() when you need the body

  // Set response headers (chainable)
  ctx.header('X-Request-Id', '123');
  ctx.header('Cache-Control', 'no-cache');

  // Set status and send (chainable)
  return ctx.status(200).json({ query: q, page });
});

app.post('/upload', async (ctx) => {
  // Body is parsed on demand
  const data = await ctx.readJson();

  // Redirect
  return ctx.redirect('/new-location', 301);
});`;

const expressErrorCode = `// Express: error handling

// Custom error class
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Throw in routes
app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await findUser(req.params.id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    res.json(user);
  } catch (err) {
    next(err); // Must call next(err) explicitly
  }
});

// Error middleware (must have 4 parameters)
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message,
  });
});`;

const vexorErrorCode = `// Vexor: error handling

// Custom error class (same pattern)
class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

// Throw in routes (no try/catch needed, no next())
app.get('/users/:id', async (ctx) => {
  const user = await findUser(ctx.params.id);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return ctx.json(user);
  // Errors are caught automatically
});

// Global error hook
app.addHook('onError', async (ctx, error) => {
  if (error instanceof AppError) {
    return ctx.status(error.statusCode).json({
      error: error.message,
    });
  }
  return ctx.status(500).json({
    error: 'Internal server error',
  });
});`;

const expressDbCode = `// Express with raw pg / Sequelize / Prisma

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users LIMIT 20');
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});`;

const vexorDbCode = `// Vexor with @vexorjs/orm (type-safe query builder)

import { Vexor } from '@vexorjs/core';
import { db, users } from '@vexorjs/orm';

const app = new Vexor();

app.get('/users', async (ctx) => {
  const allUsers = await db
    .select()
    .from(users)
    .limit(20);

  return ctx.json({ users: allUsers });
});

app.post('/users', async (ctx) => {
  const { name, email } = await ctx.readJson();

  const [newUser] = await db
    .insert(users)
    .values({ name, email })
    .returning();

  return ctx.status(201).json(newUser);
});`;

const expressRouterCode = `// Express Router pattern
// routes/users.js
const router = express.Router();

router.get('/', getUsers);
router.post('/', createUser);
router.get('/:id', getUser);

module.exports = router;

// app.js
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);`;

const vexorRouterCode = `// Vexor group pattern
// routes/users.ts
import { Vexor } from '@vexorjs/core';

export function registerUserRoutes(app: Vexor) {
  const users = app.group('/api/users');

  users.get('/', getUsers);
  users.post('/', createUser);
  users.get('/:id', getUser);
}

// app.ts
import { registerUserRoutes } from './routes/users';
registerUserRoutes(app);`;

const gradualMigrationCode = `// Step 1: Run Express and Vexor side by side
// Proxy specific routes to the new Vexor app

// express-app.ts (existing)
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const expressApp = express();

// Proxy migrated routes to Vexor
expressApp.use('/api/v2', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
}));

// Keep existing Express routes working
expressApp.get('/api/v1/users', legacyGetUsers);
expressApp.post('/api/v1/users', legacyCreateUser);

expressApp.listen(3000);`;

const gradualVexorCode = `// vexor-app.ts (new)
import { Vexor } from '@vexorjs/core';
import { db, users } from '@vexorjs/orm';

const app = new Vexor();

// New routes built with Vexor
app.get('/api/v2/users', async (ctx) => {
  const allUsers = await db.select().from(users).limit(20);
  return ctx.json({ data: allUsers, meta: { version: 'v2' } });
});

app.post('/api/v2/users', {
  body: UserCreateSchema,  // Built-in validation
}, async (ctx) => {
  const body = await ctx.readJson();
  const [user] = await db.insert(users).values(body).returning();
  return ctx.status(201).json(user);
});

app.listen(3001);

// Step 2: Migrate routes one by one from Express to Vexor
// Step 3: Update proxy rules as routes are migrated
// Step 4: Once all routes are migrated, remove Express entirely`;

const cheatsheetCode = `// Quick reference: Express → Vexor

// app.use(middleware)        → app.addHook('onRequest', middleware)
// app.use(express.json())    → (not needed, use ctx.readJson())
// router.use(middleware)     → group('/path', { preHandler: [middleware] })
// req.params.id              → ctx.params.id
// req.query.page             → ctx.query.page
// req.body                   → await ctx.readJson()
// req.get('Header')          → ctx.req.header('Header')
// res.status(200).json(data) → return ctx.status(200).json(data)
// res.set('Key', 'Value')    → ctx.header('Key', 'Value')
// res.redirect(url)          → return ctx.redirect(url)
// next()                     → (not needed, just return)
// next(error)                → throw error
// (err, req, res, next)      → app.addHook('onError', handler)
// express.Router()           → app.group('/prefix')`;

export default function Migration() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="migration" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Migration from Express
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Migrating from Express to Vexor is not simply a matter of renaming API calls. It is a
          transition from one architectural model to another, and understanding the philosophical
          differences between the two frameworks will make the process smoother and help you take
          full advantage of what Vexor offers. Express was designed in 2010 for a callback-driven
          Node.js ecosystem. Vexor was designed for modern TypeScript, async/await, and a world
          where developers expect type safety, built-in validation, and structured error handling
          without additional middleware.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The most fundamental difference is the mental model for request handling. In Express,
          a request flows through a linear chain of middleware functions, each calling
          <code className="prose-code">next()</code> to pass control to the next function.
          The request and response are separate mutable objects that middleware modifies in place.
          Error handling requires a special four-argument middleware signature, and forgetting to
          call <code className="prose-code">next(err)</code> silently swallows errors. This model
          is flexible but error-prone: it is easy to forget <code className="prose-code">next()</code>,
          accidentally send a response twice, or create subtle ordering bugs in the middleware chain.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor replaces this with a structured lifecycle model. Instead of a flat middleware chain,
          Vexor defines named lifecycle hooks (<code className="prose-code">onRequest</code>,
          <code className="prose-code">preHandler</code>, <code className="prose-code">onSend</code>,
          <code className="prose-code">onError</code>) that execute at specific points in the request
          lifecycle. Handlers are async functions that return a response rather than mutating a
          response object. There is no <code className="prose-code">next()</code> function: middleware
          either returns nothing (passes through) or returns a response (short-circuits). Errors thrown
          anywhere in the chain are automatically caught and routed to the
          <code className="prose-code">onError</code> hook. This structured approach eliminates
          entire categories of bugs that are common in Express applications.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          This guide provides side-by-side comparisons for every major concept: routes, middleware,
          request/response handling, error handling, database access, and routing groups. It also
          covers a gradual migration strategy for large applications that cannot be rewritten all
          at once, and a cheatsheet for quick reference during the migration process.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          If you are also considering Fastify as an alternative, much of this guide still applies.
          Vexor's hook system is conceptually similar to Fastify's lifecycle, but Vexor provides a
          unified Context object and integrated ORM that Fastify does not include out of the box.
        </p>
      </div>

      <section>
        <h2 id="why-migrate" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Why Migrate
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The decision to migrate from Express should be driven by specific pain points that Vexor
          addresses architecturally. Express has served the Node.js community well for over a decade,
          but its design reflects the constraints of a pre-TypeScript, pre-async/await era. If your
          team maintains type definitions manually, wraps every handler in try/catch, bolts on
          validation through third-party middleware, and debugs silent error swallowing regularly,
          Vexor removes these friction points at the framework level rather than through workarounds.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The advantages are not just ergonomic; they are structural. Vexor's radix tree router is
          measurably faster than Express's linear route matching, especially as the number of routes
          grows. TypeScript inference flows through the entire request lifecycle, from route parameters
          to validated request bodies to response types. The hook-based middleware system provides
          a predictable execution order that eliminates the ordering bugs that plague complex
          Express applications with dozens of <code className="prose-code">app.use()</code> calls.
        </p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 mb-4">
          <li>First-class TypeScript support with full type inference for params, query, and body</li>
          <li>Built-in schema validation without additional middleware</li>
          <li>Async handlers by default with automatic error catching (no <code className="prose-code">next(err)</code>)</li>
          <li>Hook-based middleware with a predictable lifecycle</li>
          <li>Radix tree router with faster route matching</li>
          <li>Integrated ORM with type-safe queries via <code className="prose-code">@vexorjs/orm</code></li>
          <li>On-demand body parsing instead of global middleware</li>
        </ul>
        <InfoBlock variant="info">
          You do not need to migrate everything at once. Vexor can run alongside Express
          using a reverse proxy, allowing you to migrate routes incrementally.
        </InfoBlock>
      </section>

      <section>
        <h2 id="architectural-differences" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Architectural Differences
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Before diving into code comparisons, it helps to understand the key architectural differences
          at a conceptual level. These differences affect how you think about request handling, not
          just how you write the code.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 pr-4 text-slate-900 dark:text-white font-semibold">Concept</th>
                <th className="py-3 pr-4 text-slate-900 dark:text-white font-semibold">Express</th>
                <th className="py-3 text-slate-900 dark:text-white font-semibold">Vexor</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Request model</td>
                <td className="py-3 pr-4">Separate mutable <code className="prose-code">req</code> and <code className="prose-code">res</code> objects. Middleware mutates <code className="prose-code">req</code> to pass data downstream.</td>
                <td className="py-3">Unified <code className="prose-code">Context</code> object with a typed key-value store. Data is passed via <code className="prose-code">ctx.set()</code> / <code className="prose-code">ctx.get()</code>.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Middleware flow</td>
                <td className="py-3 pr-4">Linear chain with <code className="prose-code">next()</code> callbacks. Ordering depends on registration order of <code className="prose-code">app.use()</code> calls.</td>
                <td className="py-3">Named lifecycle hooks (<code className="prose-code">onRequest</code>, <code className="prose-code">preHandler</code>, <code className="prose-code">onSend</code>, <code className="prose-code">onError</code>) with deterministic execution order.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Body parsing</td>
                <td className="py-3 pr-4">Global middleware (<code className="prose-code">express.json()</code>) parses every request body, even for GET routes that do not need it.</td>
                <td className="py-3">On-demand parsing via <code className="prose-code">ctx.readJson()</code>. The body is only parsed when a handler explicitly requests it.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Error handling</td>
                <td className="py-3 pr-4">Requires <code className="prose-code">next(err)</code> to propagate errors. Forgetting this call silently swallows the error. Error middleware must have exactly 4 parameters.</td>
                <td className="py-3">Errors thrown anywhere are automatically caught and routed to the <code className="prose-code">onError</code> hook. No manual propagation required.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Response model</td>
                <td className="py-3 pr-4">Imperative: call <code className="prose-code">res.json()</code> as a side effect. Accidentally calling it twice throws a "headers already sent" error.</td>
                <td className="py-3">Functional: <code className="prose-code">return ctx.json()</code> as a value. The framework sends exactly one response; the return value makes this explicit.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Routing</td>
                <td className="py-3 pr-4">Linear scan through registered routes. Performance degrades as route count increases.</td>
                <td className="py-3">Radix tree (compressed trie) compiled at startup. Static routes resolve in O(1), parametric in O(k) where k is path depth.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 id="routes" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Routes
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The routing API is intentionally familiar so that Express developers can be productive
          immediately. The HTTP method functions (<code className="prose-code">get</code>,
          <code className="prose-code">post</code>, <code className="prose-code">put</code>,
          <code className="prose-code">delete</code>) work the same way: you specify a path pattern
          and a handler function. The key differences are that handlers are always async, responses
          are returned explicitly with <code className="prose-code">return</code>, and request bodies
          are parsed on demand rather than requiring global middleware.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">return</code> keyword is significant. In Express, calling
          <code className="prose-code">res.json()</code> is a side effect that sends the response, but
          the function continues executing unless you explicitly return. This leads to a common bug
          where developers forget to return after sending an error response, causing the handler to
          continue processing and potentially sending a second response (which throws a "headers
          already sent" error). In Vexor, the response is the return value of the function. Once you
          return, nothing else executes. This makes the control flow explicit and eliminates an entire
          class of bugs.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Body parsing is another important difference. Express requires
          <code className="prose-code">app.use(express.json())</code> as global middleware, which
          attempts to parse the body of every incoming request as JSON, even GET requests that have
          no body. This wastes CPU cycles and can cause subtle issues when non-JSON content types
          are received. Vexor parses the body lazily: only when a handler calls
          <code className="prose-code">ctx.readJson()</code> is the body read from the stream and
          parsed. Routes that do not need the body pay zero cost for parsing.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <CodeBlock code={expressRouteCode} filename="Express" />
          </div>
          <div>
            <CodeBlock code={vexorRouteCode} filename="Vexor" />
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          Express uses <code className="prose-code">express.Router()</code> to group routes under
          a shared prefix. The router is a mini-application that is mounted onto the main app with
          <code className="prose-code">app.use()</code>. Vexor uses
          <code className="prose-code">app.group()</code> with a prefix, which is conceptually the
          same but integrates directly with the radix tree router. Groups in Vexor can also carry
          their own hooks, so you can attach authentication middleware to an entire group of routes
          without repeating it on each individual route.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <CodeBlock code={expressRouterCode} filename="Express Router" />
          </div>
          <div>
            <CodeBlock code={vexorRouterCode} filename="Vexor Groups" />
          </div>
        </div>
      </section>

      <section>
        <h2 id="middleware" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Middleware
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The middleware model is where Vexor diverges most significantly from Express, and
          understanding this difference is the key to a successful migration. In Express,
          <code className="prose-code">app.use()</code> registers middleware in a global chain, and
          the order of registration determines the order of execution. Each middleware receives
          <code className="prose-code">req</code>, <code className="prose-code">res</code>, and
          <code className="prose-code">next</code>. Calling <code className="prose-code">next()</code>
          passes control to the next middleware; not calling it stops the chain. This implicit flow
          control is the source of many Express bugs: a middleware that forgets to call
          <code className="prose-code">next()</code> causes the request to hang silently.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor replaces this with named lifecycle hooks. Instead of a single flat chain, Vexor
          defines specific points in the request lifecycle where hooks can execute. The
          <code className="prose-code">onRequest</code> hook runs immediately when a request arrives,
          before any routing. The <code className="prose-code">preHandler</code> hook runs after
          routing but before the handler, making it the right place for authentication and
          authorization checks. The <code className="prose-code">onSend</code> hook runs after
          the handler but before the response is sent, enabling response transformation and logging.
          The <code className="prose-code">onError</code> hook catches any thrown errors.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The mapping from Express to Vexor hooks follows a clear pattern. Express's
          <code className="prose-code">app.use(middleware)</code> becomes
          <code className="prose-code">app.addHook('onRequest', middleware)</code> for global
          concerns like CORS and logging. Route-specific middleware (the second argument to
          <code className="prose-code">app.get('/path', auth, handler)</code>) becomes
          <code className="prose-code">preHandler</code> hooks. Express's error middleware (the
          four-argument function) becomes the <code className="prose-code">onError</code> hook.
          And Express's <code className="prose-code">express.json()</code> middleware is simply not
          needed, because Vexor parses bodies on demand.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <CodeBlock code={expressMiddlewareCode} filename="Express" />
          </div>
          <div>
            <CodeBlock code={vexorMiddlewareCode} filename="Vexor" />
          </div>
        </div>
        <InfoBlock variant="tip">
          Vexor does not need <code className="prose-code">express.json()</code> middleware.
          JSON bodies are parsed on demand when you call
          <code className="prose-code">ctx.readJson()</code>, which avoids parsing bodies
          for routes that do not need them.
        </InfoBlock>
      </section>

      <section>
        <h2 id="request-response" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Request and Response
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Express provides separate <code className="prose-code">req</code> and
          <code className="prose-code">res</code> objects, each with a large API surface. The request
          object carries input data (params, query, body, headers), while the response object provides
          methods for building the output (status, headers, body). In practice, middleware often needs
          both objects, and developers frequently pass data between middleware and handlers by attaching
          custom properties to <code className="prose-code">req</code> (like
          <code className="prose-code">req.user = decoded</code>), which is not type-safe and
          requires augmenting the Express type definitions.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor consolidates everything into a single <code className="prose-code">Context</code>
          object with a chainable API. Request data is accessed through
          <code className="prose-code">ctx.params</code>, <code className="prose-code">ctx.query</code>,
          and <code className="prose-code">ctx.readJson()</code>. Response methods like
          <code className="prose-code">ctx.status()</code>,
          <code className="prose-code">ctx.header()</code>, and
          <code className="prose-code">ctx.json()</code> are chainable, allowing expressive one-liners
          like <code className="prose-code">return ctx.status(201).json(user)</code>. Cross-cutting
          data is stored in the typed <code className="prose-code">set/get</code> store rather than
          on arbitrary properties, which provides type safety and a clear contract between middleware
          and handlers.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The on-demand body parsing deserves emphasis because it changes how you think about request
          processing. In Express, <code className="prose-code">req.body</code> is always available
          (assuming the JSON middleware is registered), so handlers access it directly. In Vexor,
          <code className="prose-code">ctx.readJson()</code> is an async function that reads the
          request stream and parses it. This means the body is not available until you explicitly
          request it, which is a minor syntax change but an important performance optimization for
          routes that do not need the body.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <CodeBlock code={expressReqResCode} filename="Express" />
          </div>
          <div>
            <CodeBlock code={vexorReqResCode} filename="Vexor" />
          </div>
        </div>
      </section>

      <section>
        <h2 id="error-handling" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Error Handling
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Error handling is arguably the area where Vexor provides the biggest improvement over
          Express. In Express, async errors require explicit try/catch and
          <code className="prose-code">next(err)</code> calls. If you forget either one, the error
          is silently swallowed and the request hangs until the client times out. This is Express's
          single most common source of production bugs. Libraries like
          <code className="prose-code">express-async-errors</code> patch this behavior, but they
          are workarounds for a fundamental design limitation.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor handles this at the framework level. Every handler and hook is wrapped in an
          automatic error boundary. If any async function throws (whether it is your code, a database
          driver, or a third-party library), Vexor catches the error and routes it to the
          <code className="prose-code">onError</code> hook. You never need to write try/catch in your
          handlers, and you never need to remember to call <code className="prose-code">next(err)</code>.
          Just <code className="prose-code">throw</code>, and the error hook handles the rest.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Express's error middleware has another subtle requirement: it must accept exactly four
          parameters (<code className="prose-code">err, req, res, next</code>), even if you do not
          use <code className="prose-code">next</code>. If you accidentally omit one parameter,
          Express treats it as regular middleware and your error handler is never called. Vexor's
          <code className="prose-code">onError</code> hook has a clear, typed signature that
          the TypeScript compiler enforces, making this class of silent failure impossible.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <CodeBlock code={expressErrorCode} filename="Express" />
          </div>
          <div>
            <CodeBlock code={vexorErrorCode} filename="Vexor" />
          </div>
        </div>
        <InfoBlock variant="warning">
          In Express, forgetting to call <code className="prose-code">next(err)</code> silently
          swallows errors. In Vexor, just <code className="prose-code">throw</code> and the
          framework handles the rest. No errors are ever lost.
        </InfoBlock>
      </section>

      <section>
        <h2 id="database" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Database Access
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Express is deliberately unopinionated about database access, which means you bring your own
          driver, ORM, or query builder. This flexibility is a strength when your project has specific
          database requirements, but it also means every Express project reinvents the same patterns:
          connection pooling, transaction management, query building, and type safety. Most Express
          applications end up with raw SQL strings, manual connection management, and no type checking
          on query results.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor provides an optional but recommended companion package,
          <code className="prose-code">@vexorjs/orm</code>, which offers a type-safe query builder
          with compile-time type checking. The query builder generates SQL from method chains, so
          your IDE provides autocompletion for table columns, and TypeScript catches type mismatches
          at compile time rather than runtime. Connection pooling is built in and configured through
          the pool options rather than managed manually.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You are not required to use <code className="prose-code">@vexorjs/orm</code>. Vexor works
          equally well with Prisma, Drizzle, Knex, or raw database drivers. If your Express
          application already uses Prisma, you can keep using it in Vexor without changes. The
          migration from Express to Vexor is about the HTTP layer, not the database layer. Migrate
          the framework first, and consider the ORM change as a separate, optional step.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <CodeBlock code={expressDbCode} filename="Express + pg" />
          </div>
          <div>
            <CodeBlock code={vexorDbCode} filename="Vexor + @vexorjs/orm" />
          </div>
        </div>
      </section>

      <section>
        <h2 id="gradual-migration" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Gradual Migration Strategy
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For large applications with dozens or hundreds of routes, rewriting everything at once is
          risky and impractical. A gradual migration lets you adopt Vexor incrementally, validating
          each migrated route in production before moving on to the next. The approach uses a reverse
          proxy to run both frameworks simultaneously, with the Express application forwarding
          specific route prefixes to the new Vexor application.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The migration proceeds in four phases. In the first phase, you set up the proxy and deploy
          both applications side by side. All traffic still flows through Express, so there is zero
          risk. In the second phase, you build new features in Vexor and proxy their route prefixes
          from Express. This validates the proxy setup and gives your team experience with Vexor
          before touching existing code. In the third phase, you migrate existing routes one at a
          time, starting with the most performance-sensitive or most actively maintained routes.
          In the fourth phase, once all routes are migrated, you remove the Express application
          and the proxy entirely.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          There are several common pitfalls to watch for during migration. First, ensure that session
          state and authentication tokens are compatible between both frameworks. If Express uses
          cookie-based sessions, Vexor must be able to read those cookies, or you need a shared
          session store. Second, be careful with middleware ordering: if Express and Vexor both run
          CORS middleware, the proxy must not add conflicting headers. Third, monitor error rates
          after each route migration. A spike in 500 errors for a specific endpoint indicates a
          migration bug that needs to be rolled back and investigated.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The priority order for migrating routes should consider three factors: business impact
          (migrate critical paths first so you validate Vexor thoroughly), development velocity
          (migrate routes your team actively works on so they benefit from Vexor's developer
          experience immediately), and complexity (migrate simpler routes first to build confidence
          before tackling complex ones with many middleware dependencies).
        </p>
        <CodeBlock code={gradualMigrationCode} filename="express-app.ts" showLineNumbers />
        <CodeBlock code={gradualVexorCode} filename="vexor-app.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Start by migrating new features to Vexor while keeping existing Express routes
          untouched. Then migrate the most critical or performance-sensitive routes next.
          Leave rarely-changed legacy routes for last.
        </InfoBlock>
      </section>

      <section>
        <h2 id="common-pitfalls" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Common Pitfalls
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Developers migrating from Express frequently encounter the same set of issues. Knowing
          these in advance will save you debugging time and prevent subtle bugs from reaching
          production.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 pr-4 text-slate-900 dark:text-white font-semibold">Pitfall</th>
                <th className="py-3 text-slate-900 dark:text-white font-semibold">Solution</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Forgetting <code className="prose-code">return</code> in handlers</td>
                <td className="py-3">In Express, <code className="prose-code">res.json()</code> sends the response as a side effect, so <code className="prose-code">return</code> is optional. In Vexor, the handler must <code className="prose-code">return</code> the response. Omitting it causes the framework to send an empty response.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Forgetting <code className="prose-code">await</code> on <code className="prose-code">ctx.readJson()</code></td>
                <td className="py-3">Unlike Express's synchronous <code className="prose-code">req.body</code>, Vexor's body parsing is async. Forgetting <code className="prose-code">await</code> gives you a Promise object instead of the parsed body. TypeScript catches this in strict mode.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Using <code className="prose-code">req.user</code> pattern</td>
                <td className="py-3">Express middleware often attaches data to <code className="prose-code">req</code> directly. In Vexor, use <code className="prose-code">ctx.set('user', data)</code> and <code className="prose-code">ctx.get('user')</code> instead. This provides type safety and avoids polluting the request object.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Calling <code className="prose-code">next()</code></td>
                <td className="py-3">There is no <code className="prose-code">next()</code> in Vexor. Middleware that wants to pass through simply returns nothing (no return statement, or <code className="prose-code">return undefined</code>). Middleware that wants to short-circuit returns a response.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Registering <code className="prose-code">express.json()</code></td>
                <td className="py-3">Vexor does not need body parsing middleware. Remove <code className="prose-code">express.json()</code>, <code className="prose-code">express.urlencoded()</code>, and <code className="prose-code">body-parser</code>. Use <code className="prose-code">ctx.readJson()</code> in handlers that need the body.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 id="cheatsheet" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Quick Reference Cheatsheet
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Keep this reference handy during your migration. It maps every commonly used Express API
          to its Vexor equivalent. For most patterns, the translation is mechanical: replace the
          Express call with the Vexor equivalent, add <code className="prose-code">return</code>
          before response calls, and replace <code className="prose-code">req.body</code> with
          <code className="prose-code">await ctx.readJson()</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The most significant conceptual shifts are the elimination of
          <code className="prose-code">next()</code> (middleware passes through by not returning),
          the replacement of error middleware with the <code className="prose-code">onError</code>
          hook, and the move from <code className="prose-code">express.Router()</code> to
          <code className="prose-code">app.group()</code>. Once these three patterns become
          second nature, the rest of the migration follows naturally.
        </p>
        <CodeBlock code={cheatsheetCode} filename="cheatsheet.ts" />
      </section>

      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/advanced/performance" className="btn-primary">
            Performance Optimization <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/routing" className="btn-secondary">
            Routing Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
