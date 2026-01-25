/**
 * Plugin System
 *
 * Extensible plugin architecture with encapsulation,
 * dependency management, and lifecycle hooks.
 */

import type { Vexor } from '../core/app.js';

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
  /** Add hook */
  addHook(name: string, handler: (...args: unknown[]) => void | Promise<void>): void;
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
  private hooks: Map<string, Array<(...args: unknown[]) => void | Promise<void>>> = new Map();

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

    // Load plugin
    registered.state = 'loading';
    try {
      await plugin.register(context);
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

      addHook: (name: string, handler: (...args: unknown[]) => void | Promise<void>) => {
        let handlers = this.hooks.get(name);
        if (!handlers) {
          handlers = [];
          this.hooks.set(name, handlers);
        }
        handlers.push(handler);
      },

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
      ctx.addHook('onRequest', (async (...args: unknown[]) => {
        const req = args[0] as { method: string };
        const res = args[1] as { headers: Headers };
        // Set CORS headers
        res.headers.set('Access-Control-Allow-Origin', config.origin as string);
        res.headers.set('Access-Control-Allow-Methods', (config.methods as string[]).join(', '));
        res.headers.set('Access-Control-Allow-Headers', (config.allowedHeaders as string[]).join(', '));

        if ((config.exposedHeaders as string[]).length > 0) {
          res.headers.set('Access-Control-Expose-Headers', (config.exposedHeaders as string[]).join(', '));
        }

        if (config.credentials) {
          res.headers.set('Access-Control-Allow-Credentials', 'true');
        }

        if (config.maxAge) {
          res.headers.set('Access-Control-Max-Age', String(config.maxAge));
        }

        // Handle preflight
        if (req.method === 'OPTIONS') {
          return new Response(null, { status: 204 });
        }

        return undefined;
      }) as (...args: unknown[]) => Promise<void>);
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
      ctx.decorateRequest('requestId', () => {
        // Would get from request or generate
        return (config.generator as () => string)();
      });

      ctx.addHook('onRequest', (async (...args: unknown[]) => {
        const req = args[0] as { headers: Headers };
        const res = args[1] as { headers: Headers };
        const existingId = req.headers.get(config.header as string);
        const requestId = existingId ?? (config.generator as () => string)();
        res.headers.set(config.header as string, requestId);
      }) as (...args: unknown[]) => Promise<void>);
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
      ctx.addHook('onSend', (async (...args: unknown[]) => {
        const res = args[1] as { headers: Headers };
        if (config.xssFilter) {
          res.headers.set('X-XSS-Protection', '1; mode=block');
        }

        if (config.noSniff) {
          res.headers.set('X-Content-Type-Options', 'nosniff');
        }

        if (config.ieNoOpen) {
          res.headers.set('X-Download-Options', 'noopen');
        }

        if (config.hsts) {
          res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        if (config.frameguard) {
          res.headers.set('X-Frame-Options', (config.frameguard as string).toUpperCase());
        }

        if (config.contentSecurityPolicy) {
          res.headers.set('Content-Security-Policy', "default-src 'self'");
        }
      }) as (...args: unknown[]) => Promise<void>);
    }
  ),
};
