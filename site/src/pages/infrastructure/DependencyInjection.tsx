import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { createContainer } from '@vexorjs/core';

// Create a DI container
const container = createContainer();

// Register a class as a singleton
class DatabaseService {
  async query(sql: string) {
    return db.execute(sql);
  }
}

container.singleton('database', () => new DatabaseService());

// Register a transient service (new instance each time)
class RequestLogger {
  log(message: string) {
    console.log(\`[\${new Date().toISOString()}] \${message}\`);
  }
}

container.transient('logger', () => new RequestLogger());

// Resolve dependencies
const database = container.resolve<DatabaseService>('database');
const logger = container.resolve<RequestLogger>('logger');

// Safe resolution (returns undefined instead of throwing)
const maybeMissing = container.tryGet<unknown>('nonexistent');
// undefined`;

const scopesCode = `import { createContainer, type ServiceScope } from '@vexorjs/core';

const container = createContainer();

// Singleton: one instance for the entire application
container.singleton('config', () => loadConfig());

// Transient: new instance every time resolve is called
container.transient('uuid', () => crypto.randomUUID());

// Scoped: one instance per scope (e.g., per HTTP request)
container.scoped('requestContext', () => ({
  id: crypto.randomUUID(),
  startedAt: Date.now(),
}));

// Create a scope for a request
const scope = container.createScope();

const ctx1 = scope.resolve('requestContext');
const ctx2 = scope.resolve('requestContext');
console.log(ctx1 === ctx2); // true (same scope = same instance)

// Different scope gets a different instance
const scope2 = container.createScope();
const ctx3 = scope2.resolve('requestContext');
console.log(ctx1 === ctx3); // false

// Dispose scope when done (cleans up scoped resources)
await scope.dispose();`;

const tokensCode = `import { createContainer, token } from '@vexorjs/core';

// Define typed injection tokens
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

interface NotificationService {
  send(userId: string, message: string): Promise<void>;
}

const TOKENS = {
  UserRepo: token<UserRepository>('UserRepository'),
  Notifications: token<NotificationService>('NotificationService'),
  ApiKey: token<string>('ApiKey'),
};

const container = createContainer();

// Register with tokens for type-safe resolution
container.singleton(TOKENS.UserRepo, () => new PostgresUserRepository());
container.singleton(TOKENS.Notifications, () => new EmailNotificationService());
container.instance(TOKENS.ApiKey, process.env.API_KEY!);

// Resolve is fully typed
const repo = container.resolve(TOKENS.UserRepo);
// repo: UserRepository (not any)

const apiKey = container.resolve(TOKENS.ApiKey);
// apiKey: string`;

const factoryRegistrationCode = `import { createContainer } from '@vexorjs/core';

const container = createContainer();

// Factory registration with dependencies
container.singleton('config', () => ({
  dbUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
}));

// Factory that depends on other services
container.factory('database', async (resolve) => {
  const config = resolve<{ dbUrl: string }>('config');
  const pool = await createPool(config.dbUrl);
  return new DatabaseService(pool);
});

container.factory('cache', async (resolve) => {
  const config = resolve<{ redisUrl: string }>('config');
  const client = await connectRedis(config.redisUrl);
  return new CacheService(client);
});

// Register with dependencies using inject helper
container.factory('userService', async (resolve) => {
  const db = await resolve<DatabaseService>('database');
  const cache = await resolve<CacheService>('cache');
  return new UserService(db, cache);
});

// Register a pre-built instance directly
container.instance('version', '2.1.0');

// Resolve all registrations for a given tag
container.singleton('handler:user', () => new UserHandler(), { tags: ['handler'] });
container.singleton('handler:post', () => new PostHandler(), { tags: ['handler'] });

const allHandlers = container.resolveByTag('handler');
// [UserHandler, PostHandler]`;

const modulesCode = `import { createContainer, defineModule } from '@vexorjs/core';

// Define a reusable module
const databaseModule = defineModule({
  name: 'database',
  register(container) {
    container.singleton('db.pool', () => createPool(process.env.DATABASE_URL!));
    container.singleton('db.users', (resolve) => {
      return new UserRepository(resolve('db.pool'));
    });
    container.singleton('db.posts', (resolve) => {
      return new PostRepository(resolve('db.pool'));
    });
  },
});

const cacheModule = defineModule({
  name: 'cache',
  register(container) {
    container.singleton('cache', () => createMemoryCache({ ttl: 60_000 }));
  },
});

const authModule = defineModule({
  name: 'auth',
  register(container) {
    container.singleton('auth.jwt', () => new JwtService(process.env.JWT_SECRET!));
    container.scoped('auth.session', (resolve) => {
      return new SessionManager(resolve('cache'), resolve('auth.jwt'));
    });
  },
});

// Compose modules into a container
const container = createContainer();
container.register(databaseModule);
container.register(cacheModule);
container.register(authModule);

// All services from all modules are available
const users = container.resolve<UserRepository>('db.users');`;

const requestScopingCode = `import { Vexor, createContainer } from '@vexorjs/core';

const app = new Vexor();
const container = createContainer();

// Register services
container.singleton('database', () => new DatabaseService());
container.scoped('requestId', () => crypto.randomUUID());
container.scoped('userContext', () => ({ user: null as User | null }));

// Create a request-scoped container per request
app.addHook('onRequest', async (ctx) => {
  const scope = container.createScope();
  ctx.set('container', scope);

  // Scoped services get a fresh instance per request
  const requestId = scope.resolve<string>('requestId');
  ctx.header('X-Request-Id', requestId);
});

// Clean up the scope after the response is sent
app.addHook('onSend', async (ctx, response) => {
  const scope = ctx.get('container') as ReturnType<typeof container.createScope>;
  await scope.dispose();
  return response;
});

// Use in route handlers
app.get('/api/users', async (ctx) => {
  const scope = ctx.get('container');
  const db = scope.resolve<DatabaseService>('database');      // Singleton (shared)
  const reqId = scope.resolve<string>('requestId');           // Scoped (per request)

  const users = await db.query('SELECT * FROM users');
  return ctx.json({ requestId: reqId, users });
});`;

export default function DependencyInjection() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="dependency-injection" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Dependency Injection
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Dependency injection (DI) is a design pattern where objects receive their dependencies from an external source rather than creating them internally. Instead of a <code className="prose-code">UserService</code> class instantiating its own <code className="prose-code">DatabaseService</code> and <code className="prose-code">CacheService</code>, those dependencies are "injected" by a container that manages their creation, lifecycle, and wiring. This inversion of control makes your code more modular, more testable, and easier to refactor, because each component depends on abstractions (interfaces) rather than concrete implementations.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor includes a lightweight DI container that provides the key benefits of dependency injection without the heavyweight ceremony of decorator-based frameworks. You register services with factory functions, resolve them by name or typed token, and let the container manage their lifecycle. The container supports three service lifetimes -- singleton, transient, and scoped -- giving you precise control over when instances are created and how long they live. It also supports async factories for services that require initialization (like database connection pools), modular composition for organizing large applications, and tagged resolution for plugin-style extension points.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The practical impact of DI is most visible in testing and in multi-environment deployments. With DI, you can replace your production database service with an in-memory mock by simply changing the registration, without touching any of the code that consumes the service. You can swap an email notification service for a no-op implementation in your test environment. You can configure different cache backends for development (memory) and production (Redis) by registering different implementations behind the same token. All of this happens at the container level, keeping your business logic clean and environment-agnostic.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          For HTTP applications, the scoped lifetime is especially powerful. By creating a new scope for each incoming request, you get per-request instances of services like request context, transaction managers, and user sessions -- isolated from other concurrent requests but shared across all the handlers and middleware within a single request. The scope is disposed when the request completes, automatically cleaning up any resources it allocated.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's DI container is a registry that maps service keys (strings or typed tokens) to factory functions and their associated metadata (lifetime scope, tags, and cached instances). When you call <code className="prose-code">container.singleton('database', () =&gt; new DatabaseService())</code>, the container stores the factory function and marks it as a singleton. No instance is created yet -- instantiation is lazy, happening only when the service is first resolved.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When you call <code className="prose-code">container.resolve('database')</code>, the container looks up the registration for that key. For a <strong>singleton</strong>, it checks whether an instance has already been created. If so, it returns the cached instance. If not, it calls the factory function, caches the result, and returns it. All subsequent resolutions return the same instance. For a <strong>transient</strong> service, the container calls the factory function every time, creating a fresh instance on each resolution. For a <strong>scoped</strong> service, the container checks the scope's instance cache instead of the global cache -- the same instance is returned within a scope, but different scopes get different instances.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Factory functions can themselves resolve other services by using the <code className="prose-code">resolve</code> function passed as an argument. This enables dependency chains: a <code className="prose-code">UserService</code> factory can resolve the <code className="prose-code">database</code> and <code className="prose-code">cache</code> services it depends on. The container resolves dependencies recursively, constructing the full dependency graph on demand. Circular dependencies are detected at resolution time and result in a clear error message identifying the cycle.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Scopes are implemented as child containers that inherit the parent's registrations but maintain their own instance cache for scoped services. When you call <code className="prose-code">container.createScope()</code>, the returned scope shares singleton instances with the parent (because singletons are application-wide) and creates its own instances for scoped services. Transient services always create new instances regardless of scope. When you call <code className="prose-code">scope.dispose()</code>, the scope clears its instance cache and calls any dispose hooks registered by scoped services, freeing resources like database transactions or temporary files.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Getting started with Vexor's DI container is straightforward: create a container, register your services with factory functions, and resolve them when needed. The factory function pattern means you have full control over how each service is constructed -- you can pass configuration, perform setup logic, or compose multiple objects before returning the final service instance.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The two most common registration methods are <code className="prose-code">singleton</code> and <code className="prose-code">transient</code>. Use <code className="prose-code">singleton</code> for services that should exist once for the lifetime of your application: database connections, configuration objects, shared caches, and stateless utility services. Use <code className="prose-code">transient</code> for services that need a fresh instance each time they are resolved: request-specific loggers, unique ID generators, or any object that carries per-use state.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Resolution with <code className="prose-code">resolve</code> throws an error if the requested key has no registration, which is the safe default -- it prevents your application from silently operating with missing dependencies. For cases where a service is optional, use <code className="prose-code">tryGet</code> instead, which returns <code className="prose-code">undefined</code> when the key is not found. This is useful for optional plugins, feature flags, or fallback behavior where you want to check for a service's existence without crashing.
        </p>
        <CodeBlock code={basicUsageCode} filename="container.ts" showLineNumbers />
      </section>

      {/* Scopes */}
      <section>
        <h2 id="scopes" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Service Lifetimes and Scopes
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Understanding service lifetimes is the most important concept in dependency injection. The lifetime determines when a service instance is created, how long it lives, and when it is destroyed. Choosing the wrong lifetime can lead to subtle bugs: a singleton service that holds per-request state will leak data between requests; a transient service for an expensive resource like a database pool will waste memory creating redundant instances.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Singleton</strong> services are created once on first resolution and cached for the entire application lifetime. Every call to <code className="prose-code">resolve</code> returns the exact same instance. This is appropriate for stateless services, shared resources (database pools, cache clients), and configuration objects. Because singletons persist for the life of the process, they should not hold references to request-specific data -- doing so would cause memory leaks and data corruption.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Transient</strong> services are created fresh every time <code className="prose-code">resolve</code> is called. No caching is performed. This is appropriate for services that carry per-use state, generate unique values, or need a clean starting state on each resolution. The trade-off is that transient services are more expensive -- if a transient service involves heavy initialization, resolving it frequently could impact performance.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Scoped</strong> services are the middle ground. They behave like singletons within a scope: the first resolution within a scope creates the instance, and subsequent resolutions within the same scope return that cached instance. Different scopes get different instances. This is the natural fit for per-request data in HTTP applications -- a request ID, a user context object, or a database transaction that should be shared across all handlers and middleware processing a single request but isolated from other concurrent requests.
        </p>
        <CodeBlock code={scopesCode} filename="scopes.ts" showLineNumbers />
        <InfoBlock variant="info">
          Always call <code className="prose-code">scope.dispose()</code> when a scope is no longer
          needed. This cleans up scoped resources and prevents memory leaks, especially important for
          per-request scopes in long-running servers. A scope that is never disposed will keep its scoped instances in memory indefinitely.
        </InfoBlock>
      </section>

      {/* Tokens & Interfaces */}
      <section>
        <h2 id="tokens" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Typed Tokens
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When you register and resolve services by string keys, TypeScript cannot know the type of the resolved value. You end up writing <code className="prose-code">container.resolve&lt;DatabaseService&gt;('database')</code>, manually specifying the type parameter on every resolution call. This is error-prone -- the type annotation and the actual registered type can drift apart without any compile-time error, and you lose the refactoring safety that TypeScript is supposed to provide.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Typed tokens solve this problem by encoding the service type directly into the key. A token created with <code className="prose-code">token&lt;UserRepository&gt;('UserRepository')</code> carries the <code className="prose-code">UserRepository</code> type at the TypeScript level. When you register a service with this token, the container enforces that the factory returns a compatible type. When you resolve with this token, the return type is automatically inferred -- no manual type parameter needed. This creates a single source of truth for each service's type, and any mismatches are caught at compile time.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The recommended pattern is to define all tokens in a central file (e.g., <code className="prose-code">tokens.ts</code>) and import them wherever services are registered or resolved. This makes it easy to see all the services your application provides, to search for all resolution points, and to refactor service types with confidence that the compiler will catch any inconsistencies.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Tokens also enable coding against interfaces rather than implementations. You can define a <code className="prose-code">UserRepository</code> interface, create a token typed to that interface, and register different implementations (PostgreSQL in production, in-memory in tests) behind the same token. Consuming code depends only on the interface, making it agnostic to the specific implementation -- the hallmark of good dependency injection.
        </p>
        <CodeBlock code={tokensCode} filename="tokens.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Define all tokens in a central file (e.g., <code className="prose-code">tokens.ts</code>) and
          import them wherever needed. This makes it easy to find all injection points, see all available services at a glance, and refactor service types with full compiler support.
        </InfoBlock>
      </section>

      {/* Factory Registration */}
      <section>
        <h2 id="factory-registration" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Factory Registration and Tags
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          While <code className="prose-code">singleton</code> and <code className="prose-code">transient</code> factories are synchronous, many real-world services require asynchronous initialization. A database connection pool needs to establish connections before it can serve queries. A Redis client needs to connect to the server. A configuration service might need to fetch remote configuration. The <code className="prose-code">factory</code> method supports async factory functions that can <code className="prose-code">await</code> initialization logic before returning the service instance.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Async factories receive a <code className="prose-code">resolve</code> function that lets them look up other services they depend on. This creates a declarative dependency graph: the container knows which services depend on which, and resolves them in the correct order. If service A depends on service B, and B depends on C, resolving A will first resolve C, then B, then A. All of this happens automatically based on the factory functions you provide.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For values that are already constructed -- configuration objects, environment variables, or constants -- use <code className="prose-code">instance</code> to register them directly without a factory function. This is the simplest registration type and is useful for values that do not need lazy initialization.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Tags provide a way to group related services and resolve them all at once. When you register multiple services with the same tag (e.g., <code className="prose-code">{'{ tags: [\'handler\'] }'}</code>), calling <code className="prose-code">resolveByTag('handler')</code> returns an array containing all tagged service instances. This is a powerful pattern for extension points: register all your route handlers, all your event listeners, or all your validator plugins with a shared tag, then resolve them as a group to wire them up.
        </p>
        <CodeBlock code={factoryRegistrationCode} filename="factories.ts" showLineNumbers />
        <InfoBlock variant="info">
          Async factories are resolved lazily on first use, not during registration. If you need to verify that all services can be initialized at startup (fail-fast), resolve your critical services explicitly during application bootstrap before starting the HTTP server.
        </InfoBlock>
      </section>

      {/* Modules */}
      <section>
        <h2 id="modules" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Modules
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          As your application grows, registering all services in a single file becomes unwieldy. Modules provide a way to group related service registrations into self-contained, reusable units. A module is a named bundle of registrations that can be applied to any container. This maps naturally to domain boundaries: a "database" module registers the connection pool and all repository services, an "auth" module registers JWT services and session managers, and a "cache" module registers the cache store and related utilities.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Modules are defined with <code className="prose-code">defineModule</code>, which takes a name and a <code className="prose-code">register</code> function that receives the container. Inside the register function, you call the container's registration methods just as you would at the top level. The difference is that these registrations are encapsulated -- they only take effect when the module is registered with a container via <code className="prose-code">container.register(module)</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          This encapsulation enables several important patterns. You can reuse a module across multiple applications -- a shared database module, for example, can be an npm package imported by all your services. You can conditionally register modules based on environment or configuration. You can compose modules to build different container configurations for different contexts: a full container for production, a slimmed-down container for testing, and a container with mock modules for integration tests.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          A good naming convention for services within modules is to use dot-separated names that reflect the module hierarchy: <code className="prose-code">db.pool</code>, <code className="prose-code">db.users</code>, <code className="prose-code">auth.jwt</code>, <code className="prose-code">auth.session</code>. This makes it immediately clear which module owns each service and avoids naming collisions between modules.
        </p>
        <CodeBlock code={modulesCode} filename="modules.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Modules are the recommended way to organize services in larger applications. Each domain
          (auth, database, cache) gets its own module, keeping registrations maintainable. For testing, create alternative modules that register mock implementations behind the same service keys.
        </InfoBlock>
      </section>

      {/* Request Scoping */}
      <section>
        <h2 id="request-scoping" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Request Scoping
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Request scoping is where dependency injection delivers its greatest value in HTTP applications. By creating a new scope for each incoming request, you get isolated, per-request service instances that are automatically shared across all the middleware and handlers processing that request. A request ID generated at the start of the request is available in every handler and middleware without being explicitly passed as a function argument. A database transaction opened in middleware is available in route handlers without global state.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The pattern works by creating a scope in the <code className="prose-code">onRequest</code> hook and attaching it to the request context. Route handlers retrieve the scope from the context and resolve services from it. Singleton services (like the database pool) are shared across all requests because they are cached at the container level. Scoped services (like the request ID and user context) are unique to each scope and therefore unique to each request. This combination gives you global services where you need sharing and local services where you need isolation.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Disposing the scope in the <code className="prose-code">onSend</code> hook (or an error handler) is critical. Disposal clears the scope's instance cache and runs any cleanup logic registered by scoped services. Without disposal, scoped instances remain in memory indefinitely, creating a memory leak that grows proportionally with request volume. In a server handling thousands of requests per second, this can quickly exhaust available memory.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Request scoping also simplifies testing of route handlers. Instead of mocking global singletons, you create a test scope with mock registrations and pass it to your handler. The handler resolves its dependencies from the scope, receiving the mock implementations. This makes handler tests deterministic and isolated without any global state manipulation.
        </p>
        <CodeBlock code={requestScopingCode} filename="request-scope.ts" showLineNumbers />
        <InfoBlock variant="warning">
          Make sure to dispose the scope in the <code className="prose-code">onSend</code> hook
          or an error handler. Failing to dispose scopes in request handlers will leak memory. Consider wrapping the disposal in a try/finally pattern to ensure it runs even when the handler throws an exception.
        </InfoBlock>
      </section>

      {/* When to Use DI */}
      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          When to Use Dependency Injection
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Dependency injection is not always necessary. For small applications with a handful of services and no testing requirements beyond manual testing, direct imports and module-level instantiation are simpler and perfectly adequate. DI adds value when your application has at least some of the following characteristics: multiple services with dependencies between them, a need for different configurations in different environments, a testing strategy that requires replacing real services with mocks, or a codebase large enough that managing service wiring manually becomes error-prone.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use DI when:</strong> You have services that depend on other services and you want the container to manage the wiring. You need to swap implementations for testing (e.g., in-memory database instead of PostgreSQL). You deploy to multiple environments that require different service configurations. You want per-request isolation of stateful services. You have cross-cutting concerns (logging, caching, metrics) that need to be injected consistently across many services.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Consider skipping DI when:</strong> Your application is small (fewer than 5-10 services) and unlikely to grow significantly. You do not need to swap implementations for testing. All your services are stateless singletons that can be created at module level. The overhead of container setup and service registration outweighs the organizational benefit.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          A good middle ground is to start without DI and introduce it when you first feel the pain of manual wiring -- typically when you find yourself passing the same dependencies through multiple function calls, or when you need to replace a service for testing and realize it is imported directly everywhere. Vexor's container is lightweight enough that adopting it incrementally is straightforward.
        </p>
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Prefer constructor injection via factories over service locator patterns.</strong> Rather than passing the container itself to your services and having them call <code className="prose-code">resolve</code> internally, resolve all dependencies in the factory function and pass them as constructor arguments. This makes each service's dependencies explicit and testable without involving the container at all.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use typed tokens for all services.</strong> String keys are convenient but lose type safety. Tokens encode the type, so the compiler catches type mismatches at build time rather than at runtime. Define tokens in a central file and import them everywhere.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Keep factory functions pure.</strong> A factory function should create and return a service instance, nothing more. Avoid side effects like logging, network calls, or modifying global state inside factories. If a service requires async initialization (database connections, remote configuration), use the <code className="prose-code">factory</code> method with an async function.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Organize registrations into modules by domain.</strong> Group all database-related services in a database module, all auth services in an auth module, and so on. This makes your container setup self-documenting and allows you to swap entire domains for testing.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          <strong>Dispose scopes reliably.</strong> In HTTP applications, always dispose request scopes in the response hook or error handler. In CLI tools or batch jobs, dispose the container before exiting. Consider using try/finally blocks to ensure disposal happens even when exceptions occur.
        </p>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          <code className="prose-code">createContainer(options?)</code>
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Creates a new dependency injection container. The container serves as the central registry for all service registrations and the primary interface for resolving service instances. Returns a <code className="prose-code">Container</code> instance with methods for registration, resolution, scope management, and module composition.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Container Methods
        </h3>
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
                <td className="py-3 px-4"><code className="prose-code">singleton</code></td>
                <td className="py-3 px-4"><code className="prose-code">singleton(key, factory, opts?): void</code></td>
                <td className="py-3 px-4">Registers a service with singleton lifetime. The factory function is called at most once, on the first resolution. All subsequent resolutions return the same cached instance. Use for stateless services, shared resources (database pools, cache clients), and configuration objects.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">transient</code></td>
                <td className="py-3 px-4"><code className="prose-code">transient(key, factory, opts?): void</code></td>
                <td className="py-3 px-4">Registers a service with transient lifetime. The factory function is called on every resolution, producing a new instance each time. No caching is performed. Use for services that carry per-use state, generate unique values, or need fresh initialization on each use.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">scoped</code></td>
                <td className="py-3 px-4"><code className="prose-code">scoped(key, factory, opts?): void</code></td>
                <td className="py-3 px-4">Registers a service with scoped lifetime. The factory is called once per scope on first resolution within that scope. All resolutions within the same scope return the same instance; different scopes get different instances. Ideal for per-request data in HTTP applications.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">factory</code></td>
                <td className="py-3 px-4"><code className="prose-code">factory(key, asyncFactory, opts?): void</code></td>
                <td className="py-3 px-4">Registers a service with an asynchronous factory function that can <code className="prose-code">await</code> initialization logic before returning the instance. The factory receives a <code className="prose-code">resolve</code> function for looking up dependencies. Resolution returns a Promise. Use for services that require async setup like database connection pools or remote configuration loading.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">instance</code></td>
                <td className="py-3 px-4"><code className="prose-code">instance(key, value): void</code></td>
                <td className="py-3 px-4">Registers a pre-built value directly without a factory function. The provided value is stored as-is and returned on every resolution, behaving like a singleton. Use for constants, configuration values, environment variables, or any object that is already constructed at registration time.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">resolve</code></td>
                <td className="py-3 px-4"><code className="prose-code">resolve&lt;T&gt;(key): T</code></td>
                <td className="py-3 px-4">Resolves a service by its key or typed token. Returns the service instance according to its registered lifetime (singleton, transient, or scoped). Throws an error if no registration exists for the given key. When used with typed tokens, the return type is inferred automatically.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">get</code></td>
                <td className="py-3 px-4"><code className="prose-code">get&lt;T&gt;(key): T</code></td>
                <td className="py-3 px-4">Alias for <code className="prose-code">resolve</code>. Provided for convenience and API symmetry with other container implementations. Behaves identically to <code className="prose-code">resolve</code> in all respects.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">tryGet</code></td>
                <td className="py-3 px-4"><code className="prose-code">tryGet&lt;T&gt;(key): T | undefined</code></td>
                <td className="py-3 px-4">Attempts to resolve a service by its key, returning <code className="prose-code">undefined</code> instead of throwing if no registration is found. Use this for optional dependencies, feature-flagged services, or any case where the absence of a service is a valid condition rather than an error.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">resolveAll</code></td>
                <td className="py-3 px-4"><code className="prose-code">resolveAll(): Map&lt;string, unknown&gt;</code></td>
                <td className="py-3 px-4">Resolves all registered services and returns them as a Map keyed by their registration keys. This triggers instantiation of all lazy services. Primarily useful for debugging, diagnostics, or performing startup validation to ensure all services can be created successfully.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">resolveByTag</code></td>
                <td className="py-3 px-4"><code className="prose-code">resolveByTag(tag: string): unknown[]</code></td>
                <td className="py-3 px-4">Resolves all services that were registered with the specified tag and returns them as an array. The order of services in the array matches their registration order. Use for plugin-style extension points where multiple services implement the same interface (e.g., all route handlers, all event listeners).</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">createScope</code></td>
                <td className="py-3 px-4"><code className="prose-code">createScope(): Scope</code></td>
                <td className="py-3 px-4">Creates a new child scope for scoped service resolution. The scope inherits singleton registrations from the parent container but maintains its own instance cache for scoped services. Call <code className="prose-code">scope.dispose()</code> when the scope is no longer needed to clean up scoped resources and prevent memory leaks.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">dispose</code></td>
                <td className="py-3 px-4"><code className="prose-code">dispose(): Promise&lt;void&gt;</code></td>
                <td className="py-3 px-4">Disposes the container and all of its registered service instances, running any cleanup logic. After disposal, the container should not be used. Call this during application shutdown to ensure all resources (database connections, file handles, network sockets) are properly released.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">register</code></td>
                <td className="py-3 px-4"><code className="prose-code">register(module: Module): void</code></td>
                <td className="py-3 px-4">Applies all service registrations defined in a module to this container. The module's <code className="prose-code">register</code> function is called with this container, allowing it to register any number of services. This is the primary mechanism for modular service composition in larger applications.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Helper Functions
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
                <td className="py-3 px-4"><code className="prose-code">token</code></td>
                <td className="py-3 px-4"><code className="prose-code">token&lt;T&gt;(name: string): Token&lt;T&gt;</code></td>
                <td className="py-3 px-4">Creates a typed injection token that encodes the service type at the TypeScript level. Tokens are used in place of string keys for type-safe registration and resolution. The <code className="prose-code">name</code> parameter is used for error messages and debugging; it does not need to be unique but should be descriptive.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">inject</code></td>
                <td className="py-3 px-4"><code className="prose-code">inject(Target, ...deps): DecoratedClass</code></td>
                <td className="py-3 px-4">A class decorator that declares the dependencies a class requires. The decorated class can be registered with the container, and its dependencies will be automatically resolved and passed to its constructor during instantiation. This provides a more declarative alternative to manual factory functions for class-based services.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">defineModule</code></td>
                <td className="py-3 px-4"><code className="prose-code">defineModule(options): Module</code></td>
                <td className="py-3 px-4">Defines a reusable module that encapsulates a group of related service registrations. The module's <code className="prose-code">register</code> function receives a container and calls its registration methods to add services. Modules are applied to a container via <code className="prose-code">container.register(module)</code> and can be composed to build different container configurations for different environments.</td>
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
          <Link to="/infrastructure/plugins" className="btn-primary">
            Plugins <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/infrastructure/logging" className="btn-secondary">
            Logging
          </Link>
        </div>
      </section>
    </div>
  );
}
