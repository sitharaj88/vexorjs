/**
 * Vercel Edge Adapter
 *
 * Adapter for running Vexor on Vercel Edge Functions.
 * Compatible with Next.js edge runtime and Vercel Functions.
 */

import type { Vexor } from '../core/app.js';
import type { RuntimeCapabilities, RuntimeType } from '../core/types.js';
import { createRequest } from '../core/request.js';

/**
 * Vercel request context
 */
export interface VercelRequestContext {
  /** Wait until promise resolves */
  waitUntil(promise: Promise<unknown>): void;
}

/**
 * Vercel geo data
 */
export interface VercelGeo {
  city?: string;
  country?: string;
  countryRegion?: string;
  latitude?: string;
  longitude?: string;
  region?: string;
}

/**
 * Vercel Edge runtime capabilities
 */
export const vercelEdgeCapabilities: RuntimeCapabilities = {
  streaming: true,
  websocket: false, // Vercel Edge doesn't support WebSocket in the same way
  http2: true,
  workerThreads: false,
  fileSystem: false,
};

/**
 * Vercel runtime type
 */
export const vercelRuntime: RuntimeType = 'edge';

/**
 * Vercel Edge adapter
 */
export class VercelAdapter {
  private app: Vexor;

  constructor(app: Vexor) {
    this.app = app;
  }

  /**
   * Get the runtime type
   */
  get runtime(): RuntimeType {
    return vercelRuntime;
  }

  /**
   * Get runtime capabilities
   */
  get capabilities(): RuntimeCapabilities {
    return vercelEdgeCapabilities;
  }

  /**
   * Create an edge function handler
   */
  createHandler(): (request: Request, context?: VercelRequestContext) => Promise<Response> {
    return async (request: Request, _context?: VercelRequestContext): Promise<Response> => {
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
   * Handle incoming request
   */
  async handleRequest(request: Request): Promise<Response> {
    const vexorRequest = createRequest(request);
    return this.app.handle(vexorRequest);
  }

  /**
   * Create a Next.js compatible edge function
   */
  toNextEdgeHandler() {
    return {
      runtime: 'edge' as const,
      handler: this.createHandler(),
    };
  }
}

/**
 * Create Vercel Edge adapter
 */
export function createVercelAdapter(app: Vexor): VercelAdapter {
  return new VercelAdapter(app);
}

/**
 * Create edge function handler
 */
export function createVercelEdgeHandler(app: Vexor): (request: Request, context?: VercelRequestContext) => Promise<Response> {
  const adapter = new VercelAdapter(app);
  return adapter.createHandler();
}

/**
 * Detect if running in Vercel Edge
 */
export function isVercelEdge(): boolean {
  return typeof (globalThis as Record<string, unknown>).EdgeRuntime !== 'undefined';
}

/**
 * Get Vercel geo data from request headers
 */
export function getVercelGeo(request: Request): VercelGeo {
  return {
    city: request.headers.get('x-vercel-ip-city') ?? undefined,
    country: request.headers.get('x-vercel-ip-country') ?? undefined,
    countryRegion: request.headers.get('x-vercel-ip-country-region') ?? undefined,
    latitude: request.headers.get('x-vercel-ip-latitude') ?? undefined,
    longitude: request.headers.get('x-vercel-ip-longitude') ?? undefined,
    region: request.headers.get('x-vercel-ip-timezone') ?? undefined,
  };
}

/**
 * Get Vercel request ID
 */
export function getVercelRequestId(request: Request): string | null {
  return request.headers.get('x-vercel-id');
}

/**
 * Get Vercel deployment URL
 */
export function getVercelDeploymentUrl(request: Request): string | null {
  return request.headers.get('x-vercel-deployment-url');
}

/**
 * Vercel edge config types
 */
export interface EdgeConfigClient {
  get<T = unknown>(key: string): Promise<T | undefined>;
  getAll<T = Record<string, unknown>>(): Promise<T>;
  has(key: string): Promise<boolean>;
  digest(): Promise<string>;
}

/**
 * Create Next.js API route handler
 */
export function createNextApiHandler(app: Vexor) {
  const adapter = new VercelAdapter(app);

  return {
    GET: adapter.createHandler(),
    POST: adapter.createHandler(),
    PUT: adapter.createHandler(),
    PATCH: adapter.createHandler(),
    DELETE: adapter.createHandler(),
    HEAD: adapter.createHandler(),
    OPTIONS: adapter.createHandler(),
  };
}

/**
 * Edge middleware helper
 */
export function createEdgeMiddleware(
  handler: (request: Request) => Promise<Response | null | undefined>
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const response = await handler(request);

    if (response) {
      return response;
    }

    // Continue to next middleware/handler
    return new Response(null, { status: 200 });
  };
}

/**
 * Rewrite URL helper for edge middleware
 */
export function rewriteUrl(request: Request, destination: string | URL): Request {
  const url = new URL(destination, request.url);
  return new Request(url, request);
}

/**
 * Redirect helper
 */
export function redirect(url: string | URL, status: 301 | 302 | 303 | 307 | 308 = 307): Response {
  return new Response(null, {
    status,
    headers: {
      Location: url.toString(),
    },
  });
}

/**
 * Next response helper
 */
export function nextResponse(): Response {
  return new Response(null, {
    headers: {
      'x-middleware-next': '1',
    },
  });
}
