/**
 * Cloudflare Workers Adapter Tests
 */

import { describe, it, expect, vi } from 'vitest';
import {
  CloudflareAdapter,
  createCloudflareAdapter,
  createCloudflareWorker,
  createDurableObject,
  isCloudflareWorkers,
  cloudflareCapabilities,
  cloudflareRuntime,
} from '../adapters/cloudflare.js';
import type {
  CloudflareEnv,
  ExecutionContext,
  CloudflareHandler,
} from '../adapters/cloudflare.js';
import type { Vexor } from '../core/app.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockApp(responseBody = 'ok', responseInit: ResponseInit = {}): Vexor {
  return {
    handle: vi.fn(async () => {
      return new Response(responseBody, { status: 200, ...responseInit });
    }),
    fetch: vi.fn(async () => {
      return new Response(responseBody, { status: 200, ...responseInit });
    }),
  } as unknown as Vexor;
}

function createMockEnv(bindings: Record<string, unknown> = {}): CloudflareEnv {
  return { ...bindings };
}

function createMockExecutionContext(): ExecutionContext {
  return {
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Cloudflare Workers Adapter', () => {
  describe('cloudflareCapabilities', () => {
    it('should expose correct capabilities', () => {
      expect(cloudflareCapabilities.streaming).toBe(true);
      expect(cloudflareCapabilities.websocket).toBe(true);
      expect(cloudflareCapabilities.http2).toBe(true);
      expect(cloudflareCapabilities.workerThreads).toBe(false);
      expect(cloudflareCapabilities.fileSystem).toBe(false);
    });
  });

  describe('cloudflareRuntime', () => {
    it('should be "edge"', () => {
      expect(cloudflareRuntime).toBe('edge');
    });
  });

  // -----------------------------------------------------------------------
  // CloudflareAdapter class
  // -----------------------------------------------------------------------
  describe('CloudflareAdapter', () => {
    it('should be constructed with a Vexor app', () => {
      const app = createMockApp();
      const adapter = new CloudflareAdapter(app);
      expect(adapter).toBeDefined();
    });

    it('should expose runtime type', () => {
      const adapter = new CloudflareAdapter(createMockApp());
      expect(adapter.runtime).toBe('edge');
    });

    it('should expose capabilities', () => {
      const adapter = new CloudflareAdapter(createMockApp());
      expect(adapter.capabilities).toEqual(cloudflareCapabilities);
    });

    it('should return undefined for env and ctx before handling a request', () => {
      const adapter = new CloudflareAdapter(createMockApp());
      expect(adapter.getEnv()).toBeUndefined();
      expect(adapter.getContext()).toBeUndefined();
    });

    describe('handleRequest', () => {
      it('should pass request through to app.handle', async () => {
        const app = createMockApp('cf response');
        const adapter = new CloudflareAdapter(app);

        const request = new Request('https://example.com/test');
        const response = await adapter.handleRequest(request);

        expect(response.status).toBe(200);
        expect(await response.text()).toBe('cf response');
        expect(app.handle).toHaveBeenCalledOnce();
      });
    });

    describe('createHandler', () => {
      it('should return a CloudflareHandler with fetch method', () => {
        const adapter = new CloudflareAdapter(createMockApp());
        const handler = adapter.createHandler();
        expect(handler).toHaveProperty('fetch');
        expect(typeof handler.fetch).toBe('function');
      });

      it('should handle requests via fetch method', async () => {
        const app = createMockApp('worker response');
        const adapter = new CloudflareAdapter(app);
        const handler = adapter.createHandler();

        const request = new Request('https://example.com/hello');
        const env = createMockEnv();
        const ctx = createMockExecutionContext();

        const response = await handler.fetch(request, env, ctx);

        expect(response.status).toBe(200);
        expect(await response.text()).toBe('worker response');
      });

      it('should store env and ctx after handling a request', async () => {
        const app = createMockApp();
        const adapter = new CloudflareAdapter(app);
        const handler = adapter.createHandler();

        const env = createMockEnv({ MY_KV: 'kv-namespace' });
        const ctx = createMockExecutionContext();

        await handler.fetch(new Request('https://example.com/'), env, ctx);

        expect(adapter.getEnv()).toBe(env);
        expect(adapter.getContext()).toBe(ctx);
      });

      it('should return 500 on handler error', async () => {
        const app = {
          handle: vi.fn(async () => {
            throw new Error('boom');
          }),
        } as unknown as Vexor;

        const adapter = new CloudflareAdapter(app);
        const handler = adapter.createHandler();

        const response = await handler.fetch(
          new Request('https://example.com/'),
          createMockEnv(),
          createMockExecutionContext()
        );

        expect(response.status).toBe(500);
        expect(await response.text()).toBe('Internal Server Error');
      });
    });

    describe('waitUntil', () => {
      it('should delegate to execution context', async () => {
        const app = createMockApp();
        const adapter = new CloudflareAdapter(app);
        const handler = adapter.createHandler();

        const ctx = createMockExecutionContext();
        await handler.fetch(
          new Request('https://example.com/'),
          createMockEnv(),
          ctx
        );

        const promise = Promise.resolve();
        adapter.waitUntil(promise);

        expect(ctx.waitUntil).toHaveBeenCalledWith(promise);
      });

      it('should not throw when no context is available', () => {
        const adapter = new CloudflareAdapter(createMockApp());
        // No request handled yet, so ctx is undefined
        expect(() => adapter.waitUntil(Promise.resolve())).not.toThrow();
      });
    });

    describe('toFetchHandler', () => {
      it('should return a simple fetch function', async () => {
        const app = createMockApp('fetch handler response');
        const adapter = new CloudflareAdapter(app);
        const fetchHandler = adapter.toFetchHandler();

        expect(typeof fetchHandler).toBe('function');

        const response = await fetchHandler(new Request('https://example.com/'));
        expect(await response.text()).toBe('fetch handler response');
      });
    });
  });

  // -----------------------------------------------------------------------
  // Factory functions
  // -----------------------------------------------------------------------
  describe('createCloudflareAdapter', () => {
    it('should create a CloudflareAdapter instance', () => {
      const adapter = createCloudflareAdapter(createMockApp());
      expect(adapter).toBeInstanceOf(CloudflareAdapter);
    });
  });

  describe('createCloudflareWorker', () => {
    it('should return a CloudflareHandler with fetch', () => {
      const handler = createCloudflareWorker(createMockApp());
      expect(handler).toHaveProperty('fetch');
      expect(typeof handler.fetch).toBe('function');
    });

    it('should handle requests through the worker handler', async () => {
      const handler = createCloudflareWorker(createMockApp('worker body'));

      const response = await handler.fetch(
        new Request('https://example.com/'),
        createMockEnv(),
        createMockExecutionContext()
      );

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('worker body');
    });
  });

  // -----------------------------------------------------------------------
  // isCloudflareWorkers
  // -----------------------------------------------------------------------
  describe('isCloudflareWorkers', () => {
    it('should return false in Node.js environment', () => {
      // In a Node test, there's no HTMLRewriter global
      expect(isCloudflareWorkers()).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // createDurableObject
  // -----------------------------------------------------------------------
  describe('createDurableObject', () => {
    it('should return a class that can be instantiated', () => {
      const app = createMockApp();
      const DurableObjectClass = createDurableObject(app);

      const state = {
        id: { toString: () => 'obj-123' },
        storage: {} as any,
        blockConcurrencyWhile: vi.fn(),
      };

      const instance = new DurableObjectClass(state, createMockEnv());
      expect(instance.state).toBe(state);
      expect(instance.env).toBeDefined();
      expect(instance.app).toBe(app);
    });

    it('should handle fetch requests', async () => {
      const app = createMockApp('durable object response');
      const DurableObjectClass = createDurableObject(app);

      const state = {
        id: { toString: () => 'obj-123' },
        storage: {} as any,
        blockConcurrencyWhile: vi.fn(),
      };

      const instance = new DurableObjectClass(state, createMockEnv());
      const response = await instance.fetch(new Request('https://example.com/'));

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('durable object response');
    });
  });
});
