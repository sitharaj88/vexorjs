import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const overviewCode = `import { Vexor } from '@vexorjs/core';
import { startNodeServer } from '@vexorjs/core/adapters/node';
import { startBunServer } from '@vexorjs/core/adapters/bun';
import { createDenoAdapter } from '@vexorjs/core/adapters/deno';

const app = new Vexor();

app.get('/hello', (ctx) => ctx.json({ message: 'Hello World' }));

// Vexor auto-detects the runtime and starts accordingly
// Or you can explicitly choose an adapter:
startNodeServer(app, { port: 3000 });`;

const nodeBasicCode = `import { Vexor } from '@vexorjs/core';
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
});`;

const nodeAdvancedCode = `import { Vexor } from '@vexorjs/core';
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
});`;

const bunCode = `import { Vexor } from '@vexorjs/core';
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
});`;

const denoCode = `import { Vexor } from '@vexorjs/core';
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
}, handler);`;

const denoDeployCode = `// deno.json
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
Deno.serve(handler);`;

const cloudflareCode = `import { Vexor } from '@vexorjs/core';
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
export default createCloudflareWorker(app);`;

const cloudflareAdvancedCode = `import { Vexor } from '@vexorjs/core';
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
// class_name = "RateLimiter"`;

const vercelCode = `import { Vexor } from '@vexorjs/core';
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
export default createVercelAdapter(app);`;

const vercelNextCode = `// pages/api/[...path].ts (Pages Router)
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
};`;

const vercelMiddlewareCode = `// middleware.ts (Next.js Edge Middleware)
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
};`;

const runtimeDetectionCode = `import {
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
});`;

