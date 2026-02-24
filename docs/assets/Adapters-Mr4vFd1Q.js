import{j as e,C as t,I as s,L as a,A as r}from"./index-Bga0OgzL.js";const o=`import { Vexor } from '@vexorjs/core';
import { startNodeServer } from '@vexorjs/core/adapters/node';
import { startBunServer } from '@vexorjs/core/adapters/bun';
import { createDenoAdapter } from '@vexorjs/core/adapters/deno';

const app = new Vexor();

app.get('/hello', (ctx) => ctx.json({ message: 'Hello World' }));

// Vexor auto-detects the runtime and starts accordingly
// Or you can explicitly choose an adapter:
startNodeServer(app, { port: 3000 });`,n=`import { Vexor } from '@vexorjs/core';
import { createNodeServer, startNodeServer } from '@vexorjs/core/adapters/node';

const app = new Vexor();

app.get('/api/health', (ctx) => {
  return ctx.json({ status: 'ok', runtime: 'node' });
});

// Option 1: Create a raw http.Server for custom configuration
const server = createNodeServer(app, {
  hostname: '0.0.0.0',
  port: 3000,
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

// Option 2: Start with built-in lifecycle management
startNodeServer(app, {
  port: 3000,
  hostname: '0.0.0.0',
  onListen: ({ port, hostname }) => {
    console.log(\`Listening on http://\${hostname}:\${port}\`);
  },
  gracefulShutdown: true,
  shutdownTimeout: 10_000,
});`,l=`import { Vexor } from '@vexorjs/core';
import { startNodeServer } from '@vexorjs/core/adapters/node';
import { createServer as createHttpsServer } from 'node:https';
import { readFileSync } from 'node:fs';

const app = new Vexor();

// HTTPS support with custom Node.js server
startNodeServer(app, {
  port: 443,
  serverFactory: (handler) => {
    return createHttpsServer(
      {
        key: readFileSync('./certs/key.pem'),
        cert: readFileSync('./certs/cert.pem'),
      },
      handler
    );
  },
  // Enable HTTP/2 with Node.js compatibility
  http2: true,
  // Configure keep-alive
  keepAliveTimeout: 72_000,
  headersTimeout: 75_000,
});`,i=`import { Vexor } from '@vexorjs/core';
import { startBunServer, isBun } from '@vexorjs/core/adapters/bun';

const app = new Vexor();

app.get('/api/health', (ctx) => {
  return ctx.json({
    status: 'ok',
    runtime: 'bun',
    bunVersion: isBun() ? Bun.version : null,
  });
});

// Start using Bun.serve() under the hood
startBunServer(app, {
  port: 3000,
  hostname: '0.0.0.0',

  // Bun-specific TLS configuration
  tls: {
    key: Bun.file('./certs/key.pem'),
    cert: Bun.file('./certs/cert.pem'),
  },

  // Development mode enables hot reloading
  development: process.env.NODE_ENV !== 'production',

  // Max request body size (default: 128MB)
  maxRequestBodySize: 1024 * 1024 * 50, // 50MB

  // WebSocket support (Bun native)
  websocket: {
    open(ws) { console.log('Connected:', ws.remoteAddress); },
    message(ws, msg) { ws.send(\`Echo: \${msg}\`); },
    close(ws) { console.log('Disconnected'); },
  },
});`,c=`import { Vexor } from '@vexorjs/core';
import { createDenoAdapter, isDeno } from '@vexorjs/core/adapters/deno';

const app = new Vexor();

app.get('/api/health', (ctx) => {
  return ctx.json({
    status: 'ok',
    runtime: 'deno',
    denoVersion: isDeno() ? Deno.version.deno : null,
  });
});

// Create a Deno.serve-compatible handler
const handler = createDenoAdapter(app);

// Use with Deno.serve()
Deno.serve({
  port: 3000,
  hostname: '0.0.0.0',
  onListen: ({ port, hostname }) => {
    console.log(\`Listening on http://\${hostname}:\${port}\`);
  },
}, handler);`,d=`// deno.json
// {
//   "tasks": {
//     "start": "deno run --allow-net --allow-env main.ts"
//   }
// }

import { Vexor } from '@vexorjs/core';
import { createDenoAdapter } from '@vexorjs/core/adapters/deno';

const app = new Vexor();

app.get('/', (ctx) => ctx.json({ message: 'Hello from Deno Deploy!' }));
app.get('/api/time', (ctx) => ctx.json({ time: new Date().toISOString() }));

// Compatible with Deno Deploy
const handler = createDenoAdapter(app);
Deno.serve(handler);`,h=`import { Vexor } from '@vexorjs/core';
import {
  createCloudflareAdapter,
  createCloudflareWorker,
  createDurableObject,
} from '@vexorjs/core/adapters/cloudflare';

const app = new Vexor();

app.get('/api/hello', (ctx) => {
  // Access Cloudflare bindings via ctx.env
  return ctx.json({ message: 'Hello from Workers!' });
});

// Access KV, R2, D1, and other bindings
app.get('/api/data', async (ctx) => {
  const { KV, DB } = ctx.env;

  const cached = await KV.get('my-key');
  if (cached) return ctx.json(JSON.parse(cached));

  const result = await DB.prepare('SELECT * FROM users LIMIT 10').all();
  await KV.put('my-key', JSON.stringify(result.results), {
    expirationTtl: 3600,
  });

  return ctx.json(result.results);
});

// Option 1: Export as a worker module
export default createCloudflareWorker(app);`,p=`import { Vexor } from '@vexorjs/core';
import {
  createCloudflareAdapter,
  createDurableObject,
} from '@vexorjs/core/adapters/cloudflare';

// Durable Objects for stateful edge computing
export class RateLimiter extends createDurableObject({
  async fetch(request: Request, state: DurableObjectState) {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const key = \`rate:\${ip}\`;
    const current = (await state.storage.get<number>(key)) || 0;

    if (current >= 100) {
      return new Response('Rate limit exceeded', { status: 429 });
    }

    await state.storage.put(key, current + 1);
    state.storage.setAlarm(Date.now() + 60_000); // Reset after 1 min

    return new Response('OK');
  },

  async alarm(state: DurableObjectState) {
    await state.storage.deleteAll();
  },
}) {}

// wrangler.toml
// [[durable_objects.bindings]]
// name = "RATE_LIMITER"
// class_name = "RateLimiter"`,x=`import { Vexor } from '@vexorjs/core';
import {
  createVercelAdapter,
  createVercelEdgeHandler,
  createNextApiHandler,
  createEdgeMiddleware,
} from '@vexorjs/core/adapters/vercel';

const app = new Vexor();

app.get('/api/hello', (ctx) => {
  return ctx.json({ message: 'Hello from Vercel Edge!' });
});

app.get('/api/geo', (ctx) => {
  // Access Vercel-specific headers
  const city = ctx.req.header('x-vercel-ip-city') || 'unknown';
  const country = ctx.req.header('x-vercel-ip-country') || 'unknown';
  return ctx.json({ city, country });
});

// Option 1: Vercel Edge Functions (recommended)
export const GET = createVercelEdgeHandler(app);
export const POST = createVercelEdgeHandler(app);

// Option 2: Vercel Serverless Functions (Node.js runtime)
export default createVercelAdapter(app);`,m=`// pages/api/[...path].ts (Pages Router)
import { Vexor } from '@vexorjs/core';
import { createNextApiHandler } from '@vexorjs/core/adapters/vercel';

const app = new Vexor();

app.get('/api/users', async (ctx) => {
  const users = await db.query('SELECT * FROM users');
  return ctx.json(users);
});

app.post('/api/users', async (ctx) => {
  const body = await ctx.req.json();
  const user = await db.insert('users', body);
  return ctx.status(201).json(user);
});

// Wrap for Next.js API routes
export default createNextApiHandler(app);

// Configure body parsing
export const config = {
  api: { bodyParser: false },
};`,u=`// middleware.ts (Next.js Edge Middleware)
import { Vexor } from '@vexorjs/core';
import { createEdgeMiddleware } from '@vexorjs/core/adapters/vercel';

const app = new Vexor();

// Protect API routes with auth
app.addHook('onRequest', async (ctx) => {
  const path = ctx.req.path;

  if (path.startsWith('/api/admin')) {
    const token = ctx.req.header('authorization')?.replace('Bearer ', '');
    if (!token || !(await verifyAdminToken(token))) {
      return ctx.status(401).json({ error: 'Unauthorized' });
    }
  }
});

// Add security headers
app.addHook('onResponse', async (ctx, response) => {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
});

export const middleware = createEdgeMiddleware(app);

export const config = {
  matcher: ['/api/:path*'],
};`,f=`import {
  detectRuntime,
  isNode,
  isBun,
  isDeno,
  isCloudflareWorker,
  isVercelEdge,
} from '@vexorjs/core/runtime';

// Automatic detection
const runtime = detectRuntime();
// Returns: 'node' | 'bun' | 'deno' | 'cloudflare' | 'vercel-edge' | 'unknown'

console.log('Current runtime:', runtime);

// Individual checks
if (isNode()) {
  console.log('Node.js version:', process.version);
}

if (isBun()) {
  console.log('Bun version:', Bun.version);
}

if (isDeno()) {
  console.log('Deno version:', Deno.version.deno);
}

if (isCloudflareWorker()) {
  console.log('Running on Cloudflare Workers');
}

if (isVercelEdge()) {
  console.log('Running on Vercel Edge');
}

// Use in your app for conditional logic
const app = new Vexor();

app.get('/runtime', (ctx) => {
  return ctx.json({
    runtime: detectRuntime(),
    features: {
      fileSystem: isNode() || isBun() || isDeno(),
      nativeWebSocket: isBun() || isDeno() || isCloudflareWorker(),
      durableObjects: isCloudflareWorker(),
      edgeCompute: isCloudflareWorker() || isVercelEdge(),
    },
  });
});`;function g(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"adapters-runtimes",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"Adapters & Runtimes"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"Vexor runs everywhere. Deploy to Node.js, Bun, Deno, Cloudflare Workers, or Vercel Edge with zero code changes. Each adapter translates platform-specific APIs into Vexor's universal request/response model while exposing platform-specific features when you need them."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The JavaScript runtime landscape has fragmented significantly. Node.js, Bun, Deno, and edge platforms like Cloudflare Workers each provide their own HTTP server primitives, request objects, and response APIs. A framework that only supports one runtime forces you into a platform lock-in decision before you write your first line of business logic. Vexor's adapter architecture solves this by placing a thin translation layer between your application code and the underlying platform, so your route handlers, middleware, and hooks remain identical regardless of where they execute."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Internally, the adapter system works by normalizing every platform's incoming request into Vexor's unified ",e.jsx("code",{className:"prose-code",children:"Context"})," object. When a request arrives, the active adapter extracts the HTTP method, URL, headers, and body stream from the platform-native request and wraps them in a standardized interface. Your handler reads from this interface without knowing whether the bytes came from Node.js's ",e.jsx("code",{className:"prose-code",children:"IncomingMessage"}),", Bun's native ",e.jsx("code",{className:"prose-code",children:"Request"}),", or a Cloudflare Worker's fetch event. After your handler produces a response, the adapter translates it back into whatever the platform expects -- a writable stream for Node.js, a ",e.jsx("code",{className:"prose-code",children:"Response"})," object for Web API-based runtimes, or an exported handler for serverless platforms."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"This design means you can develop locally on Node.js, run benchmarks on Bun, deploy your API to Cloudflare Workers for edge performance, and serve a Next.js frontend through Vercel -- all from the same codebase. The adapter is the only thing that changes, and each adapter is a single import away."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"how-it-works",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"How It Works"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"At its core, Vexor's adapter pattern follows a well-established software architecture principle: the adapter (or wrapper) pattern. Each adapter implements a common contract that bridges the gap between Vexor's internal request pipeline and the host runtime's HTTP primitives. The pipeline itself is runtime-agnostic -- it processes a normalized request through middleware, hooks, route matching, and handler execution without any knowledge of the underlying platform."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When a request arrives, the adapter performs three critical translations. First, it converts the platform's native request object into Vexor's internal ",e.jsx("code",{className:"prose-code",children:"VexorRequest"}),", which provides a uniform API for accessing method, path, headers, query parameters, and body regardless of origin. Second, it invokes the Vexor application's request pipeline, which runs your ",e.jsx("code",{className:"prose-code",children:"onRequest"})," hooks, matches routes, executes handlers, and runs ",e.jsx("code",{className:"prose-code",children:"onResponse"})," hooks. Third, it converts the resulting ",e.jsx("code",{className:"prose-code",children:"VexorResponse"})," back into whatever the platform requires -- a Node.js writable stream, a Web API",e.jsx("code",{className:"prose-code",children:" Response"}),", or a serverless function return value."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Crucially, adapters also expose platform-specific capabilities through escape hatches. The Cloudflare adapter injects KV, R2, and D1 bindings into ",e.jsx("code",{className:"prose-code",children:"ctx.env"}),". The Bun adapter exposes native WebSocket support. The Vercel adapter provides access to geo-location headers. These extensions are additive -- they enrich the context without breaking the universal contract, so code that does not use them remains portable."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"The adapter is selected at the entry point of your application, not inside your business logic. This single point of configuration means migrating between runtimes requires changing one import statement and potentially adjusting platform-specific options, while every route handler, middleware function, and hook remains untouched."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"choosing-a-runtime",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Choosing a Runtime"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Each runtime offers distinct trade-offs in performance, ecosystem maturity, deployment model, and available APIs. Understanding these trade-offs helps you choose the right target for your specific use case rather than defaulting to the most familiar option."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Node.js"})," is the safest choice for most traditional server applications. It has the largest ecosystem of npm packages, the most mature tooling for debugging and profiling, and the broadest deployment support across cloud providers. Choose Node.js when you rely heavily on native modules (like database drivers or image processing libraries), need long-running server processes, or want the broadest compatibility with existing infrastructure. The trade-off is that Node.js has higher cold-start times than edge runtimes and uses a callback-based I/O model that can be slightly slower than newer runtimes for raw HTTP throughput."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Bun"})," is the performance-oriented choice. Its HTTP server uses native system calls and avoids the overhead of Node.js streams, delivering significantly higher throughput for I/O-heavy workloads. Bun also includes a built-in bundler, test runner, and package manager, reducing toolchain complexity. Choose Bun when raw request-per-second performance matters, when you want native WebSocket support without additional libraries, or when you want faster development iteration through built-in hot reloading. The trade-off is a smaller ecosystem and less battle-tested production tooling compared to Node.js."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Deno"})," provides security-first design with explicit permissions, built-in TypeScript support without a compilation step, and native Web API alignment. Choose Deno when security isolation is important (sandboxing network access, file system reads), when you want to leverage Web Standards APIs natively, or when deploying to Deno Deploy for globally distributed edge hosting. The trade-off is that some npm packages may not work without compatibility shims, and the operational tooling is less established."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Cloudflare Workers"})," excel at latency-sensitive workloads that benefit from running at the edge -- closer to your users. With access to KV storage, R2 object storage, D1 databases, and Durable Objects, Workers provide a full application platform at the edge. Choose Cloudflare when you need sub-50ms global response times, when your application can work within the Worker memory and CPU constraints, or when you need stateful edge computing via Durable Objects. The trade-off is the 128MB memory limit, restricted CPU time, no file system access, and a more constrained JavaScript runtime that excludes some Node.js APIs."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Vercel Edge"})," is ideal when your API lives alongside a Next.js frontend. Edge Functions run on Vercel's global network with low latency, while Serverless Functions give you the full Node.js runtime for heavier operations. Choose Vercel when you are already using Next.js, when you need both edge and serverless functions in the same project, or when you want seamless integration with Vercel's preview deployments and CI/CD pipeline. The trade-off is vendor lock-in to Vercel's platform and the execution time limits of serverless functions."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"overview",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Overview"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Write your application once and deploy to any JavaScript runtime. Vexor adapters handle the translation between each platform's native HTTP primitives and Vexor's unified",e.jsx("code",{className:"prose-code",children:" Context"})," object. The example below shows how the same application instance can be passed to any adapter -- the routing, middleware, and handler logic is completely decoupled from the server lifecycle."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When you call ",e.jsx("code",{className:"prose-code",children:"app.listen()"})," without specifying an adapter, Vexor inspects the global environment to determine which runtime is active. It checks for the presence of runtime-specific globals like ",e.jsx("code",{className:"prose-code",children:"Bun"}),",",e.jsx("code",{className:"prose-code",children:" Deno"}),", or Cloudflare's service worker scope, and selects the appropriate adapter automatically. For production deployments where you want explicit control over server configuration (TLS certificates, graceful shutdown, custom ports), use the platform-specific adapter functions directly."]}),e.jsx(t,{code:o,showLineNumbers:!0}),e.jsxs(s,{variant:"tip",title:"Auto-Detection",children:["When you call ",e.jsx("code",{className:"prose-code",children:"app.listen()"})," without specifying an adapter, Vexor automatically detects the current runtime and selects the appropriate adapter. Use explicit adapters when you need platform-specific configuration."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"nodejs-adapter",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Node.js Adapter"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The Node.js adapter wraps Vexor in a standard ",e.jsx("code",{className:"prose-code",children:"http.Server"})," and supports HTTPS, HTTP/2, graceful shutdown, and custom server factories. This is the most commonly used adapter for traditional server deployments, container-based infrastructure, and any environment where Node.js is the default runtime."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Internally, the Node.js adapter converts Node's ",e.jsx("code",{className:"prose-code",children:"IncomingMessage"})," into a Web API-compatible ",e.jsx("code",{className:"prose-code",children:"Request"})," object, which Vexor's pipeline then processes. The response flows back through Node's ",e.jsx("code",{className:"prose-code",children:"ServerResponse"})," writable stream. This conversion adds a small overhead compared to runtimes that natively use the Web API ",e.jsx("code",{className:"prose-code",children:"Request"}),"/",e.jsx("code",{className:"prose-code",children:"Response"})," model, but it provides full compatibility with Node.js's extensive ecosystem of HTTP middleware, TLS configuration, and server management tools."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The adapter provides two entry points. ",e.jsx("code",{className:"prose-code",children:"createNodeServer"})," returns a raw ",e.jsx("code",{className:"prose-code",children:"http.Server"})," instance that you manage yourself -- useful when you need to attach the server to a custom port, integrate with an existing Express or Fastify application, or combine with tools like Socket.IO.",e.jsx("code",{className:"prose-code",children:" startNodeServer"})," handles the full lifecycle: binding to a port, registering signal handlers for graceful shutdown, and waiting for in-flight requests to drain before exiting."]}),e.jsx(t,{code:n,filename:"server.ts",showLineNumbers:!0}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4 mt-6",children:["For production deployments requiring HTTPS or HTTP/2, use the"," ",e.jsx("code",{className:"prose-code",children:"serverFactory"})," option to supply a custom server instance. The factory receives the request handler function and returns an ",e.jsx("code",{className:"prose-code",children:"http.Server"})," (or",e.jsx("code",{className:"prose-code",children:" https.Server"}),"), giving you full control over TLS certificates, cipher suites, and protocol negotiation. This pattern avoids wrapping HTTPS configuration inside Vexor itself, keeping the framework focused on application logic while delegating transport-level concerns to Node.js's native APIs."]}),e.jsx(t,{code:l,filename:"server-https.ts",showLineNumbers:!0}),e.jsxs(s,{variant:"info",title:"Graceful Shutdown",children:["When ",e.jsx("code",{className:"prose-code",children:"gracefulShutdown"})," is enabled, the server listens for SIGTERM and SIGINT signals, stops accepting new connections, and waits for in-flight requests to complete before exiting. The ",e.jsx("code",{className:"prose-code",children:"shutdownTimeout"})," controls the maximum wait time. This is essential for container orchestration systems like Kubernetes, which send SIGTERM during rolling deployments and expect the process to finish serving active requests before terminating. If in-flight requests do not complete within the timeout, the server forcefully closes all connections to prevent deployment stalls."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"bun-adapter",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Bun Adapter"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The Bun adapter leverages ",e.jsx("code",{className:"prose-code",children:"Bun.serve()"})," for maximum performance. It supports Bun's native TLS, built-in WebSocket server, hot reloading in development, and configurable request body size limits. Because Bun natively uses the Web API",e.jsx("code",{className:"prose-code",children:" Request"})," and ",e.jsx("code",{className:"prose-code",children:"Response"})," objects, this adapter avoids the conversion overhead present in the Node.js adapter, resulting in measurably lower per-request latency."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Under the hood, Bun's HTTP server is implemented in Zig and uses native system calls (like",e.jsx("code",{className:"prose-code",children:" io_uring"})," on Linux) to handle network I/O. This bypasses the libuv event loop that Node.js relies on, eliminating several layers of abstraction between your handler code and the operating system's networking stack. The result is significantly higher throughput for I/O-bound workloads -- often 2-3x more requests per second compared to Node.js for simple JSON API responses. Vexor's Bun adapter takes full advantage of this by passing ",e.jsx("code",{className:"prose-code",children:"Request"}),"/",e.jsx("code",{className:"prose-code",children:"Response"})," objects directly without conversion."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Bun's native WebSocket support is particularly noteworthy. Unlike Node.js, where WebSocket requires a third-party library like ",e.jsx("code",{className:"prose-code",children:"ws"})," or",e.jsx("code",{className:"prose-code",children:" socket.io"}),", Bun provides a first-class WebSocket API integrated directly into its HTTP server. The Vexor Bun adapter exposes this through the",e.jsx("code",{className:"prose-code",children:" websocket"})," option, allowing you to handle WebSocket connections alongside your HTTP routes without additional dependencies."]}),e.jsx(t,{code:i,filename:"server.ts",showLineNumbers:!0}),e.jsxs(s,{variant:"tip",title:"Performance",children:["Bun's HTTP server uses native system calls and avoids the overhead of Node.js streams, making it significantly faster for high-throughput workloads. Vexor's Bun adapter takes full advantage of this by passing ",e.jsx("code",{className:"prose-code",children:"Request"}),"/",e.jsx("code",{className:"prose-code",children:"Response"})," ","objects directly without conversion. Enable ",e.jsx("code",{className:"prose-code",children:"development: true"})," during local development for hot reloading, but always disable it in production to avoid the overhead of file watching."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"deno-adapter",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Deno Adapter"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The Deno adapter produces a handler function compatible with"," ",e.jsx("code",{className:"prose-code",children:"Deno.serve()"}),". It works with both local Deno installations and Deno Deploy for edge deployments. Because Deno natively implements the Web API",e.jsx("code",{className:"prose-code",children:" Request"}),"/",e.jsx("code",{className:"prose-code",children:"Response"})," standard, the adapter performs minimal translation -- it simply forwards the incoming",e.jsx("code",{className:"prose-code",children:" Request"})," to Vexor's pipeline and returns the resulting",e.jsx("code",{className:"prose-code",children:" Response"}),"."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Deno's permission system is a key differentiator. By default, a Deno process has no access to the network, file system, or environment variables. You must explicitly grant permissions at startup (for example, ",e.jsx("code",{className:"prose-code",children:"--allow-net"})," for HTTP serving). This makes Deno an excellent choice for security-sensitive environments or multi-tenant applications where you want to limit the blast radius of a compromised handler. The Vexor adapter works seamlessly within these constraints -- it only requires network access to serve HTTP requests, and any additional permissions depend on what your handlers do."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"On Deno Deploy, permissions are granted automatically and the runtime is pre-warmed, eliminating cold starts. Your Vexor application runs on a global edge network with automatic scaling, making Deno Deploy a compelling choice for globally distributed APIs that need low latency without the operational complexity of managing multiple regions."}),e.jsx(t,{code:c,filename:"main.ts",showLineNumbers:!0}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4 mt-6",children:["Deploying to Deno Deploy requires no special configuration beyond using the adapter. The same code that runs locally with ",e.jsx("code",{className:"prose-code",children:"Deno.serve()"})," works identically on Deno Deploy. Simply push your code to a connected Git repository, and Deno Deploy handles the build and deployment pipeline automatically."]}),e.jsx(t,{code:d,filename:"main.ts",showLineNumbers:!0}),e.jsxs(s,{variant:"info",title:"Permissions",children:["Deno requires explicit permissions. Use ",e.jsx("code",{className:"prose-code",children:"--allow-net"})," for network access, ",e.jsx("code",{className:"prose-code",children:"--allow-env"})," for environment variables, and ",e.jsx("code",{className:"prose-code",children:"--allow-read"})," for file system access. On Deno Deploy, permissions are granted automatically. When running locally, use the most restrictive set of permissions possible -- for example, ",e.jsx("code",{className:"prose-code",children:"--allow-net=0.0.0.0:3000"})," limits network access to only the server port."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"cloudflare-workers",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Cloudflare Workers"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Deploy to Cloudflare's edge network with access to KV, R2, D1, Durable Objects, and other Cloudflare bindings. The adapter exposes bindings through"," ",e.jsx("code",{className:"prose-code",children:"ctx.env"})," so you can access them in any handler. Workers execute on Cloudflare's network of over 300 data centers worldwide, meaning your API handler runs physically close to the user making the request, dramatically reducing round-trip latency."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The Cloudflare adapter translates Vexor's application into a Workers module export. When a request arrives at Cloudflare's edge, the Worker runtime invokes the exported",e.jsx("code",{className:"prose-code",children:" fetch"})," handler, which the adapter maps to Vexor's request pipeline. The adapter also injects the Worker's environment bindings (KV namespaces, D1 databases, R2 buckets, service bindings) into the Vexor context, making them accessible through ",e.jsx("code",{className:"prose-code",children:"ctx.env"}),". This means your handlers can read from KV, query D1, or store objects in R2 using the same context-based API that the rest of your Vexor application uses."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["It is important to understand the execution model. Workers are stateless by default -- each request may execute on a different isolate, and there is no shared memory between requests. For stateful workloads, Cloudflare provides Durable Objects, which guarantee single-threaded access to a storage-backed object. Vexor's ",e.jsx("code",{className:"prose-code",children:"createDurableObject"})," helper simplifies creating Durable Object classes that integrate with Vexor's request handling model."]}),e.jsx(t,{code:h,filename:"src/index.ts",showLineNumbers:!0}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4 mt-6",children:"For stateful workloads, use Durable Objects to persist data at the edge with strong consistency guarantees. Each Durable Object instance is pinned to a single Cloudflare location and processes requests sequentially, making it suitable for coordination tasks like rate limiting, leader election, and real-time collaboration. The Vexor helper wraps the Durable Object lifecycle and provides a familiar request/response interface."}),e.jsx(t,{code:p,filename:"src/durable-objects.ts",showLineNumbers:!0}),e.jsx(s,{variant:"warning",title:"Worker Limits",children:"Cloudflare Workers have a 128MB memory limit, 10ms CPU time (free) or 30s (paid), and no file system access. Design your handlers to work within these constraints. Use KV or R2 for storage instead of the file system. Avoid CPU-intensive operations like image processing or large JSON parsing -- offload these to a Node.js serverless function or a dedicated compute service and call it from the Worker."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"vercel-edge",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Vercel Edge"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Deploy Vexor to Vercel as Edge Functions, Serverless Functions, or Next.js API routes. The Vercel adapter provides helpers for each deployment model, including edge middleware for authentication and request transformation. This makes Vexor an excellent choice for teams that already use Vercel for their frontend and want a consistent deployment pipeline for their API layer."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vercel offers two distinct execution environments, and Vexor provides dedicated adapters for each. Edge Functions run on Vercel's global edge network (powered by Cloudflare under the hood) and are ideal for low-latency responses, authentication checks, and request routing. They have access to the Web Crypto API, fetch, and a limited subset of Node.js APIs. Serverless Functions run in a full Node.js environment on AWS Lambda, providing access to the entire Node.js ecosystem including native modules, larger memory limits, and longer execution times. The ",e.jsx("code",{className:"prose-code",children:"createVercelEdgeHandler"})," targets the former, while ",e.jsx("code",{className:"prose-code",children:"createVercelAdapter"})," targets the latter."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["For Next.js applications, Vexor integrates at two levels. The ",e.jsx("code",{className:"prose-code",children:"createNextApiHandler"})," wraps a Vexor application as a Pages Router API route, handling the translation between Next.js's",e.jsx("code",{className:"prose-code",children:" req"}),"/",e.jsx("code",{className:"prose-code",children:"res"})," objects and Vexor's context. The ",e.jsx("code",{className:"prose-code",children:"createEdgeMiddleware"})," function runs Vexor as Next.js Edge Middleware, executing before any page or API route to handle cross-cutting concerns like authentication, rate limiting, A/B testing, and header injection."]}),e.jsx(t,{code:x,filename:"app/api/hello/route.ts",showLineNumbers:!0}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4 mt-6",children:["For Next.js applications using the Pages Router, use"," ",e.jsx("code",{className:"prose-code",children:"createNextApiHandler"})," to wrap Vexor in a compatible handler. This is particularly useful for migrating existing Next.js API routes to Vexor incrementally -- you can wrap individual route files without changing the rest of your Next.js application. Set ",e.jsx("code",{className:"prose-code",children:"bodyParser: false"})," in the route config to let Vexor handle body parsing instead of Next.js's built-in parser."]}),e.jsx(t,{code:m,filename:"pages/api/[...path].ts",showLineNumbers:!0}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4 mt-6",children:["Use ",e.jsx("code",{className:"prose-code",children:"createEdgeMiddleware"})," to run Vexor as Next.js edge middleware for tasks like authentication, rate limiting, and header injection. Edge middleware runs before any page render or API route execution, making it the ideal place for cross-cutting security checks that should apply globally. The middleware function receives a ",e.jsx("code",{className:"prose-code",children:"NextRequest"})," and must return a",e.jsx("code",{className:"prose-code",children:" NextResponse"}),", which the adapter handles transparently."]}),e.jsx(t,{code:u,filename:"middleware.ts",showLineNumbers:!0}),e.jsxs(s,{variant:"tip",title:"Edge vs Serverless",children:["Use Edge Functions for low-latency responses that run close to the user. Use Serverless Functions when you need Node.js APIs, larger execution time limits, or more memory. The ",e.jsx("code",{className:"prose-code",children:"createVercelEdgeHandler"})," targets Edge, while"," ",e.jsx("code",{className:"prose-code",children:"createVercelAdapter"})," targets the Node.js Serverless runtime. A common pattern is to use Edge for read-heavy endpoints and Serverless for write-heavy endpoints that interact with databases."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"runtime-detection",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Runtime Detection"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor provides utility functions to detect the current runtime at startup. This is useful for conditional logic, feature flags, or logging. Detection is performed once and cached for the lifetime of the process, so calling these functions is effectively free after the first invocation."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The detection algorithm works by inspecting the global scope for runtime-specific objects. It checks for ",e.jsx("code",{className:"prose-code",children:"globalThis.Bun"})," to identify Bun,",e.jsx("code",{className:"prose-code",children:" globalThis.Deno"})," for Deno, the presence of",e.jsx("code",{className:"prose-code",children:" caches.default"})," for Cloudflare Workers, and the",e.jsx("code",{className:"prose-code",children:" VERCEL_EDGE"})," environment variable for Vercel Edge Functions. If none match, it falls back to checking ",e.jsx("code",{className:"prose-code",children:"process.versions.node"})," for Node.js. The result is cached in a module-level variable, so subsequent calls return instantly without re-evaluating the detection logic."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Runtime detection is particularly useful in shared library code that needs to behave differently across platforms. For example, you might use the file system for caching on Node.js but fall back to in-memory caching on Cloudflare Workers where file system access is unavailable. Or you might log to stdout on traditional servers but use a Worker-specific logging API on Cloudflare. The individual boolean check functions (",e.jsx("code",{className:"prose-code",children:"isNode()"}),", ",e.jsx("code",{className:"prose-code",children:"isBun()"}),", etc.) make these conditional paths clean and readable."]}),e.jsx(t,{code:f,filename:"runtime-check.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"best-practices",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Best Practices"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Keep adapter selection at the entry point."})," ","Your route handlers, middleware, and hooks should never import from adapter-specific modules. The adapter import should appear only in your server entry file (e.g., ",e.jsx("code",{className:"prose-code",children:"server.ts"})," or",e.jsx("code",{className:"prose-code",children:" index.ts"}),"). This ensures your business logic remains portable across all runtimes without modification."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Use platform-specific features through ctx.env, not direct imports."})," ","When you need Cloudflare KV, Deno permissions, or Vercel headers, access them through the context object rather than importing platform-specific modules directly. This keeps your handlers testable -- in tests, you can mock ",e.jsx("code",{className:"prose-code",children:"ctx.env"})," without needing to simulate an entire runtime."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Test on your target runtime early."})," ","While Vexor's adapter layer normalizes most differences, edge cases can emerge around body parsing, stream handling, and timing behavior. Run your test suite on the target runtime in CI, not just on Node.js, to catch runtime-specific issues before they reach production."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Enable graceful shutdown in production."})," ","For Node.js and Bun deployments, always enable graceful shutdown. Container orchestration systems like Kubernetes send SIGTERM signals during rolling deployments, and your server needs to stop accepting new connections while finishing in-flight requests. Without graceful shutdown, active requests are abruptly terminated, causing errors for your users."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:[e.jsx("strong",{className:"text-slate-900 dark:text-white",children:"Design for the most constrained target."})," ","If you might deploy to Cloudflare Workers, design your handlers to work within Worker constraints from the start. Avoid synchronous CPU-intensive operations, keep request handlers fast, and use external storage instead of in-memory caches. Code that works within Worker constraints works everywhere else with room to spare."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"api-reference",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"API Reference"}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3",children:"Node.js Adapter"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Function"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Signature"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"createNodeServer"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"(app, options?) => http.Server"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Creates a raw Node.js HTTP server instance wrapping the Vexor application. Returns the server without starting it, giving you full control over when and how the server begins listening. Use this when you need to attach additional event listeners, integrate with existing infrastructure, or manage the server lifecycle manually."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"startNodeServer"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"(app, options?) => Promise<void>"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Creates and starts a Node.js HTTP server with full lifecycle management. Handles port binding, the onListen callback, and optionally registers SIGTERM/SIGINT handlers for graceful shutdown. The returned promise resolves when the server is listening and rejects if binding fails (e.g., port already in use)."})]})]})]})}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3",children:"NodeServerOptions"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Option"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Type"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Default"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"port"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"number"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"3000"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"The TCP port the server binds to. If the port is already in use, the server will throw an EADDRINUSE error. Set to 0 to let the OS assign an available port automatically, which is useful for testing."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"hostname"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"string"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"'localhost'"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"The network interface to bind to. Use 'localhost' or '127.0.0.1' to accept connections only from the local machine. Use '0.0.0.0' to accept connections from any network interface, which is required inside Docker containers and most production environments."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"serverFactory"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"(handler) => http.Server"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"-"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"A factory function that receives the request handler and returns a custom server instance. Use this to create HTTPS servers, HTTP/2 servers, or servers with custom socket configuration. The factory is called once during server initialization."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"gracefulShutdown"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"boolean"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"false"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"When enabled, the server registers handlers for SIGTERM and SIGINT signals. Upon receiving a signal, it stops accepting new connections and waits for in-flight requests to complete before exiting the process. Essential for Kubernetes and container deployments."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"shutdownTimeout"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"number"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"30000"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Maximum time in milliseconds to wait for in-flight requests to complete during graceful shutdown. If requests do not finish within this window, the server forcefully closes all connections and exits. Set this lower than your orchestrator's termination grace period to ensure a clean exit."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"onListen"})}),e.jsxs("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:["(","{ port, hostname }",") => void"]}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"-"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Callback invoked once the server has successfully bound to the port and is ready to accept connections. Receives the resolved port and hostname, which is especially useful when port is set to 0 and the OS assigns a dynamic port."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"http2"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"boolean"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"false"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Enables HTTP/2 support with automatic HTTP/1.1 fallback via ALPN negotiation. Requires TLS (use with serverFactory to provide an HTTPS server). HTTP/2 enables multiplexed streams, header compression, and server push, improving performance for clients that support it."})]})]})]})}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3",children:"Bun Adapter"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Option"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Type"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Default"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"port"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"number"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"3000"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"The TCP port the Bun server binds to. Bun's port binding is slightly faster than Node.js because it uses native system calls directly rather than going through libuv."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"tls"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"{ key, cert }"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"-"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"TLS certificate and key for HTTPS. Accepts Bun.file() references or string paths. When provided, the server automatically serves over HTTPS. Bun uses BoringSSL for TLS, which is the same library used by Chrome and Cloudflare."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"development"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"boolean"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"false"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Enables Bun's development mode with hot reloading. When a source file changes, the server automatically reloads without restarting the process. Adds overhead from file watching, so always disable in production."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"maxRequestBodySize"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"number"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"134217728"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Maximum allowed request body size in bytes. Defaults to 128MB. Requests exceeding this limit are rejected with a 413 Payload Too Large response before the body is fully read, preventing memory exhaustion from oversized uploads."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"websocket"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"WebSocketHandler"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"-"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Bun's native WebSocket handler configuration. Provides open, message, close, and drain callbacks for managing WebSocket connections. Runs on the same server and port as HTTP without requiring a separate library or upgrade mechanism."})]})]})]})}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3",children:"Deno Adapter"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Function"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Signature"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"createDenoAdapter"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"(app) => Deno.ServeHandler"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Creates a handler function compatible with Deno.serve(). The returned function accepts a Request and returns a Response or Promise of Response, matching the Deno.ServeHandler signature. Works identically on local Deno and Deno Deploy."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"isDeno"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"() => boolean"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Returns true if the current runtime is Deno. Checks for the presence of globalThis.Deno. The result is cached after the first call, so subsequent invocations have zero overhead."})]})]})]})}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3",children:"Cloudflare Workers Adapter"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Function"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Signature"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"createCloudflareAdapter"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"(app) => ExportedHandler"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Creates a Cloudflare Workers-compatible handler that can be used in both module and service worker formats. Automatically injects environment bindings (KV, R2, D1, etc.) into the Vexor context as ctx.env, making platform services accessible from any route handler."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"createCloudflareWorker"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"(app) => ExportedHandler"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Creates a module-format worker export suitable for use as a default export. This is the recommended format for new Workers projects and is required for Workers that use Durable Objects, Queues, or other module-only features."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"createDurableObject"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"(handlers) => DurableObjectClass"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Creates a Durable Object class with Vexor integration. The handlers object defines fetch (for request handling) and alarm (for scheduled callbacks) methods. The resulting class can be exported and referenced in wrangler.toml bindings."})]})]})]})}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3",children:"Vercel Edge Adapter"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Function"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Signature"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"createVercelAdapter"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"(app) => VercelHandler"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Creates a Vercel Serverless Function handler that runs in the Node.js runtime. Provides access to the full Node.js API including native modules, file system access, and unlimited execution time (subject to Vercel plan limits). Use for database-heavy endpoints or operations requiring Node.js-specific packages."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"createVercelEdgeHandler"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"(app) => EdgeHandler"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Creates a Vercel Edge Function handler that runs on the global edge network. Provides low-latency responses from the nearest edge location. Limited to Web APIs (no Node.js native modules). Export the result as named HTTP method handlers (GET, POST, etc.) for the App Router."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"createNextApiHandler"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"(app) => NextApiHandler"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Wraps a Vexor application as a Next.js Pages Router API route handler. Translates between Next.js's req/res objects and Vexor's Context. Set bodyParser to false in the route config to let Vexor handle body parsing. Supports all HTTP methods through a single catch-all route."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"createEdgeMiddleware"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"(app) => NextMiddleware"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Creates a Next.js Edge Middleware handler. Runs before page renders and API routes, making it ideal for authentication, request rewriting, header injection, and A/B testing. Use the config.matcher to limit which paths the middleware applies to."})]})]})]})}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3",children:"Runtime Detection"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Function"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Returns"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"detectRuntime()"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"RuntimeType"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Detects the current JavaScript runtime by inspecting global objects and environment variables. Returns one of 'node', 'bun', 'deno', 'cloudflare', 'vercel-edge', or 'unknown'. The result is cached after first invocation for zero-cost subsequent calls."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"isNode()"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"boolean"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Returns true if running on Node.js. Checks for process.versions.node. Note that Bun also sets this value for compatibility, so isNode() returns false when Bun is detected to avoid ambiguity."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"isBun()"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"boolean"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Returns true if running on Bun. Checks for the globalThis.Bun object, which is exclusive to the Bun runtime. Bun is checked before Node.js in the detection order because Bun sets Node.js-compatible globals."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"isDeno()"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"boolean"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Returns true if running on Deno. Checks for the globalThis.Deno object. Works on both local Deno installations and Deno Deploy."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"isCloudflareWorker()"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"boolean"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Returns true if running on Cloudflare Workers. Detects the Workers runtime by checking for caches.default and the absence of Node.js/Bun/Deno globals. Works in both module and service worker formats."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"isVercelEdge()"})}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"boolean"}),e.jsx("td",{className:"py-3 px-4 text-slate-600 dark:text-slate-400",children:"Returns true if running on Vercel Edge Functions. Checks for the VERCEL_EDGE environment variable, which Vercel injects automatically into Edge Function execution contexts."})]})]})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next-steps",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(a,{to:"/advanced/circuit-breaker",className:"btn-primary",children:["Circuit Breaker ",e.jsx(r,{className:"w-4 h-4 ml-2"})]}),e.jsx(a,{to:"/advanced/deployment",className:"btn-secondary",children:"Deployment Guide"})]})]})]})}export{g as default};
