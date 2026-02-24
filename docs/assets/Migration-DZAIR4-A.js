import{j as e,I as r,C as s,L as t,A as a}from"./index-BWrueqsD.js";const o=`// Express
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

app.listen(3000);`,n=`// Vexor
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

app.listen(3000);`,i=`// Express middleware
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
});`,d=`// Vexor middleware (hook-based)
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
});`,c=`// Express: req and res are separate objects

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
});`,l=`// Vexor: unified context object

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
});`,p=`// Express: error handling

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
});`,h=`// Vexor: error handling

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
});`,x=`// Express with raw pg / Sequelize / Prisma

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
});`,m=`// Vexor with @vexorjs/orm (type-safe query builder)

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
});`,u=`// Express Router pattern
// routes/users.js
const router = express.Router();

router.get('/', getUsers);
router.post('/', createUser);
router.get('/:id', getUser);

module.exports = router;

// app.js
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);`,g=`// Vexor group pattern
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
registerUserRoutes(app);`,y=`// Step 1: Run Express and Vexor side by side
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

expressApp.listen(3000);`,j=`// vexor-app.ts (new)
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
// Step 4: Once all routes are migrated, remove Express entirely`,f=`// Quick reference: Express → Vexor

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
// express.Router()           → app.group('/prefix')`;function w(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"migration",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"Migration from Express"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"Migrating from Express to Vexor is not simply a matter of renaming API calls. It is a transition from one architectural model to another, and understanding the philosophical differences between the two frameworks will make the process smoother and help you take full advantage of what Vexor offers. Express was designed in 2010 for a callback-driven Node.js ecosystem. Vexor was designed for modern TypeScript, async/await, and a world where developers expect type safety, built-in validation, and structured error handling without additional middleware."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The most fundamental difference is the mental model for request handling. In Express, a request flows through a linear chain of middleware functions, each calling",e.jsx("code",{className:"prose-code",children:"next()"})," to pass control to the next function. The request and response are separate mutable objects that middleware modifies in place. Error handling requires a special four-argument middleware signature, and forgetting to call ",e.jsx("code",{className:"prose-code",children:"next(err)"})," silently swallows errors. This model is flexible but error-prone: it is easy to forget ",e.jsx("code",{className:"prose-code",children:"next()"}),", accidentally send a response twice, or create subtle ordering bugs in the middleware chain."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor replaces this with a structured lifecycle model. Instead of a flat middleware chain, Vexor defines named lifecycle hooks (",e.jsx("code",{className:"prose-code",children:"onRequest"}),",",e.jsx("code",{className:"prose-code",children:"preHandler"}),", ",e.jsx("code",{className:"prose-code",children:"onSend"}),",",e.jsx("code",{className:"prose-code",children:"onError"}),") that execute at specific points in the request lifecycle. Handlers are async functions that return a response rather than mutating a response object. There is no ",e.jsx("code",{className:"prose-code",children:"next()"})," function: middleware either returns nothing (passes through) or returns a response (short-circuits). Errors thrown anywhere in the chain are automatically caught and routed to the",e.jsx("code",{className:"prose-code",children:"onError"})," hook. This structured approach eliminates entire categories of bugs that are common in Express applications."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"This guide provides side-by-side comparisons for every major concept: routes, middleware, request/response handling, error handling, database access, and routing groups. It also covers a gradual migration strategy for large applications that cannot be rewritten all at once, and a cheatsheet for quick reference during the migration process."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"If you are also considering Fastify as an alternative, much of this guide still applies. Vexor's hook system is conceptually similar to Fastify's lifecycle, but Vexor provides a unified Context object and integrated ORM that Fastify does not include out of the box."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"why-migrate",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Why Migrate"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The decision to migrate from Express should be driven by specific pain points that Vexor addresses architecturally. Express has served the Node.js community well for over a decade, but its design reflects the constraints of a pre-TypeScript, pre-async/await era. If your team maintains type definitions manually, wraps every handler in try/catch, bolts on validation through third-party middleware, and debugs silent error swallowing regularly, Vexor removes these friction points at the framework level rather than through workarounds."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The advantages are not just ergonomic; they are structural. Vexor's radix tree router is measurably faster than Express's linear route matching, especially as the number of routes grows. TypeScript inference flows through the entire request lifecycle, from route parameters to validated request bodies to response types. The hook-based middleware system provides a predictable execution order that eliminates the ordering bugs that plague complex Express applications with dozens of ",e.jsx("code",{className:"prose-code",children:"app.use()"})," calls."]}),e.jsxs("ul",{className:"list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 mb-4",children:[e.jsx("li",{children:"First-class TypeScript support with full type inference for params, query, and body"}),e.jsx("li",{children:"Built-in schema validation without additional middleware"}),e.jsxs("li",{children:["Async handlers by default with automatic error catching (no ",e.jsx("code",{className:"prose-code",children:"next(err)"}),")"]}),e.jsx("li",{children:"Hook-based middleware with a predictable lifecycle"}),e.jsx("li",{children:"Radix tree router with faster route matching"}),e.jsxs("li",{children:["Integrated ORM with type-safe queries via ",e.jsx("code",{className:"prose-code",children:"@vexorjs/orm"})]}),e.jsx("li",{children:"On-demand body parsing instead of global middleware"})]}),e.jsx(r,{variant:"info",children:"You do not need to migrate everything at once. Vexor can run alongside Express using a reverse proxy, allowing you to migrate routes incrementally."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"architectural-differences",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Architectural Differences"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Before diving into code comparisons, it helps to understand the key architectural differences at a conceptual level. These differences affect how you think about request handling, not just how you write the code."}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-left border-collapse",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"py-3 pr-4 text-slate-900 dark:text-white font-semibold",children:"Concept"}),e.jsx("th",{className:"py-3 pr-4 text-slate-900 dark:text-white font-semibold",children:"Express"}),e.jsx("th",{className:"py-3 text-slate-900 dark:text-white font-semibold",children:"Vexor"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Request model"}),e.jsxs("td",{className:"py-3 pr-4",children:["Separate mutable ",e.jsx("code",{className:"prose-code",children:"req"})," and ",e.jsx("code",{className:"prose-code",children:"res"})," objects. Middleware mutates ",e.jsx("code",{className:"prose-code",children:"req"})," to pass data downstream."]}),e.jsxs("td",{className:"py-3",children:["Unified ",e.jsx("code",{className:"prose-code",children:"Context"})," object with a typed key-value store. Data is passed via ",e.jsx("code",{className:"prose-code",children:"ctx.set()"})," / ",e.jsx("code",{className:"prose-code",children:"ctx.get()"}),"."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Middleware flow"}),e.jsxs("td",{className:"py-3 pr-4",children:["Linear chain with ",e.jsx("code",{className:"prose-code",children:"next()"})," callbacks. Ordering depends on registration order of ",e.jsx("code",{className:"prose-code",children:"app.use()"})," calls."]}),e.jsxs("td",{className:"py-3",children:["Named lifecycle hooks (",e.jsx("code",{className:"prose-code",children:"onRequest"}),", ",e.jsx("code",{className:"prose-code",children:"preHandler"}),", ",e.jsx("code",{className:"prose-code",children:"onSend"}),", ",e.jsx("code",{className:"prose-code",children:"onError"}),") with deterministic execution order."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Body parsing"}),e.jsxs("td",{className:"py-3 pr-4",children:["Global middleware (",e.jsx("code",{className:"prose-code",children:"express.json()"}),") parses every request body, even for GET routes that do not need it."]}),e.jsxs("td",{className:"py-3",children:["On-demand parsing via ",e.jsx("code",{className:"prose-code",children:"ctx.readJson()"}),". The body is only parsed when a handler explicitly requests it."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Error handling"}),e.jsxs("td",{className:"py-3 pr-4",children:["Requires ",e.jsx("code",{className:"prose-code",children:"next(err)"})," to propagate errors. Forgetting this call silently swallows the error. Error middleware must have exactly 4 parameters."]}),e.jsxs("td",{className:"py-3",children:["Errors thrown anywhere are automatically caught and routed to the ",e.jsx("code",{className:"prose-code",children:"onError"})," hook. No manual propagation required."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Response model"}),e.jsxs("td",{className:"py-3 pr-4",children:["Imperative: call ",e.jsx("code",{className:"prose-code",children:"res.json()"}),' as a side effect. Accidentally calling it twice throws a "headers already sent" error.']}),e.jsxs("td",{className:"py-3",children:["Functional: ",e.jsx("code",{className:"prose-code",children:"return ctx.json()"})," as a value. The framework sends exactly one response; the return value makes this explicit."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Routing"}),e.jsx("td",{className:"py-3 pr-4",children:"Linear scan through registered routes. Performance degrades as route count increases."}),e.jsx("td",{className:"py-3",children:"Radix tree (compressed trie) compiled at startup. Static routes resolve in O(1), parametric in O(k) where k is path depth."})]})]})]})})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"routes",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Routes"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The routing API is intentionally familiar so that Express developers can be productive immediately. The HTTP method functions (",e.jsx("code",{className:"prose-code",children:"get"}),",",e.jsx("code",{className:"prose-code",children:"post"}),", ",e.jsx("code",{className:"prose-code",children:"put"}),",",e.jsx("code",{className:"prose-code",children:"delete"}),") work the same way: you specify a path pattern and a handler function. The key differences are that handlers are always async, responses are returned explicitly with ",e.jsx("code",{className:"prose-code",children:"return"}),", and request bodies are parsed on demand rather than requiring global middleware."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"return"})," keyword is significant. In Express, calling",e.jsx("code",{className:"prose-code",children:"res.json()"}),' is a side effect that sends the response, but the function continues executing unless you explicitly return. This leads to a common bug where developers forget to return after sending an error response, causing the handler to continue processing and potentially sending a second response (which throws a "headers already sent" error). In Vexor, the response is the return value of the function. Once you return, nothing else executes. This makes the control flow explicit and eliminates an entire class of bugs.']}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Body parsing is another important difference. Express requires",e.jsx("code",{className:"prose-code",children:"app.use(express.json())"})," as global middleware, which attempts to parse the body of every incoming request as JSON, even GET requests that have no body. This wastes CPU cycles and can cause subtle issues when non-JSON content types are received. Vexor parses the body lazily: only when a handler calls",e.jsx("code",{className:"prose-code",children:"ctx.readJson()"})," is the body read from the stream and parsed. Routes that do not need the body pay zero cost for parsing."]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-4",children:[e.jsx("div",{children:e.jsx(s,{code:o,filename:"Express"})}),e.jsx("div",{children:e.jsx(s,{code:n,filename:"Vexor"})})]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mt-4 mb-4",children:["Express uses ",e.jsx("code",{className:"prose-code",children:"express.Router()"})," to group routes under a shared prefix. The router is a mini-application that is mounted onto the main app with",e.jsx("code",{className:"prose-code",children:"app.use()"}),". Vexor uses",e.jsx("code",{className:"prose-code",children:"app.group()"})," with a prefix, which is conceptually the same but integrates directly with the radix tree router. Groups in Vexor can also carry their own hooks, so you can attach authentication middleware to an entire group of routes without repeating it on each individual route."]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-4",children:[e.jsx("div",{children:e.jsx(s,{code:u,filename:"Express Router"})}),e.jsx("div",{children:e.jsx(s,{code:g,filename:"Vexor Groups"})})]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"middleware",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Middleware"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The middleware model is where Vexor diverges most significantly from Express, and understanding this difference is the key to a successful migration. In Express,",e.jsx("code",{className:"prose-code",children:"app.use()"})," registers middleware in a global chain, and the order of registration determines the order of execution. Each middleware receives",e.jsx("code",{className:"prose-code",children:"req"}),", ",e.jsx("code",{className:"prose-code",children:"res"}),", and",e.jsx("code",{className:"prose-code",children:"next"}),". Calling ",e.jsx("code",{className:"prose-code",children:"next()"}),"passes control to the next middleware; not calling it stops the chain. This implicit flow control is the source of many Express bugs: a middleware that forgets to call",e.jsx("code",{className:"prose-code",children:"next()"})," causes the request to hang silently."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor replaces this with named lifecycle hooks. Instead of a single flat chain, Vexor defines specific points in the request lifecycle where hooks can execute. The",e.jsx("code",{className:"prose-code",children:"onRequest"})," hook runs immediately when a request arrives, before any routing. The ",e.jsx("code",{className:"prose-code",children:"preHandler"})," hook runs after routing but before the handler, making it the right place for authentication and authorization checks. The ",e.jsx("code",{className:"prose-code",children:"onSend"})," hook runs after the handler but before the response is sent, enabling response transformation and logging. The ",e.jsx("code",{className:"prose-code",children:"onError"})," hook catches any thrown errors."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The mapping from Express to Vexor hooks follows a clear pattern. Express's",e.jsx("code",{className:"prose-code",children:"app.use(middleware)"})," becomes",e.jsx("code",{className:"prose-code",children:"app.addHook('onRequest', middleware)"})," for global concerns like CORS and logging. Route-specific middleware (the second argument to",e.jsx("code",{className:"prose-code",children:"app.get('/path', auth, handler)"}),") becomes",e.jsx("code",{className:"prose-code",children:"preHandler"})," hooks. Express's error middleware (the four-argument function) becomes the ",e.jsx("code",{className:"prose-code",children:"onError"})," hook. And Express's ",e.jsx("code",{className:"prose-code",children:"express.json()"})," middleware is simply not needed, because Vexor parses bodies on demand."]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-4",children:[e.jsx("div",{children:e.jsx(s,{code:i,filename:"Express"})}),e.jsx("div",{children:e.jsx(s,{code:d,filename:"Vexor"})})]}),e.jsxs(r,{variant:"tip",children:["Vexor does not need ",e.jsx("code",{className:"prose-code",children:"express.json()"})," middleware. JSON bodies are parsed on demand when you call",e.jsx("code",{className:"prose-code",children:"ctx.readJson()"}),", which avoids parsing bodies for routes that do not need them."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"request-response",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Request and Response"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Express provides separate ",e.jsx("code",{className:"prose-code",children:"req"})," and",e.jsx("code",{className:"prose-code",children:"res"})," objects, each with a large API surface. The request object carries input data (params, query, body, headers), while the response object provides methods for building the output (status, headers, body). In practice, middleware often needs both objects, and developers frequently pass data between middleware and handlers by attaching custom properties to ",e.jsx("code",{className:"prose-code",children:"req"})," (like",e.jsx("code",{className:"prose-code",children:"req.user = decoded"}),"), which is not type-safe and requires augmenting the Express type definitions."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor consolidates everything into a single ",e.jsx("code",{className:"prose-code",children:"Context"}),"object with a chainable API. Request data is accessed through",e.jsx("code",{className:"prose-code",children:"ctx.params"}),", ",e.jsx("code",{className:"prose-code",children:"ctx.query"}),", and ",e.jsx("code",{className:"prose-code",children:"ctx.readJson()"}),". Response methods like",e.jsx("code",{className:"prose-code",children:"ctx.status()"}),",",e.jsx("code",{className:"prose-code",children:"ctx.header()"}),", and",e.jsx("code",{className:"prose-code",children:"ctx.json()"})," are chainable, allowing expressive one-liners like ",e.jsx("code",{className:"prose-code",children:"return ctx.status(201).json(user)"}),". Cross-cutting data is stored in the typed ",e.jsx("code",{className:"prose-code",children:"set/get"})," store rather than on arbitrary properties, which provides type safety and a clear contract between middleware and handlers."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The on-demand body parsing deserves emphasis because it changes how you think about request processing. In Express, ",e.jsx("code",{className:"prose-code",children:"req.body"})," is always available (assuming the JSON middleware is registered), so handlers access it directly. In Vexor,",e.jsx("code",{className:"prose-code",children:"ctx.readJson()"})," is an async function that reads the request stream and parses it. This means the body is not available until you explicitly request it, which is a minor syntax change but an important performance optimization for routes that do not need the body."]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-4",children:[e.jsx("div",{children:e.jsx(s,{code:c,filename:"Express"})}),e.jsx("div",{children:e.jsx(s,{code:l,filename:"Vexor"})})]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"error-handling",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Error Handling"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Error handling is arguably the area where Vexor provides the biggest improvement over Express. In Express, async errors require explicit try/catch and",e.jsx("code",{className:"prose-code",children:"next(err)"})," calls. If you forget either one, the error is silently swallowed and the request hangs until the client times out. This is Express's single most common source of production bugs. Libraries like",e.jsx("code",{className:"prose-code",children:"express-async-errors"})," patch this behavior, but they are workarounds for a fundamental design limitation."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor handles this at the framework level. Every handler and hook is wrapped in an automatic error boundary. If any async function throws (whether it is your code, a database driver, or a third-party library), Vexor catches the error and routes it to the",e.jsx("code",{className:"prose-code",children:"onError"})," hook. You never need to write try/catch in your handlers, and you never need to remember to call ",e.jsx("code",{className:"prose-code",children:"next(err)"}),". Just ",e.jsx("code",{className:"prose-code",children:"throw"}),", and the error hook handles the rest."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Express's error middleware has another subtle requirement: it must accept exactly four parameters (",e.jsx("code",{className:"prose-code",children:"err, req, res, next"}),"), even if you do not use ",e.jsx("code",{className:"prose-code",children:"next"}),". If you accidentally omit one parameter, Express treats it as regular middleware and your error handler is never called. Vexor's",e.jsx("code",{className:"prose-code",children:"onError"})," hook has a clear, typed signature that the TypeScript compiler enforces, making this class of silent failure impossible."]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-4",children:[e.jsx("div",{children:e.jsx(s,{code:p,filename:"Express"})}),e.jsx("div",{children:e.jsx(s,{code:h,filename:"Vexor"})})]}),e.jsxs(r,{variant:"warning",children:["In Express, forgetting to call ",e.jsx("code",{className:"prose-code",children:"next(err)"})," silently swallows errors. In Vexor, just ",e.jsx("code",{className:"prose-code",children:"throw"})," and the framework handles the rest. No errors are ever lost."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"database",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Database Access"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Express is deliberately unopinionated about database access, which means you bring your own driver, ORM, or query builder. This flexibility is a strength when your project has specific database requirements, but it also means every Express project reinvents the same patterns: connection pooling, transaction management, query building, and type safety. Most Express applications end up with raw SQL strings, manual connection management, and no type checking on query results."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor provides an optional but recommended companion package,",e.jsx("code",{className:"prose-code",children:"@vexorjs/orm"}),", which offers a type-safe query builder with compile-time type checking. The query builder generates SQL from method chains, so your IDE provides autocompletion for table columns, and TypeScript catches type mismatches at compile time rather than runtime. Connection pooling is built in and configured through the pool options rather than managed manually."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["You are not required to use ",e.jsx("code",{className:"prose-code",children:"@vexorjs/orm"}),". Vexor works equally well with Prisma, Drizzle, Knex, or raw database drivers. If your Express application already uses Prisma, you can keep using it in Vexor without changes. The migration from Express to Vexor is about the HTTP layer, not the database layer. Migrate the framework first, and consider the ORM change as a separate, optional step."]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-4",children:[e.jsx("div",{children:e.jsx(s,{code:x,filename:"Express + pg"})}),e.jsx("div",{children:e.jsx(s,{code:m,filename:"Vexor + @vexorjs/orm"})})]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"gradual-migration",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Gradual Migration Strategy"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"For large applications with dozens or hundreds of routes, rewriting everything at once is risky and impractical. A gradual migration lets you adopt Vexor incrementally, validating each migrated route in production before moving on to the next. The approach uses a reverse proxy to run both frameworks simultaneously, with the Express application forwarding specific route prefixes to the new Vexor application."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The migration proceeds in four phases. In the first phase, you set up the proxy and deploy both applications side by side. All traffic still flows through Express, so there is zero risk. In the second phase, you build new features in Vexor and proxy their route prefixes from Express. This validates the proxy setup and gives your team experience with Vexor before touching existing code. In the third phase, you migrate existing routes one at a time, starting with the most performance-sensitive or most actively maintained routes. In the fourth phase, once all routes are migrated, you remove the Express application and the proxy entirely."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"There are several common pitfalls to watch for during migration. First, ensure that session state and authentication tokens are compatible between both frameworks. If Express uses cookie-based sessions, Vexor must be able to read those cookies, or you need a shared session store. Second, be careful with middleware ordering: if Express and Vexor both run CORS middleware, the proxy must not add conflicting headers. Third, monitor error rates after each route migration. A spike in 500 errors for a specific endpoint indicates a migration bug that needs to be rolled back and investigated."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The priority order for migrating routes should consider three factors: business impact (migrate critical paths first so you validate Vexor thoroughly), development velocity (migrate routes your team actively works on so they benefit from Vexor's developer experience immediately), and complexity (migrate simpler routes first to build confidence before tackling complex ones with many middleware dependencies)."}),e.jsx(s,{code:y,filename:"express-app.ts",showLineNumbers:!0}),e.jsx(s,{code:j,filename:"vexor-app.ts",showLineNumbers:!0}),e.jsx(r,{variant:"tip",children:"Start by migrating new features to Vexor while keeping existing Express routes untouched. Then migrate the most critical or performance-sensitive routes next. Leave rarely-changed legacy routes for last."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"common-pitfalls",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Common Pitfalls"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Developers migrating from Express frequently encounter the same set of issues. Knowing these in advance will save you debugging time and prevent subtle bugs from reaching production."}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-left border-collapse",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"py-3 pr-4 text-slate-900 dark:text-white font-semibold",children:"Pitfall"}),e.jsx("th",{className:"py-3 text-slate-900 dark:text-white font-semibold",children:"Solution"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsxs("td",{className:"py-3 pr-4 font-medium",children:["Forgetting ",e.jsx("code",{className:"prose-code",children:"return"})," in handlers"]}),e.jsxs("td",{className:"py-3",children:["In Express, ",e.jsx("code",{className:"prose-code",children:"res.json()"})," sends the response as a side effect, so ",e.jsx("code",{className:"prose-code",children:"return"})," is optional. In Vexor, the handler must ",e.jsx("code",{className:"prose-code",children:"return"})," the response. Omitting it causes the framework to send an empty response."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsxs("td",{className:"py-3 pr-4 font-medium",children:["Forgetting ",e.jsx("code",{className:"prose-code",children:"await"})," on ",e.jsx("code",{className:"prose-code",children:"ctx.readJson()"})]}),e.jsxs("td",{className:"py-3",children:["Unlike Express's synchronous ",e.jsx("code",{className:"prose-code",children:"req.body"}),", Vexor's body parsing is async. Forgetting ",e.jsx("code",{className:"prose-code",children:"await"})," gives you a Promise object instead of the parsed body. TypeScript catches this in strict mode."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsxs("td",{className:"py-3 pr-4 font-medium",children:["Using ",e.jsx("code",{className:"prose-code",children:"req.user"})," pattern"]}),e.jsxs("td",{className:"py-3",children:["Express middleware often attaches data to ",e.jsx("code",{className:"prose-code",children:"req"})," directly. In Vexor, use ",e.jsx("code",{className:"prose-code",children:"ctx.set('user', data)"})," and ",e.jsx("code",{className:"prose-code",children:"ctx.get('user')"})," instead. This provides type safety and avoids polluting the request object."]})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsxs("td",{className:"py-3 pr-4 font-medium",children:["Calling ",e.jsx("code",{className:"prose-code",children:"next()"})]}),e.jsxs("td",{className:"py-3",children:["There is no ",e.jsx("code",{className:"prose-code",children:"next()"})," in Vexor. Middleware that wants to pass through simply returns nothing (no return statement, or ",e.jsx("code",{className:"prose-code",children:"return undefined"}),"). Middleware that wants to short-circuit returns a response."]})]}),e.jsxs("tr",{children:[e.jsxs("td",{className:"py-3 pr-4 font-medium",children:["Registering ",e.jsx("code",{className:"prose-code",children:"express.json()"})]}),e.jsxs("td",{className:"py-3",children:["Vexor does not need body parsing middleware. Remove ",e.jsx("code",{className:"prose-code",children:"express.json()"}),", ",e.jsx("code",{className:"prose-code",children:"express.urlencoded()"}),", and ",e.jsx("code",{className:"prose-code",children:"body-parser"}),". Use ",e.jsx("code",{className:"prose-code",children:"ctx.readJson()"})," in handlers that need the body."]})]})]})]})})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"cheatsheet",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Quick Reference Cheatsheet"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Keep this reference handy during your migration. It maps every commonly used Express API to its Vexor equivalent. For most patterns, the translation is mechanical: replace the Express call with the Vexor equivalent, add ",e.jsx("code",{className:"prose-code",children:"return"}),"before response calls, and replace ",e.jsx("code",{className:"prose-code",children:"req.body"})," with",e.jsx("code",{className:"prose-code",children:"await ctx.readJson()"}),"."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The most significant conceptual shifts are the elimination of",e.jsx("code",{className:"prose-code",children:"next()"})," (middleware passes through by not returning), the replacement of error middleware with the ",e.jsx("code",{className:"prose-code",children:"onError"}),"hook, and the move from ",e.jsx("code",{className:"prose-code",children:"express.Router()"})," to",e.jsx("code",{className:"prose-code",children:"app.group()"}),". Once these three patterns become second nature, the rest of the migration follows naturally."]}),e.jsx(s,{code:f,filename:"cheatsheet.ts"})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(t,{to:"/advanced/performance",className:"btn-primary",children:["Performance Optimization ",e.jsx(a,{className:"w-4 h-4 ml-2"})]}),e.jsx(t,{to:"/routing",className:"btn-secondary",children:"Routing Guide"})]})]})]})}export{w as default};
