/**
 * Middleware Pipeline
 *
 * Hook-based middleware system for request/response lifecycle.
 * Provides named hooks at specific points in the request lifecycle.
 *
 * Lifecycle:
 * 1. onRequest      - First hook, runs before routing
 * 2. preParsing     - Before body parsing
 * 3. preValidation  - Before schema validation
 * 4. preHandler     - Before route handler (auth, etc.)
 * 5. preSerialization - Before response serialization
 * 6. onSend         - Before sending response
 * 7. onResponse     - After response sent (cleanup, logging)
 * 8. onError        - When an error occurs
 */

import type { VexorContext } from '../core/context.js';
import type { HookType, HookFunction, ErrorHandler } from '../core/types.js';

/**
 * Hook registry - stores hooks by type
 */
type HookRegistry = Map<HookType, HookFunction<VexorContext>[]>;

/**
 * Pipeline execution result
 */
export interface PipelineResult {
  response?: Response;
  error?: Error;
}

/**
 * Middleware Pipeline class
 */
export class Pipeline {
  // Global hooks
  private hooks: HookRegistry = new Map();

  // Error handler
  private errorHandler?: ErrorHandler<VexorContext>;

  constructor() {
    // Initialize hook arrays for each type
    const hookTypes: HookType[] = [
      'onRequest',
      'preParsing',
      'preValidation',
      'preHandler',
      'preSerialization',
      'onSend',
      'onResponse',
      'onError',
    ];

    for (const type of hookTypes) {
      this.hooks.set(type, []);
    }
  }

  /**
   * Add a hook function
   */
  addHook(type: HookType, fn: HookFunction<VexorContext>): void {
    const hooks = this.hooks.get(type);
    if (hooks) {
      hooks.push(fn);
    }
  }

  /**
   * Remove a hook function
   */
  removeHook(type: HookType, fn: HookFunction<VexorContext>): boolean {
    const hooks = this.hooks.get(type);
    if (hooks) {
      const index = hooks.indexOf(fn);
      if (index !== -1) {
        hooks.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Set the error handler
   */
  setErrorHandler(handler: ErrorHandler<VexorContext>): void {
    this.errorHandler = handler;
  }

  /**
   * Run hooks of a specific type
   */
  async runHooks(
    type: HookType,
    ctx: VexorContext,
    additionalHooks?: HookFunction<VexorContext>[]
  ): Promise<void> {
    // Get global hooks
    const globalHooks = this.hooks.get(type) ?? [];

    // Combine with route-specific hooks
    const allHooks = additionalHooks
      ? [...globalHooks, ...additionalHooks]
      : globalHooks;

    // Run all hooks in sequence
    for (const hook of allHooks) {
      await hook(ctx);
    }
  }

  /**
   * Handle an error
   */
  async handleError(error: Error, ctx: VexorContext): Promise<Response> {
    // Run onError hooks
    try {
      await this.runHooks('onError', ctx);
    } catch {
      // Ignore errors in error hooks
    }

    // Use custom error handler if set
    if (this.errorHandler) {
      try {
        return await this.errorHandler(error, ctx);
      } catch (handlerError) {
        // If error handler throws, fall through to default
        console.error('Error in error handler:', handlerError);
      }
    }

    // Default error response
    return this.defaultErrorResponse(error);
  }

  /**
   * Default error response
   */
  private defaultErrorResponse(error: Error): Response {
    const isDev = process.env.NODE_ENV !== 'production';

    const body = JSON.stringify({
      error: error.message || 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      ...(isDev && { stack: error.stack }),
    });

    return new Response(body, {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  }

  /**
   * Execute the full pipeline
   */
  async execute(
    ctx: VexorContext,
    handler: (ctx: VexorContext) => Response | Promise<Response>,
    routeHooks?: {
      onRequest?: HookFunction<VexorContext>[];
      preValidation?: HookFunction<VexorContext>[];
      preHandler?: HookFunction<VexorContext>[];
      onSend?: HookFunction<VexorContext>[];
    }
  ): Promise<Response> {
    try {
      // 1. onRequest hooks
      await this.runHooks('onRequest', ctx, routeHooks?.onRequest);

      // 2. preParsing hooks
      await this.runHooks('preParsing', ctx);

      // 3. preValidation hooks
      await this.runHooks('preValidation', ctx, routeHooks?.preValidation);

      // 4. preHandler hooks
      await this.runHooks('preHandler', ctx, routeHooks?.preHandler);

      // 5. Execute the route handler
      let response = await handler(ctx);

      // 6. preSerialization hooks
      await this.runHooks('preSerialization', ctx);

      // 7. onSend hooks
      await this.runHooks('onSend', ctx, routeHooks?.onSend);

      // 8. onResponse hooks (fire and forget)
      this.runHooks('onResponse', ctx).catch(() => {
        // Ignore errors in onResponse hooks
      });

      return response;
    } catch (error) {
      return this.handleError(error as Error, ctx);
    }
  }

  /**
   * Get all hooks of a specific type
   */
  getHooks(type: HookType): HookFunction<VexorContext>[] {
    return [...(this.hooks.get(type) ?? [])];
  }

  /**
   * Clear all hooks
   */
  clear(): void {
    for (const hooks of this.hooks.values()) {
      hooks.length = 0;
    }
    this.errorHandler = undefined;
  }

  /**
   * Clone the pipeline (for scoped routes)
   */
  clone(): Pipeline {
    const cloned = new Pipeline();

    for (const [type, hooks] of this.hooks) {
      for (const hook of hooks) {
        cloned.addHook(type, hook);
      }
    }

    if (this.errorHandler) {
      cloned.setErrorHandler(this.errorHandler);
    }

    return cloned;
  }
}

/**
 * Compose multiple middleware functions into one
 */
export function compose(
  ...middlewares: HookFunction<VexorContext>[]
): HookFunction<VexorContext> {
  return async (ctx: VexorContext) => {
    for (const middleware of middlewares) {
      await middleware(ctx);
    }
  };
}

/**
 * Create a conditional middleware
 */
export function when(
  condition: (ctx: VexorContext) => boolean,
  middleware: HookFunction<VexorContext>
): HookFunction<VexorContext> {
  return async (ctx: VexorContext) => {
    if (condition(ctx)) {
      await middleware(ctx);
    }
  };
}

/**
 * Create a timing middleware (measures execution time)
 */
export function timing(name: string): HookFunction<VexorContext> {
  return async (ctx: VexorContext) => {
    const start = performance.now();
    ctx.set(`timing:${name}:start`, start);
  };
}

/**
 * Record timing result
 */
export function timingEnd(name: string): HookFunction<VexorContext> {
  return async (ctx: VexorContext) => {
    const start = ctx.get<number>(`timing:${name}:start`);
    if (start !== undefined) {
      const duration = performance.now() - start;
      ctx.set(`timing:${name}:duration`, duration);
    }
  };
}