export default function Adapters() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="adapters-runtimes" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Adapters & Runtimes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Vexor runs everywhere. Deploy to Node.js, Bun, Deno, Cloudflare Workers, or Vercel Edge
          with zero code changes. Each adapter translates platform-specific APIs into Vexor's
          universal request/response model while exposing platform-specific features when you need them.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The JavaScript runtime landscape has fragmented significantly. Node.js, Bun, Deno, and
          edge platforms like Cloudflare Workers each provide their own HTTP server primitives,
          request objects, and response APIs. A framework that only supports one runtime forces you
          into a platform lock-in decision before you write your first line of business logic. Vexor's
          adapter architecture solves this by placing a thin translation layer between your application
          code and the underlying platform, so your route handlers, middleware, and hooks remain
          identical regardless of where they execute.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Internally, the adapter system works by normalizing every platform's incoming request into
          Vexor's unified <code className="prose-code">Context</code> object. When a request arrives,
          the active adapter extracts the HTTP method, URL, headers, and body stream from the
          platform-native request and wraps them in a standardized interface. Your handler reads from
          this interface without knowing whether the bytes came from Node.js's <code className="prose-code">IncomingMessage</code>,
          Bun's native <code className="prose-code">Request</code>, or a Cloudflare Worker's fetch
          event. After your handler produces a response, the adapter translates it back into whatever
          the platform expects -- a writable stream for Node.js, a <code className="prose-code">Response</code> object for
          Web API-based runtimes, or an exported handler for serverless platforms.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          This design means you can develop locally on Node.js, run benchmarks on Bun, deploy your
          API to Cloudflare Workers for edge performance, and serve a Next.js frontend through Vercel
          -- all from the same codebase. The adapter is the only thing that changes, and each adapter
          is a single import away.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          At its core, Vexor's adapter pattern follows a well-established software architecture
          principle: the adapter (or wrapper) pattern. Each adapter implements a common contract that
          bridges the gap between Vexor's internal request pipeline and the host runtime's HTTP
          primitives. The pipeline itself is runtime-agnostic -- it processes a normalized request
          through middleware, hooks, route matching, and handler execution without any knowledge of
          the underlying platform.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When a request arrives, the adapter performs three critical translations. First, it converts
          the platform's native request object into Vexor's internal <code className="prose-code">VexorRequest</code>,
          which provides a uniform API for accessing method, path, headers, query parameters, and
          body regardless of origin. Second, it invokes the Vexor application's request pipeline,
          which runs your <code className="prose-code">onRequest</code> hooks, matches routes,
          executes handlers, and runs <code className="prose-code">onResponse</code> hooks. Third,
          it converts the resulting <code className="prose-code">VexorResponse</code> back into
          whatever the platform requires -- a Node.js writable stream, a Web API
          <code className="prose-code"> Response</code>, or a serverless function return value.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Crucially, adapters also expose platform-specific capabilities through escape hatches. The
          Cloudflare adapter injects KV, R2, and D1 bindings into <code className="prose-code">ctx.env</code>.
          The Bun adapter exposes native WebSocket support. The Vercel adapter provides access to
          geo-location headers. These extensions are additive -- they enrich the context without
          breaking the universal contract, so code that does not use them remains portable.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The adapter is selected at the entry point of your application, not inside your business
          logic. This single point of configuration means migrating between runtimes requires changing
          one import statement and potentially adjusting platform-specific options, while every route
          handler, middleware function, and hook remains untouched.
        </p>
      </section>

      {/* When to Use / Choosing a Runtime */}
      <section>
        <h2 id="choosing-a-runtime" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Choosing a Runtime
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Each runtime offers distinct trade-offs in performance, ecosystem maturity, deployment model,
          and available APIs. Understanding these trade-offs helps you choose the right target for
          your specific use case rather than defaulting to the most familiar option.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Node.js</strong> is the safest choice
          for most traditional server applications. It has the largest ecosystem of npm packages,
          the most mature tooling for debugging and profiling, and the broadest deployment support
          across cloud providers. Choose Node.js when you rely heavily on native modules (like
          database drivers or image processing libraries), need long-running server processes, or
          want the broadest compatibility with existing infrastructure. The trade-off is that Node.js
          has higher cold-start times than edge runtimes and uses a callback-based I/O model that
          can be slightly slower than newer runtimes for raw HTTP throughput.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Bun</strong> is the performance-oriented
          choice. Its HTTP server uses native system calls and avoids the overhead of Node.js streams,
          delivering significantly higher throughput for I/O-heavy workloads. Bun also includes a
          built-in bundler, test runner, and package manager, reducing toolchain complexity. Choose
          Bun when raw request-per-second performance matters, when you want native WebSocket support
          without additional libraries, or when you want faster development iteration through built-in
          hot reloading. The trade-off is a smaller ecosystem and less battle-tested production
          tooling compared to Node.js.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Deno</strong> provides security-first
          design with explicit permissions, built-in TypeScript support without a compilation step,
          and native Web API alignment. Choose Deno when security isolation is important (sandboxing
          network access, file system reads), when you want to leverage Web Standards APIs natively,
          or when deploying to Deno Deploy for globally distributed edge hosting. The trade-off is
          that some npm packages may not work without compatibility shims, and the operational tooling
          is less established.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Cloudflare Workers</strong> excel at
          latency-sensitive workloads that benefit from running at the edge -- closer to your users.
          With access to KV storage, R2 object storage, D1 databases, and Durable Objects, Workers
          provide a full application platform at the edge. Choose Cloudflare when you need
          sub-50ms global response times, when your application can work within the Worker memory
          and CPU constraints, or when you need stateful edge computing via Durable Objects. The
          trade-off is the 128MB memory limit, restricted CPU time, no file system access, and a
          more constrained JavaScript runtime that excludes some Node.js APIs.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          <strong className="text-slate-900 dark:text-white">Vercel Edge</strong> is ideal when
          your API lives alongside a Next.js frontend. Edge Functions run on Vercel's global
          network with low latency, while Serverless Functions give you the full Node.js runtime
          for heavier operations. Choose Vercel when you are already using Next.js, when you need
          both edge and serverless functions in the same project, or when you want seamless
          integration with Vercel's preview deployments and CI/CD pipeline. The trade-off is
          vendor lock-in to Vercel's platform and the execution time limits of serverless functions.
        </p>
      </section>

      {/* Overview */}
      <section>
        <h2 id="overview" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Overview
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Write your application once and deploy to any JavaScript runtime. Vexor adapters handle
          the translation between each platform's native HTTP primitives and Vexor's unified
          <code className="prose-code"> Context</code> object. The example below shows how the same
          application instance can be passed to any adapter -- the routing, middleware, and handler
          logic is completely decoupled from the server lifecycle.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When you call <code className="prose-code">app.listen()</code> without specifying an
          adapter, Vexor inspects the global environment to determine which runtime is active. It
          checks for the presence of runtime-specific globals like <code className="prose-code">Bun</code>,
          <code className="prose-code"> Deno</code>, or Cloudflare's service worker scope, and
          selects the appropriate adapter automatically. For production deployments where you want
          explicit control over server configuration (TLS certificates, graceful shutdown, custom
          ports), use the platform-specific adapter functions directly.
        </p>
        <CodeBlock code={overviewCode} showLineNumbers />
        <InfoBlock variant="tip" title="Auto-Detection">
          When you call <code className="prose-code">app.listen()</code> without specifying an adapter,
          Vexor automatically detects the current runtime and selects the appropriate adapter. Use
          explicit adapters when you need platform-specific configuration.
        </InfoBlock>
      </section>

      {/* Node.js Adapter */}
      <section>
        <h2 id="nodejs-adapter" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Node.js Adapter
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The Node.js adapter wraps Vexor in a standard <code className="prose-code">http.Server</code> and
          supports HTTPS, HTTP/2, graceful shutdown, and custom server factories. This is the most
          commonly used adapter for traditional server deployments, container-based infrastructure,
          and any environment where Node.js is the default runtime.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Internally, the Node.js adapter converts Node's <code className="prose-code">IncomingMessage</code> into
          a Web API-compatible <code className="prose-code">Request</code> object, which Vexor's
          pipeline then processes. The response flows back through Node's <code className="prose-code">ServerResponse</code> writable
          stream. This conversion adds a small overhead compared to runtimes that natively use the
          Web API <code className="prose-code">Request</code>/<code className="prose-code">Response</code> model,
          but it provides full compatibility with Node.js's extensive ecosystem of HTTP middleware,
          TLS configuration, and server management tools.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The adapter provides two entry points. <code className="prose-code">createNodeServer</code> returns
          a raw <code className="prose-code">http.Server</code> instance that you manage yourself --
          useful when you need to attach the server to a custom port, integrate with an existing
          Express or Fastify application, or combine with tools like Socket.IO.
          <code className="prose-code"> startNodeServer</code> handles the full lifecycle: binding to
          a port, registering signal handlers for graceful shutdown, and waiting for in-flight
          requests to drain before exiting.
        </p>
        <CodeBlock code={nodeBasicCode} filename="server.ts" showLineNumbers />
        <p className="text-slate-600 dark:text-slate-400 mb-4 mt-6">
          For production deployments requiring HTTPS or HTTP/2, use the{' '}
          <code className="prose-code">serverFactory</code> option to supply a custom server instance.
          The factory receives the request handler function and returns an <code className="prose-code">http.Server</code> (or
          <code className="prose-code"> https.Server</code>), giving you full control over TLS
          certificates, cipher suites, and protocol negotiation. This pattern avoids wrapping HTTPS
          configuration inside Vexor itself, keeping the framework focused on application logic while
          delegating transport-level concerns to Node.js's native APIs.
        </p>
        <CodeBlock code={nodeAdvancedCode} filename="server-https.ts" showLineNumbers />
        <InfoBlock variant="info" title="Graceful Shutdown">
          When <code className="prose-code">gracefulShutdown</code> is enabled, the server listens for
          SIGTERM and SIGINT signals, stops accepting new connections, and waits for in-flight requests
          to complete before exiting. The <code className="prose-code">shutdownTimeout</code> controls
          the maximum wait time. This is essential for container orchestration systems like Kubernetes,
          which send SIGTERM during rolling deployments and expect the process to finish serving active
          requests before terminating. If in-flight requests do not complete within the timeout, the
          server forcefully closes all connections to prevent deployment stalls.
        </InfoBlock>
      </section>

      {/* Bun Adapter */}
      <section>
        <h2 id="bun-adapter" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Bun Adapter
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The Bun adapter leverages <code className="prose-code">Bun.serve()</code> for maximum performance.
          It supports Bun's native TLS, built-in WebSocket server, hot reloading in development, and
          configurable request body size limits. Because Bun natively uses the Web API
          <code className="prose-code"> Request</code> and <code className="prose-code">Response</code> objects,
          this adapter avoids the conversion overhead present in the Node.js adapter, resulting in
          measurably lower per-request latency.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Under the hood, Bun's HTTP server is implemented in Zig and uses native system calls (like
          <code className="prose-code"> io_uring</code> on Linux) to handle network I/O. This bypasses
          the libuv event loop that Node.js relies on, eliminating several layers of abstraction between
          your handler code and the operating system's networking stack. The result is significantly
          higher throughput for I/O-bound workloads -- often 2-3x more requests per second compared to
          Node.js for simple JSON API responses. Vexor's Bun adapter takes full advantage of this by
          passing <code className="prose-code">Request</code>/<code className="prose-code">Response</code> objects
          directly without conversion.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Bun's native WebSocket support is particularly noteworthy. Unlike Node.js, where WebSocket
          requires a third-party library like <code className="prose-code">ws</code> or
          <code className="prose-code"> socket.io</code>, Bun provides a first-class WebSocket API
          integrated directly into its HTTP server. The Vexor Bun adapter exposes this through the
          <code className="prose-code"> websocket</code> option, allowing you to handle WebSocket
          connections alongside your HTTP routes without additional dependencies.
        </p>
        <CodeBlock code={bunCode} filename="server.ts" showLineNumbers />
        <InfoBlock variant="tip" title="Performance">
          Bun's HTTP server uses native system calls and avoids the overhead of Node.js streams,
          making it significantly faster for high-throughput workloads. Vexor's Bun adapter takes
          full advantage of this by passing <code className="prose-code">Request</code>/<code className="prose-code">Response</code>{' '}
          objects directly without conversion. Enable <code className="prose-code">development: true</code> during
          local development for hot reloading, but always disable it in production to avoid the
          overhead of file watching.
        </InfoBlock>
      </section>

      {/* Deno Adapter */}
      <section>
        <h2 id="deno-adapter" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Deno Adapter
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The Deno adapter produces a handler function compatible with{' '}
          <code className="prose-code">Deno.serve()</code>. It works with both local Deno installations
          and Deno Deploy for edge deployments. Because Deno natively implements the Web API
          <code className="prose-code"> Request</code>/<code className="prose-code">Response</code> standard,
          the adapter performs minimal translation -- it simply forwards the incoming
          <code className="prose-code"> Request</code> to Vexor's pipeline and returns the resulting
          <code className="prose-code"> Response</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Deno's permission system is a key differentiator. By default, a Deno process has no access
          to the network, file system, or environment variables. You must explicitly grant permissions
          at startup (for example, <code className="prose-code">--allow-net</code> for HTTP serving).
          This makes Deno an excellent choice for security-sensitive environments or multi-tenant
          applications where you want to limit the blast radius of a compromised handler. The Vexor
          adapter works seamlessly within these constraints -- it only requires network access to serve
          HTTP requests, and any additional permissions depend on what your handlers do.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          On Deno Deploy, permissions are granted automatically and the runtime is pre-warmed,
          eliminating cold starts. Your Vexor application runs on a global edge network with
          automatic scaling, making Deno Deploy a compelling choice for globally distributed APIs
          that need low latency without the operational complexity of managing multiple regions.
        </p>
        <CodeBlock code={denoCode} filename="main.ts" showLineNumbers />
        <p className="text-slate-600 dark:text-slate-400 mb-4 mt-6">
          Deploying to Deno Deploy requires no special configuration beyond using the adapter. The
          same code that runs locally with <code className="prose-code">Deno.serve()</code> works
          identically on Deno Deploy. Simply push your code to a connected Git repository, and Deno
          Deploy handles the build and deployment pipeline automatically.
        </p>
        <CodeBlock code={denoDeployCode} filename="main.ts" showLineNumbers />
        <InfoBlock variant="info" title="Permissions">
          Deno requires explicit permissions. Use <code className="prose-code">--allow-net</code> for
          network access, <code className="prose-code">--allow-env</code> for environment variables,
          and <code className="prose-code">--allow-read</code> for file system access. On Deno Deploy,
          permissions are granted automatically. When running locally, use the most restrictive set of
          permissions possible -- for example, <code className="prose-code">--allow-net=0.0.0.0:3000</code> limits
          network access to only the server port.
        </InfoBlock>
      </section>

      {/* Cloudflare Workers */}
      <section>
        <h2 id="cloudflare-workers" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Cloudflare Workers
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Deploy to Cloudflare's edge network with access to KV, R2, D1, Durable Objects, and
          other Cloudflare bindings. The adapter exposes bindings through{' '}
          <code className="prose-code">ctx.env</code> so you can access them in any handler. Workers
          execute on Cloudflare's network of over 300 data centers worldwide, meaning your API
          handler runs physically close to the user making the request, dramatically reducing
          round-trip latency.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The Cloudflare adapter translates Vexor's application into a Workers module export. When
          a request arrives at Cloudflare's edge, the Worker runtime invokes the exported
          <code className="prose-code"> fetch</code> handler, which the adapter maps to Vexor's
          request pipeline. The adapter also injects the Worker's environment bindings (KV
          namespaces, D1 databases, R2 buckets, service bindings) into the Vexor context, making
          them accessible through <code className="prose-code">ctx.env</code>. This means your
          handlers can read from KV, query D1, or store objects in R2 using the same context-based
          API that the rest of your Vexor application uses.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          It is important to understand the execution model. Workers are stateless by default -- each
          request may execute on a different isolate, and there is no shared memory between requests.
          For stateful workloads, Cloudflare provides Durable Objects, which guarantee single-threaded
          access to a storage-backed object. Vexor's <code className="prose-code">createDurableObject</code> helper
          simplifies creating Durable Object classes that integrate with Vexor's request handling model.
        </p>
        <CodeBlock code={cloudflareCode} filename="src/index.ts" showLineNumbers />
        <p className="text-slate-600 dark:text-slate-400 mb-4 mt-6">
          For stateful workloads, use Durable Objects to persist data at the edge with strong
          consistency guarantees. Each Durable Object instance is pinned to a single Cloudflare
          location and processes requests sequentially, making it suitable for coordination tasks
          like rate limiting, leader election, and real-time collaboration. The Vexor helper wraps
          the Durable Object lifecycle and provides a familiar request/response interface.
        </p>
        <CodeBlock code={cloudflareAdvancedCode} filename="src/durable-objects.ts" showLineNumbers />
        <InfoBlock variant="warning" title="Worker Limits">
          Cloudflare Workers have a 128MB memory limit, 10ms CPU time (free) or 30s (paid),
          and no file system access. Design your handlers to work within these constraints.
          Use KV or R2 for storage instead of the file system. Avoid CPU-intensive operations
          like image processing or large JSON parsing -- offload these to a Node.js serverless
          function or a dedicated compute service and call it from the Worker.
        </InfoBlock>
      </section>

      {/* Vercel Edge */}
      <section>
        <h2 id="vercel-edge" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Vercel Edge
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Deploy Vexor to Vercel as Edge Functions, Serverless Functions, or Next.js API routes.
          The Vercel adapter provides helpers for each deployment model, including edge middleware
          for authentication and request transformation. This makes Vexor an excellent choice for
          teams that already use Vercel for their frontend and want a consistent deployment pipeline
          for their API layer.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vercel offers two distinct execution environments, and Vexor provides dedicated adapters
          for each. Edge Functions run on Vercel's global edge network (powered by Cloudflare under
          the hood) and are ideal for low-latency responses, authentication checks, and request
          routing. They have access to the Web Crypto API, fetch, and a limited subset of Node.js
          APIs. Serverless Functions run in a full Node.js environment on AWS Lambda, providing access
          to the entire Node.js ecosystem including native modules, larger memory limits, and longer
          execution times. The <code className="prose-code">createVercelEdgeHandler</code> targets the
          former, while <code className="prose-code">createVercelAdapter</code> targets the latter.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For Next.js applications, Vexor integrates at two levels. The <code className="prose-code">createNextApiHandler</code> wraps
          a Vexor application as a Pages Router API route, handling the translation between Next.js's
          <code className="prose-code"> req</code>/<code className="prose-code">res</code> objects and Vexor's context.
          The <code className="prose-code">createEdgeMiddleware</code> function runs Vexor as Next.js
          Edge Middleware, executing before any page or API route to handle cross-cutting concerns
          like authentication, rate limiting, A/B testing, and header injection.
        </p>
        <CodeBlock code={vercelCode} filename="app/api/hello/route.ts" showLineNumbers />
        <p className="text-slate-600 dark:text-slate-400 mb-4 mt-6">
          For Next.js applications using the Pages Router, use{' '}
          <code className="prose-code">createNextApiHandler</code> to wrap Vexor in a compatible handler.
          This is particularly useful for migrating existing Next.js API routes to Vexor incrementally
          -- you can wrap individual route files without changing the rest of your Next.js application.
          Set <code className="prose-code">bodyParser: false</code> in the route config to let Vexor
          handle body parsing instead of Next.js's built-in parser.
        </p>
        <CodeBlock code={vercelNextCode} filename="pages/api/[...path].ts" showLineNumbers />
        <p className="text-slate-600 dark:text-slate-400 mb-4 mt-6">
          Use <code className="prose-code">createEdgeMiddleware</code> to run Vexor as Next.js edge
          middleware for tasks like authentication, rate limiting, and header injection. Edge
          middleware runs before any page render or API route execution, making it the ideal place
          for cross-cutting security checks that should apply globally. The middleware function
          receives a <code className="prose-code">NextRequest</code> and must return a
          <code className="prose-code"> NextResponse</code>, which the adapter handles transparently.
        </p>
        <CodeBlock code={vercelMiddlewareCode} filename="middleware.ts" showLineNumbers />
        <InfoBlock variant="tip" title="Edge vs Serverless">
          Use Edge Functions for low-latency responses that run close to the user. Use Serverless
          Functions when you need Node.js APIs, larger execution time limits, or more memory.
          The <code className="prose-code">createVercelEdgeHandler</code> targets Edge, while{' '}
          <code className="prose-code">createVercelAdapter</code> targets the Node.js Serverless runtime.
          A common pattern is to use Edge for read-heavy endpoints and Serverless for write-heavy
          endpoints that interact with databases.
        </InfoBlock>
      </section>

      {/* Runtime Detection */}
      <section>
        <h2 id="runtime-detection" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Runtime Detection
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor provides utility functions to detect the current runtime at startup. This is useful
          for conditional logic, feature flags, or logging. Detection is performed once and cached
          for the lifetime of the process, so calling these functions is effectively free after the
          first invocation.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The detection algorithm works by inspecting the global scope for runtime-specific objects.
          It checks for <code className="prose-code">globalThis.Bun</code> to identify Bun,
          <code className="prose-code"> globalThis.Deno</code> for Deno, the presence of
          <code className="prose-code"> caches.default</code> for Cloudflare Workers, and the
          <code className="prose-code"> VERCEL_EDGE</code> environment variable for Vercel Edge
          Functions. If none match, it falls back to checking <code className="prose-code">process.versions.node</code> for
          Node.js. The result is cached in a module-level variable, so subsequent calls return instantly
          without re-evaluating the detection logic.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Runtime detection is particularly useful in shared library code that needs to behave
          differently across platforms. For example, you might use the file system for caching on
          Node.js but fall back to in-memory caching on Cloudflare Workers where file system access
          is unavailable. Or you might log to stdout on traditional servers but use a Worker-specific
          logging API on Cloudflare. The individual boolean check functions
          (<code className="prose-code">isNode()</code>, <code className="prose-code">isBun()</code>, etc.)
          make these conditional paths clean and readable.
        </p>
        <CodeBlock code={runtimeDetectionCode} filename="runtime-check.ts" showLineNumbers />
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Keep adapter selection at the entry point.</strong>{' '}
          Your route handlers, middleware, and hooks should never import from adapter-specific modules.
          The adapter import should appear only in your server entry file (e.g., <code className="prose-code">server.ts</code> or
          <code className="prose-code"> index.ts</code>). This ensures your business logic remains
          portable across all runtimes without modification.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Use platform-specific features through ctx.env, not direct imports.</strong>{' '}
          When you need Cloudflare KV, Deno permissions, or Vercel headers, access them through the
          context object rather than importing platform-specific modules directly. This keeps your
          handlers testable -- in tests, you can mock <code className="prose-code">ctx.env</code> without
          needing to simulate an entire runtime.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Test on your target runtime early.</strong>{' '}
          While Vexor's adapter layer normalizes most differences, edge cases can emerge around body
          parsing, stream handling, and timing behavior. Run your test suite on the target runtime in
          CI, not just on Node.js, to catch runtime-specific issues before they reach production.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Enable graceful shutdown in production.</strong>{' '}
          For Node.js and Bun deployments, always enable graceful shutdown. Container orchestration
          systems like Kubernetes send SIGTERM signals during rolling deployments, and your server
          needs to stop accepting new connections while finishing in-flight requests. Without graceful
          shutdown, active requests are abruptly terminated, causing errors for your users.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          <strong className="text-slate-900 dark:text-white">Design for the most constrained target.</strong>{' '}
          If you might deploy to Cloudflare Workers, design your handlers to work within Worker
          constraints from the start. Avoid synchronous CPU-intensive operations, keep request handlers
          fast, and use external storage instead of in-memory caches. Code that works within Worker
          constraints works everywhere else with room to spare.
        </p>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          Node.js Adapter
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Function</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">createNodeServer</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(app, options?) =&gt; http.Server</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a raw Node.js HTTP server instance wrapping the Vexor application. Returns the server without starting it, giving you full control over when and how the server begins listening. Use this when you need to attach additional event listeners, integrate with existing infrastructure, or manage the server lifecycle manually.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">startNodeServer</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(app, options?) =&gt; Promise&lt;void&gt;</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates and starts a Node.js HTTP server with full lifecycle management. Handles port binding, the onListen callback, and optionally registers SIGTERM/SIGINT handlers for graceful shutdown. The returned promise resolves when the server is listening and rejects if binding fails (e.g., port already in use).</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          NodeServerOptions
        </h3>
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
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">port</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">3000</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The TCP port the server binds to. If the port is already in use, the server will throw an EADDRINUSE error. Set to 0 to let the OS assign an available port automatically, which is useful for testing.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">hostname</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'localhost'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The network interface to bind to. Use 'localhost' or '127.0.0.1' to accept connections only from the local machine. Use '0.0.0.0' to accept connections from any network interface, which is required inside Docker containers and most production environments.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">serverFactory</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(handler) =&gt; http.Server</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">A factory function that receives the request handler and returns a custom server instance. Use this to create HTTPS servers, HTTP/2 servers, or servers with custom socket configuration. The factory is called once during server initialization.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">gracefulShutdown</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">false</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">When enabled, the server registers handlers for SIGTERM and SIGINT signals. Upon receiving a signal, it stops accepting new connections and waits for in-flight requests to complete before exiting the process. Essential for Kubernetes and container deployments.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">shutdownTimeout</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">30000</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Maximum time in milliseconds to wait for in-flight requests to complete during graceful shutdown. If requests do not finish within this window, the server forcefully closes all connections and exits. Set this lower than your orchestrator's termination grace period to ensure a clean exit.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">onListen</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">({'{ port, hostname }'}) =&gt; void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Callback invoked once the server has successfully bound to the port and is ready to accept connections. Receives the resolved port and hostname, which is especially useful when port is set to 0 and the OS assigns a dynamic port.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">http2</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">false</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Enables HTTP/2 support with automatic HTTP/1.1 fallback via ALPN negotiation. Requires TLS (use with serverFactory to provide an HTTPS server). HTTP/2 enables multiplexed streams, header compression, and server push, improving performance for clients that support it.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Bun Adapter
        </h3>
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
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">port</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">3000</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The TCP port the Bun server binds to. Bun's port binding is slightly faster than Node.js because it uses native system calls directly rather than going through libuv.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">tls</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{'{ key, cert }'}</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">TLS certificate and key for HTTPS. Accepts Bun.file() references or string paths. When provided, the server automatically serves over HTTPS. Bun uses BoringSSL for TLS, which is the same library used by Chrome and Cloudflare.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">development</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">false</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Enables Bun's development mode with hot reloading. When a source file changes, the server automatically reloads without restarting the process. Adds overhead from file watching, so always disable in production.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">maxRequestBodySize</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">134217728</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Maximum allowed request body size in bytes. Defaults to 128MB. Requests exceeding this limit are rejected with a 413 Payload Too Large response before the body is fully read, preventing memory exhaustion from oversized uploads.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">websocket</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">WebSocketHandler</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Bun's native WebSocket handler configuration. Provides open, message, close, and drain callbacks for managing WebSocket connections. Runs on the same server and port as HTTP without requiring a separate library or upgrade mechanism.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Deno Adapter
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Function</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">createDenoAdapter</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(app) =&gt; Deno.ServeHandler</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a handler function compatible with Deno.serve(). The returned function accepts a Request and returns a Response or Promise of Response, matching the Deno.ServeHandler signature. Works identically on local Deno and Deno Deploy.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">isDeno</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">() =&gt; boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns true if the current runtime is Deno. Checks for the presence of globalThis.Deno. The result is cached after the first call, so subsequent invocations have zero overhead.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Cloudflare Workers Adapter
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Function</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">createCloudflareAdapter</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(app) =&gt; ExportedHandler</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a Cloudflare Workers-compatible handler that can be used in both module and service worker formats. Automatically injects environment bindings (KV, R2, D1, etc.) into the Vexor context as ctx.env, making platform services accessible from any route handler.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">createCloudflareWorker</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(app) =&gt; ExportedHandler</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a module-format worker export suitable for use as a default export. This is the recommended format for new Workers projects and is required for Workers that use Durable Objects, Queues, or other module-only features.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">createDurableObject</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(handlers) =&gt; DurableObjectClass</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a Durable Object class with Vexor integration. The handlers object defines fetch (for request handling) and alarm (for scheduled callbacks) methods. The resulting class can be exported and referenced in wrangler.toml bindings.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Vercel Edge Adapter
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Function</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">createVercelAdapter</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(app) =&gt; VercelHandler</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a Vercel Serverless Function handler that runs in the Node.js runtime. Provides access to the full Node.js API including native modules, file system access, and unlimited execution time (subject to Vercel plan limits). Use for database-heavy endpoints or operations requiring Node.js-specific packages.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">createVercelEdgeHandler</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(app) =&gt; EdgeHandler</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a Vercel Edge Function handler that runs on the global edge network. Provides low-latency responses from the nearest edge location. Limited to Web APIs (no Node.js native modules). Export the result as named HTTP method handlers (GET, POST, etc.) for the App Router.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">createNextApiHandler</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(app) =&gt; NextApiHandler</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Wraps a Vexor application as a Next.js Pages Router API route handler. Translates between Next.js's req/res objects and Vexor's Context. Set bodyParser to false in the route config to let Vexor handle body parsing. Supports all HTTP methods through a single catch-all route.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">createEdgeMiddleware</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(app) =&gt; NextMiddleware</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a Next.js Edge Middleware handler. Runs before page renders and API routes, making it ideal for authentication, request rewriting, header injection, and A/B testing. Use the config.matcher to limit which paths the middleware applies to.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Runtime Detection
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Function</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Returns</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">detectRuntime()</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">RuntimeType</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Detects the current JavaScript runtime by inspecting global objects and environment variables. Returns one of 'node', 'bun', 'deno', 'cloudflare', 'vercel-edge', or 'unknown'. The result is cached after first invocation for zero-cost subsequent calls.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">isNode()</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns true if running on Node.js. Checks for process.versions.node. Note that Bun also sets this value for compatibility, so isNode() returns false when Bun is detected to avoid ambiguity.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">isBun()</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns true if running on Bun. Checks for the globalThis.Bun object, which is exclusive to the Bun runtime. Bun is checked before Node.js in the detection order because Bun sets Node.js-compatible globals.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">isDeno()</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns true if running on Deno. Checks for the globalThis.Deno object. Works on both local Deno installations and Deno Deploy.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">isCloudflareWorker()</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns true if running on Cloudflare Workers. Detects the Workers runtime by checking for caches.default and the absence of Node.js/Bun/Deno globals. Works in both module and service worker formats.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">isVercelEdge()</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns true if running on Vercel Edge Functions. Checks for the VERCEL_EDGE environment variable, which Vercel injects automatically into Edge Function execution contexts.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next-steps" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/advanced/circuit-breaker" className="btn-primary">
            Circuit Breaker <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/advanced/deployment" className="btn-secondary">
            Deployment Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
