/**
 * Vexor Application
 *
 * The main application class that brings together:
 * - Router for URL matching
 * - Middleware pipeline for hooks
 * - Context for request handling
 * - Adapters for different runtimes
 */

import { VexorRequest } from './request.js';
import { VexorResponse } from './response.js';
import { type VexorContext, ContextPool } from './context.js';
import { RadixRouter, toMatchedRoute } from '../router/radix.js';
import { Pipeline } from '../middleware/pipeline.js';
import { PluginRegistry, type PluginInput, type PluginOptions } from '../plugins/system.js';
import type { ContextFor } from './infer.js';
import { NodeAdapter, isBun, BunAdapter } from '../adapters/index.js';
import {
  createValidationMiddleware,
  validationErrorResponse,
  ValidationError,
} from '../validation/index.js';
import type {
  HTTPMethod,
  Handler,
  HookType,
  HookFunction,
  ErrorHandler,
  VexorOptions,
  RouteSchema,
  RouteHooks,
} from './types.js';

/**
 * Route options for defining routes with schema and hooks.
 * The schema type parameter flows into the handler's context type.
 */
export interface RouteOptions<S extends RouteSchema = RouteSchema> {
  schema?: S;
  hooks?: RouteHooks<VexorContext>;
}

/**
 * A RouteSchema passed directly as route options, without the `schema`
 * wrapper: `app.post('/x', { body: ... }, handler)`
 */
export type BareRouteSchema<S extends RouteSchema> = S & { schema?: never; hooks?: never };

/**
 * Handler type with context
 */
export type VexorHandler = Handler<VexorContext>;

/**
 * Server instance (could be Node.js Server or Bun Server)
 */
export type ServerInstance = ReturnType<typeof import('http').createServer> | unknown;

/**
 * Vexor - The main application class
 */
export class Vexor {
  // Core components
  private router: RadixRouter;
  private pipeline: Pipeline;
  private contextPool: ContextPool;

  // Server
  private adapter?: NodeAdapter | BunAdapter;
  private _config: VexorOptions;

  // Plugin registry (created lazily on first use)
  private _plugins?: PluginRegistry;

  // Prefix for scoped routes
  private prefix = '';

  constructor(config: VexorOptions = {}) {
    this.router = new RadixRouter();
    this.pipeline = new Pipeline();
    this.contextPool = new ContextPool();
    this._config = config;
  }

  // ============ Route Registration ============

  /**
   * Register a GET route
   */
  get<Path extends string>(path: Path, handler: Handler<ContextFor<Path>>): this;
  get<Path extends string, S extends RouteSchema>(
    path: Path,
    schema: BareRouteSchema<S>,
    handler: Handler<ContextFor<Path, S>>
  ): this;
  get<Path extends string, S extends RouteSchema>(
    path: Path,
    options: RouteOptions<S>,
    handler: Handler<ContextFor<Path, S>>
  ): this;
  get(path: string, optionsOrHandler: RouteOptions | RouteSchema | Handler<any>, handler?: Handler<any>): this {
    return this.route(
      'GET',
      path,
      optionsOrHandler as RouteOptions | VexorHandler,
      handler as VexorHandler
    );
  }

  /**
   * Register a POST route
   */
  post<Path extends string>(path: Path, handler: Handler<ContextFor<Path>>): this;
  post<Path extends string, S extends RouteSchema>(
    path: Path,
    schema: BareRouteSchema<S>,
    handler: Handler<ContextFor<Path, S>>
  ): this;
  post<Path extends string, S extends RouteSchema>(
    path: Path,
    options: RouteOptions<S>,
    handler: Handler<ContextFor<Path, S>>
  ): this;
  post(path: string, optionsOrHandler: RouteOptions | RouteSchema | Handler<any>, handler?: Handler<any>): this {
    return this.route(
      'POST',
      path,
      optionsOrHandler as RouteOptions | VexorHandler,
      handler as VexorHandler
    );
  }

  /**
   * Register a PUT route
   */
  put<Path extends string>(path: Path, handler: Handler<ContextFor<Path>>): this;
  put<Path extends string, S extends RouteSchema>(
    path: Path,
    schema: BareRouteSchema<S>,
    handler: Handler<ContextFor<Path, S>>
  ): this;
  put<Path extends string, S extends RouteSchema>(
    path: Path,
    options: RouteOptions<S>,
    handler: Handler<ContextFor<Path, S>>
  ): this;
  put(path: string, optionsOrHandler: RouteOptions | RouteSchema | Handler<any>, handler?: Handler<any>): this {
    return this.route(
      'PUT',
      path,
      optionsOrHandler as RouteOptions | VexorHandler,
      handler as VexorHandler
    );
  }

