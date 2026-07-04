/**
 * Plugin System
 *
 * Extensible plugin architecture with encapsulation,
 * dependency management, and lifecycle hooks.
 */

import type { Vexor } from '../core/app.js';
import type { VexorContext } from '../core/context.js';
import type { HookType, HookFunction } from '../core/types.js';

/** The lifecycle hooks that are forwarded to the app's middleware pipeline */
const LIFECYCLE_HOOKS: ReadonlySet<string> = new Set([
  'onRequest',
  'preParsing',
  'preValidation',
  'preHandler',
  'preSerialization',
  'onSend',
  'onResponse',
  'onError',
]);

/**
 * Plugin metadata
 */
export interface PluginMeta {
  /** Plugin name (unique identifier) */
  name: string;
  /** Plugin version */
  version?: string;
  /** Plugin description */
  description?: string;
  /** Plugin dependencies (other plugin names) */
  dependencies?: string[];
  /** Incompatible plugins */
  conflicts?: string[];
}

/**
 * Plugin options
 */
export interface PluginOptions {
  /** Plugin configuration */
  config?: Record<string, unknown>;
  /** Plugin prefix for routes */
  prefix?: string;
  /** Skip registration if already registered */
  skipDuplicate?: boolean;
}

/**
 * Plugin context passed to register function
 */
export interface PluginContext {
  /** Vexor app instance */
  app: Vexor;
  /** Plugin options */
  options: PluginOptions;
  /** Access to other plugins */
  plugins: PluginRegistry;
  /** Decorate app with custom properties */
  decorate(name: string, value: unknown): void;
  /** Decorate request context */
  decorateRequest(name: string, getter: () => unknown): void;
  /**
   * Add a hook. Lifecycle hook names (onRequest, preHandler, onSend, ...)
   * are registered on the app's middleware pipeline and run per request;
   * any other name is a custom event runnable via `plugins.runHooks(name)`.
   */
  addHook(name: HookType, handler: HookFunction<VexorContext>): void;
  addHook(name: string, handler: (...args: unknown[]) => unknown): void;
  /** Register sub-plugin */
  register(plugin: VexorPlugin, options?: PluginOptions): Promise<void>;
}

/**
 * Plugin register function
 */
export type PluginRegisterFn = (context: PluginContext) => void | Promise<void>;

/**
 * Vexor plugin interface
 */
export interface VexorPlugin {
  /** Plugin metadata */
  meta?: PluginMeta;
  /** Register function */
  register: PluginRegisterFn;
}

/**
 * Async plugin (for lazy loading)
 */
export type AsyncPlugin = () => Promise<VexorPlugin>;

/**
 * Plugin or async plugin
 */
export type PluginInput = VexorPlugin | AsyncPlugin;

/**
 * Plugin state
 */
type PluginState = 'pending' | 'loading' | 'loaded' | 'error';

/**
 * Registered plugin info
 */
interface RegisteredPlugin {
  plugin: VexorPlugin;
  options: PluginOptions;
  state: PluginState;
  error?: Error;
  decorations: string[];
}

/**
 * Plugin registry
 */
export class PluginRegistry {
  private plugins = new Map<string, RegisteredPlugin>();
  private app: Vexor;
  private decorations: Map<string, unknown> = new Map();
  private requestDecorations: Map<string, () => unknown> = new Map();
  private hooks: Map<string, Array<(...args: unknown[]) => unknown>> = new Map();

  constructor(app: Vexor) {
    this.app = app;
  }

