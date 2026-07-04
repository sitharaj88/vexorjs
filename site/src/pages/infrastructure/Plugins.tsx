import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { Vexor, definePlugin } from '@vexorjs/core';

const app = new Vexor();

// Define a simple plugin
const timingPlugin = definePlugin({
  meta: { name: 'timing', version: '1.0.0' },
  register(pluginCtx) {
    // Lifecycle hooks run per request through the middleware pipeline
    pluginCtx.addHook('onRequest', (ctx) => {
      ctx.set('startedAt', performance.now());
    });

    pluginCtx.addHook('onSend', (ctx) => {
      const startedAt = ctx.get<number>('startedAt') ?? performance.now();
      ctx.setResponseHeader(
        'X-Response-Time',
        \`\${(performance.now() - startedAt).toFixed(1)}ms\`
      );
    });
  },
});

// Registration is async and runs immediately -- await it
await app.registerPlugin(timingPlugin);

app.get('/hello', async (ctx) => ctx.json({ hello: 'world' }));

await app.listen(3000);
// GET /hello -> 200 with an X-Response-Time header`;

const pluginAnatomyCode = `import { definePlugin, type PluginContext } from '@vexorjs/core';

const myPlugin = definePlugin({
  // Plugin metadata
  meta: {
    name: 'my-plugin',                 // unique identifier
    version: '2.0.0',
    description: 'A comprehensive example plugin',
    dependencies: ['database'],        // must be registered first
    conflicts: ['legacy-plugin'],      // cannot coexist with this one
  },

  // Registration function receives the plugin context
  async register(pluginCtx: PluginContext) {
    // pluginCtx.app     - the Vexor application instance
    // pluginCtx.options - the options passed to registerPlugin()
    // pluginCtx.plugins - the PluginRegistry (inspect other plugins)

    // Decorate the app instance with a shared service
    pluginCtx.decorate('myService', new MyService());

    // Decorate every request context (the getter runs per request)
    pluginCtx.decorateRequest('traceId', () => crypto.randomUUID());

    // Add lifecycle hooks that run per request
    pluginCtx.addHook('preHandler', async (ctx) => {
      // Returning a Response short-circuits the pipeline
      if (!ctx.header('authorization')) {
        return ctx.unauthorized();
      }
    });

    // Register sub-plugins (they inherit this plugin's prefix)
    await pluginCtx.register(helperPlugin);
  },
});

// definePlugin also accepts (meta, register) as two arguments:
const samePlugin = definePlugin(
  { name: 'my-plugin', version: '2.0.0' },
  (pluginCtx) => {
    /* ... */
  }
);`;

const lifecycleHooksCode = `import { definePlugin } from '@vexorjs/core';

// Lifecycle hook names are wired into the app's middleware pipeline
// and run for every request, in this order:
//
//   onRequest -> preParsing -> preValidation -> preHandler
//     -> (route handler) -> preSerialization -> onSend -> onResponse
//
// (onError runs when an error occurs.)

const authPlugin = definePlugin({
  meta: { name: 'auth', version: '1.0.0' },
  register(pluginCtx) {
    pluginCtx.addHook('preHandler', async (ctx) => {
      // Hooks receive the VexorContext for the current request
      const token = ctx.header('authorization');

      if (!token) {
        // Returning a Response short-circuits: the remaining hooks
        // and the route handler are skipped
        return ctx.unauthorized('Missing token');
      }

      ctx.set('user', await verifyToken(token));
    });
  },
});

await app.registerPlugin(authPlugin);

// Any other hook name is a custom event stored on the registry.
// Run custom events manually with app.plugins.runHooks():
const databasePlugin = definePlugin({
  meta: { name: 'database' },
  async register(pluginCtx) {
    const pool = await createPool(process.env.DATABASE_URL);
    pluginCtx.decorate('db', pool);
    pluginCtx.addHook('onClose', async () => pool.end());
  },
});

await app.registerPlugin(databasePlugin);

// ...during shutdown:
await app.plugins.runHooks('onClose');
await app.close();`;

const decoratorsCode = `import { definePlugin } from '@vexorjs/core';

const analyticsPlugin = definePlugin({
  meta: { name: 'analytics', version: '1.0.0' },
  register(pluginCtx) {
    // App-level decoration: one shared value, set once at registration
    const analytics = new AnalyticsService();
    pluginCtx.decorate('analytics', analytics);

    // Request-level decoration: the getter runs for EVERY request and
    // the resulting value is stored in the request's context state
    pluginCtx.decorateRequest('tracker', () => analytics.createTracker());

    pluginCtx.addHook('onSend', (ctx) => {
      const tracker = ctx.get<Tracker>('tracker');
      tracker?.finish({ path: ctx.path, method: ctx.method });
    });
  },
});

await app.registerPlugin(analyticsPlugin);

app.get('/api/data', async (ctx) => {
  // Request-level decorations are read with ctx.get()
  const tracker = ctx.get<Tracker>('tracker');
  tracker?.event('data_fetched', { count: 42 });

  // App-level decorations are also readable from the registry
  const analytics = app.plugins.getDecoration<AnalyticsService>('analytics');
  analytics?.track('api.data.accessed');

  return ctx.json({ data: [] });
});`;

const routePrefixCode = `import { Type, definePlugin } from '@vexorjs/core';

// Encapsulate a feature's routes in a plugin
const userRoutes = definePlugin({
  meta: { name: 'user-routes', version: '1.0.0' },
  register({ app }) {
    app.get('/users', async (ctx) => {
      return ctx.json(await listUsers());
    });

    app.get('/users/:id', async (ctx) => {
      return ctx.json(await getUser(ctx.params.id)); // ctx.params.id: string
    });

    app.post('/users', {
      body: Type.Object({ name: Type.String() }),
    }, async (ctx) => {
      const body = await ctx.body(); // { name: string }
      return ctx.status(201).json(await createUser(body));
    });
  },
});

// The prefix option applies to every route registered inside the plugin
await app.registerPlugin(userRoutes, { prefix: '/api/v1' });
// Registers: GET  /api/v1/users
//            GET  /api/v1/users/:id
//            POST /api/v1/users

// Prefixing works for async register functions too -- the registry
// applies the prefix with app.withPrefix(), which awaits the callback.

// Sub-plugins registered via pluginCtx.register() combine prefixes:
// parent { prefix: '/api' } + child { prefix: '/users' } -> /api/users`;

const configurablePluginsCode = `import { configurablePlugin } from '@vexorjs/core';

// configurablePlugin(meta, defaults, register) returns a factory
const rateLimit = configurablePlugin(
  { name: 'rate-limit', version: '1.0.0' },
  // Defaults, deep-merged with the caller's overrides
  {
    max: 100,
    window: 60_000,
    message: 'Too many requests',
    statusCode: 429,
  },
  // The register function receives the merged config
  (pluginCtx, config) => {
    const store = new Map<string, { count: number; resetAt: number }>();

    pluginCtx.addHook('onRequest', (ctx) => {
      const key = ctx.ip;
      const now = Date.now();
      const record = store.get(key);

      if (!record || now > record.resetAt) {
        store.set(key, { count: 1, resetAt: now + config.window });
        return;
      }

      record.count++;
      if (record.count > config.max) {
        return ctx.json({
          error: config.message,
          retryAfter: Math.ceil((record.resetAt - now) / 1000),
        }, config.statusCode);
      }
    });
  }
);

// Call the factory to produce a plugin, then register it
await app.registerPlugin(rateLimit({ max: 50, window: 30_000 }));

// Or use the defaults
await app.registerPlugin(rateLimit());`;

const asyncPluginsCode = `import { asyncPlugin, definePlugin } from '@vexorjs/core';

// Any plugin's register function may be async. registerPlugin()
// awaits it, so the app never runs half-initialized.
const databasePlugin = definePlugin({
  meta: { name: 'database', version: '1.0.0' },
  async register(pluginCtx) {
    const pool = await createPool({
      connectionString: process.env.DATABASE_URL,
      maxConnections: 20,
    });

    // Verify the connection during registration -- fail fast
    await pool.query('SELECT 1');

    pluginCtx.decorate('db', pool);

    // Cleanup as a custom event (run via app.plugins.runHooks('onClose'))
    pluginCtx.addHook('onClose', async () => {
      await pool.end();
    });
  },
});

await app.registerPlugin(databasePlugin);
await app.listen(3000);

// asyncPlugin() wraps a lazy loader: the module is only imported
// (and the plugin only created) when it is actually registered
const metricsPlugin = asyncPlugin(async () => {
  const { createMetrics } = await import('./metrics.js');
  return {
    meta: { name: 'metrics' },
    register(pluginCtx) {
      pluginCtx.decorate('metrics', createMetrics());
    },
  };
});

await app.registerPlugin(metricsPlugin);`;

const metaValidationCode = `// Duplicate names throw unless skipDuplicate is set
await app.registerPlugin(authPlugin);
await app.registerPlugin(authPlugin);
// Error: Plugin "auth" is already registered

await app.registerPlugin(authPlugin, { skipDuplicate: true }); // no-op

// Dependencies must already be registered (and loaded)
const sessions = definePlugin({
  meta: { name: 'sessions', dependencies: ['database'] },
  register(pluginCtx) { /* ... */ },
});
await app.registerPlugin(sessions);
// Error: Plugin "sessions" requires "database" to be registered first

// Conflicts prevent incompatible plugins from coexisting
const legacyAuth = definePlugin({
  meta: { name: 'legacy-auth', conflicts: ['auth'] },
  register() { /* ... */ },
});
await app.registerPlugin(legacyAuth);
// Error: Plugin "legacy-auth" conflicts with "auth"`;

const builtinPluginsCode = `import { Vexor, plugins } from '@vexorjs/core';

const app = new Vexor();

// CORS: queues Access-Control-* headers on every response and
// short-circuits OPTIONS preflight requests with a 204
await app.registerPlugin(plugins.cors({
  origin: 'https://example.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}));

// Request ID: reuses an incoming X-Request-ID header or generates one,
// stores it in the context state, and sets it as a response header
await app.registerPlugin(plugins.requestId());

app.get('/whoami', async (ctx) => {
  return ctx.json({ requestId: ctx.get('requestId') });
});

// Helmet: queues security headers in an onSend hook
await app.registerPlugin(plugins.helmet({
  frameguard: 'deny',           // X-Frame-Options: DENY
  hsts: true,                   // Strict-Transport-Security
  noSniff: true,                // X-Content-Type-Options: nosniff
  contentSecurityPolicy: true,  // Content-Security-Policy
}));

// All built-ins are configurable factories with sensible defaults
await app.listen(3000);`;

export default function Plugins() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="plugins" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Plugins
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Plugins are Vexor's primary mechanism for extending framework functionality in a modular, composable, and reusable way. A plugin is a self-contained unit of functionality that can add lifecycle hooks, decorate the application and request contexts, register routes under a shared prefix, and declare relationships with other plugins. The plugin system is what makes it possible to build a rich ecosystem of shareable functionality -- from CORS handling and rate limiting to database integrations and authentication flows -- without coupling any of it to your application's business logic.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The plugin system is fully wired into the application. A plugin is registered with a single{' '}
          <code className="prose-code">await app.registerPlugin(plugin, options?)</code> call: its{' '}
          <code className="prose-code">register</code> function runs immediately (and is awaited, so async
          setup completes before the promise resolves), routes it registers receive the{' '}
          <code className="prose-code">prefix</code> option, and lifecycle hooks it adds run for every
          request through the same middleware pipeline as <code className="prose-code">app.addHook()</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The design philosophy is encapsulation. Each plugin declares what it needs (dependencies), what it
          cannot coexist with (conflicts), and what it provides (decorations and hooks). The framework enforces
          uniqueness for plugin names and decoration names, and validates dependency and conflict metadata at
          registration time, so combining plugins from different authors is predictable.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Whether you are wrapping a third-party library, encapsulating cross-cutting concerns, organizing your
          application into feature modules, or publishing reusable functionality for the Vexor ecosystem, the
          plugin system provides a structured, type-safe way to do it. The rest of this page covers how
          registration works, lifecycle hooks, the decoration system, route prefixes, configurable and lazy
          plugins, the built-in plugins, and best practices.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How Plugins Work
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When you call <code className="prose-code">app.registerPlugin(plugin, options)</code>, Vexor first
          validates the plugin's metadata: the name must not already be registered (unless{' '}
          <code className="prose-code">skipDuplicate</code> is set), no declared conflict may be present among
          the registered plugins, and every declared dependency must already be registered and loaded. This
          fail-fast validation catches configuration errors at startup rather than at runtime.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The plugin's <code className="prose-code">register</code> function then runs immediately and is
          awaited. If the registration options include a <code className="prose-code">prefix</code>, Vexor
          wraps the call in <code className="prose-code">app.withPrefix(prefix, ...)</code>, so every route the
          plugin registers -- even after an <code className="prose-code">await</code> in an async register
          function -- gets the prefix applied.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">register</code> function receives a{' '}
          <code className="prose-code">PluginContext</code>. Through this context, the plugin can add
          lifecycle hooks with <code className="prose-code">addHook</code>, decorate the app and request
          contexts, access the application instance (<code className="prose-code">pluginCtx.app</code>), read
          its registration options, inspect other plugins via the registry, and register sub-plugins. Hooks
          added for lifecycle names (<code className="prose-code">onRequest</code>,{' '}
          <code className="prose-code">preParsing</code>, <code className="prose-code">preValidation</code>,{' '}
          <code className="prose-code">preHandler</code>, <code className="prose-code">preSerialization</code>,{' '}
          <code className="prose-code">onSend</code>, <code className="prose-code">onResponse</code>,{' '}
          <code className="prose-code">onError</code>) are forwarded to the app's middleware pipeline and run
          for every request. Each hook receives the request's <code className="prose-code">VexorContext</code>,
          and returning a <code className="prose-code">Response</code> from a hook short-circuits the rest of
          the pipeline -- this is how the built-in CORS plugin answers preflight requests.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Because registration is awaited, a plugin that fails to initialize (a rejected promise from an async{' '}
          <code className="prose-code">register</code>) surfaces the error at the{' '}
          <code className="prose-code">registerPlugin</code> call site, before your app starts listening. The
          registry records the plugin's state (<code className="prose-code">pending</code>,{' '}
          <code className="prose-code">loading</code>, <code className="prose-code">loaded</code>, or{' '}
          <code className="prose-code">error</code>) for introspection via{' '}
          <code className="prose-code">app.plugins.get(name)</code>.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The simplest way to create a plugin is with <code className="prose-code">definePlugin</code>. You
          provide metadata under <code className="prose-code">meta</code> (the{' '}
          <code className="prose-code">name</code> identifies the plugin for duplicate detection, dependency
          resolution, and conflict checks) and a <code className="prose-code">register</code> function that
          sets up the plugin's behavior.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Inside <code className="prose-code">register</code>, the most common operation is adding lifecycle
          hooks with <code className="prose-code">pluginCtx.addHook</code>. The example below brackets the
          request lifecycle: an <code className="prose-code">onRequest</code> hook stores a timestamp in the
          context state, and an <code className="prose-code">onSend</code> hook computes the elapsed time and
          queues it as a response header with{' '}
          <code className="prose-code">ctx.setResponseHeader()</code> -- which the pipeline applies to the
          final response even when the handler returns a raw <code className="prose-code">Response</code>.
        </p>
        <CodeBlock code={basicUsageCode} filename="plugin.ts" showLineNumbers />
        <InfoBlock variant="info" title="Registration Is Awaited">
          <code className="prose-code">registerPlugin()</code> returns a promise that resolves once the
          plugin's <code className="prose-code">register</code> function has completed. Register your plugins
          before calling <code className="prose-code">app.listen()</code> so all hooks and decorations are in
          place when the first request arrives.
        </InfoBlock>
      </section>

      {/* Plugin Anatomy */}
      <section>
        <h2 id="plugin-anatomy" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Plugin Anatomy
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every plugin consists of two parts: an optional <code className="prose-code">meta</code> object and a{' '}
          <code className="prose-code">register</code> function. The metadata declares the plugin's identity
          and its relationships with other plugins. The <code className="prose-code">name</code> serves as the
          unique identifier within the application; <code className="prose-code">version</code>,{' '}
          <code className="prose-code">description</code>, <code className="prose-code">dependencies</code>,
          and <code className="prose-code">conflicts</code> are optional but recommended for any plugin that
          will be shared or reused.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">dependencies</code> array lists plugin names that must be registered
          (and successfully loaded) <em>before</em> this plugin -- registration order matters, and Vexor throws
          a clear error if a dependency is missing. The <code className="prose-code">conflicts</code> array
          lists plugins that are incompatible with this one; if a conflicting plugin is already registered,
          registration fails immediately.
        </p>
        <CodeBlock code={pluginAnatomyCode} filename="anatomy.ts" showLineNumbers />
        <p className="text-slate-600 dark:text-slate-400 mt-6 mb-4">
          Metadata validation happens at registration time, before the{' '}
          <code className="prose-code">register</code> function runs:
        </p>
        <CodeBlock code={metaValidationCode} filename="validation.ts" showLineNumbers />
        <InfoBlock variant="info">
          Plugin dependencies are checked at registration time. If a required plugin is missing, Vexor throws
          an error indicating which dependency is not satisfied. This fail-fast behavior ensures you discover
          configuration errors during development rather than encountering mysterious runtime failures in
          production.
        </InfoBlock>
      </section>

      {/* Lifecycle Hooks */}
      <section>
        <h2 id="lifecycle-hooks" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Lifecycle Hooks
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Hooks added via <code className="prose-code">pluginCtx.addHook()</code> with a lifecycle name are
          registered on the app's real middleware pipeline -- exactly as if you had called{' '}
          <code className="prose-code">app.addHook()</code> yourself -- and run for every request. The
          supported lifecycle names, in execution order, are{' '}
          <code className="prose-code">onRequest</code>, <code className="prose-code">preParsing</code>,{' '}
          <code className="prose-code">preValidation</code>, <code className="prose-code">preHandler</code>,{' '}
          <code className="prose-code">preSerialization</code>, <code className="prose-code">onSend</code>,{' '}
          <code className="prose-code">onResponse</code>, and <code className="prose-code">onError</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Each hook receives the request's <code className="prose-code">VexorContext</code>. A hook may return
          nothing (execution continues) or return a <code className="prose-code">Response</code>, which
          short-circuits the remaining hooks and the route handler. Short-circuiting is the standard pattern
          for CORS preflights, authentication rejections, and rate limiting.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Any hook name that is <em>not</em> a lifecycle name is treated as a custom event. Custom events are
          stored on the plugin registry and run only when you invoke them explicitly with{' '}
          <code className="prose-code">app.plugins.runHooks(name, ...args)</code>. A common use is an{' '}
          <code className="prose-code">onClose</code> event for resource cleanup during shutdown.
        </p>
        <CodeBlock code={lifecycleHooksCode} filename="hooks.ts" showLineNumbers />
      </section>

      {/* Decorators */}
      <section>
        <h2 id="decorators" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Decorating the App and Request
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Decoration is how plugins expose services, utilities, and data to the rest of the application. There
          are two types. <strong>App-level decorations</strong> (<code className="prose-code">pluginCtx.decorate(name, value)</code>)
          attach a value to the Vexor application instance once, at registration time. They are the right
          choice for shared, stateless services that do not vary by request -- database clients, analytics
          SDKs, configuration managers. The value is also retrievable via{' '}
          <code className="prose-code">app.plugins.getDecoration(name)</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Request-level decorations</strong> (<code className="prose-code">pluginCtx.decorateRequest(name, getter)</code>)
          take a getter function instead of a value. The getter runs for <em>every incoming request</em>, and
          the result is stored in that request's context state -- readable inside handlers and hooks with{' '}
          <code className="prose-code">ctx.get(name)</code>. This gives each request its own fresh value (a
          trace ID, a per-request tracker, a scoped logger) without any per-route wiring.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Vexor enforces that decoration names are unique across all plugins, separately for app-level and
          request-level decorations. If two plugins try to decorate with the same name, registration throws a
          conflict error. If you are authoring a plugin intended for wide distribution, choose decoration
          names that are specific and unlikely to collide -- prefer{' '}
          <code className="prose-code">myPluginTracker</code> over <code className="prose-code">tracker</code>.
        </p>
        <CodeBlock code={decoratorsCode} filename="decorators.ts" showLineNumbers />
        <InfoBlock variant="warning">
          Decorator names must be unique across all plugins. If two plugins try to decorate with the same
          name, Vexor throws a conflict error at registration time. Use descriptive, namespaced names to
          minimize the risk of collisions, especially for plugins intended for distribution.
        </InfoBlock>
      </section>

      {/* Route Prefixes */}
      <section>
        <h2 id="route-prefixes" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Routes and Prefixes
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Plugins can register routes directly on <code className="prose-code">pluginCtx.app</code>, which
          makes them a natural unit for organizing an API into feature modules. Passing a{' '}
          <code className="prose-code">prefix</code> in the registration options prepends it to every route
          the plugin registers: a plugin that defines <code className="prose-code">GET /users</code> and is
          registered with <code className="prose-code">{"{ prefix: '/api/v1' }"}</code> serves{' '}
          <code className="prose-code">GET /api/v1/users</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The prefix is applied with <code className="prose-code">app.withPrefix()</code>, which awaits the
          register function before restoring the previous prefix -- so async plugins that load route
          definitions over I/O still get correct prefixing. Sub-plugins registered through{' '}
          <code className="prose-code">pluginCtx.register(child, opts)</code> combine the parent's prefix with
          their own.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Routes inside plugins keep full schema validation and type inference: path literals type{' '}
          <code className="prose-code">ctx.params</code>, and body/query schemas type{' '}
          <code className="prose-code">ctx.body()</code> and <code className="prose-code">ctx.query</code>.
          A common architecture is one plugin per domain entity (users, posts, comments), composed at the
          application level with a shared version prefix.
        </p>
        <CodeBlock code={routePrefixCode} filename="route-prefix.ts" showLineNumbers />
      </section>

      {/* Configurable Plugins */}
      <section>
        <h2 id="configurable-plugins" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Configurable Plugins
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Most plugins need to be adaptable to different deployment contexts. A rate limiting plugin needs
          different thresholds for different applications; a CORS plugin needs to know which origins to allow.
          Configurable plugins address this by accepting an options object at creation time, merged with
          declared defaults.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="prose-code">configurablePlugin(meta, defaults, register)</code> returns a factory
          function rather than a plugin. You call the factory with your overrides to produce the plugin
          instance -- <code className="prose-code">rateLimit({'{ max: 50 }'})</code> -- or with no arguments to
          use the defaults. The <code className="prose-code">register</code> function receives the merged
          config as its second argument, typed from the defaults object.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          When designing the options for a configurable plugin, follow the principle of progressive
          disclosure: provide sensible defaults for everything, require as few options as possible, and let
          users override individual values as needed. All of Vexor's built-in plugins follow this pattern.
        </p>
        <CodeBlock code={configurablePluginsCode} filename="configurable.ts" showLineNumbers />
      </section>

      {/* Async & Lazy Plugins */}
      <section>
        <h2 id="async-plugins" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Async and Lazy Plugins
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Many plugins need to perform asynchronous work during initialization: establishing a database
          connection pool, connecting to a message broker, or verifying that external dependencies are
          reachable. Any plugin's <code className="prose-code">register</code> function may be{' '}
          <code className="prose-code">async</code> -- <code className="prose-code">registerPlugin()</code>{' '}
          awaits it, so awaiting registration before <code className="prose-code">app.listen()</code>{' '}
          guarantees your application never starts accepting requests in a half-initialized state. If
          initialization fails, the promise rejects and the plugin is recorded in the registry with state{' '}
          <code className="prose-code">error</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Separately, <code className="prose-code">asyncPlugin(loader)</code> wraps a <em>lazy loader</em>: a
          function returning a promise of a plugin. The loader is only invoked when the plugin is registered,
          which is useful for deferring expensive imports with dynamic{' '}
          <code className="prose-code">import()</code>.
        </p>
        <CodeBlock code={asyncPluginsCode} filename="async-plugin.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Register cleanup logic under a custom hook name such as{' '}
          <code className="prose-code">onClose</code> and run it with{' '}
          <code className="prose-code">await app.plugins.runHooks('onClose')</code> before calling{' '}
          <code className="prose-code">app.close()</code>. This ensures connection pools are drained and
          buffers are flushed before the process exits.
        </InfoBlock>
      </section>

      {/* Built-in Plugins */}
      <section>
        <h2 id="built-in-plugins" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Built-in Plugins
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor ships with functional built-in plugins under the <code className="prose-code">plugins</code>{' '}
          export, covering the most common needs of HTTP APIs. Each follows the configurable plugin pattern:
          call the factory (optionally with overrides) and pass the result to{' '}
          <code className="prose-code">app.registerPlugin()</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <strong>CORS plugin</strong> (<code className="prose-code">plugins.cors()</code>) adds an{' '}
          <code className="prose-code">onRequest</code> hook that queues the{' '}
          <code className="prose-code">Access-Control-*</code> headers on every response via{' '}
          <code className="prose-code">ctx.setResponseHeader()</code>, and short-circuits{' '}
          <code className="prose-code">OPTIONS</code> preflight requests with a{' '}
          <code className="prose-code">204 No Content</code> response before routing happens.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <strong>Request ID plugin</strong> (<code className="prose-code">plugins.requestId()</code>)
          reuses the incoming <code className="prose-code">X-Request-ID</code> header when present, or
          generates a new ID. The ID is stored in the context state -- read it with{' '}
          <code className="prose-code">ctx.get('requestId')</code> -- and queued as a response header for
          client-side correlation and distributed tracing.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <strong>Helmet plugin</strong> (<code className="prose-code">plugins.helmet()</code>) adds an{' '}
          <code className="prose-code">onSend</code> hook that queues security headers on every response:{' '}
          <code className="prose-code">Content-Security-Policy</code>,{' '}
          <code className="prose-code">Strict-Transport-Security</code>,{' '}
          <code className="prose-code">X-Frame-Options</code>,{' '}
          <code className="prose-code">X-Content-Type-Options</code>, and{' '}
          <code className="prose-code">X-XSS-Protection</code>. Each header can be individually configured or
          disabled.
        </p>
        <CodeBlock code={builtinPluginsCode} filename="built-in.ts" showLineNumbers />
        <InfoBlock variant="tip">
          All built-in plugins work with zero configuration. Start by registering them with defaults, then
          customize specific options as your requirements become clearer. For production deployments, review
          the CORS origin and the Helmet directives carefully -- the CORS default origin is{' '}
          <code className="prose-code">'*'</code>.
        </InfoBlock>
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Keep plugins focused.</strong> A plugin should do one thing well. A database plugin manages
          the connection pool and exposes it as a decoration. An authentication plugin verifies tokens and
          populates the request state. Resist the temptation to combine unrelated functionality into a single
          plugin -- it makes the plugin harder to test, harder to configure, and impossible to use partially.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Register in dependency order and declare dependencies explicitly.</strong> Vexor validates
          that every plugin listed in <code className="prose-code">dependencies</code> is already registered
          and loaded, but it does not reorder registrations for you. Declaring dependencies turns a silent
          mis-ordering into a clear startup error.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Clean up resources on shutdown.</strong> For plugins that own connections, timers, or file
          handles, register a custom <code className="prose-code">onClose</code> hook and run{' '}
          <code className="prose-code">app.plugins.runHooks('onClose')</code> as part of your shutdown
          sequence (alongside <code className="prose-code">app.close()</code> or the{' '}
          <code className="prose-code">gracefulShutdown</code> option).
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Namespace your decoration names.</strong> If you are authoring a plugin for distribution,
          choose decoration names that are unlikely to collide with other plugins. A generic name like{' '}
          <code className="prose-code">db</code> might conflict with another database plugin. A more specific
          name like <code className="prose-code">postgresPool</code> is safer.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          <strong>Make configurable plugins zero-config by default.</strong> Provide sensible defaults for
          every option so users can register the plugin with no arguments and get reasonable behavior, then
          override specific values as needed. Document the defaults clearly.
        </p>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          App Methods
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Member</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">registerPlugin</code></td>
                <td className="py-3 px-4"><code className="prose-code">registerPlugin(plugin: PluginInput, options?: PluginOptions): Promise&lt;this&gt;</code></td>
                <td className="py-3 px-4">Registers a plugin (or lazy async plugin loader) on the app. Validates metadata (duplicates, conflicts, dependencies), then runs and awaits the plugin's register function. When <code className="prose-code">options.prefix</code> is set, routes registered inside the plugin get the prefix.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">plugins</code></td>
                <td className="py-3 px-4"><code className="prose-code">get plugins(): PluginRegistry</code></td>
                <td className="py-3 px-4">The app's plugin registry. Exposes <code className="prose-code">has(name)</code>, <code className="prose-code">get(name)</code>, <code className="prose-code">all()</code>, <code className="prose-code">getDecoration(name)</code>, and <code className="prose-code">runHooks(name, ...args)</code> for custom events. Created lazily on first access.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Plugin Factories
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
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">definePlugin</code></td>
                <td className="py-3 px-4"><code className="prose-code">definePlugin(plugin) | definePlugin(meta, register)</code></td>
                <td className="py-3 px-4">Defines a plugin with type safety. Accepts either a full plugin object (<code className="prose-code">{'{ meta, register }'}</code>) or the metadata and register function as separate arguments. The register function may be sync or async.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">asyncPlugin</code></td>
                <td className="py-3 px-4"><code className="prose-code">asyncPlugin(loader: () =&gt; Promise&lt;VexorPlugin&gt;): AsyncPlugin</code></td>
                <td className="py-3 px-4">Wraps a lazy loader. The loader is invoked (and awaited) when the plugin is registered, making it ideal for deferring expensive dynamic imports until the plugin is actually used.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">routePlugin</code></td>
                <td className="py-3 px-4"><code className="prose-code">routePlugin(prefix: string, register): VexorPlugin</code></td>
                <td className="py-3 px-4">Creates a plugin named <code className="prose-code">routes:&lt;prefix&gt;</code> whose prefix is combined into the options seen by sub-plugins registered via <code className="prose-code">pluginCtx.register()</code>. For prefixing routes registered directly on the app, prefer <code className="prose-code">registerPlugin(plugin, {'{ prefix }'})</code>.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">configurablePlugin</code></td>
                <td className="py-3 px-4"><code className="prose-code">configurablePlugin(meta, defaults, register): (config?) =&gt; VexorPlugin</code></td>
                <td className="py-3 px-4">Returns a factory that produces a plugin with the caller's partial config merged over the declared defaults. The register function receives the merged config as its second argument, typed from the defaults.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          PluginMeta
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Field</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">name</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">Unique identifier within the application, used for duplicate detection, dependency resolution, and conflict checks. Use a descriptive, kebab-case name (e.g. <code className="prose-code">'rate-limit'</code>). If omitted entirely (no meta), an anonymous name is generated.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">version</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">Optional semver-formatted version string. Not enforced by the framework, but communicates compatibility expectations and is available for programmatic checks.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">description</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">Optional human-readable description. Recommended for plugins intended for distribution.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">dependencies</code></td>
                <td className="py-3 px-4"><code className="prose-code">string[]</code></td>
                <td className="py-3 px-4">Plugin names that must be registered and loaded before this plugin. Registration throws if any is missing or failed to load. Registration order matters -- register dependencies first.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">conflicts</code></td>
                <td className="py-3 px-4"><code className="prose-code">string[]</code></td>
                <td className="py-3 px-4">Plugin names that cannot coexist with this plugin. If any is already registered, registration throws a conflict error.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          PluginOptions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Option</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">prefix</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">URL prefix applied to every route the plugin registers. Applied via <code className="prose-code">app.withPrefix()</code>, so it also works for async register functions. Sub-plugin prefixes are concatenated onto the parent's.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">config</code></td>
                <td className="py-3 px-4"><code className="prose-code">Record&lt;string, unknown&gt;</code></td>
                <td className="py-3 px-4">Arbitrary plugin-specific configuration, readable inside the register function as <code className="prose-code">pluginCtx.options.config</code>.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">skipDuplicate</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4">When true, registering a plugin whose name is already taken becomes a silent no-op instead of throwing.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          PluginContext
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The object passed to a plugin's <code className="prose-code">register</code> function. Alongside the
          properties <code className="prose-code">app</code> (the Vexor instance),{' '}
          <code className="prose-code">options</code> (the registration options), and{' '}
          <code className="prose-code">plugins</code> (the registry), it exposes these methods:
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
                <td className="py-3 px-4"><code className="prose-code">decorate</code></td>
                <td className="py-3 px-4"><code className="prose-code">decorate(name: string, value: unknown): void</code></td>
                <td className="py-3 px-4">Adds a named value to the Vexor application instance and the registry. Names must be unique across all plugins; a duplicate throws. Retrieve typed values with <code className="prose-code">app.plugins.getDecoration&lt;T&gt;(name)</code>.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">decorateRequest</code></td>
                <td className="py-3 px-4"><code className="prose-code">decorateRequest(name: string, getter: () =&gt; unknown): void</code></td>
                <td className="py-3 px-4">Registers a per-request decoration. The getter runs for every incoming request and its result is stored in the request's context state, readable via <code className="prose-code">ctx.get(name)</code> in hooks and handlers. Names must be unique across all plugins.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">addHook</code></td>
                <td className="py-3 px-4"><code className="prose-code">addHook(name: string, handler: (ctx) =&gt; void | Response): void</code></td>
                <td className="py-3 px-4">Lifecycle names (<code className="prose-code">onRequest</code>, <code className="prose-code">preParsing</code>, <code className="prose-code">preValidation</code>, <code className="prose-code">preHandler</code>, <code className="prose-code">preSerialization</code>, <code className="prose-code">onSend</code>, <code className="prose-code">onResponse</code>, <code className="prose-code">onError</code>) are forwarded to the app's middleware pipeline and run per request with the <code className="prose-code">VexorContext</code>; returning a Response short-circuits. Any other name registers a custom event runnable via <code className="prose-code">app.plugins.runHooks(name)</code>.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">register</code></td>
                <td className="py-3 px-4"><code className="prose-code">register(plugin: VexorPlugin, options?: PluginOptions): Promise&lt;void&gt;</code></td>
                <td className="py-3 px-4">Registers a child plugin. The parent's prefix is combined with the child's (<code className="prose-code">'/api'</code> + <code className="prose-code">'/users'</code> = <code className="prose-code">'/api/users'</code>). The child goes through the same validation as top-level plugins.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Built-in Plugins
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Configurable plugin factories available on the <code className="prose-code">plugins</code> export.
          Call the factory (optionally with overrides) and pass the result to{' '}
          <code className="prose-code">app.registerPlugin()</code>.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Plugin</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Usage</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">plugins.cors</code></td>
                <td className="py-3 px-4"><code className="prose-code">plugins.cors(config?)</code></td>
                <td className="py-3 px-4">Queues <code className="prose-code">Access-Control-*</code> headers on every response and short-circuits OPTIONS preflight requests with a 204. Options: <code className="prose-code">origin</code> (default <code className="prose-code">'*'</code>), <code className="prose-code">methods</code>, <code className="prose-code">allowedHeaders</code>, <code className="prose-code">exposedHeaders</code>, <code className="prose-code">credentials</code>, <code className="prose-code">maxAge</code> (default 86400).</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">plugins.requestId</code></td>
                <td className="py-3 px-4"><code className="prose-code">plugins.requestId(config?)</code></td>
                <td className="py-3 px-4">Reuses an incoming request ID header or generates one, stores it in the context state (<code className="prose-code">ctx.get('requestId')</code>), and queues it as a response header. Options: <code className="prose-code">header</code> (default <code className="prose-code">'X-Request-ID'</code>), <code className="prose-code">generator</code>.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">plugins.helmet</code></td>
                <td className="py-3 px-4"><code className="prose-code">plugins.helmet(config?)</code></td>
                <td className="py-3 px-4">Queues security headers in an <code className="prose-code">onSend</code> hook: Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, X-Download-Options. Options: <code className="prose-code">contentSecurityPolicy</code>, <code className="prose-code">hsts</code>, <code className="prose-code">noSniff</code>, <code className="prose-code">xssFilter</code>, <code className="prose-code">ieNoOpen</code>, <code className="prose-code">frameguard</code> (<code className="prose-code">'deny'</code> | <code className="prose-code">'sameorigin'</code> | <code className="prose-code">false</code>).</td>
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
          <Link to="/infrastructure/config" className="btn-primary">
            Configuration <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/infrastructure/dependency-injection" className="btn-secondary">
            Dependency Injection
          </Link>
        </div>
      </section>
    </div>
  );
}
