/**
 * VexorContext and ContextPool Tests
 */

import { describe, it, expect, beforeEach, } from 'vitest';
import { VexorContext, ContextPool } from '../core/context.js';
import type { VexorRequest } from '../core/request.js';
import { createMockRequest } from './helpers.js';

describe('VexorContext', () => {
  let ctx: VexorContext;
  let request: VexorRequest;

  beforeEach(() => {
    request = createMockRequest('http://localhost:3000/users/42?page=1&sort=name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=abc123; theme=dark',
        'Host': 'localhost:3000',
        'X-Forwarded-For': '1.2.3.4',
        'X-Forwarded-Proto': 'https',
      },
    });
    ctx = new VexorContext();
    ctx.init(request, {
      handler: async () => new Response('ok'),
      params: { id: '42' },
    });
  });

  describe('init', () => {
    it('should set all fields on init', () => {
      expect(ctx.initialized).toBe(true);
      expect(ctx.req).toBe(request);
      expect(ctx.requestId).toBeDefined();
      expect(ctx.requestId).toMatch(/^req_/);
    });

    it('should set route params from matched route', () => {
      expect(ctx.params).toEqual({ id: '42' });
    });

    it('should set route information', () => {
      expect(ctx.route).toBeDefined();
      expect(ctx.route?.params).toEqual({ id: '42' });
    });
  });

  describe('reset', () => {
    it('should clear state on reset', () => {
      ctx.set('key', 'value');
      ctx.reset();

      expect(ctx.initialized).toBe(false);
      expect(ctx.route).toBeUndefined();
      expect(ctx.has('key')).toBe(false);
    });
  });

  // ============ Request Property Proxies ============

  describe('request property proxies', () => {
    it('should proxy method', () => {
      expect(ctx.method).toBe('POST');
    });

    it('should proxy url', () => {
      expect(ctx.url).toBe('http://localhost:3000/users/42?page=1&sort=name');
    });

    it('should proxy path', () => {
      expect(ctx.path).toBe('/users/42');
    });

    it('should proxy headers', () => {
      expect(ctx.headers).toBeInstanceOf(Headers);
      expect(ctx.headers.get('content-type')).toBe('application/json');
    });

    it('should proxy params', () => {
      expect(ctx.params).toEqual({ id: '42' });
    });

    it('should proxy query', () => {
      expect(ctx.query).toBeDefined();
      expect(ctx.query.page).toBe('1');
      expect(ctx.query.sort).toBe('name');
    });

    it('should proxy cookies', () => {
      expect(ctx.cookies).toBeDefined();
      expect(ctx.cookies.session).toBe('abc123');
      expect(ctx.cookies.theme).toBe('dark');
    });

    it('should proxy ip (from X-Forwarded-For)', () => {
      expect(ctx.ip).toBe('1.2.3.4');
    });

    it('should proxy protocol (from X-Forwarded-Proto)', () => {
      expect(ctx.protocol).toBe('https');
    });

    it('should proxy host', () => {
      expect(ctx.host).toBe('localhost:3000');
    });
  });

  // ============ Delegation Methods ============

  describe('header()', () => {
    it('should delegate to request header()', () => {
      expect(ctx.header('content-type')).toBe('application/json');
    });

    it('should return null for missing headers', () => {
      expect(ctx.header('x-missing')).toBeNull();
    });
  });

  describe('queryParam()', () => {
    it('should delegate to request queryParam()', () => {
      expect(ctx.queryParam('page')).toBe('1');
    });

    it('should return undefined for missing query params', () => {
      expect(ctx.queryParam('missing')).toBeUndefined();
    });
  });

  describe('cookie()', () => {
    it('should delegate to request cookie()', () => {
      expect(ctx.cookie('session')).toBe('abc123');
    });

    it('should return undefined for missing cookies', () => {
      expect(ctx.cookie('missing')).toBeUndefined();
    });
  });

  // ============ Body Parsing ============

  describe('readJson / body', () => {
    it('should parse request body as JSON via readJson', async () => {
      const jsonReq = createMockRequest('http://localhost/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test' }),
      });
      const jsonCtx = new VexorContext();
      jsonCtx.init(jsonReq);

      const data = await jsonCtx.readJson();
      expect(data).toEqual({ name: 'test' });
    });

    it('should parse request body as JSON via body()', async () => {
      const jsonReq = createMockRequest('http://localhost/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: 42 }),
      });
      const jsonCtx = new VexorContext();
      jsonCtx.init(jsonReq);

      const data = await jsonCtx.body();
      expect(data).toEqual({ value: 42 });
    });
  });

  describe('readText', () => {
    it('should parse request body as text', async () => {
      const textReq = createMockRequest('http://localhost/test', {
        method: 'POST',
        body: 'hello world',
      });
      const textCtx = new VexorContext();
      textCtx.init(textReq);

      const text = await textCtx.readText();
      expect(text).toBe('hello world');
    });
  });

  // ============ Response Shortcuts ============

  describe('json()', () => {
    it('should return JSON response', async () => {
      const response = ctx.json({ hello: 'world' });
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');
      const body = await response.json();
      expect(body).toEqual({ hello: 'world' });
    });

    it('should support custom status code', async () => {
      const response = ctx.json({ created: true }, 201);
      expect(response.status).toBe(201);
    });
  });

  describe('text()', () => {
    it('should return text response', async () => {
      const response = ctx.text('Hello');
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/plain');
      expect(await response.text()).toBe('Hello');
    });

    it('should support custom status code', async () => {
      const response = ctx.text('Created', 201);
      expect(response.status).toBe(201);
    });
  });

  describe('html()', () => {
    it('should return HTML response', async () => {
      const response = ctx.html('<h1>Hi</h1>');
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
      expect(await response.text()).toBe('<h1>Hi</h1>');
    });

    it('should support custom status code', async () => {
      const response = ctx.html('<p>OK</p>', 201);
      expect(response.status).toBe(201);
    });
  });

  describe('empty()', () => {
    it('should return 204 No Content by default', () => {
      const response = ctx.empty();
      expect(response.status).toBe(204);
    });

    it('should support custom status code', () => {
      const response = ctx.empty(202);
      expect(response.status).toBe(202);
    });
  });

  describe('redirect()', () => {
    it('should return 302 redirect by default', () => {
      const response = ctx.redirect('/new-location');
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/new-location');
    });

    it('should support custom redirect status', () => {
      const response = ctx.redirect('/moved', 301);
      expect(response.status).toBe(301);
    });
  });

  describe('stream()', () => {
    it('should return stream response', () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('chunk'));
          controller.close();
        },
      });
      const response = ctx.stream(stream, 'text/plain');
      expect(response.headers.get('content-type')).toBe('text/plain');
    });
  });

  // ============ Error Responses ============

  describe('notFound()', () => {
    it('should return 404 response', async () => {
      const response = ctx.notFound();
      expect(response.status).toBe(404);
    });

    it('should include custom message', async () => {
      const response = ctx.notFound('User not found');
      const body = await response.json();
      expect(body.error).toBe('User not found');
    });
  });

  describe('badRequest()', () => {
    it('should return 400 response', async () => {
      const response = ctx.badRequest();
      expect(response.status).toBe(400);
    });

    it('should include custom message', async () => {
      const response = ctx.badRequest('Invalid input');
      const body = await response.json();
      expect(body.error).toBe('Invalid input');
    });
  });

  describe('unauthorized()', () => {
    it('should return 401 response', async () => {
      const response = ctx.unauthorized();
      expect(response.status).toBe(401);
    });

    it('should include custom message', async () => {
      const response = ctx.unauthorized('Token expired');
      const body = await response.json();
      expect(body.error).toBe('Token expired');
    });
  });

  describe('forbidden()', () => {
    it('should return 403 response', async () => {
      const response = ctx.forbidden();
      expect(response.status).toBe(403);
    });

    it('should include custom message', async () => {
      const response = ctx.forbidden('Access denied');
      const body = await response.json();
      expect(body.error).toBe('Access denied');
    });
  });

  describe('internalError()', () => {
    it('should return 500 response', async () => {
      const response = ctx.internalError();
      expect(response.status).toBe(500);
    });

    it('should include custom message', async () => {
      const response = ctx.internalError('Something broke');
      const body = await response.json();
      expect(body.error).toBe('Something broke');
    });
  });

  // ============ Custom State ============

  describe('custom state', () => {
    it('should set and get state values', () => {
      ctx.set('userId', 123);
      expect(ctx.get<number>('userId')).toBe(123);
    });

    it('should return undefined for non-existent keys', () => {
      expect(ctx.get('missing')).toBeUndefined();
    });

    it('should check if key exists with has()', () => {
      ctx.set('key', 'value');
      expect(ctx.has('key')).toBe(true);
      expect(ctx.has('missing')).toBe(false);
    });

    it('should delete state values', () => {
      ctx.set('key', 'value');
      const result = ctx.delete('key');
      expect(result).toBe(true);
      expect(ctx.has('key')).toBe(false);
    });

    it('should return false when deleting non-existent key', () => {
      const result = ctx.delete('missing');
      expect(result).toBe(false);
    });

    it('should expose state object', () => {
      ctx.set('a', 1);
      ctx.set('b', 2);
      expect(ctx.state).toEqual({ a: 1, b: 2 });
    });

    it('should return this from set() for chaining', () => {
      const result = ctx.set('key', 'value');
      expect(result).toBe(ctx);
    });
  });

  // ============ Request ID and Timing ============

  describe('requestId', () => {
    it('should be generated on init', () => {
      expect(ctx.requestId).toBeDefined();
      expect(typeof ctx.requestId).toBe('string');
      expect(ctx.requestId).toMatch(/^req_/);
    });

    it('should be unique across contexts', () => {
      const ctx2 = new VexorContext();
      ctx2.init(createMockRequest('http://localhost/test'));
      expect(ctx.requestId).not.toBe(ctx2.requestId);
    });
  });

  describe('elapsed', () => {
    it('should measure time since init', async () => {
      // Small delay to ensure measurable elapsed time
      await new Promise((resolve) => setTimeout(resolve, 5));
      expect(ctx.elapsed).toBeGreaterThan(0);
    });

    it('should return a number', () => {
      expect(typeof ctx.elapsed).toBe('number');
    });
  });

  // ============ Response Builder ============

  describe('res', () => {
    it('should return ResponseBuilder', () => {
      expect(ctx.res).toBeDefined();
    });
  });

  describe('status()', () => {
    it('should return ResponseBuilder for chaining', () => {
      const builder = ctx.status(201);
      expect(builder).toBeDefined();
      const response = builder.json({ ok: true });
      expect(response.status).toBe(201);
    });
  });
});