  /**
   * Register a plugin
   */
  async register(input: PluginInput, options: PluginOptions = {}): Promise<void> {
    // Resolve async plugin
    const plugin = typeof input === 'function' && !('register' in input)
      ? await (input as AsyncPlugin)()
      : input as VexorPlugin;

    const name = plugin.meta?.name ?? `plugin_${this.plugins.size}`;

    // Check for duplicate
    if (this.plugins.has(name)) {
      if (options.skipDuplicate) {
        return;
      }
      throw new Error(`Plugin "${name}" is already registered`);
    }

    // Check for conflicts
    if (plugin.meta?.conflicts) {
      for (const conflict of plugin.meta.conflicts) {
        if (this.plugins.has(conflict)) {
          throw new Error(`Plugin "${name}" conflicts with "${conflict}"`);
        }
      }
    }

    // Check dependencies
    if (plugin.meta?.dependencies) {
      for (const dep of plugin.meta.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin "${name}" requires "${dep}" to be registered first`);
        }
        const depPlugin = this.plugins.get(dep)!;
        if (depPlugin.state !== 'loaded') {
          throw new Error(`Plugin "${name}" dependency "${dep}" is not loaded`);
        }
      }
    }

    // Register plugin
    const registered: RegisteredPlugin = {
      plugin,
      options,
      state: 'pending',
      decorations: [],
    };
    this.plugins.set(name, registered);

    // Create plugin context
    const context = this.createContext(name, options);

    // Load plugin — routes added inside get the plugin's prefix
    registered.state = 'loading';
    try {
      if (options.prefix) {
        await this.app.withPrefix(options.prefix, () => plugin.register(context));
      } else {
        await plugin.register(context);
      }
      registered.state = 'loaded';
    } catch (error) {
      registered.state = 'error';
      registered.error = error as Error;
      throw error;
    }
  }

  /**
   * Check if plugin is registered
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Get plugin info
   */
  get(name: string): RegisteredPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Get all registered plugins
   */
  all(): Map<string, RegisteredPlugin> {
    return new Map(this.plugins);
  }

  /**
   * Get decoration value
   */
  getDecoration<T>(name: string): T | undefined {
    return this.decorations.get(name) as T;
  }

  /**
   * Get request decoration getter
   */
  getRequestDecoration(name: string): (() => unknown) | undefined {
    return this.requestDecorations.get(name);
  }

  /**
   * Whether any request decorations are registered
   */
  get hasRequestDecorations(): boolean {
    return this.requestDecorations.size > 0;
  }

  /**
   * Apply registered request decorations to a context (called per request)
   */
  applyRequestDecorations(ctx: VexorContext): void {
    for (const [name, getter] of this.requestDecorations) {
      ctx.set(name, getter());
    }
  }

  /**
   * Run hooks
   */
  async runHooks(name: string, ...args: unknown[]): Promise<void> {
    const handlers = this.hooks.get(name);
    if (!handlers) return;

    for (const handler of handlers) {
      await handler(...args);
    }
  }

  /**
   * Create plugin context
   */
  private createContext(pluginName: string, options: PluginOptions): PluginContext {
    const registered = this.plugins.get(pluginName)!;

    return {
      app: this.app,
      options,
      plugins: this,

      decorate: (name: string, value: unknown) => {
        if (this.decorations.has(name)) {
          throw new Error(`Decoration "${name}" already exists`);
        }
        this.decorations.set(name, value);
        registered.decorations.push(name);

        // Add to app instance
        (this.app as unknown as Record<string, unknown>)[name] = value;
      },

      decorateRequest: (name: string, getter: () => unknown) => {
        if (this.requestDecorations.has(name)) {
          throw new Error(`Request decoration "${name}" already exists`);
        }
        this.requestDecorations.set(name, getter);
        registered.decorations.push(`request.${name}`);
      },

      addHook: ((name: string, handler: (...args: unknown[]) => unknown) => {
        // Lifecycle hooks run per request via the app's pipeline
        // (guarded so the registry also works with partial app doubles)
        if (LIFECYCLE_HOOKS.has(name) && typeof this.app?.addHook === 'function') {
          this.app.addHook(name as HookType, handler as HookFunction<VexorContext>);
        }
        // Also track in the registry (custom events + introspection)
        let handlers = this.hooks.get(name);
        if (!handlers) {
          handlers = [];
          this.hooks.set(name, handlers);
        }
        handlers.push(handler);
      }) as PluginContext['addHook'],

      register: async (plugin: VexorPlugin, opts?: PluginOptions) => {
        // Apply parent prefix
        const combinedOptions: PluginOptions = {
          ...opts,
          prefix: options.prefix
            ? opts?.prefix
              ? `${options.prefix}${opts.prefix}`
              : options.prefix
            : opts?.prefix,
        };
        await this.register(plugin, combinedOptions);
      },
    };
  }
}

/**
 * Define a plugin with type safety
 */
export function definePlugin(options: VexorPlugin): VexorPlugin;
export function definePlugin(
  meta: PluginMeta,
  register: PluginRegisterFn
): VexorPlugin;
export function definePlugin(
  optionsOrMeta: VexorPlugin | PluginMeta,
  register?: PluginRegisterFn
): VexorPlugin {
  if (register) {
    return {
      meta: optionsOrMeta as PluginMeta,
      register,
    };
  }
  return optionsOrMeta as VexorPlugin;
}

/**
 * Create an async plugin (for lazy loading)
 */
export function asyncPlugin(loader: () => Promise<VexorPlugin>): AsyncPlugin {
  return loader;
}

/**
 * Plugin for adding routes with a prefix
 */
export function routePlugin(
  prefix: string,
  register: (ctx: PluginContext) => void | Promise<void>
): VexorPlugin {
  return {
    meta: {
      name: `routes:${prefix}`,
    },
    register: async (ctx) => {
      // Store original prefix
      const originalPrefix = ctx.options.prefix ?? '';
      ctx.options.prefix = `${originalPrefix}${prefix}`;

      await register(ctx);

      // Restore prefix
      ctx.options.prefix = originalPrefix;
    },
  };
}

/**
 * Create a configurable plugin
 */
export function configurablePlugin<T extends Record<string, unknown>>(
  meta: PluginMeta,
  defaultConfig: T,
  register: (ctx: PluginContext, config: T) => void | Promise<void>
): (config?: Partial<T>) => VexorPlugin {
  return (config?: Partial<T>) => ({
    meta,
    register: (ctx) => {
      const finalConfig = { ...defaultConfig, ...config } as T;
      return register(ctx, finalConfig);
    },
  });
}

/**
 * Built-in plugins
 */
export const plugins = {
  /**
   * CORS plugin
   */
  cors: configurablePlugin(
    { name: 'cors', version: '1.0.0' },
    {
      origin: '*',
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: [],
      credentials: false,
      maxAge: 86400,
    },
    (ctx, config) => {
      ctx.addHook('onRequest', (reqCtx: VexorContext) => {
        // Queue CORS headers for the final response
        reqCtx.setResponseHeader('Access-Control-Allow-Origin', config.origin as string);
        reqCtx.setResponseHeader(
          'Access-Control-Allow-Methods',
          (config.methods as string[]).join(', ')
        );
        reqCtx.setResponseHeader(
          'Access-Control-Allow-Headers',
          (config.allowedHeaders as string[]).join(', ')
        );

        if ((config.exposedHeaders as string[]).length > 0) {
          reqCtx.setResponseHeader(
            'Access-Control-Expose-Headers',
            (config.exposedHeaders as string[]).join(', ')
          );
        }

        if (config.credentials) {
          reqCtx.setResponseHeader('Access-Control-Allow-Credentials', 'true');
        }

        if (config.maxAge) {
          reqCtx.setResponseHeader('Access-Control-Max-Age', String(config.maxAge));
        }

        // Short-circuit preflight requests
        if (reqCtx.method === 'OPTIONS') {
          return new Response(null, { status: 204 });
        }

        return undefined;
      });
    }
  ),

  /**
   * Request ID plugin
   */
  requestId: configurablePlugin(
    { name: 'request-id', version: '1.0.0' },
    {
      header: 'X-Request-ID',
      generator: () => `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`,
    },
    (ctx, config) => {
      ctx.addHook('onRequest', (reqCtx: VexorContext) => {
        const existingId = reqCtx.header(config.header as string);
        const requestId = existingId ?? (config.generator as () => string)();
        reqCtx.set('requestId', requestId);
        reqCtx.setResponseHeader(config.header as string, requestId);
      });
    }
  ),

  /**
   * Helmet plugin (security headers)
   */
  helmet: configurablePlugin(
    { name: 'helmet', version: '1.0.0' },
    {
      contentSecurityPolicy: true,
      xssFilter: true,
      noSniff: true,
      ieNoOpen: true,
      hsts: true,
      frameguard: 'deny' as 'deny' | 'sameorigin' | false,
    },
    (ctx, config) => {
      ctx.addHook('onSend', (reqCtx: VexorContext) => {
        if (config.xssFilter) {
          reqCtx.setResponseHeader('X-XSS-Protection', '1; mode=block');
        }

        if (config.noSniff) {
          reqCtx.setResponseHeader('X-Content-Type-Options', 'nosniff');
        }

        if (config.ieNoOpen) {
          reqCtx.setResponseHeader('X-Download-Options', 'noopen');
        }

        if (config.hsts) {
          reqCtx.setResponseHeader(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains'
          );
        }

        if (config.frameguard) {
          reqCtx.setResponseHeader('X-Frame-Options', (config.frameguard as string).toUpperCase());
        }

        if (config.contentSecurityPolicy) {
          reqCtx.setResponseHeader('Content-Security-Policy', "default-src 'self'");
        }
      });
    }
  ),
};
