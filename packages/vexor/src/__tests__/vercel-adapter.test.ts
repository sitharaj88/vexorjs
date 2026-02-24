/**
 * Vercel Edge Adapter Tests
 */

import { describe, it, expect, vi } from 'vitest';
import {
  VercelAdapter,
  createVercelAdapter,
  createVercelEdgeHandler,
  createNextApiHandler,
  createEdgeMiddleware,
  rewriteUrl,
  redirect,
  nextResponse,
  isVercelEdge,
  getVercelGeo,
  getVercelRequestId,
  getVercelDeploymentUrl,
  vercelEdgeCapabilities,
  vercelRuntime,
} from '../adapters/vercel.js';
import type { Vexor } from '../core/app.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockApp(responseBody = 'ok', responseInit: ResponseInit = {}): Vexor {
  return {
    handle: vi.fn(async () => {
      return new Response(responseBody, { status: 200, ...responseInit });
    }),
  } as unknown as Vexor;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Vercel Edge Adapter', () => {
  describe('vercelEdgeCapabilities', () => {
    it('should expose correct capabilities', () => {
      expect(vercelEdgeCapabilities.streaming).toBe(true);
      expect(vercelEdgeCapabilities.websocket).toBe(false);
      expect(vercelEdgeCapabilities.http2).toBe(true);
      expect(vercelEdgeCapabilities.workerThreads).toBe(false);
      expect(vercelEdgeCapabilities.fileSystem).toBe(false);
    });
  });

  describe('vercelRuntime', () => {
    it('should be "edge"', () => {
      expect(vercelRuntime).toBe('edge');
    });
  });

  // -----------------------------------------------------------------------
  // VercelAdapter class
  // -----------------------------------------------------------------------
  describe('VercelAdapter', () => {
    it('should be constructed with a Vexor app', () => {
      const adapter = new VercelAdapter(createMockApp());
      expect(adapter).toBeDefined();
    });

    it('should expose runtime type', () => {
      const adapter = new VercelAdapter(createMockApp());
      expect(adapter.runtime).toBe('edge');
    });

    it('should expose capabilities', () => {
      const adapter = new VercelAdapter(createMockApp());
      expect(adapter.capabilities).toEqual(vercelEdgeCapabilities);
    });

    describe('handleRequest', () => {
      it('should pass request to app.handle', async () => {
        const app = createMockApp('vercel response');
        const adapter = new VercelAdapter(app);

        const request = new Request('https://example.vercel.app/api/test');
        const response = await adapter.handleRequest(request);

        expect(response.status).toBe(200);
        expect(await response.text()).toBe('vercel response');
        expect(app.handle).toHaveBeenCalledOnce();
      });
    });

    describe('createHandler', () => {
      it('should return an async function', () => {
        const adapter = new VercelAdapter(createMockApp());
        const handler = adapter.createHandler();
        expect(typeof handler).toBe('function');
      });

      it('should handle requests successfully', async () => {
        const app = createMockApp('edge fn response');
        const adapter = new VercelAdapter(app);
        const handler = adapter.createHandler();

        const response = await handler(
          new Request('https://example.vercel.app/api/hello')
        );

        expect(response.status).toBe(200);
        expect(await response.text()).toBe('edge fn response');
      });

      it('should accept optional context parameter', async () => {
        const app = createMockApp('with context');
        const adapter = new VercelAdapter(app);
        const handler = adapter.createHandler();

        const ctx = { waitUntil: vi.fn() };
        const response = await handler(
          new Request('https://example.vercel.app/api/test'),
          ctx
        );

        expect(response.status).toBe(200);
        expect(await response.text()).toBe('with context');
      });

      it('should return 500 on handler error', async () => {
        const app = {
          handle: vi.fn(async () => {
            throw new Error('vercel boom');
          }),
        } as unknown as Vexor;

        const adapter = new VercelAdapter(app);
        const handler = adapter.createHandler();

        const response = await handler(
          new Request('https://example.vercel.app/')
        );

        expect(response.status).toBe(500);
        expect(await response.text()).toBe('Internal Server Error');
      });
    });

    describe('toNextEdgeHandler', () => {
      it('should return an object with runtime and handler', () => {
        const adapter = new VercelAdapter(createMockApp());
        const nextEdge = adapter.toNextEdgeHandler();

        expect(nextEdge.runtime).toBe('edge');
        expect(typeof nextEdge.handler).toBe('function');
      });

      it('should handle requests via the edge handler', async () => {
        const app = createMockApp('next edge');
        const adapter = new VercelAdapter(app);
        const nextEdge = adapter.toNextEdgeHandler();

        const response = await nextEdge.handler(
          new Request('https://example.com/')
        );

        expect(await response.text()).toBe('next edge');
      });
    });
  });

  // -----------------------------------------------------------------------
  // Factory functions
  // -----------------------------------------------------------------------
  describe('createVercelAdapter', () => {
    it('should create a VercelAdapter instance', () => {
      const adapter = createVercelAdapter(createMockApp());
      expect(adapter).toBeInstanceOf(VercelAdapter);
    });
  });

  describe('createVercelEdgeHandler', () => {
    it('should return an async function', () => {
      const handler = createVercelEdgeHandler(createMockApp());
      expect(typeof handler).toBe('function');
    });

    it('should handle requests', async () => {
      const handler = createVercelEdgeHandler(createMockApp('edge handler'));
      const response = await handler(new Request('https://example.com/'));
      expect(await response.text()).toBe('edge handler');
    });
  });

  describe('createNextApiHandler', () => {
    it('should return handlers for all HTTP methods', () => {
      const handlers = createNextApiHandler(createMockApp());

      expect(typeof handlers.GET).toBe('function');
      expect(typeof handlers.POST).toBe('function');
      expect(typeof handlers.PUT).toBe('function');
      expect(typeof handlers.PATCH).toBe('function');
      expect(typeof handlers.DELETE).toBe('function');
      expect(typeof handlers.HEAD).toBe('function');
      expect(typeof handlers.OPTIONS).toBe('function');
    });

    it('should handle requests via each method handler', async () => {
      const app = createMockApp('api route');
      const handlers = createNextApiHandler(app);

      const response = await handlers.GET(
        new Request('https://example.com/api/test')
      );

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('api route');
    });
  });

  // -----------------------------------------------------------------------
  // isVercelEdge
  // -----------------------------------------------------------------------
  describe('isVercelEdge', () => {
    it('should return false in Node.js environment', () => {
      expect(isVercelEdge()).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Geo helpers
  // -----------------------------------------------------------------------
  describe('getVercelGeo', () => {
    it('should extract geo data from request headers', () => {
      const request = new Request('https://example.com/', {
        headers: {
          'x-vercel-ip-city': 'San Francisco',
          'x-vercel-ip-country': 'US',
          'x-vercel-ip-country-region': 'CA',
          'x-vercel-ip-latitude': '37.7749',
          'x-vercel-ip-longitude': '-122.4194',
          'x-vercel-ip-timezone': 'America/Los_Angeles',
        },
      });

      const geo = getVercelGeo(request);

      expect(geo.city).toBe('San Francisco');
      expect(geo.country).toBe('US');
      expect(geo.countryRegion).toBe('CA');
      expect(geo.latitude).toBe('37.7749');
      expect(geo.longitude).toBe('-122.4194');
      expect(geo.region).toBe('America/Los_Angeles');
    });

    it('should return undefined for missing headers', () => {
      const request = new Request('https://example.com/');
      const geo = getVercelGeo(request);

      expect(geo.city).toBeUndefined();
      expect(geo.country).toBeUndefined();
      expect(geo.countryRegion).toBeUndefined();
      expect(geo.latitude).toBeUndefined();
      expect(geo.longitude).toBeUndefined();
      expect(geo.region).toBeUndefined();
    });
  });

  describe('getVercelRequestId', () => {
    it('should return the request ID header', () => {
      const request = new Request('https://example.com/', {
        headers: { 'x-vercel-id': 'iad1::abc123' },
      });

      expect(getVercelRequestId(request)).toBe('iad1::abc123');
    });

    it('should return null when header is absent', () => {
      const request = new Request('https://example.com/');
      expect(getVercelRequestId(request)).toBeNull();
    });
  });

  describe('getVercelDeploymentUrl', () => {
    it('should return the deployment URL header', () => {
      const request = new Request('https://example.com/', {
        headers: { 'x-vercel-deployment-url': 'my-app-abc123.vercel.app' },
      });

      expect(getVercelDeploymentUrl(request)).toBe('my-app-abc123.vercel.app');
    });

    it('should return null when header is absent', () => {
      const request = new Request('https://example.com/');
      expect(getVercelDeploymentUrl(request)).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // Edge middleware helpers
  // -----------------------------------------------------------------------
  describe('createEdgeMiddleware', () => {
    it('should return response from handler when provided', async () => {
      const middleware = createEdgeMiddleware(async () => {
        return new Response('intercepted', { status: 403 });
      });

      const response = await middleware(new Request('https://example.com/'));
      expect(response.status).toBe(403);
      expect(await response.text()).toBe('intercepted');
    });

    it('should return 200 when handler returns null', async () => {
      const middleware = createEdgeMiddleware(async () => null);

      const response = await middleware(new Request('https://example.com/'));
      expect(response.status).toBe(200);
    });

    it('should return 200 when handler returns undefined', async () => {
      const middleware = createEdgeMiddleware(async () => undefined);

      const response = await middleware(new Request('https://example.com/'));
      expect(response.status).toBe(200);
    });
  });

  describe('rewriteUrl', () => {
    it('should rewrite request URL with string destination', () => {
      const original = new Request('https://example.com/old-path');
      const rewritten = rewriteUrl(original, '/new-path');

      expect(new URL(rewritten.url).pathname).toBe('/new-path');
    });

    it('should rewrite request URL with URL destination', () => {
      const original = new Request('https://example.com/old-path');
      const rewritten = rewriteUrl(original, new URL('https://other.com/path'));

      expect(rewritten.url).toBe('https://other.com/path');
    });
  });

  describe('redirect', () => {
    it('should create a redirect response with default 307 status', () => {
      const response = redirect('https://example.com/new');

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('https://example.com/new');
    });

    it('should create a redirect with custom status', () => {
      const response = redirect('https://example.com/', 301);
      expect(response.status).toBe(301);
    });

    it('should accept URL object', () => {
      const response = redirect(new URL('https://example.com/url-obj'));
      expect(response.headers.get('Location')).toBe('https://example.com/url-obj');
    });
  });

  describe('nextResponse', () => {
    it('should return response with x-middleware-next header', () => {
      const response = nextResponse();
      expect(response.headers.get('x-middleware-next')).toBe('1');
    });
  });
});
