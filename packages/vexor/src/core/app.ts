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
import { VexorContext, ContextPool } from './context.js';
import { RadixRouter, toMatchedRoute } from '../router/radix.js';
import { Pipeline } from '../middleware/pipeline.js';
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
 * Route options for defining routes with schema and hooks
 */
export interface RouteOptions {
  schema?: RouteSchema;
  hooks?: RouteHooks<VexorContext>;
}

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
  get(path: string, handler: VexorHandler): this;
  get(path: string, options: RouteOptions, handler: VexorHandler): this;
  get(path: string, optionsOrHandler: RouteOptions | VexorHandler, handler?: VexorHandler): this {
    return this.route('GET', path, optionsOrHandler, handler);
  }

  /**
   * Register a POST route
   */
  post(path: string, handler: VexorHandler): this;
  post(path: string, options: RouteOptions, handler: VexorHandler): this;
  post(path: string, optionsOrHandler: RouteOptions | VexorHandler, handler?: VexorHandler): this {
    return this.route('POST', path, optionsOrHandler, handler);
  }

  /**
   * Register a PUT route
   */
  put(path: string, handler: VexorHandler): this;
  put(path: string, options: RouteOptions, handler: VexorHandler): this;
  put(path: string, optionsOrHandler: RouteOptions | VexorHandler, handler?: VexorHandler): this {
    return this.route('PUT', path, optionsOrHandler, handler);
  }

  /**
   * Register a DELETE route
   */
  delete(path: string, handler: VexorHandler): this;
  delete(path: string, options: RouteOptions, handler: VexorHandler): this;
  delete(path: string, optionsOrHandler: RouteOptions | VexorHandler, handler?: VexorHandler): this {
    return this.route('DELETE', path, optionsOrHandler, handler);
  }

  /**
   * Register a PATCH route
   */
  patch(path: string, handler: VexorHandler): this;
  patch(path: string, options: RouteOptions, handler: VexorHandler): this;
  patch(path: string, optionsOrHandler: RouteOptions | VexorHandler, handler?: VexorHandler): this {
    return this.route('PATCH', path, optionsOrHandler, handler);
  }

  /**
   * Register a HEAD route
   */
  head(path: string, handler: VexorHandler): this;
  head(path: string, options: RouteOptions, handler: VexorHandler): this;
  head(path: string, optionsOrHandler: RouteOptions | VexorHandler, handler?: VexorHandler): this {
    return this.route('HEAD', path, optionsOrHandler, handler);
  }

  /**
   * Register an OPTIONS route
   */
  options(path: string, handler: VexorHandler): this;
  options(path: string, options: RouteOptions, handler: VexorHandler): this;
  options(path: string, optionsOrHandler: RouteOptions | VexorHandler, handler?: VexorHandler): this {
    return this.route('OPTIONS', path, optionsOrHandler, handler);
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

    // Apply prefix
    const fullPath = this.prefix + path;

    // Register with router
    this.router.add(
      method,
      fullPath,
      routeHandler,
      routeOptions?.schema,
      routeOptions?.hooks
    );

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

  // ============ Request Handling ============

  /**
   * Handle an incoming request
   * This is the core request handler
   */
  async handle(request: VexorRequest): Promise<Response> {
    const method = request.method as HTTPMethod;
    const path = request.path;

    // Find matching route
    const match = this.router.find(method, path);

    if (!match) {
      return VexorResponse.notFound(`Route not found: ${method} ${path}`);
    }

    // Convert to MatchedRoute
    const matchedRoute = toMatchedRoute(match);

    // Acquire context from pool
    const ctx = this.contextPool.acquire(request, matchedRoute);

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
        async (c) => match.route.handler(c),
        hooks
      );

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
    if (isBun()) {
      this.adapter = new BunAdapter(handler);
      const server = await this.adapter.listen(resolvedPort, resolvedHost);

      if (this._config.logging !== false) {
        console.log(`🚀 Vexor server running on http://${resolvedHost}:${resolvedPort} (Bun)`);
      }

      return server as ServerInstance;
    } else {
      this.adapter = new NodeAdapter(handler, {
        maxBodySize: this._config.maxBodySize,
      });
      const server = await this.adapter.listen(resolvedPort, resolvedHost);

      if (this._config.logging !== false) {
        console.log(`🚀 Vexor server running on http://${resolvedHost}:${resolvedPort} (Node.js)`);
      }

      return server as ServerInstance;
    }
  }

  /**
   * Stop the server
   */
  async close(): Promise<void> {
    if (this.adapter) {
      await this.adapter.close();
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
