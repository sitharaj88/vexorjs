import { Link } from 'react-router-dom';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const constructorCode = `import { Vexor } from '@vexorjs/core';

// Basic usage
const app = new Vexor();

// With options
const app = new Vexor({
  port: 3000,
  host: '0.0.0.0',

  // Enable or disable startup/request logging
  logging: true,

  // Trust proxy headers (X-Forwarded-*)
  trustProxy: true,

  // Maximum request body size
  maxBodySize: 1024 * 1024, // 1MB

  // Handle SIGTERM/SIGINT automatically: stop accepting connections,
  // drain in-flight requests, then exit
  gracefulShutdown: true,
});

// Fine-tune which signals are handled and how long to drain
const app = new Vexor({
  gracefulShutdown: {
    signals: ['SIGTERM'],
    timeout: 5000, // force-close remaining connections after 5s
  },
});`;

const routeMethodsCode = `// HTTP method shortcuts
app.get(path, options, handler);
app.post(path, options, handler);
app.put(path, options, handler);
app.delete(path, options, handler);
app.patch(path, options, handler);
app.head(path, options, handler);
app.options(path, options, handler);

// Match all methods
app.all(path, options, handler);

// Example with full options
app.post('/users', {
  schema: {
    body: Type.Object({
      name: Type.String(),
      email: Type.String({ format: 'email' }),
    }),
    response: {
      201: UserSchema,
    },
  },
  hooks: {
    preHandler: [authMiddleware],
  },
}, async (ctx) => {
  const body = await ctx.body(); // typed from the schema
  return ctx.status(201).json(body);
});

// Bare schema shorthand -- same validation and inference
app.post('/teams', {
  body: Type.Object({ name: Type.String() }),
}, async (ctx) => {
  return ctx.status(201).json(await ctx.body());
});`;

const groupCode = `// Create route groups with a shared prefix
app.group('/api/v1', (api) => {
  api.get('/users', handler);    // GET /api/v1/users
  api.post('/users', handler);   // POST /api/v1/users

  // Nested groups
  api.group('/admin', (admin) => {
    admin.get('/stats', handler);  // GET /api/v1/admin/stats
  });
});`;

const withPrefixCode = `// Like group(), but awaits async callbacks before restoring
// the prefix, so routes added after an await still get it
await app.withPrefix('/api/v2', async () => {
  const routes = await loadRoutesFromConfig(); // async work is safe here

  for (const route of routes) {
    app.get(route.path, route.handler);  // GET /api/v2/...
  }
});

// group() runs its callback synchronously. If the callback were async,
// any route added after an await would miss the prefix -- use
// withPrefix() whenever the callback needs to await something.
// The plugin system uses withPrefix() internally to apply the
// { prefix } option to routes registered by async plugins.`;

const hooksCode = `// Add lifecycle hooks
app.addHook('onRequest', async (ctx) => {
  // Runs for every request
  // Returning a Response short-circuits the pipeline
});

app.addHook('preValidation', async (ctx) => {
  // Before schema validation
});

app.addHook('preHandler', async (ctx) => {
  // After validation, before handler
});

app.addHook('onSend', async (ctx) => {
  // Before sending the response
  // Queue headers with ctx.setResponseHeader() here
});

app.addHook('onError', async (ctx) => {
  // When an error occurs
});

// use() is a shortcut for addHook('onRequest', fn)
app.use(async (ctx) => {
  ctx.set('startedAt', Date.now());
});`;

const registerPluginCode = `import { definePlugin } from '@vexorjs/core';

const authPlugin = definePlugin({
  meta: { name: 'auth', version: '1.0.0' },
  register(pluginCtx) {
    pluginCtx.addHook('preHandler', async (ctx) => {
      if (!ctx.header('authorization')) {
        return ctx.unauthorized();
      }
    });
  },
});

// Registration is async and runs immediately -- await it before listen()
await app.registerPlugin(authPlugin);

// Routes registered inside the plugin get the prefix
await app.registerPlugin(userRoutesPlugin, { prefix: '/v1' });

// Skip silently instead of throwing if the plugin is already registered
await app.registerPlugin(authPlugin, { skipDuplicate: true });

// Inspect the registry via the app.plugins getter
app.plugins.has('auth');   // true
app.plugins.get('auth');   // registration info (state, options, decorations)
app.plugins.all();         // Map of all registered plugins`;

const serverCode = `// Start the server
const server = await app.listen(3000);

// With host
const server = await app.listen(3000, '0.0.0.0');

// Get the bound address
const addr = app.address(); // { port, host } | null

// Graceful shutdown:
// 1. stops accepting new connections
// 2. closes idle keep-alive connections
// 3. waits for in-flight requests to finish
// 4. force-closes anything still open after \`timeout\` ms (default 10000)
await app.close({ timeout: 5000 });

// Or let Vexor handle SIGTERM/SIGINT for you
const app = new Vexor({ gracefulShutdown: true });`;

const handleCode = `// app.handle() powers listen() and the app.fetch handler, and
// implements standard HTTP semantics automatically.

app.get('/users', async (ctx) => ctx.json([{ id: '1' }]));

// 405 Method Not Allowed: the path exists under other methods,
// so Vexor answers with an Allow header instead of a 404
//
//   POST /users
//   -> 405
//   -> Allow: GET, HEAD
//   -> { "error": "Method POST not allowed for /users",
//        "code": "METHOD_NOT_ALLOWED" }

// HEAD served from GET: when no explicit HEAD route exists, the GET
// handler runs and the body is stripped -- status and headers are kept
//
//   HEAD /users
//   -> 200, same headers as GET /users, empty body

// Unknown paths still return 404. Global onRequest hooks run even for
// unmatched requests, so middleware like CORS can answer preflights,
// and headers queued via ctx.setResponseHeader() apply to 404/405s too.`;