  /**
   * Register a DELETE route
   */
  delete<Path extends string>(path: Path, handler: Handler<ContextFor<Path>>): this;
  delete<Path extends string, S extends RouteSchema>(
    path: Path,
    schema: BareRouteSchema<S>,
    handler: Handler<ContextFor<Path, S>>
  ): this;
  delete<Path extends string, S extends RouteSchema>(
    path: Path,
    options: RouteOptions<S>,
    handler: Handler<ContextFor<Path, S>>
  ): this;
  delete(
    path: string,
    optionsOrHandler: RouteOptions | RouteSchema | Handler<any>,
    handler?: Handler<any>
  ): this {
    return this.route(
      'DELETE',
      path,
      optionsOrHandler as RouteOptions | VexorHandler,
      handler as VexorHandler
    );
  }

  /**
   * Register a PATCH route
   */
  patch<Path extends string>(path: Path, handler: Handler<ContextFor<Path>>): this;
  patch<Path extends string, S extends RouteSchema>(
    path: Path,
    schema: BareRouteSchema<S>,
    handler: Handler<ContextFor<Path, S>>
  ): this;
  patch<Path extends string, S extends RouteSchema>(
    path: Path,
    options: RouteOptions<S>,
    handler: Handler<ContextFor<Path, S>>
  ): this;
  patch(path: string, optionsOrHandler: RouteOptions | RouteSchema | Handler<any>, handler?: Handler<any>): this {
    return this.route(
      'PATCH',
      path,
      optionsOrHandler as RouteOptions | VexorHandler,
      handler as VexorHandler
    );
  }

  /**
   * Register a HEAD route
   */
  head<Path extends string>(path: Path, handler: Handler<ContextFor<Path>>): this;
  head<Path extends string, S extends RouteSchema>(
    path: Path,
    schema: BareRouteSchema<S>,
    handler: Handler<ContextFor<Path, S>>
  ): this;
  head<Path extends string, S extends RouteSchema>(
    path: Path,
    options: RouteOptions<S>,
    handler: Handler<ContextFor<Path, S>>
  ): this;
  head(path: string, optionsOrHandler: RouteOptions | RouteSchema | Handler<any>, handler?: Handler<any>): this {
    return this.route(
      'HEAD',
      path,
      optionsOrHandler as RouteOptions | VexorHandler,
      handler as VexorHandler
    );
  }

  /**
   * Register an OPTIONS route
   */
  options<Path extends string>(path: Path, handler: Handler<ContextFor<Path>>): this;
  options<Path extends string, S extends RouteSchema>(
    path: Path,
    schema: BareRouteSchema<S>,
    handler: Handler<ContextFor<Path, S>>
  ): this;
  options<Path extends string, S extends RouteSchema>(
    path: Path,
    options: RouteOptions<S>,
    handler: Handler<ContextFor<Path, S>>
  ): this;
  options(
    path: string,
    optionsOrHandler: RouteOptions | RouteSchema | Handler<any>,
    handler?: Handler<any>
  ): this {
    return this.route(
      'OPTIONS',
      path,
      optionsOrHandler as RouteOptions | VexorHandler,
      handler as VexorHandler
    );
  }

  /**
   * Register a route for all methods
   */
  all(path: string, handler: VexorHandler): this;
  all(path: string, options: RouteOptions, handler: VexorHandler): this;
  all(path: string, optionsOrHandler: RouteOptions | VexorHandler, handler?: VexorHandler): this {
    const methods: HTTPMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    for (const method of methods) {
      this.route(method, path, optionsOrHandler, handler);
    }
    return this;
  }

  /**
   * Register a route with any method
   */
  route(
    method: HTTPMethod,
    path: string,
    optionsOrHandler: RouteOptions | VexorHandler,
    handler?: VexorHandler
  ): this {
    // Parse overloaded arguments
    let routeHandler: VexorHandler;
    let routeOptions: RouteOptions | undefined;

    if (typeof optionsOrHandler === 'function') {
      routeHandler = optionsOrHandler;
    } else {
      routeOptions = optionsOrHandler;
      routeHandler = handler!;
    }

    // Accept a bare RouteSchema as options ({ body: ... } instead of
    // { schema: { body: ... } }) for convenience
    let schema = routeOptions?.schema;
    if (!schema && routeOptions && !routeOptions.hooks) {
      const maybeSchema = routeOptions as RouteSchema;
      if (
        maybeSchema.params ||
        maybeSchema.query ||
        maybeSchema.body ||
        maybeSchema.headers ||
        maybeSchema.response
      ) {
        schema = maybeSchema;
      }
    }

    // Apply prefix
    const fullPath = this.prefix + path;

    // Register with router
    this.router.add(method, fullPath, routeHandler, schema, routeOptions?.hooks);

    return this;
  }

