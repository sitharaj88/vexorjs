/**
 * Deno Adapter Tests
 *
 * Since we cannot run in Deno runtime during Node.js tests,
 * we test conversion logic, constructor, capabilities, runtime
 * detection, and helper utilities. The listen() method is tested
 * to verify it throws when Deno global is absent.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  DenoAdapter,
  createDenoAdapter,
  isDeno,
  getDenoVersion,
  getEnv,
  DenoDeployHelpers,
  denoCapabilities,
  denoRuntime,
} from '../adapters/deno.js';
import type { DenoServer } from '../adapters/deno.js';
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

function createMockDenoGlobal(overrides: Record<string, unknown> = {}) {
  return {
    serve: vi.fn(() => ({
      finished: Promise.resolve(),
      shutdown: vi.fn(async () => {}),
      ref: vi.fn(),
      unref: vi.fn(),
    })),
    version: { deno: '1.40.0', v8: '12.0', typescript: '5.3' },
    env: {
      get: vi.fn((_key: string) => undefined),
      set: vi.fn(),
      delete: vi.fn(),
      toObject: vi.fn(() => ({})),
    },
    readTextFile: vi.fn(),
    writeTextFile: vi.fn(),
    cwd: vi.fn(() => '/'),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Deno Adapter', () => {
  afterEach(() => {
    delete (globalThis as any).Deno;
  });

  describe('denoCapabilities', () => {
    it('should expose correct capabilities', () => {
      expect(denoCapabilities.streaming).toBe(true);
      expect(denoCapabilities.websocket).toBe(true);
      expect(denoCapabilities.http2).toBe(true);
      expect(denoCapabilities.workerThreads).toBe(false);
      expect(denoCapabilities.fileSystem).toBe(true);
    });
  });

  describe('denoRuntime', () => {
    it('should be "deno"', () => {
      expect(denoRuntime).toBe('deno');
    });
  });

  // -----------------------------------------------------------------------
  // isDeno
  // -----------------------------------------------------------------------
  describe('isDeno', () => {
    it('should return false in Node.js environment', () => {
      expect(isDeno()).toBe(false);
    });

    it('should return true when Deno global is present', () => {
      (globalThis as any).Deno = createMockDenoGlobal();
      expect(isDeno()).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // getDenoVersion
  // -----------------------------------------------------------------------
  describe('getDenoVersion', () => {
    it('should return null when Deno is not available', () => {
      expect(getDenoVersion()).toBeNull();
    });

    it('should return the Deno version string', () => {
      (globalThis as any).Deno = createMockDenoGlobal();
      expect(getDenoVersion()).toBe('1.40.0');
    });
  });

  // -----------------------------------------------------------------------
  // getEnv
  // -----------------------------------------------------------------------
  describe('getEnv', () => {
    it('should return undefined when Deno is not available', () => {
      expect(getEnv('TEST_VAR')).toBeUndefined();
    });

    it('should call Deno.env.get with the key', () => {
      const denoMock = createMockDenoGlobal();
      denoMock.env.get = vi.fn((key: string) => {
        if (key === 'MY_VAR') return 'my_value';
        return undefined;
      });
      (globalThis as any).Deno = denoMock;

      expect(getEnv('MY_VAR')).toBe('my_value');
      expect(getEnv('MISSING')).toBeUndefined();
    });
  });

  // -----------------------------------------------------------------------
  // DenoDeployHelpers
  // -----------------------------------------------------------------------
  describe('DenoDeployHelpers', () => {
    describe('isDenoDeployed', () => {
      it('should return false when Deno is not available', () => {
        expect(DenoDeployHelpers.isDenoDeployed()).toBe(false);
      });

      it('should return true when DENO_DEPLOYMENT_ID is set', () => {
        const denoMock = createMockDenoGlobal();
        denoMock.env.get = vi.fn((key: string) => {
          if (key === 'DENO_DEPLOYMENT_ID') return 'deploy-abc';
          return undefined;
        });
        (globalThis as any).Deno = denoMock;

        expect(DenoDeployHelpers.isDenoDeployed()).toBe(true);
      });

      it('should return false when DENO_DEPLOYMENT_ID is not set', () => {
        (globalThis as any).Deno = createMockDenoGlobal();
        expect(DenoDeployHelpers.isDenoDeployed()).toBe(false);
      });
    });

    describe('getDeploymentId', () => {
      it('should return undefined when not on Deno Deploy', () => {
        expect(DenoDeployHelpers.getDeploymentId()).toBeUndefined();
      });

      it('should return the deployment ID', () => {
        const denoMock = createMockDenoGlobal();
        denoMock.env.get = vi.fn((key: string) => {
          if (key === 'DENO_DEPLOYMENT_ID') return 'abc123';
          return undefined;
        });
        (globalThis as any).Deno = denoMock;

        expect(DenoDeployHelpers.getDeploymentId()).toBe('abc123');
      });
    });

    describe('getRegion', () => {
      it('should return undefined when not on Deno Deploy', () => {
        expect(DenoDeployHelpers.getRegion()).toBeUndefined();
      });

      it('should return the region', () => {
        const denoMock = createMockDenoGlobal();
        denoMock.env.get = vi.fn((key: string) => {
          if (key === 'DENO_REGION') return 'us-east-1';
          return undefined;
        });
        (globalThis as any).Deno = denoMock;

        expect(DenoDeployHelpers.getRegion()).toBe('us-east-1');
      });
    });
  });

  // -----------------------------------------------------------------------
  // DenoAdapter class
  // -----------------------------------------------------------------------
  describe('DenoAdapter', () => {
    it('should be constructed with a Vexor app', () => {
      const adapter = new DenoAdapter(createMockApp());
      expect(adapter).toBeDefined();
    });

    it('should expose runtime type', () => {
      const adapter = new DenoAdapter(createMockApp());
      expect(adapter.runtime).toBe('deno');
    });

    it('should expose capabilities', () => {
      const adapter = new DenoAdapter(createMockApp());
      expect(adapter.capabilities).toEqual(denoCapabilities);
    });

    describe('createHandler', () => {
      it('should return an async function', () => {
        const adapter = new DenoAdapter(createMockApp());
        const handler = adapter.createHandler();
        expect(typeof handler).toBe('function');
      });

      it('should handle requests by calling app.handle', async () => {
        const app = createMockApp('deno response');
        const adapter = new DenoAdapter(app);
        const handler = adapter.createHandler();

        const response = await handler(
          new Request('https://example.com/test')
        );

        expect(response.status).toBe(200);
        expect(await response.text()).toBe('deno response');
        expect(app.handle).toHaveBeenCalledOnce();
      });

      it('should accept optional connInfo parameter', async () => {
        const app = createMockApp('with conn info');
        const adapter = new DenoAdapter(app);
        const handler = adapter.createHandler();

        const connInfo = {
          remoteAddr: { hostname: '1.2.3.4', port: 12345, transport: 'tcp' as const },
          localAddr: { hostname: '0.0.0.0', port: 3000, transport: 'tcp' as const },
        };

        const response = await handler(
          new Request('https://example.com/'),
          connInfo
        );

        expect(response.status).toBe(200);
      });

      it('should return 500 on handler error', async () => {
        const app = {
          handle: vi.fn(async () => {
            throw new Error('deno boom');
          }),
        } as unknown as Vexor;

        const adapter = new DenoAdapter(app);
        const handler = adapter.createHandler();

        const response = await handler(
          new Request('https://example.com/')
        );

        expect(response.status).toBe(500);
        expect(await response.text()).toBe('Internal Server Error');
      });
    });

    describe('listen', () => {
      it('should throw when Deno global is not available', async () => {
        const adapter = new DenoAdapter(createMockApp());
        await expect(adapter.listen()).rejects.toThrow(
          'Deno runtime not available'
        );
      });

      it('should call Deno.serve with correct options', async () => {
        const mockServer: DenoServer = {
          finished: Promise.resolve(),
          shutdown: vi.fn(async () => {}),
          ref: vi.fn(),
          unref: vi.fn(),
        };

        const denoMock = createMockDenoGlobal({
          serve: vi.fn(() => mockServer),
        });
        (globalThis as any).Deno = denoMock;

        const adapter = new DenoAdapter(createMockApp());
        const server = await adapter.listen({
          port: 8080,
          hostname: '127.0.0.1',
        });

        expect(server).toBe(mockServer);
        expect(denoMock.serve).toHaveBeenCalledOnce();

        const serveOpts = (denoMock.serve as any).mock.calls[0][0];
        expect(serveOpts.port).toBe(8080);
        expect(serveOpts.hostname).toBe('127.0.0.1');
      });

      it('should pass TLS options when provided', async () => {
        const mockServer: DenoServer = {
          finished: Promise.resolve(),
          shutdown: vi.fn(async () => {}),
          ref: vi.fn(),
          unref: vi.fn(),
        };

        const denoMock = createMockDenoGlobal({
          serve: vi.fn(() => mockServer),
        });
        (globalThis as any).Deno = denoMock;

        const adapter = new DenoAdapter(createMockApp());
        await adapter.listen({
          tls: { cert: 'cert-data', key: 'key-data' },
        });

        const serveOpts = (denoMock.serve as any).mock.calls[0][0];
        expect(serveOpts.cert).toBe('cert-data');
        expect(serveOpts.key).toBe('key-data');
      });

      it('should pass signal when provided', async () => {
        const mockServer: DenoServer = {
          finished: Promise.resolve(),
          shutdown: vi.fn(async () => {}),
          ref: vi.fn(),
          unref: vi.fn(),
        };

        const denoMock = createMockDenoGlobal({
          serve: vi.fn(() => mockServer),
        });
        (globalThis as any).Deno = denoMock;

        const controller = new AbortController();
        const adapter = new DenoAdapter(createMockApp());
        await adapter.listen({ signal: controller.signal });

        const serveOpts = (denoMock.serve as any).mock.calls[0][0];
        expect(serveOpts.signal).toBe(controller.signal);
      });

      it('should invoke the request handler passed to Deno.serve', async () => {
        let capturedHandler: ((req: Request) => Promise<Response>) | undefined;

        const mockServer: DenoServer = {
          finished: Promise.resolve(),
          shutdown: vi.fn(async () => {}),
          ref: vi.fn(),
          unref: vi.fn(),
        };

        const denoMock = createMockDenoGlobal({
          serve: vi.fn((opts: any) => {
            capturedHandler = opts.handler;
            return mockServer;
          }),
        });
        (globalThis as any).Deno = denoMock;

        const app = createMockApp('deno served');
        const adapter = new DenoAdapter(app);
        await adapter.listen();

        expect(capturedHandler).toBeDefined();

        const response = await capturedHandler!(
          new Request('https://example.com/path'),
          {
            remoteAddr: { hostname: '10.0.0.1', port: 5000, transport: 'tcp' },
            localAddr: { hostname: '0.0.0.0', port: 3000, transport: 'tcp' },
          } as any
        );

        expect(response.status).toBe(200);
        expect(await response.text()).toBe('deno served');
      });
    });

    describe('close', () => {
      it('should resolve when no server is running', async () => {
        const adapter = new DenoAdapter(createMockApp());
        await expect(adapter.close()).resolves.toBeUndefined();
      });

      it('should call server.shutdown()', async () => {
        const shutdownFn = vi.fn(async () => {});
        const mockServer: DenoServer = {
          finished: Promise.resolve(),
          shutdown: shutdownFn,
          ref: vi.fn(),
          unref: vi.fn(),
        };

        const denoMock = createMockDenoGlobal({
          serve: vi.fn(() => mockServer),
        });
        (globalThis as any).Deno = denoMock;

        const adapter = new DenoAdapter(createMockApp());
        await adapter.listen();
        await adapter.close();

        expect(shutdownFn).toHaveBeenCalledOnce();
      });
    });

    describe('finished', () => {
      it('should resolve when no server is running', async () => {
        const adapter = new DenoAdapter(createMockApp());
        await expect(adapter.finished()).resolves.toBeUndefined();
      });

      it('should await server.finished', async () => {
        let resolveFinished: () => void;
        const finishedPromise = new Promise<void>((resolve) => {
          resolveFinished = resolve;
        });

        const mockServer: DenoServer = {
          finished: finishedPromise,
          shutdown: vi.fn(async () => {}),
          ref: vi.fn(),
          unref: vi.fn(),
        };

        const denoMock = createMockDenoGlobal({
          serve: vi.fn(() => mockServer),
        });
        (globalThis as any).Deno = denoMock;

        const adapter = new DenoAdapter(createMockApp());
        await adapter.listen();

        let resolved = false;
        const waitPromise = adapter.finished().then(() => {
          resolved = true;
        });

        // Not resolved yet
        await new Promise((r) => setTimeout(r, 10));
        expect(resolved).toBe(false);

        // Resolve the server's finished promise
        resolveFinished!();
        await waitPromise;
        expect(resolved).toBe(true);
      });
    });
  });

  // -----------------------------------------------------------------------
  // Factory function
  // -----------------------------------------------------------------------
  describe('createDenoAdapter', () => {
    it('should create a DenoAdapter instance', () => {
      const adapter = createDenoAdapter(createMockApp());
      expect(adapter).toBeInstanceOf(DenoAdapter);
    });
  });
});