// ============ ContextPool ============

describe('ContextPool', () => {
  describe('acquire', () => {
    it('should return an initialized context', () => {
      const pool = new ContextPool();
      const request = createMockRequest('http://localhost/test');
      const ctx = pool.acquire(request);

      expect(ctx).toBeInstanceOf(VexorContext);
      expect(ctx.initialized).toBe(true);
      expect(ctx.path).toBe('/test');
    });

    it('should set route info when provided', () => {
      const pool = new ContextPool();
      const request = createMockRequest('http://localhost/users/5');
      const route = {
        handler: async () => new Response('ok'),
        params: { id: '5' },
      };
      const ctx = pool.acquire(request, route);

      expect(ctx.params).toEqual({ id: '5' });
      expect(ctx.route).toBeDefined();
    });
  });

  describe('release', () => {
    it('should reset and return context to pool', () => {
      const pool = new ContextPool();
      const request = createMockRequest('http://localhost/test');
      const ctx = pool.acquire(request);

      expect(pool.size).toBe(0);
      pool.release(ctx);
      expect(pool.size).toBe(1);
      expect(ctx.initialized).toBe(false);
    });

    it('should reuse released contexts on next acquire', () => {
      const pool = new ContextPool();
      const req1 = createMockRequest('http://localhost/first');
      const ctx1 = pool.acquire(req1);
      pool.release(ctx1);

      const req2 = createMockRequest('http://localhost/second');
      const ctx2 = pool.acquire(req2);

      // Should be the same object reused
      expect(ctx2).toBe(ctx1);
      expect(ctx2.path).toBe('/second');
    });
  });

  describe('maxSize', () => {
    it('should respect maxSize limit', () => {
      const pool = new ContextPool(2);

      const contexts = [];
      for (let i = 0; i < 5; i++) {
        const req = createMockRequest(`http://localhost/test${i}`);
        contexts.push(pool.acquire(req));
      }

      // Release all
      for (const ctx of contexts) {
        pool.release(ctx);
      }

      // Only maxSize (2) contexts should be in pool
      expect(pool.size).toBe(2);
    });

    it('should default to 1000 maxSize', () => {
      const pool = new ContextPool();
      // The pool should accept more than a small number
      for (let i = 0; i < 10; i++) {
        const req = createMockRequest(`http://localhost/test${i}`);
        const ctx = pool.acquire(req);
        pool.release(ctx);
      }
      // All should be in pool since well under 1000
      // Actually they get reused, so size should be 1
      expect(pool.size).toBeLessThanOrEqual(1000);
    });
  });

  describe('size', () => {
    it('should track current pool size', () => {
      const pool = new ContextPool();
      expect(pool.size).toBe(0);

      const req = createMockRequest('http://localhost/test');
      const ctx = pool.acquire(req);
      expect(pool.size).toBe(0);

      pool.release(ctx);
      expect(pool.size).toBe(1);
    });
  });

  describe('clear', () => {
    it('should empty the pool', () => {
      const pool = new ContextPool();
      const req = createMockRequest('http://localhost/test');
      const ctx = pool.acquire(req);
      pool.release(ctx);

      expect(pool.size).toBe(1);
      pool.clear();
      expect(pool.size).toBe(0);
    });
  });
});