  // ============ Middleware & Hooks ============

  /**
   * Add a global hook
   */
  addHook(type: HookType, fn: HookFunction<VexorContext>): this {
    this.pipeline.addHook(type, fn);
    return this;
  }

  /**
   * Add middleware (shortcut for onRequest hook)
   */
  use(fn: HookFunction<VexorContext>): this {
    return this.addHook('onRequest', fn);
  }

  /**
   * Set custom error handler
   */
  setErrorHandler(handler: ErrorHandler<VexorContext>): this {
    this.pipeline.setErrorHandler(handler);
    return this;
  }

  // ============ Route Groups ============

  /**
   * Create a route group with a prefix
   */
  group(prefix: string, callback: (app: Vexor) => void): this {
    const originalPrefix = this.prefix;
    this.prefix = originalPrefix + prefix;
    callback(this);
    this.prefix = originalPrefix;
    return this;
  }

  /**
   * Register routes from another Vexor instance
   */
  register(prefix: string, plugin: (app: Vexor) => void): this {
    return this.group(prefix, plugin);
  }

  // ============ Plugins ============

  /**
   * The plugin registry for this app
   */
  get plugins(): PluginRegistry {
    if (!this._plugins) {
      this._plugins = new PluginRegistry(this);
    }
    return this._plugins;
  }

  /**
   * Register a Vexor plugin (with metadata, dependency resolution,
   * decorators, and lifecycle hooks)
   */
  async registerPlugin(plugin: PluginInput, options?: PluginOptions): Promise<this> {
    await this.plugins.register(plugin, options);
    return this;
  }

  /**
   * Run a callback with a route prefix applied.
   * Unlike group(), this awaits async callbacks before restoring the prefix,
   * so async plugin register functions can add prefixed routes safely.
   */
  async withPrefix(prefix: string, callback: () => void | Promise<void>): Promise<void> {
    const originalPrefix = this.prefix;
    this.prefix = originalPrefix + prefix;
    try {
      await callback();
    } finally {
      this.prefix = originalPrefix;
    }
  }

  // ============ Request Handling ============

  /**
   * Handle an incoming request
   * This is the core request handler
   */
  async handle(request: VexorRequest): Promise<Response> {
    const method = request.method as HTTPMethod;
    const path = request.path;

    // Find matching route
    let match = this.router.find(method, path);

    // HEAD falls back to the GET handler (the body is stripped below)
    let stripBody = false;
    if (!match && method === 'HEAD') {
      match = this.router.find('GET', path);
      stripBody = match !== null;
    }

    if (!match) {
      return this.handleUnmatched(request, method, path);
    }

    // Convert to MatchedRoute
    const routeData = match.route;
    const matchedRoute = toMatchedRoute(match);

    // Acquire context from pool
    const ctx = this.contextPool.acquire(request, matchedRoute);

    // Apply plugin request decorations (no-op unless plugins registered them)
    if (this._plugins?.hasRequestDecorations) {
      this._plugins.applyRequestDecorations(ctx);
    }

    try {
      // Build hooks with validation middleware if schema is present
      let hooks = matchedRoute?.hooks as RouteHooks<VexorContext> | undefined;
      if (matchedRoute?.schema) {
        const validationMiddleware = createValidationMiddleware(matchedRoute.schema);
        const existingPreValidation = hooks?.preValidation ?? [];
        hooks = {
          ...hooks,
          preValidation: [
            ...existingPreValidation,
            validationMiddleware,
          ],
        };
      }

      // Execute pipeline
      const response = await this.pipeline.execute(
        ctx,
        async (c) => routeData.handler(c),
        hooks
      );

      // HEAD served by a GET handler: keep status/headers, drop the body
      if (stripBody) {
        return new Response(null, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }

      return response;
    } catch (error) {
      // Handle validation errors with proper 400 response
      if (error instanceof ValidationError) {
        return validationErrorResponse(error);
      }
      throw error;
    } finally {
      // Release context back to pool
      this.contextPool.release(ctx);
    }
  }

  /**
   * Handle a request that matched no route.
   * Global onRequest hooks still run so middleware like CORS can answer
   * preflight requests; otherwise responds 405 (path exists under another
   * method, with an Allow header) or 404.
   */
  private async handleUnmatched(
    request: VexorRequest,
    method: HTTPMethod,
    path: string
  ): Promise<Response> {
    const ctx = this.contextPool.acquire(request, undefined);

    try {
      let response: Response | undefined;
      try {
        response = await this.pipeline.runHooks('onRequest', ctx);
      } catch (error) {
        return this.pipeline.handleError(error as Error, ctx);
      }

      if (!response) {
        const allowed = this.router.findMethods(path);
        if (allowed.length > 0) {
          if (allowed.includes('GET') && !allowed.includes('HEAD')) {
            allowed.push('HEAD');
          }
          response = new Response(
            JSON.stringify({
              error: `Method ${method} not allowed for ${path}`,
              code: 'METHOD_NOT_ALLOWED',
            }),
            {
              status: 405,
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                Allow: allowed.join(', '),
              },
            }
          );
        } else {
          response = VexorResponse.notFound(`Route not found: ${method} ${path}`);
        }
      }

      // Headers queued by hooks (e.g. CORS) apply to 404/405s too
      const pendingHeaders = ctx.responseHeaders;
      if (pendingHeaders) {
        const headers = new Headers(response.headers);
        for (const [key, value] of Object.entries(pendingHeaders)) {
          headers.set(key, value);
        }
        response = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }

      return response;
    } finally {
      this.contextPool.release(ctx);
    }
  }

