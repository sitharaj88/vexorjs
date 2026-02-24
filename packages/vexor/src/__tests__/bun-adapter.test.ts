/**
 * Bun Adapter Tests
 *
 * Since we cannot actually start a Bun server in Node.js tests,
 * we test the conversion logic, constructor, capability constants,
 * and runtime detection. The listen() method is tested to verify
 * it throws when not in Bun runtime.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  BunAdapter,
  toVexorRequest,
  isBun,
  bunCapabilities,
  runtimeType,
} from '../adapters/bun.js';
import type { BunServer } from '../adapters/bun.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Bun Adapter', () => {
  describe('bunCapabilities', () => {
    it('should expose correct capabilities', () => {
      expect(bunCapabilities.streaming).toBe(true);
      expect(bunCapabilities.websocket).toBe(true);
      expect(bunCapabilities.http2).toBe(false);
      expect(bunCapabilities.workerThreads).toBe(false);
      expect(bunCapabilities.fileSystem).toBe(true);
    });
  });

  describe('runtimeType', () => {
    it('should be "bun"', () => {
      expect(runtimeType).toBe('bun');
    });
  });

  // -----------------------------------------------------------------------
  // isBun
  // -----------------------------------------------------------------------
  describe('isBun', () => {
    afterEach(() => {
      // Clean up any Bun global we may have injected
      delete (globalThis as any).Bun;
    });

    it('should return false in Node.js environment', () => {
      expect(isBun()).toBe(false);
    });

    it('should return true when Bun global is present', () => {
      (globalThis as any).Bun = {};
      expect(isBun()).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // toVexorRequest
  // -----------------------------------------------------------------------
  describe('toVexorRequest', () => {
    it('should convert a standard Request to VexorRequest', () => {
      const request = new Request('https://example.com/test', {
        method: 'GET',
        headers: { 'x-custom': 'value' },
      });

      const vexorReq = toVexorRequest(request);

      expect(vexorReq.method).toBe('GET');
      expect(vexorReq.url).toBe('https://example.com/test');
      expect(vexorReq.headers.get('x-custom')).toBe('value');
    });

    it('should preserve the raw request reference', () => {
      const request = new Request('https://example.com/');
      const vexorReq = toVexorRequest(request);

      expect(vexorReq.raw).toBe(request);
    });

    it('should convert POST requests with body', () => {
      const request = new Request('https://example.com/data', {
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
        headers: { 'content-type': 'application/json' },
      });

      const vexorReq = toVexorRequest(request);
      expect(vexorReq.method).toBe('POST');
    });
  });

  // -----------------------------------------------------------------------
  // BunAdapter class
  // -----------------------------------------------------------------------
  describe('BunAdapter', () => {
    it('should accept a handler in the constructor', () => {
      const handler = async () => new Response('ok');
      const adapter = new BunAdapter(handler);
      expect(adapter).toBeDefined();
    });

    it('should accept options in the constructor', () => {
      const handler = async () => new Response('ok');
      const adapter = new BunAdapter(handler, {
        port: 8080,
        hostname: '127.0.0.1',
        development: true,
      });
      expect(adapter).toBeDefined();
    });

    it('should return null from address() before listening', () => {
      const adapter = new BunAdapter(async () => new Response('ok'));
      expect(adapter.address()).toBeNull();
    });

    it('should return undefined from getServer() before listening', () => {
      const adapter = new BunAdapter(async () => new Response('ok'));
      expect(adapter.getServer()).toBeUndefined();
    });

    it('should throw when listen is called outside Bun runtime', async () => {
      const adapter = new BunAdapter(async () => new Response('ok'));
      await expect(adapter.listen()).rejects.toThrow(
        'BunAdapter can only be used in Bun runtime'
      );
    });

    it('should resolve close() when no server is running', async () => {
      const adapter = new BunAdapter(async () => new Response('ok'));
      await expect(adapter.close()).resolves.toBeUndefined();
    });

    describe('with mocked Bun global', () => {
      afterEach(() => {
        delete (globalThis as any).Bun;
      });

      it('should listen and set up server when Bun is available', async () => {
        const mockServer: BunServer = {
          stop: vi.fn(),
          port: 3000,
          hostname: '0.0.0.0',
          development: true,
          pendingRequests: 0,
          pendingWebSockets: 0,
        };

        (globalThis as any).Bun = {
          serve: vi.fn(() => mockServer),
        };

        const handler = async () => new Response('ok');
        const adapter = new BunAdapter(handler);

        const server = await adapter.listen(3000, '0.0.0.0');

        expect(server).toBe(mockServer);
        expect(adapter.getServer()).toBe(mockServer);
        expect((globalThis as any).Bun.serve).toHaveBeenCalledOnce();
      });

      it('should return address after listening', async () => {
        const mockServer: BunServer = {
          stop: vi.fn(),
          port: 8080,
          hostname: '127.0.0.1',
          development: false,
          pendingRequests: 0,
          pendingWebSockets: 0,
        };

        (globalThis as any).Bun = {
          serve: vi.fn(() => mockServer),
        };

        const adapter = new BunAdapter(async () => new Response('ok'));
        await adapter.listen(8080, '127.0.0.1');

        const addr = adapter.address();
        expect(addr).toEqual({ port: 8080, host: '127.0.0.1' });
      });

      it('should pass options to Bun.serve', async () => {
        const mockServer: BunServer = {
          stop: vi.fn(),
          port: 4000,
          hostname: 'localhost',
          development: false,
          pendingRequests: 0,
          pendingWebSockets: 0,
        };

        (globalThis as any).Bun = {
          serve: vi.fn(() => mockServer),
        };

        const handler = async () => new Response('ok');
        const adapter = new BunAdapter(handler, {
          reusePort: true,
          maxRequestBodySize: 1024,
          lowMemoryMode: true,
        });

        await adapter.listen(4000, 'localhost');

        const serveCall = (globalThis as any).Bun.serve.mock.calls[0][0];
        expect(serveCall.port).toBe(4000);
        expect(serveCall.hostname).toBe('localhost');
        expect(serveCall.reusePort).toBe(true);
        expect(serveCall.maxRequestBodySize).toBe(1024);
        expect(serveCall.lowMemoryMode).toBe(true);
      });

      it('should invoke handler via Bun.serve fetch callback', async () => {
        let serveFetchFn: ((req: Request) => Promise<Response>) | undefined;

        const mockServer: BunServer = {
          stop: vi.fn(),
          port: 3000,
          hostname: '0.0.0.0',
          development: true,
          pendingRequests: 0,
          pendingWebSockets: 0,
        };

        (globalThis as any).Bun = {
          serve: vi.fn((opts: any) => {
            serveFetchFn = opts.fetch;
            return mockServer;
          }),
        };

        const handler = vi.fn(async () => new Response('handled'));
        const adapter = new BunAdapter(handler);
        await adapter.listen();

        expect(serveFetchFn).toBeDefined();

        const response = await serveFetchFn!(
          new Request('https://example.com/test')
        );

        expect(handler).toHaveBeenCalledOnce();
        expect(response.status).toBe(200);
        expect(await response.text()).toBe('handled');
      });

      it('should return 500 from fetch callback on handler error', async () => {
        let serveFetchFn: ((req: Request) => Promise<Response>) | undefined;

        const mockServer: BunServer = {
          stop: vi.fn(),
          port: 3000,
          hostname: '0.0.0.0',
          development: true,
          pendingRequests: 0,
          pendingWebSockets: 0,
        };

        (globalThis as any).Bun = {
          serve: vi.fn((opts: any) => {
            serveFetchFn = opts.fetch;
            return mockServer;
          }),
        };

        const handler = vi.fn(async () => {
          throw new Error('handler boom');
        });
        const adapter = new BunAdapter(handler);
        await adapter.listen();

        const response = await serveFetchFn!(
          new Request('https://example.com/')
        );

        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body.error).toBe('handler boom');
        expect(body.code).toBe('INTERNAL_ERROR');
      });

      it('should provide an error handler to Bun.serve', async () => {
        let serveErrorFn: ((err: Error) => Response) | undefined;

        const mockServer: BunServer = {
          stop: vi.fn(),
          port: 3000,
          hostname: '0.0.0.0',
          development: true,
          pendingRequests: 0,
          pendingWebSockets: 0,
        };

        (globalThis as any).Bun = {
          serve: vi.fn((opts: any) => {
            serveErrorFn = opts.error;
            return mockServer;
          }),
        };

        const adapter = new BunAdapter(async () => new Response('ok'));
        await adapter.listen();

        expect(serveErrorFn).toBeDefined();

        const response = serveErrorFn!(new Error('server error'));
        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body.error).toBe('server error');
        expect(body.code).toBe('SERVER_ERROR');
      });

      it('should stop server on close()', async () => {
        const mockServer: BunServer = {
          stop: vi.fn(),
          port: 3000,
          hostname: '0.0.0.0',
          development: true,
          pendingRequests: 0,
          pendingWebSockets: 0,
        };

        (globalThis as any).Bun = {
          serve: vi.fn(() => mockServer),
        };

        const adapter = new BunAdapter(async () => new Response('ok'));
        await adapter.listen();
        await adapter.close();

        expect(mockServer.stop).toHaveBeenCalledOnce();
        expect(adapter.getServer()).toBeUndefined();
      });
    });
  });
});
