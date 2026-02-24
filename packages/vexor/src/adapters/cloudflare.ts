/**
 * Cloudflare Workers Adapter
 *
 * Adapter for running Vexor on Cloudflare Workers and Pages.
 * Uses native fetch handler with Cloudflare-specific bindings.
 */

import type { Vexor } from '../core/app.js';
import type { RuntimeCapabilities, RuntimeType } from '../core/types.js';
import { createRequest } from '../core/request.js';

/**
 * Cloudflare Workers environment bindings
 */
export interface CloudflareEnv {
  /** KV namespaces */
  [key: string]: unknown;
}

/**
 * Cloudflare execution context
 */
export interface ExecutionContext {
  /** Wait until promise resolves before worker terminates */
  waitUntil(promise: Promise<unknown>): void;
  /** Pass through to origin */
  passThroughOnException(): void;
}

/**
 * Cloudflare module worker handler
 */
export interface CloudflareHandler {
  fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext): Promise<Response>;
  scheduled?(controller: ScheduledController, env: CloudflareEnv, ctx: ExecutionContext): Promise<void>;
}

/**
 * Scheduled event controller
 */
export interface ScheduledController {
  cron: string;
  scheduledTime: number;
}

/**
 * Cloudflare runtime capabilities
 */
export const cloudflareCapabilities: RuntimeCapabilities = {
  streaming: true,
  websocket: true,
  http2: true,
  workerThreads: false,
  fileSystem: false,
};

/**
 * Cloudflare runtime type
 */
export const cloudflareRuntime: RuntimeType = 'edge';

/**
 * Cloudflare Workers adapter
 */
export class CloudflareAdapter {
  private app: Vexor;
  private env?: CloudflareEnv;
  private ctx?: ExecutionContext;

  constructor(app: Vexor) {
    this.app = app;
  }

  /**
   * Get the runtime type
   */
  get runtime(): RuntimeType {
    return cloudflareRuntime;
  }

  /**
   * Get runtime capabilities
   */
  get capabilities(): RuntimeCapabilities {
    return cloudflareCapabilities;
  }

  /**
   * Create a module worker handler
   */
  createHandler(): CloudflareHandler {
    return {
      fetch: async (request: Request, env: CloudflareEnv, ctx: ExecutionContext): Promise<Response> => {
        this.env = env;
        this.ctx = ctx;

        try {
          return await this.handleRequest(request);
        } catch (error) {
          console.error('Request handling error:', error);
          return new Response('Internal Server Error', { status: 500 });
        }
      },
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
   * Get current environment bindings
   */
  getEnv(): CloudflareEnv | undefined {
    return this.env;
  }

  /**
   * Get execution context
   */
  getContext(): ExecutionContext | undefined {
    return this.ctx;
  }

  /**
   * Schedule background task
   */
  waitUntil(promise: Promise<unknown>): void {
    this.ctx?.waitUntil(promise);
  }

  /**
   * Create a fetch handler function (for service worker format)
   */
  toFetchHandler(): (request: Request) => Promise<Response> {
    return (request: Request) => this.handleRequest(request);
  }
}

/**
 * Create Cloudflare Workers adapter
 */
export function createCloudflareAdapter(app: Vexor): CloudflareAdapter {
  return new CloudflareAdapter(app);
}

/**
 * Create module worker export
 */
export function createCloudflareWorker(app: Vexor): CloudflareHandler {
  const adapter = new CloudflareAdapter(app);
  return adapter.createHandler();
}

/**
 * Detect if running in Cloudflare Workers
 */
export function isCloudflareWorkers(): boolean {
  // Check for Cloudflare-specific globals
  return typeof (globalThis as Record<string, unknown>).caches !== 'undefined' &&
         typeof (globalThis as Record<string, unknown>).HTMLRewriter !== 'undefined';
}

/**
 * Create Durable Object base class helper
 */
export interface DurableObjectState {
  id: { toString(): string };
  storage: DurableObjectStorage;
  blockConcurrencyWhile<T>(fn: () => Promise<T>): Promise<T>;
}

export interface DurableObjectStorage {
  get<T>(key: string): Promise<T | undefined>;
  get<T>(keys: string[]): Promise<Map<string, T>>;
  put<T>(key: string, value: T): Promise<void>;
  put<T>(entries: Record<string, T>): Promise<void>;
  delete(key: string): Promise<boolean>;
  delete(keys: string[]): Promise<number>;
  list<T>(options?: { start?: string; end?: string; prefix?: string; limit?: number; reverse?: boolean }): Promise<Map<string, T>>;
}

/**
 * Create a Vexor-powered Durable Object
 */
export function createDurableObject(app: Vexor) {
  return class VexorDurableObject {
    state: DurableObjectState;
    env: CloudflareEnv;
    app: Vexor;

    constructor(state: DurableObjectState, env: CloudflareEnv) {
      this.state = state;
      this.env = env;
      this.app = app;
    }

    async fetch(request: Request): Promise<Response> {
      const vexorRequest = createRequest(request);
      return this.app.handle(vexorRequest);
    }
  };
}

/**
 * KV namespace helper types
 */
export interface KVNamespace {
  get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream'; cacheTtl?: number }): Promise<unknown>;
  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: { expiration?: number; expirationTtl?: number; metadata?: unknown }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string; expiration?: number; metadata?: unknown }[]; list_complete: boolean; cursor?: string }>;
}

/**
 * R2 bucket helper types
 */
export interface R2Bucket {
  get(key: string): Promise<R2Object | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | string, options?: R2PutOptions): Promise<R2Object>;
  delete(key: string | string[]): Promise<void>;
  list(options?: R2ListOptions): Promise<R2Objects>;
}

export interface R2Object {
  key: string;
  size: number;
  etag: string;
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
  body: ReadableStream;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T>(): Promise<T>;
}

export interface R2PutOptions {
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
}

export interface R2HTTPMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

export interface R2ListOptions {
  prefix?: string;
  limit?: number;
  cursor?: string;
  delimiter?: string;
  include?: ('httpMetadata' | 'customMetadata')[];
}

export interface R2Objects {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes: string[];
}