export default function VexorClass() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="vexor-class" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Vexor Class
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          The main application class. Create instances, define routes, register middleware and plugins, and start servers.
        </p>
      </div>

      <section>
        <h2 id="constructor" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Constructor
        </h2>
        <CodeBlock code={constructorCode} />
        <div className="mt-4 overflow-x-auto">
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
                <td className="py-3 px-4"><code>port</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">3000</td>
                <td className="py-3 px-4">Default port used by listen() when none is passed</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>host</code></td>
                <td className="py-3 px-4">string</td>
                <td className="py-3 px-4">'0.0.0.0'</td>
                <td className="py-3 px-4">Default host used by listen() when none is passed</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>logging</code></td>
                <td className="py-3 px-4">boolean | LoggingOptions</td>
                <td className="py-3 px-4">true</td>
                <td className="py-3 px-4">Enable or configure logging (set false to silence startup output)</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>trustProxy</code></td>
                <td className="py-3 px-4">boolean</td>
                <td className="py-3 px-4">false</td>
                <td className="py-3 px-4">Trust X-Forwarded-* headers</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>maxBodySize</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Maximum request body size in bytes</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>requestTimeout</code></td>
                <td className="py-3 px-4">number</td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Request timeout in milliseconds</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code>gracefulShutdown</code></td>
                <td className="py-3 px-4">boolean | {'{ signals?, timeout? }'}</td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">Handle SIGTERM/SIGINT by draining in-flight requests before exiting. Pass an object to customize the signals (default ['SIGTERM', 'SIGINT']) or the drain timeout in ms (default 10000)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 id="route-methods" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Route Methods
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every route method accepts an optional options object between the path and the handler.
          Schemas can be passed under a <code className="prose-code">schema</code> key or directly
          as a bare shorthand; both validate requests and drive the handler's context types.
        </p>
        <CodeBlock code={routeMethodsCode} />
      </section>

      <section>
        <h2 id="group" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          group(prefix, callback)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Create a route group with a shared prefix. The callback runs synchronously and receives
          the app instance with the prefix applied.
        </p>
        <CodeBlock code={groupCode} />
      </section>

      <section>
        <h2 id="with-prefix" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          withPrefix(prefix, callback)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The async-safe counterpart to <code className="prose-code">group()</code>. It applies the
          prefix, <strong>awaits</strong> the callback (which may return a Promise), and only then
          restores the previous prefix. Use it whenever route registration involves asynchronous
          work.
        </p>
        <CodeBlock code={withPrefixCode} />
      </section>

      <section>
        <h2 id="add-hook" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          addHook(name, handler)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Register lifecycle hooks for the application. Hooks receive the request context; a hook
          that returns a <code className="prose-code">Response</code> short-circuits the rest of the
          pipeline (used for CORS preflights, auth rejections, and similar).
        </p>
        <CodeBlock code={hooksCode} />
      </section>

      <section>
        <h2 id="register-plugin" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          registerPlugin(plugin, options?) / plugins
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Register a Vexor plugin with metadata, dependency resolution, decorators, and lifecycle
          hooks. The plugin's <code className="prose-code">register</code> function runs immediately
          and is awaited, so async setup (database connections, remote config) completes before the
          returned promise resolves. Passing a <code className="prose-code">prefix</code> option
          applies it to every route the plugin registers. The{' '}
          <code className="prose-code">app.plugins</code> getter exposes the underlying{' '}
          <code className="prose-code">PluginRegistry</code> for introspection.
        </p>
        <CodeBlock code={registerPluginCode} />
        <InfoBlock variant="info" title="See Also">
          The <Link to="/infrastructure/plugins" className="underline">Plugins guide</Link> covers plugin
          authoring in depth: decorators, dependency metadata, configurable plugins, and the built-in
          CORS, request ID, and helmet plugins.
        </InfoBlock>
      </section>

      <section>
        <h2 id="listen" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          listen(port?, host?) / close(options?)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Start and stop the HTTP server. <code className="prose-code">close()</code> performs a
          graceful shutdown: it stops accepting new connections, closes idle keep-alive connections,
          drains in-flight requests, and force-closes whatever remains once the{' '}
          <code className="prose-code">timeout</code> (default 10000ms) expires. With the{' '}
          <code className="prose-code">gracefulShutdown</code> constructor option, Vexor wires this
          up to SIGTERM/SIGINT for you.
        </p>
        <CodeBlock code={serverCode} />
      </section>

      <section>
        <h2 id="handle" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          handle(request)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The core request handler behind <code className="prose-code">listen()</code> and{' '}
          <code className="prose-code">app.fetch</code>. Beyond routing, it implements HTTP
          semantics you would otherwise have to hand-roll: automatic{' '}
          <strong>405 Method Not Allowed</strong> responses with an{' '}
          <code className="prose-code">Allow</code> header when a path exists under other methods,
          and <strong>HEAD requests served from GET handlers</strong> (same status and headers,
          body stripped) when no explicit HEAD route is registered.
        </p>
        <CodeBlock code={handleCode} />
      </section>
    </div>
  );
}
