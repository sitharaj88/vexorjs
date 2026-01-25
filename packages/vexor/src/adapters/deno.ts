/**
 * Deno Adapter
 *
 * Adapter for running Vexor on Deno runtime.
 * Uses Deno.serve and native Web APIs.
 */

import type { Vexor } from '../core/app.js';
import type { RuntimeCapabilities, RuntimeType } from '../core/types.js';
import { createRequest } from '../core/request.js';

/**
 * Deno server options
 */
export interface DenoServeOptions {
  /** Port to listen on (default: 3000) */
  port?: number;
  /** Hostname to bind to (default: '0.0.0.0') */
  hostname?: string;
  /** Enable TLS */
  tls?: {
    cert: string;
    key: string;
  };
  /** Signal to abort the server */
  signal?: AbortSignal;
  /** Called when server starts listening */
  onListen?: (params: { hostname: string; port: number }) => void;
  /** Called on error */
  onError?: (error: Error) => Response | Promise<Response>;
}

/**
 * Deno connection info
 */
export interface DenoConnInfo {
  remoteAddr: {
    hostname: string;
    port: number;
    transport: 'tcp' | 'udp';
  };
  localAddr: {
    hostname: string;
    port: number;
    transport: 'tcp' | 'udp';
  };
}

/**
 * Deno server instance
 */
export interface DenoServer {
  finished: Promise<void>;
  shutdown(): Promise<void>;
  ref(): void;
  unref(): void;
}

/**
 * Deno runtime capabilities
 */
export const denoCapabilities: RuntimeCapabilities = {
  streaming: true,
  websocket: true,
  http2: true,
  workerThreads: false,
  fileSystem: true,
};

/**
 * Deno runtime type
 */
export const denoRuntime: RuntimeType = 'deno';

/**
 * Deno adapter
 */
export class DenoAdapter {
  private app: Vexor;
  private server?: DenoServer;

  constructor(app: Vexor) {
    this.app = app;
  }

  /**
   * Get the runtime type
   */
  get runtime(): RuntimeType {
    return denoRuntime;
  }

  /**
   * Get runtime capabilities
   */
  get capabilities(): RuntimeCapabilities {
    return denoCapabilities;
  }

  /**
   * Start the server
   */
  async listen(options: DenoServeOptions = {}): Promise<DenoServer> {
    const {
      port = 3000,
      hostname = '0.0.0.0',
      tls,
      signal,
      onListen,
      onError,
    } = options;

    // Access Deno global
    const Deno = (globalThis as { Deno?: DenoGlobal }).Deno;
    if (!Deno) {
      throw new Error('Deno runtime not available');
    }

    const handler = this.createHandler();

    const serveOptions: Record<string, unknown> = {
      port,
      hostname,
      handler: (request: Request, connInfo: DenoConnInfo) => handler(request, connInfo),
      onListen: onListen ?? (({ hostname, port }: { hostname: string; port: number }) => {
        console.log(`🚀 Vexor server running at http://${hostname}:${port}`);
      }),
      onError: onError ?? ((error: Error) => {
        console.error('Server error:', error);
        return new Response('Internal Server Error', { status: 500 });
      }),
    };

    if (signal) {
      serveOptions.signal = signal;
    }

    if (tls) {
      serveOptions.cert = tls.cert;
      serveOptions.key = tls.key;
    }

    this.server = Deno.serve(serveOptions) as DenoServer;
    return this.server;
  }

