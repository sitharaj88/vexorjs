/**
 * Bun Adapter
 *
 * Native Bun.serve integration for maximum performance.
 * Bun natively supports Web Standards Request/Response.
 */

import { VexorRequest, createRequest } from '../core/request.js';
import type { RuntimeCapabilities, RuntimeType } from '../core/types.js';

/**
 * Bun runtime adapter capabilities
 */
export const bunCapabilities: RuntimeCapabilities = {
  http2: false, // Bun HTTP/2 support is limited
  streaming: true,
  websocket: true,
  workerThreads: false, // Bun uses different worker API
  fileSystem: true,
};

/**
 * Runtime type
 */
export const runtimeType: RuntimeType = 'bun';

/**
 * Bun server type (for type checking without importing bun types)
 */
export interface BunServer {
  stop(): void;
  port: number;
  hostname: string;
  development: boolean;
  pendingRequests: number;
  pendingWebSockets: number;
}

/**
 * Bun serve options
 */
export interface BunServeOptions {
  port?: number;
  hostname?: string;
  development?: boolean;
  reusePort?: boolean;
  maxRequestBodySize?: number;
  lowMemoryMode?: boolean;
}

/**
 * Request handler function type
 */
export type RequestHandler = (request: VexorRequest) => Response | Promise<Response>;

/**
 * Convert Bun Request to VexorRequest
 * Bun already uses Web Standards Request, so this is straightforward
 */
export function toVexorRequest(request: Request): VexorRequest {
  return createRequest(request, request);
}

/**
 * Check if we're running in Bun
 */
export function isBun(): boolean {
  return typeof globalThis !== 'undefined' &&
    'Bun' in globalThis &&
    typeof (globalThis as { Bun?: unknown }).Bun === 'object';
}

/**
 * BunAdapter class for integration with Vexor app
 */
export class BunAdapter {
  private server?: BunServer;
  private handler: RequestHandler;
  private options: BunServeOptions;

  constructor(handler: RequestHandler, options: BunServeOptions = {}) {
    this.handler = handler;
    this.options = options;
  }

  /**
   * Start the Bun server
   */
  async listen(port?: number, hostname?: string): Promise<BunServer> {
    if (!isBun()) {
      throw new Error('BunAdapter can only be used in Bun runtime');
    }

    const options = {
      ...this.options,
      ...(port !== undefined && { port }),
      ...(hostname !== undefined && { hostname }),
    };

    // Access Bun.serve dynamically (cast to unknown first for type safety)
    const BunGlobal = globalThis as unknown as { Bun: {
      serve: (options: {
        port?: number;
        hostname?: string;
        development?: boolean;
        reusePort?: boolean;
        maxRequestBodySize?: number;
        lowMemoryMode?: boolean;
        fetch: (request: Request) => Response | Promise<Response>;
        error?: (error: Error) => Response | Promise<Response>;
      }) => BunServer;
    } };
    const Bun = BunGlobal.Bun;

    this.server = Bun.serve({
      port: options.port ?? 3000,
      hostname: options.hostname ?? '0.0.0.0',
      development: options.development ?? process.env.NODE_ENV !== 'production',
      reusePort: options.reusePort,
      maxRequestBodySize: options.maxRequestBodySize,
      lowMemoryMode: options.lowMemoryMode,

      fetch: async (request: Request) => {
        try {
          const vexorRequest = toVexorRequest(request);
          return await this.handler(vexorRequest);
        } catch (error) {
          console.error('Request error:', error);
          return new Response(
            JSON.stringify({
              error: error instanceof Error ? error.message : 'Internal Server Error',
              code: 'INTERNAL_ERROR',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      },

      error: (error: Error) => {
        console.error('Server error:', error);
        return new Response(
          JSON.stringify({
            error: error.message,
            code: 'SERVER_ERROR',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      },
    });

    return this.server;
  }

  /**
   * Stop the server
   */
  async close(): Promise<void> {
    if (this.server) {
      this.server.stop();
      this.server = undefined;
    }
  }

  /**
   * Get the underlying server
   */
  getServer(): BunServer | undefined {
    return this.server;
  }

  /**
   * Get server address
   */
  address(): { port: number; host: string } | null {
    if (!this.server) return null;
    return {
      port: this.server.port,
      host: this.server.hostname,
    };
  }
}

/**
 * Create and start a Bun server with the given handler
 */
export async function startBunServer(
  handler: RequestHandler,
  options: BunServeOptions = {}
): Promise<BunServer> {
  const adapter = new BunAdapter(handler, options);
  return adapter.listen(options.port, options.hostname);
}