  /**
   * Create the native fetch handler (for Bun/Deno/Edge)
   */
  fetch = async (request: Request): Promise<Response> => {
    const vexorRequest = new VexorRequest(request, request);
    return this.handle(vexorRequest);
  };

  // ============ Server ============

  /**
   * Start the server
   */
  async listen(port?: number, host?: string): Promise<ServerInstance> {
    const resolvedPort = port ?? this._config.port ?? 3000;
    const resolvedHost = host ?? this._config.host ?? '0.0.0.0';

    // Create handler function
    const handler = async (request: VexorRequest): Promise<Response> => {
      return this.handle(request);
    };

    // Choose adapter based on runtime
    let server: ServerInstance;
    if (isBun()) {
      this.adapter = new BunAdapter(handler);
      server = await this.adapter.listen(resolvedPort, resolvedHost);

      if (this._config.logging !== false) {
        console.log(`🚀 Vexor server running on http://${resolvedHost}:${resolvedPort} (Bun)`);
      }
    } else {
      this.adapter = new NodeAdapter(handler, {
        maxBodySize: this._config.maxBodySize,
      });
      server = await this.adapter.listen(resolvedPort, resolvedHost);

      if (this._config.logging !== false) {
        console.log(`🚀 Vexor server running on http://${resolvedHost}:${resolvedPort} (Node.js)`);
      }
    }

    this.setupGracefulShutdown();
    return server;
  }

  /**
   * Register SIGTERM/SIGINT handlers when gracefulShutdown is enabled
   */
  private setupGracefulShutdown(): void {
    const config = this._config.gracefulShutdown;
    if (!config || typeof process === 'undefined' || typeof process.once !== 'function') {
      return;
    }

    const signals = (typeof config === 'object' && config.signals) || ['SIGTERM', 'SIGINT'];
    const timeout = typeof config === 'object' ? config.timeout : undefined;

    for (const signal of signals) {
      process.once(signal as NodeJS.Signals, () => {
        if (this._config.logging !== false) {
          console.log(`\n${signal} received, draining connections...`);
        }
        void this.close({ timeout }).finally(() => process.exit(0));
      });
    }
  }

  /**
   * Stop the server, draining in-flight requests.
   * `timeout` (ms) bounds the drain before remaining connections are force-closed.
   */
  async close(options: { timeout?: number } = {}): Promise<void> {
    if (this.adapter) {
      if (this.adapter instanceof NodeAdapter) {
        await this.adapter.close(options);
      } else {
        await this.adapter.close();
      }
      this.adapter = undefined;
    }
  }

  /**
   * Get server address
   */
  address(): { port: number; host: string } | null {
    return this.adapter?.address() ?? null;
  }

  // ============ Utilities ============

  /**
   * Get all registered routes
   */
  getRoutes(): Array<{ method: HTTPMethod; path: string }> {
    return this.router.getRoutes();
  }

  /**
   * Print all routes (for debugging)
   */
  printRoutes(): void {
    console.log('\n📍 Registered Routes:');
    for (const route of this.getRoutes()) {
      console.log(`   ${route.method.padEnd(7)} ${route.path}`);
    }
    console.log('');
  }

  /**
   * Get context pool stats
   */
  getPoolStats(): { size: number } {
    return { size: this.contextPool.size };
  }

  /**
   * Clear router cache
   */
  clearRouterCache(): void {
    this.router.clearCache();
  }

  /**
   * Reset the application (for testing)
   */
  reset(): void {
    this.router.reset();
    this.pipeline.clear();
    this.contextPool.clear();
  }
}

/**
 * Create a new Vexor application
 */
export function createApp(options?: VexorOptions): Vexor {
  return new Vexor(options);
}
