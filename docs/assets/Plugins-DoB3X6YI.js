import{j as e,C as s,I as t,L as a,A as i}from"./index-Bga0OgzL.js";const r=`import { Vexor, definePlugin } from '@vexorjs/core';

const app = new Vexor();

// Define a simple plugin
const timestampPlugin = definePlugin({
  name: 'timestamp',
  version: '1.0.0',
  register(ctx) {
    // Add a hook that runs on every request
    ctx.addHook('onRequest', async (reqCtx) => {
      reqCtx.set('requestTime', Date.now());
    });

    // Add a hook that runs before sending the response
    ctx.addHook('onSend', async (reqCtx, response) => {
      const start = reqCtx.get('requestTime') as number;
      reqCtx.header('X-Response-Time', \`\${Date.now() - start}ms\`);
      return response;
    });
  },
});

// Register the plugin
app.register(timestampPlugin);

// Plugins are activated when the app starts
app.listen({ port: 3000 });`,n=`import { definePlugin, type PluginContext } from '@vexorjs/core';

const myPlugin = definePlugin({
  // Plugin metadata
  name: 'my-plugin',
  version: '2.0.0',
  description: 'A comprehensive example plugin',
  dependencies: ['database'],        // Required plugins
  conflicts: ['legacy-plugin'],      // Incompatible plugins

  // Registration function receives the plugin context
  register(ctx: PluginContext) {
    // ctx.app - the Vexor application instance
    // ctx.options - plugin-specific options (if configurable)
    // ctx.plugins - map of already-registered plugins

    // Decorate the app instance with new properties
    ctx.decorate('myService', new MyService());

    // Decorate every request context
    ctx.decorateRequest('requestId', null);

    // Add lifecycle hooks
    ctx.addHook('onRequest', async (reqCtx) => {
      reqCtx.requestId = crypto.randomUUID();
    });

    // Register sub-plugins
    ctx.register(helperPlugin);
  },
});`,o=`import { definePlugin } from '@vexorjs/core';

const analyticsPlugin = definePlugin({
  name: 'analytics',
  version: '1.0.0',
  register(ctx) {
    // Decorate the app with a shared service
    const analytics = new AnalyticsService();
    ctx.decorate('analytics', analytics);

    // Decorate every request context with a tracker
    ctx.decorateRequest('tracker', null);

    ctx.addHook('onRequest', async (reqCtx) => {
      reqCtx.tracker = analytics.createTracker({
        requestId: crypto.randomUUID(),
        path: reqCtx.req.url,
        method: reqCtx.req.method,
      });
    });

    ctx.addHook('onSend', async (reqCtx, response) => {
      reqCtx.tracker.finish({ statusCode: response.status });
      return response;
    });
  },
});

// After registering, decorations are available on the app and request
app.register(analyticsPlugin);

app.get('/api/data', async (ctx) => {
  // app-level decoration
  app.analytics.track('api.data.accessed');

  // request-level decoration
  ctx.tracker.event('data_fetched', { count: 42 });

  return ctx.json({ data: [] });
});`,l=`import { asyncPlugin } from '@vexorjs/core';

// Async plugins can perform asynchronous setup
const databasePlugin = asyncPlugin({
  name: 'database',
  version: '1.0.0',
  description: 'Database connection pool',

  async register(ctx) {
    // Perform async initialization
    const pool = await createPool({
      connectionString: process.env.DATABASE_URL,
      maxConnections: 20,
    });

    // Verify connection during plugin registration
    await pool.query('SELECT 1');

    // Decorate the app with the pool
    ctx.decorate('db', pool);

    // Add a graceful shutdown hook
    ctx.addHook('onClose', async () => {
      await pool.end();
      console.log('Database pool closed');
    });

    console.log('Database plugin initialized');
  },
});

// Async plugins are awaited during app.listen()
app.register(databasePlugin);

// App waits for all async plugins to initialize
await app.listen({ port: 3000 });

// Use in handlers
app.get('/api/users', async (ctx) => {
  const users = await app.db.query('SELECT * FROM users');
  return ctx.json(users.rows);
});`,c=`import { routePlugin } from '@vexorjs/core';

// Route plugins encapsulate related routes
const userRoutes = routePlugin({
  name: 'user-routes',
  version: '1.0.0',
  prefix: '/api/users',

  register(ctx) {
    const { app } = ctx;

    app.get('/', async (reqCtx) => {
      const users = await app.db.query('SELECT * FROM users');
      return reqCtx.json(users.rows);
    });

    app.get('/:id', async (reqCtx) => {
      const { id } = reqCtx.params;
      const user = await app.db.query('SELECT * FROM users WHERE id = $1', [id]);
      return reqCtx.json(user.rows[0]);
    });

    app.post('/', {
      body: UserCreateSchema,
    }, async (reqCtx) => {
      const data = reqCtx.body;
      const user = await app.db.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [data.name, data.email]
      );
      return reqCtx.status(201).json(user.rows[0]);
    });

    app.delete('/:id', async (reqCtx) => {
      const { id } = reqCtx.params;
      await app.db.query('DELETE FROM users WHERE id = $1', [id]);
      return reqCtx.status(204).send();
    });
  },
});

app.register(userRoutes);
// Registers: GET /api/users, GET /api/users/:id, POST /api/users, DELETE /api/users/:id`,d=`import { configurablePlugin } from '@vexorjs/core';

interface RateLimitOptions {
  max: number;
  window: number;
  keyGenerator?: (ctx: Context) => string;
  message?: string;
  statusCode?: number;
}

// Configurable plugin accepts options at registration time
const rateLimit = configurablePlugin<RateLimitOptions>({
  name: 'rate-limit',
  version: '1.0.0',
  defaults: {
    max: 100,
    window: 60_000,
    message: 'Too many requests',
    statusCode: 429,
  },

  register(ctx, options) {
    const store = new Map<string, { count: number; resetAt: number }>();

    ctx.addHook('onRequest', async (reqCtx) => {
      const key = options.keyGenerator
        ? options.keyGenerator(reqCtx)
        : reqCtx.req.header('x-forwarded-for') || 'unknown';

      const now = Date.now();
      const record = store.get(key);

      if (!record || now > record.resetAt) {
        store.set(key, { count: 1, resetAt: now + options.window });
        return;
      }

      record.count++;

      if (record.count > options.max) {
        return reqCtx.status(options.statusCode!).json({
          error: options.message,
          retryAfter: Math.ceil((record.resetAt - now) / 1000),
        });
      }
    });
  },
});

// Register with custom options
app.register(rateLimit({ max: 50, window: 30_000 }));

// Or use defaults
app.register(rateLimit());`,p=`import { Vexor, cors, requestId, helmet } from '@vexorjs/core';

const app = new Vexor();

// CORS plugin - configures Cross-Origin Resource Sharing
app.register(cors({
  origin: ['https://example.com', 'https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  maxAge: 86400,
}));

// Request ID plugin - adds unique ID to every request
app.register(requestId({
  header: 'X-Request-Id',       // Header to check / set
  generator: () => crypto.randomUUID(),
}));

// Helmet plugin - sets security headers
app.register(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: 'deny' },
}));

// All built-in plugins are configurable with sensible defaults
app.listen({ port: 3000 });`;function u(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"plugins",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"Plugins"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"Plugins are Vexor's primary mechanism for extending framework functionality in a modular, composable, and reusable way. A plugin is a self-contained unit of functionality that can add lifecycle hooks, decorate the application and request contexts with new properties and methods, register routes, and declare dependencies on other plugins. The plugin system is what makes it possible to build a rich ecosystem of shareable functionality -- from CORS handling and rate limiting to database integrations and authentication flows -- without coupling any of it to your application's business logic."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The design philosophy behind Vexor's plugin system is encapsulation. Each plugin operates in its own scope, declares what it needs (dependencies) and what it provides (decorations and hooks), and is registered with a single ",e.jsx("code",{className:"prose-code",children:"app.register()"})," call. This makes plugins predictable and composable: you can add or remove a plugin without understanding its internals, and you can combine plugins from different authors without worrying about namespace collisions (the framework enforces uniqueness for decoration names) or execution order conflicts (the framework resolves dependencies automatically)."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor supports several plugin types to cover different use cases. Synchronous plugins (",e.jsx("code",{className:"prose-code",children:"definePlugin"}),") handle most common scenarios like adding hooks and decorations. Async plugins (",e.jsx("code",{className:"prose-code",children:"asyncPlugin"}),") support initialization that involves I/O, such as establishing database connections or loading remote configuration. Route plugins (",e.jsx("code",{className:"prose-code",children:"routePlugin"}),") encapsulate groups of related HTTP endpoints under a common prefix. Configurable plugins (",e.jsx("code",{className:"prose-code",children:"configurablePlugin"}),") accept user-provided options that are merged with sensible defaults, making them adaptable to different deployment contexts."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"Whether you are wrapping a third-party library, encapsulating cross-cutting concerns, organizing your application into feature modules, or publishing reusable functionality for the Vexor ecosystem, the plugin system provides a structured, type-safe way to do it. The rest of this page covers the plugin lifecycle, the different plugin types and when to use each, the decoration system, and best practices for authoring robust plugins."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"how-it-works",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"How Plugins Work"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When you call ",e.jsx("code",{className:"prose-code",children:"app.register(plugin)"}),", Vexor does not immediately execute the plugin's ",e.jsx("code",{className:"prose-code",children:"register"})," function. Instead, it queues the plugin for initialization, which happens during the application boot sequence (triggered by ",e.jsx("code",{className:"prose-code",children:"app.listen()"})," or ",e.jsx("code",{className:"prose-code",children:"app.ready()"}),"). During boot, Vexor processes plugins in registration order, but with dependency resolution: if plugin B declares a dependency on plugin A, Vexor ensures A is initialized before B, regardless of the order they were registered."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Before executing a plugin's ",e.jsx("code",{className:"prose-code",children:"register"})," function, Vexor performs validation. It checks that all declared dependencies are registered (and throws a clear error if any are missing), verifies that no declared conflicts exist among the registered plugins, and checks that the plugin name is unique. This validation catches configuration errors at startup rather than at runtime, following the fail-fast principle."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"register"})," function receives a ",e.jsx("code",{className:"prose-code",children:"PluginContext"})," object that serves as the plugin's interface to the application. Through this context, the plugin can add lifecycle hooks (",e.jsx("code",{className:"prose-code",children:"onRequest"}),", ",e.jsx("code",{className:"prose-code",children:"onSend"}),", ",e.jsx("code",{className:"prose-code",children:"onError"}),", ",e.jsx("code",{className:"prose-code",children:"onClose"}),"), decorate the app and request objects, access the application instance, read plugin-specific options, and even register sub-plugins. The context acts as a sandbox: plugins can extend the application but cannot accidentally interfere with each other's internal state."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:["For async plugins, the ",e.jsx("code",{className:"prose-code",children:"register"})," function returns a Promise, and Vexor ",e.jsx("code",{className:"prose-code",children:"awaits"})," it during boot. This means the application will not start accepting HTTP requests until all async plugins have finished initializing. If any async plugin's initialization fails (the Promise rejects), the entire boot sequence aborts with an error. This ensures your application never starts in a half-initialized state -- either all plugins are ready, or the application does not start."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"basic-usage",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Basic Usage"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The simplest way to create a plugin is with ",e.jsx("code",{className:"prose-code",children:"definePlugin"}),". You provide a name, a version, and a ",e.jsx("code",{className:"prose-code",children:"register"})," function that sets up the plugin's behavior. The name must be unique across all registered plugins and is used for dependency resolution, conflict detection, and debugging output. The version follows semver conventions and is available for programmatic compatibility checking."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Inside the ",e.jsx("code",{className:"prose-code",children:"register"})," function, you interact with the application through the provided ",e.jsx("code",{className:"prose-code",children:"PluginContext"}),". The most common operation is adding lifecycle hooks with ",e.jsx("code",{className:"prose-code",children:"ctx.addHook"}),". Hooks let you execute code at specific points in the request lifecycle -- before routing (",e.jsx("code",{className:"prose-code",children:"onRequest"}),"), before sending the response (",e.jsx("code",{className:"prose-code",children:"onSend"}),"), when an error occurs (",e.jsx("code",{className:"prose-code",children:"onError"}),"), or when the application shuts down (",e.jsx("code",{className:"prose-code",children:"onClose"}),"). This is how plugins inject behavior into the request pipeline without modifying route handlers."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The example below demonstrates a response timing plugin that measures how long each request takes to process. It sets a timestamp in the ",e.jsx("code",{className:"prose-code",children:"onRequest"})," hook, then computes the elapsed time in the ",e.jsx("code",{className:"prose-code",children:"onSend"})," hook and adds it as a response header. This is a pattern you will see frequently -- plugins that bracket the request lifecycle to add observability, security, or transformation logic."]}),e.jsx(s,{code:r,filename:"plugin.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"plugin-anatomy",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Plugin Anatomy"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Every plugin consists of two parts: metadata and a registration function. The metadata declares the plugin's identity and its relationships with other plugins. The ",e.jsx("code",{className:"prose-code",children:"name"})," is the only required field and serves as the plugin's unique identifier within the application. The ",e.jsx("code",{className:"prose-code",children:"version"}),", ",e.jsx("code",{className:"prose-code",children:"description"}),", ",e.jsx("code",{className:"prose-code",children:"dependencies"}),", and ",e.jsx("code",{className:"prose-code",children:"conflicts"})," fields are optional but recommended for any plugin that will be shared or reused."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"dependencies"})," array lists the names of plugins that must be registered and initialized before this plugin. If your plugin decorates the app with a service that depends on a database connection provided by another plugin, you declare that plugin as a dependency. Vexor verifies at boot time that all dependencies are satisfied and initializes them first. The ",e.jsx("code",{className:"prose-code",children:"conflicts"})," array lists plugins that are incompatible with this one -- for example, two different authentication plugins that both try to decorate the app with an ",e.jsx("code",{className:"prose-code",children:"auth"})," property. If a conflict is detected, registration fails with a clear error message."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"PluginContext"})," passed to the ",e.jsx("code",{className:"prose-code",children:"register"})," function provides access to the application instance (",e.jsx("code",{className:"prose-code",children:"ctx.app"}),"), the options passed during registration (",e.jsx("code",{className:"prose-code",children:"ctx.options"}),"), and a map of already-registered plugins (",e.jsx("code",{className:"prose-code",children:"ctx.plugins"}),"). The context also exposes the key methods for extending the application: ",e.jsx("code",{className:"prose-code",children:"decorate"}),", ",e.jsx("code",{className:"prose-code",children:"decorateRequest"}),", ",e.jsx("code",{className:"prose-code",children:"addHook"}),", and ",e.jsx("code",{className:"prose-code",children:"register"})," (for sub-plugins). These methods are the building blocks for all plugin functionality."]}),e.jsx(s,{code:n,filename:"anatomy.ts",showLineNumbers:!0}),e.jsx(t,{variant:"info",children:"Plugin dependencies are checked at registration time. If a required plugin is missing, Vexor throws an error with a clear message indicating which dependency is not satisfied. This fail-fast behavior ensures you discover configuration errors during development rather than encountering mysterious runtime failures in production."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"decorators",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Decorating the App and Request"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Decoration is how plugins expose services, utilities, and data to the rest of the application. There are two types: app-level decorations and request-level decorations. App-level decorations add properties to the Vexor application instance itself, making them accessible anywhere you have a reference to ",e.jsx("code",{className:"prose-code",children:"app"}),". Request-level decorations add properties to every request context, making them available inside route handlers and middleware for each individual request."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When you call ",e.jsx("code",{className:"prose-code",children:"ctx.decorate('analytics', analyticsService)"}),", the ",e.jsx("code",{className:"prose-code",children:"analytics"})," property becomes available on the app instance: ",e.jsx("code",{className:"prose-code",children:"app.analytics"}),". This is the right choice for shared, stateless services that do not vary by request -- database clients, analytics SDKs, configuration managers, and utility libraries. The value is set once during plugin registration and remains constant for the application's lifetime."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Request-level decorations work differently. When you call ",e.jsx("code",{className:"prose-code",children:"ctx.decorateRequest('tracker', null)"}),", Vexor adds a ",e.jsx("code",{className:"prose-code",children:"tracker"})," property to the prototype of the request context object. The initial value you provide (in this case, ",e.jsx("code",{className:"prose-code",children:"null"}),") serves as the default. Typically, you then use an ",e.jsx("code",{className:"prose-code",children:"onRequest"})," hook to assign a real value to the property for each incoming request. This pattern gives each request its own tracker instance while keeping the property declaration in the plugin's registration phase."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:["Vexor enforces that decoration names are unique across all plugins. If two plugins try to decorate the app or request with the same property name, Vexor throws a conflict error during registration. This prevents accidental overwriting and makes it immediately clear when two plugins are incompatible. If you are authoring a plugin intended for wide distribution, choose decoration names that are specific and unlikely to collide -- prefer ",e.jsx("code",{className:"prose-code",children:"myPluginTracker"})," over ",e.jsx("code",{className:"prose-code",children:"tracker"}),"."]}),e.jsx(s,{code:o,filename:"decorators.ts",showLineNumbers:!0}),e.jsx(t,{variant:"warning",children:"Decorator names must be unique across all plugins. If two plugins try to decorate with the same name, Vexor throws a conflict error at registration time. Use descriptive, namespaced names to minimize the risk of collisions, especially for plugins intended for distribution."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"async-plugins",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Async Plugins"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Many plugins need to perform asynchronous work during initialization: establishing a database connection pool, connecting to a message broker, loading configuration from a remote service, or verifying that external dependencies are reachable. Synchronous plugins cannot perform these operations because their ",e.jsx("code",{className:"prose-code",children:"register"})," function runs synchronously during the boot sequence. Async plugins solve this by allowing the ",e.jsx("code",{className:"prose-code",children:"register"})," function to be an ",e.jsx("code",{className:"prose-code",children:"async"})," function that Vexor ",e.jsx("code",{className:"prose-code",children:"awaits"})," before proceeding to the next plugin."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The key benefit of async plugins is that they block the boot sequence until initialization is complete. This means your application will never start accepting HTTP requests before all resources are ready. If the database plugin fails to establish a connection, the application does not start. If the configuration plugin fails to load remote settings, the application does not start. This fail-fast behavior prevents the frustrating scenario where your application appears to be running but fails on every request because a critical resource is unavailable."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Async plugins should also register cleanup logic using the ",e.jsx("code",{className:"prose-code",children:"onClose"})," lifecycle hook. When the application shuts down (via ",e.jsx("code",{className:"prose-code",children:"app.close()"})," or a signal handler), Vexor runs all ",e.jsx("code",{className:"prose-code",children:"onClose"})," hooks in reverse registration order, allowing each plugin to clean up its resources gracefully. For a database plugin, this means draining the connection pool. For a message broker plugin, this means closing channels and connections. Proper cleanup prevents resource leaks and ensures in-flight operations complete before the process exits."]}),e.jsx(s,{code:l,filename:"async-plugin.ts",showLineNumbers:!0}),e.jsxs(t,{variant:"tip",children:["Use the ",e.jsx("code",{className:"prose-code",children:"onClose"})," hook to clean up resources when the application shuts down. This ensures connections are properly closed and buffers are flushed. Vexor runs ",e.jsx("code",{className:"prose-code",children:"onClose"})," hooks in reverse registration order, so plugins that depend on other plugins will clean up first, followed by their dependencies."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"route-plugins",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Route Plugins"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Route plugins are a specialized plugin type designed for encapsulating groups of related HTTP endpoints. They automatically apply a URL prefix to all routes registered within the plugin, keeping route definitions clean and making it easy to move or rename entire feature areas. This is the recommended way to organize routes in any application that goes beyond a handful of endpoints."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"prefix"})," option determines the base URL for all routes in the plugin. A route plugin with ",e.jsx("code",{className:"prose-code",children:"prefix: '/api/users'"})," that defines a ",e.jsx("code",{className:"prose-code",children:"GET /"})," route will register it as ",e.jsx("code",{className:"prose-code",children:"GET /api/users"}),". A ",e.jsx("code",{className:"prose-code",children:"GET /:id"})," route becomes ",e.jsx("code",{className:"prose-code",children:"GET /api/users/:id"}),". This prefix is applied transparently -- inside the plugin, routes are defined relative to the prefix, keeping them short and readable."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Route plugins compose naturally with other plugin features. They can depend on other plugins (like a database plugin), use app-level decorations, add their own hooks that apply only to routes within the plugin, and even register sub-plugins. A common architecture is to have one route plugin per domain entity (users, posts, comments) and compose them all at the application level, giving you a clean separation of concerns without sacrificing the ability to share services across domains."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"When building a REST API, route plugins naturally map to API resources. Each plugin owns all CRUD operations for its resource, along with any resource-specific validation, authorization logic, or business rules. This co-location makes it easy to understand everything about a resource by reading a single file, and to modify or extend a resource without affecting unrelated parts of the application."}),e.jsx(s,{code:c,filename:"route-plugin.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"configurable-plugins",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Configurable Plugins"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Most plugins need to be adaptable to different deployment contexts. A rate limiting plugin needs different thresholds for different applications. A CORS plugin needs to know which origins to allow. A logging plugin needs to know the log level. Configurable plugins address this by accepting an options object at registration time, which is merged with sensible default values to produce the final configuration."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"configurablePlugin"})," function returns a factory function rather than a plugin directly. You call the factory with your options to produce the plugin instance: ",e.jsxs("code",{className:"prose-code",children:["app.register(rateLimit(","{ max: 50, window: 30_000 }","));"]}),". If you are happy with the defaults, you can call the factory with no arguments: ",e.jsx("code",{className:"prose-code",children:"app.register(rateLimit())"}),". Vexor deep-merges your provided options with the declared defaults, so you only need to specify the values you want to override."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"register"})," function of a configurable plugin receives both the plugin context and the merged options object. The options are fully typed based on the generic parameter you provide to ",e.jsx("code",{className:"prose-code",children:"configurablePlugin<T>"}),", giving you compile-time safety for all option access. This pattern is the standard way to build reusable, distributable plugins that work across different applications and environments."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"When designing the options interface for a configurable plugin, follow the principle of progressive disclosure: provide sensible defaults for everything, require as few options as possible, and let users override specific values as needed. A plugin that requires ten options to do anything useful will not be adopted. A plugin that works out of the box and lets you customize individual behaviors will."}),e.jsx(s,{code:d,filename:"configurable.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"built-in-plugins",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Built-in Plugins"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor ships with several built-in plugins that address the most common needs of HTTP API applications. Each built-in plugin follows the configurable plugin pattern, providing sensible defaults while allowing full customization. These plugins are maintained as part of the core framework, ensuring compatibility with each Vexor release and consistent API conventions."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("strong",{children:"CORS plugin"})," handles Cross-Origin Resource Sharing, which is necessary for any API that will be called from browser-based JavaScript running on a different domain. It handles preflight OPTIONS requests automatically, sets the required headers on every response, and supports fine-grained configuration of allowed origins, methods, headers, and credentials. Without CORS configuration, browsers will block frontend applications from calling your API."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("strong",{children:"Request ID plugin"})," ensures every request has a unique identifier, either by reading it from an incoming header (for distributed tracing across services) or by generating a new UUID. The request ID is set as a response header and can be used in logging, error reporting, and debugging to correlate all activity related to a single request across your entire system."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("strong",{children:"Helmet plugin"})," sets security-related HTTP headers that protect against common web vulnerabilities. It configures Content-Security-Policy (to prevent XSS attacks), Strict-Transport-Security (to enforce HTTPS), X-Frame-Options (to prevent clickjacking), and several other headers. These are generally recommended for all production deployments and can be customized based on your application's specific security requirements."]}),e.jsx(s,{code:p,filename:"built-in.ts",showLineNumbers:!0}),e.jsx(t,{variant:"tip",children:"All built-in plugins work with zero configuration. Start by registering them with defaults, then customize specific options as your requirements become clearer. For production deployments, review the CORS origins, Helmet CSP directives, and other security-sensitive options carefully."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"best-practices",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Best Practices"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{children:"Keep plugins focused."})," A plugin should do one thing well. A database plugin manages the connection pool and exposes it as a decoration. An authentication plugin verifies tokens and populates user context. Resist the temptation to combine unrelated functionality into a single plugin -- it makes the plugin harder to test, harder to configure, and impossible to use partially."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{children:"Declare dependencies explicitly."})," If your plugin relies on another plugin's decoration (e.g., it reads ",e.jsx("code",{className:"prose-code",children:"app.db"}),"), declare that plugin as a dependency. This ensures correct initialization order and gives users a clear error when they forget to register a required plugin. Never silently swallow errors from missing dependencies -- fail fast and fail clearly."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsxs("strong",{children:["Always implement ",e.jsx("code",{className:"prose-code",children:"onClose"})," for plugins that manage resources."]})," Database connections, file handles, network sockets, timers, and intervals should all be cleaned up when the application shuts down. Without proper cleanup, your process may hang during shutdown or leak resources in environments where processes are recycled."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:[e.jsx("strong",{children:"Namespace your decoration names."})," If you are authoring a plugin for distribution, choose decoration names that are unlikely to collide with other plugins. A generic name like ",e.jsx("code",{className:"prose-code",children:"db"})," might conflict with another database plugin. A more specific name like ",e.jsx("code",{className:"prose-code",children:"postgresPool"})," is safer. For internal plugins where you control the full set, shorter names are fine."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400",children:[e.jsx("strong",{children:"Make configurable plugins zero-config by default."})," Provide sensible defaults for every option so that users can register the plugin with no arguments and get reasonable behavior. Then let them override specific options as needed. Document the defaults clearly so users know what they are getting without reading the source code."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"api-reference",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"API Reference"}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3",children:"Plugin Definitions"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor provides four factory functions for creating plugins, each tailored to a different use case. All return a ",e.jsx("code",{className:"prose-code",children:"Plugin"})," object that can be passed to ",e.jsx("code",{className:"prose-code",children:"app.register()"}),"."]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Function"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Signature"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"definePlugin"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"definePlugin(options): Plugin"})}),e.jsxs("td",{className:"py-3 px-4",children:["Defines a synchronous plugin with metadata and a register function. The register function runs during the application boot sequence and receives a ",e.jsx("code",{className:"prose-code",children:"PluginContext"})," for extending the application. This is the standard plugin type for most use cases that do not require async initialization."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"asyncPlugin"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"asyncPlugin(options): Plugin"})}),e.jsxs("td",{className:"py-3 px-4",children:["Defines a plugin with an async register function that Vexor ",e.jsx("code",{className:"prose-code",children:"awaits"})," during boot. The application will not start accepting requests until all async plugins have completed initialization. Use for plugins that need to establish network connections, load remote configuration, or perform any I/O during setup."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"routePlugin"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"routePlugin(options): Plugin"})}),e.jsxs("td",{className:"py-3 px-4",children:["Defines a plugin that registers HTTP routes under a common URL prefix. The ",e.jsx("code",{className:"prose-code",children:"prefix"})," option is prepended to all route paths registered within the plugin. This is the recommended way to organize routes by domain entity or feature area in larger applications."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"configurablePlugin"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"configurablePlugin<T>(options): (opts?: T) => Plugin"})}),e.jsx("td",{className:"py-3 px-4",children:"Returns a factory function that produces a plugin with user-provided options merged with declared defaults. The factory can be called with partial options (only the values to override) or no arguments (to use all defaults). The register function receives the merged options as its second argument, fully typed via the generic parameter."})]})]})]})}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3",children:"PluginMeta"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Metadata fields that describe the plugin's identity and its relationships with other plugins. These fields are validated during registration."}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Option"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Type"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Default"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"name"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"Required"}),e.jsxs("td",{className:"py-3 px-4",children:["A unique identifier for the plugin within the application. Used for dependency resolution, conflict detection, and diagnostic output. Must be unique among all registered plugins. Use a descriptive, kebab-case name (e.g., ",e.jsx("code",{className:"prose-code",children:"'database'"}),", ",e.jsx("code",{className:"prose-code",children:"'rate-limit'"}),", ",e.jsx("code",{className:"prose-code",children:"'user-routes'"}),")."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"version"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"'0.0.0'"})}),e.jsx("td",{className:"py-3 px-4",children:"A semver-formatted version string for the plugin. While not enforced by the framework, following semantic versioning conventions communicates compatibility expectations to users. The version is accessible programmatically for runtime compatibility checks."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"description"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"undefined"})}),e.jsx("td",{className:"py-3 px-4",children:"A human-readable description of what the plugin does. Not used by the framework at runtime but appears in diagnostic output and can be queried programmatically. Recommended for plugins intended for distribution or use by other developers."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"dependencies"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string[]"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"[]"})}),e.jsx("td",{className:"py-3 px-4",children:"An array of plugin names that must be registered and initialized before this plugin. Vexor checks at boot time that all listed dependencies are present and ensures they initialize first. If any dependency is missing, registration fails with an error message listing the unsatisfied dependencies."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"conflicts"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string[]"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"[]"})}),e.jsx("td",{className:"py-3 px-4",children:"An array of plugin names that cannot coexist with this plugin. If any listed plugin is also registered, Vexor throws a conflict error during registration. Use this to prevent incompatible plugins from being combined -- for example, two authentication plugins that both try to decorate the app with the same property."})]})]})]})}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3",children:"PluginContext Methods"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The methods available on the ",e.jsx("code",{className:"prose-code",children:"PluginContext"})," object passed to the ",e.jsx("code",{className:"prose-code",children:"register"})," function. These are the building blocks for all plugin functionality."]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Method"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Signature"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"decorate"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"decorate(name: string, value: unknown): void"})}),e.jsxs("td",{className:"py-3 px-4",children:["Adds a property with the given name and value to the Vexor application instance. After decoration, the property is accessible as ",e.jsx("code",{className:"prose-code",children:"app[name]"})," from anywhere in the application. The name must be unique across all plugins. Use for shared services, utilities, and application-wide state that does not vary by request."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"decorateRequest"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"decorateRequest(name: string, defaultValue: unknown): void"})}),e.jsxs("td",{className:"py-3 px-4",children:["Adds a property with the given name to every request context object, initialized to ",e.jsx("code",{className:"prose-code",children:"defaultValue"})," for each new request. The property is accessible as ",e.jsx("code",{className:"prose-code",children:"ctx[name]"})," inside route handlers and middleware. Typically paired with an ",e.jsx("code",{className:"prose-code",children:"onRequest"})," hook that assigns the real value for each request. The name must be unique across all plugins."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"addHook"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"addHook(name: string, handler: Function): void"})}),e.jsxs("td",{className:"py-3 px-4",children:["Registers a handler function for a specific lifecycle hook. Supported hooks include ",e.jsx("code",{className:"prose-code",children:"onRequest"})," (before routing), ",e.jsx("code",{className:"prose-code",children:"onSend"})," (before sending the response), ",e.jsx("code",{className:"prose-code",children:"onError"})," (when an error occurs), and ",e.jsx("code",{className:"prose-code",children:"onClose"})," (during application shutdown). Multiple handlers can be registered for the same hook; they execute in registration order."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"register"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"register(plugin: Plugin): void"})}),e.jsx("td",{className:"py-3 px-4",children:"Registers a child plugin within the context of this plugin. The child plugin inherits the parent plugin's scope and is initialized as part of the parent's registration. Use for composing complex plugins from smaller, focused sub-plugins or for plugins that include helper plugins as internal implementation details."})]})]})]})}),e.jsx("h3",{className:"text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3",children:"Built-in Plugins"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Pre-built configurable plugins included with Vexor for common HTTP API needs. All accept an optional options object and provide sensible defaults."}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Plugin"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Import"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"cors"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"cors(options?)"})}),e.jsxs("td",{className:"py-3 px-4",children:["Configures Cross-Origin Resource Sharing by handling preflight OPTIONS requests and setting appropriate CORS headers on all responses. Options include ",e.jsx("code",{className:"prose-code",children:"origin"})," (allowed origins), ",e.jsx("code",{className:"prose-code",children:"methods"})," (allowed HTTP methods), ",e.jsx("code",{className:"prose-code",children:"credentials"})," (whether to include credentials), and ",e.jsx("code",{className:"prose-code",children:"maxAge"})," (preflight cache duration in seconds)."]})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"requestId"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"requestId(options?)"})}),e.jsx("td",{className:"py-3 px-4",children:"Assigns a unique identifier to each incoming request. Checks the incoming request for an existing ID via the configured header name, or generates a new one using the provided generator function. Sets the ID as a response header for client-side correlation. Essential for distributed tracing and debugging."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"helmet"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"helmet(options?)"})}),e.jsx("td",{className:"py-3 px-4",children:"Sets security-related HTTP response headers to protect against common web vulnerabilities. Configures Content-Security-Policy (XSS prevention), Strict-Transport-Security (HTTPS enforcement), X-Frame-Options (clickjacking prevention), X-Content-Type-Options (MIME sniffing prevention), and X-XSS-Protection. Each header can be individually configured or disabled."})]})]})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(a,{to:"/infrastructure/config",className:"btn-primary",children:["Configuration ",e.jsx(i,{className:"w-4 h-4 ml-2"})]}),e.jsx(a,{to:"/infrastructure/dependency-injection",className:"btn-secondary",children:"Dependency Injection"})]})]})]})}export{u as default};
