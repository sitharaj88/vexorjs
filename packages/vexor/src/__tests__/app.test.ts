/**
 * Vexor Application Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Vexor, createApp } from '../core/app.js';
import { createMockRequest } from './helpers.js';

describe('Vexor', () => {
  let app: Vexor;

  beforeEach(() => {
    app = new Vexor();
  });

  describe('constructor', () => {
    it('should create a new app instance', () => {
      const instance = new Vexor();
      expect(instance).toBeInstanceOf(Vexor);
    });

    it('should accept options', () => {
      const instance = new Vexor({ port: 4000, host: '127.0.0.1' });
      expect(instance).toBeInstanceOf(Vexor);
    });
  });

  describe('createApp factory', () => {
    it('should return a Vexor instance', () => {
      const instance = createApp();
      expect(instance).toBeInstanceOf(Vexor);
    });

    it('should pass options through', () => {
      const instance = createApp({ port: 5000 });
      expect(instance).toBeInstanceOf(Vexor);
    });
  });

  // ============ Route Registration ============

  describe('route registration', () => {
    it('should register a GET route', () => {
      app.get('/test', async (ctx) => ctx.text('ok'));
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'GET', path: '/test' });
    });

    it('should register a POST route', () => {
      app.post('/test', async (ctx) => ctx.text('ok'));
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'POST', path: '/test' });
    });

    it('should register a PUT route', () => {
      app.put('/test', async (ctx) => ctx.text('ok'));
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'PUT', path: '/test' });
    });

    it('should register a DELETE route', () => {
      app.delete('/test', async (ctx) => ctx.text('ok'));
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'DELETE', path: '/test' });
    });

    it('should register a PATCH route', () => {
      app.patch('/test', async (ctx) => ctx.text('ok'));
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'PATCH', path: '/test' });
    });

    it('should register a HEAD route', () => {
      app.head('/test', async (ctx) => ctx.empty());
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'HEAD', path: '/test' });
    });

    it('should register an OPTIONS route', () => {
      app.options('/test', async (ctx) => ctx.empty());
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'OPTIONS', path: '/test' });
    });

    it('should return this for chaining', () => {
      const result = app.get('/a', async (ctx) => ctx.text('ok'));
      expect(result).toBe(app);
    });
  });

  describe('route with schema/hooks options overload', () => {
    it('should register a route with schema option', () => {
      app.get('/users', { schema: { query: { type: 'object' } as any } }, async (ctx) => ctx.json({}));
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'GET', path: '/users' });
    });

    it('should register a route with hooks option', () => {
      const preHandler = async () => {};
      app.post(
        '/users',
        { hooks: { preHandler: [preHandler] } },
        async (ctx) => ctx.json({})
      );
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'POST', path: '/users' });
    });

    it('should register a route with both schema and hooks', () => {
      app.put(
        '/users/:id',
        {
          schema: { body: { type: 'object' } as any },
          hooks: { preHandler: [async () => {}] },
        },
        async (ctx) => ctx.json({})
      );
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'PUT', path: '/users/:id' });
    });
  });

  describe('all()', () => {
    it('should register for all HTTP methods', () => {
      app.all('/health', async (ctx) => ctx.text('ok'));
      const routes = app.getRoutes();
      const methods = routes.filter((r) => r.path === '/health').map((r) => r.method);
      expect(methods).toContain('GET');
      expect(methods).toContain('POST');
      expect(methods).toContain('PUT');
      expect(methods).toContain('DELETE');
      expect(methods).toContain('PATCH');
      expect(methods).toContain('HEAD');
      expect(methods).toContain('OPTIONS');
      expect(methods).toHaveLength(7);
    });

    it('should support options overload', () => {
      app.all('/health', {}, async (ctx) => ctx.text('ok'));
      const routes = app.getRoutes();
      const methods = routes.filter((r) => r.path === '/health').map((r) => r.method);
      expect(methods).toHaveLength(7);
    });
  });

  // ============ Groups ============

  describe('group()', () => {
    it('should create route prefix', () => {
      app.group('/api', (router) => {
        router.get('/users', async (ctx) => ctx.json([]));
        router.post('/users', async (ctx) => ctx.json({}));
      });

      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'GET', path: '/api/users' });
      expect(routes).toContainEqual({ method: 'POST', path: '/api/users' });
    });

    it('should support nested groups', () => {
      app.group('/api', (router) => {
        router.group('/v1', (v1) => {
          v1.get('/users', async (ctx) => ctx.json([]));
        });
      });

      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'GET', path: '/api/v1/users' });
    });

    it('should restore prefix after callback', () => {
      app.group('/api', (router) => {
        router.get('/users', async (ctx) => ctx.json([]));
      });
      app.get('/health', async (ctx) => ctx.text('ok'));

      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'GET', path: '/health' });
    });

    it('should return this for chaining', () => {
      const result = app.group('/api', () => {});
      expect(result).toBe(app);
    });
  });

  // ============ Middleware & Hooks ============

  describe('use()', () => {
    it('should add onRequest middleware', async () => {
      const fn = vi.fn();
      app.use(fn);

      app.get('/test', async (ctx) => ctx.text('ok'));

      const request = createMockRequest('http://localhost/test');
      await app.handle(request);

      expect(fn).toHaveBeenCalled();
    });

    it('should return this for chaining', () => {
      const result = app.use(async () => {});
      expect(result).toBe(app);
    });
  });

  describe('addHook()', () => {
    it('should add hook to pipeline', async () => {
      const fn = vi.fn();
      app.addHook('preHandler', fn);

      app.get('/test', async (ctx) => ctx.text('ok'));

      const request = createMockRequest('http://localhost/test');
      await app.handle(request);

      expect(fn).toHaveBeenCalled();
    });

    it('should return this for chaining', () => {
      const result = app.addHook('onRequest', async () => {});
      expect(result).toBe(app);
    });
  });

  describe('setErrorHandler()', () => {
    it('should set custom error handler', async () => {
      app.setErrorHandler(async (error, ctx) => {
        return ctx.json({ custom: error.message }, 418);
      });

      app.get('/fail', async () => {
        throw new Error('test error');
      });

      const request = createMockRequest('http://localhost/fail');
      const response = await app.handle(request);

      expect(response.status).toBe(418);
      const body = await response.json();
      expect(body.custom).toBe('test error');
    });

    it('should return this for chaining', () => {
      const result = app.setErrorHandler(async (_err, ctx) => ctx.text('error'));
      expect(result).toBe(app);
    });
  });

  // ============ Request Handling ============

  describe('handle()', () => {
    it('should find matching route and execute handler', async () => {
      app.get('/hello', async (ctx) => ctx.text('Hello World'));

      const request = createMockRequest('http://localhost/hello');
      const response = await app.handle(request);

      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).toBe('Hello World');
    });

    it('should return 404 for non-existent routes', async () => {
      app.get('/exists', async (ctx) => ctx.text('ok'));

      const request = createMockRequest('http://localhost/not-found');
      const response = await app.handle(request);

      expect(response.status).toBe(404);
    });

    it('should pass route params to context', async () => {
      app.get('/users/:id', async (ctx) => ctx.json({ id: ctx.params.id }));

      const request = createMockRequest('http://localhost/users/42');
      const response = await app.handle(request);

      const body = await response.json();
      expect(body.id).toBe('42');
    });

    it('should run middleware pipeline hooks', async () => {
      const order: string[] = [];

      app.addHook('onRequest', async () => { order.push('onRequest'); });
      app.addHook('preHandler', async () => { order.push('preHandler'); });

      app.get('/test', async (ctx) => {
        order.push('handler');
        return ctx.text('ok');
      });

      const request = createMockRequest('http://localhost/test');
      await app.handle(request);

      expect(order).toEqual(['onRequest', 'preHandler', 'handler']);
    });

    it('should match correct HTTP method', async () => {
      app.get('/resource', async (ctx) => ctx.text('GET'));
      app.post('/resource', async (ctx) => ctx.text('POST'));

      const getReq = createMockRequest('http://localhost/resource');
      const getResp = await app.handle(getReq);
      expect(await getResp.text()).toBe('GET');

      const postReq = createMockRequest('http://localhost/resource', { method: 'POST' });
      const postResp = await app.handle(postReq);
      expect(await postResp.text()).toBe('POST');
    });
  });

  describe('fetch()', () => {
    it('should convert native Request to VexorRequest and handle', async () => {
      app.get('/hello', async (ctx) => ctx.text('world'));

      const nativeReq = new Request('http://localhost/hello');
      const response = await app.fetch(nativeReq);

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('world');
    });

    it('should return 404 for unmatched fetch', async () => {
      const nativeReq = new Request('http://localhost/nothing');
      const response = await app.fetch(nativeReq);

      expect(response.status).toBe(404);
    });
  });

  // ============ Utilities ============

  describe('getRoutes()', () => {
    it('should return all registered routes', () => {
      app.get('/a', async (ctx) => ctx.text('a'));
      app.post('/b', async (ctx) => ctx.text('b'));
      app.delete('/c', async (ctx) => ctx.text('c'));

      const routes = app.getRoutes();
      expect(routes).toHaveLength(3);
      expect(routes).toContainEqual({ method: 'GET', path: '/a' });
      expect(routes).toContainEqual({ method: 'POST', path: '/b' });
      expect(routes).toContainEqual({ method: 'DELETE', path: '/c' });
    });

    it('should return empty array for fresh app', () => {
      expect(app.getRoutes()).toEqual([]);
    });
  });

  describe('reset()', () => {
    it('should clear router and pipeline', async () => {
      app.get('/test', async (ctx) => ctx.text('ok'));
      app.use(async () => {});

      app.reset();

      expect(app.getRoutes()).toEqual([]);

      // Verify routes are cleared by checking handle returns 404
      const request = createMockRequest('http://localhost/test');
      const response = await app.handle(request);
      expect(response.status).toBe(404);
    });
  });

  describe('getPoolStats()', () => {
    it('should return context pool stats', () => {
      const stats = app.getPoolStats();
      expect(stats).toBeDefined();
      expect(typeof stats.size).toBe('number');
    });

    it('should have size 0 initially', () => {
      expect(app.getPoolStats().size).toBe(0);
    });

    it('should return pool back after handling request', async () => {
      app.get('/test', async (ctx) => ctx.text('ok'));

      const request = createMockRequest('http://localhost/test');
      await app.handle(request);

      // After handling, context should be released back to pool
      expect(app.getPoolStats().size).toBe(1);
    });
  });

  describe('register()', () => {
    it('should be an alias for group()', () => {
      app.register('/api', (router) => {
        router.get('/items', async (ctx) => ctx.json([]));
      });

      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'GET', path: '/api/items' });
    });
  });
});