  /**
   * Create request handler
   */
  createHandler(): (request: Request, connInfo?: DenoConnInfo) => Promise<Response> {
    return async (request: Request, _connInfo?: DenoConnInfo): Promise<Response> => {
      try {
        const vexorRequest = createRequest(request);
        return await this.app.handle(vexorRequest);
      } catch (error) {
        console.error('Request handling error:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    };
  }

  /**
   * Stop the server
   */
  async close(): Promise<void> {
    await this.server?.shutdown();
  }

  /**
   * Wait for server to finish
   */
  async finished(): Promise<void> {
    await this.server?.finished;
  }
}

/**
 * Deno global interface
 */
interface DenoGlobal {
  serve(options: Record<string, unknown>): DenoServer;
  version: {
    deno: string;
    v8: string;
    typescript: string;
  };
  env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): Record<string, string>;
  };
  readTextFile(path: string): Promise<string>;
  writeTextFile(path: string, content: string): Promise<void>;
  cwd(): string;
}

/**
 * Create Deno adapter
 */
export function createDenoAdapter(app: Vexor): DenoAdapter {
  return new DenoAdapter(app);
}

/**
 * Detect if running in Deno
 */
export function isDeno(): boolean {
  return typeof (globalThis as { Deno?: unknown }).Deno !== 'undefined';
}

/**
 * Get Deno version
 */
export function getDenoVersion(): string | null {
  const Deno = (globalThis as { Deno?: DenoGlobal }).Deno;
  return Deno?.version?.deno ?? null;
}

/**
 * Get environment variable (Deno-compatible)
 */
export function getEnv(key: string): string | undefined {
  const Deno = (globalThis as { Deno?: DenoGlobal }).Deno;
  return Deno?.env?.get(key);
}

/**
 * Deno Deploy specific helpers
 */
export const DenoDeployHelpers = {
  /**
   * Check if running on Deno Deploy
   */
  isDenoDeployed(): boolean {
    return getEnv('DENO_DEPLOYMENT_ID') !== undefined;
  },

  /**
   * Get deployment ID
   */
  getDeploymentId(): string | undefined {
    return getEnv('DENO_DEPLOYMENT_ID');
  },

  /**
   * Get region
   */
  getRegion(): string | undefined {
    return getEnv('DENO_REGION');
  },
};

/**
 * Fresh framework integration helper
 */
export function createFreshHandler(app: Vexor) {
  const adapter = new DenoAdapter(app);
  const handler = adapter.createHandler();

  return {
    handler: async (request: Request, ctx: { render: () => Promise<Response> }) => {
      // Try Vexor first
      const response = await handler(request);

      // If not found, fall through to Fresh
      if (response.status === 404) {
        return ctx.render();
      }

      return response;
    },
  };
}

/**
 * Oak middleware integration
 */
export function createOakMiddleware(app: Vexor) {
  const adapter = new DenoAdapter(app);
  const handler = adapter.createHandler();

  return async (ctx: { request: { originalRequest: { request: Request } }; response: { body: unknown; status: number; headers: Headers } }, next: () => Promise<void>) => {
    const request = ctx.request.originalRequest.request;
    const response = await handler(request);

    // If not a 404, use Vexor's response
    if (response.status !== 404) {
      ctx.response.status = response.status;
      ctx.response.body = response.body;
      response.headers.forEach((value, key) => {
        ctx.response.headers.set(key, value);
      });
      return;
    }

    // Otherwise, continue to next middleware
    await next();
  };
}

/**
 * Deno KV helper types
 */
export interface DenoKv {
  get<T>(key: unknown[]): Promise<{ key: unknown[]; value: T | null; versionstamp: string | null }>;
  set(key: unknown[], value: unknown): Promise<{ ok: true; versionstamp: string }>;
  delete(key: unknown[]): Promise<void>;
  list<T>(selector: { prefix: unknown[] }, options?: { limit?: number; cursor?: string }): AsyncIterable<{ key: unknown[]; value: T; versionstamp: string }>;
  atomic(): DenoKvAtomic;
  close(): void;
}

export interface DenoKvAtomic {
  check(...checks: { key: unknown[]; versionstamp: string | null }[]): DenoKvAtomic;
  set(key: unknown[], value: unknown): DenoKvAtomic;
  delete(key: unknown[]): DenoKvAtomic;
  commit(): Promise<{ ok: boolean; versionstamp?: string }>;
}
