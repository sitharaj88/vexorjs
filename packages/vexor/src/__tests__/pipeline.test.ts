/**
 * Pipeline Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Pipeline, compose, when, timing, timingEnd } from '../middleware/pipeline.js';
import { createMockContext } from './helpers.js';

describe('Pipeline', () => {
  let pipeline: Pipeline;

  beforeEach(() => {
    pipeline = new Pipeline();
  });

  describe('constructor', () => {
    it('should initialize all 8 hook types', () => {
      const hookTypes = [
        'onRequest',
        'preParsing',
        'preValidation',
        'preHandler',
        'preSerialization',
        'onSend',
        'onResponse',
        'onError',
      ] as const;

      for (const type of hookTypes) {
        const hooks = pipeline.getHooks(type);
        expect(hooks).toEqual([]);
      }
    });
  });

  describe('addHook', () => {
    it('should add hooks to the correct type', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();

      pipeline.addHook('onRequest', fn1);
      pipeline.addHook('preHandler', fn2);

      expect(pipeline.getHooks('onRequest')).toHaveLength(1);
      expect(pipeline.getHooks('onRequest')[0]).toBe(fn1);
      expect(pipeline.getHooks('preHandler')).toHaveLength(1);
      expect(pipeline.getHooks('preHandler')[0]).toBe(fn2);
    });

    it('should add multiple hooks to the same type', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();

      pipeline.addHook('onRequest', fn1);
      pipeline.addHook('onRequest', fn2);

      expect(pipeline.getHooks('onRequest')).toHaveLength(2);
    });
  });

  describe('removeHook', () => {
    it('should remove a hook and return true', () => {
      const fn = vi.fn();
      pipeline.addHook('onRequest', fn);

      const result = pipeline.removeHook('onRequest', fn);

      expect(result).toBe(true);
      expect(pipeline.getHooks('onRequest')).toHaveLength(0);
    });

    it('should return false when hook is not found', () => {
      const fn = vi.fn();
      const result = pipeline.removeHook('onRequest', fn);
      expect(result).toBe(false);
    });

    it('should return false for invalid hook type', () => {
      const fn = vi.fn();
      const result = pipeline.removeHook('nonExistent' as any, fn);
      expect(result).toBe(false);
    });
  });

  describe('runHooks', () => {
    it('should run hooks in sequence', async () => {
      const order: number[] = [];

      pipeline.addHook('onRequest', async () => { order.push(1); });
      pipeline.addHook('onRequest', async () => { order.push(2); });
      pipeline.addHook('onRequest', async () => { order.push(3); });

      const ctx = createMockContext('http://localhost/test');
      await pipeline.runHooks('onRequest', ctx);

      expect(order).toEqual([1, 2, 3]);
    });

    it('should merge global and additional (route-level) hooks', async () => {
      const order: number[] = [];

      pipeline.addHook('onRequest', async () => { order.push(1); });

      const additionalHooks = [
        async () => { order.push(2); },
        async () => { order.push(3); },
      ];

      const ctx = createMockContext('http://localhost/test');
      await pipeline.runHooks('onRequest', ctx, additionalHooks);

      expect(order).toEqual([1, 2, 3]);
    });

    it('should run only global hooks when no additional hooks provided', async () => {
      const fn = vi.fn();
      pipeline.addHook('preHandler', fn);

      const ctx = createMockContext('http://localhost/test');
      await pipeline.runHooks('preHandler', ctx);

      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith(ctx);
    });
  });

  describe('execute', () => {
    it('should run full lifecycle: onRequest -> handler -> onSend -> onResponse', async () => {
      const order: string[] = [];

      pipeline.addHook('onRequest', async () => { order.push('onRequest'); });
      pipeline.addHook('preParsing', async () => { order.push('preParsing'); });
      pipeline.addHook('preValidation', async () => { order.push('preValidation'); });
      pipeline.addHook('preHandler', async () => { order.push('preHandler'); });
      pipeline.addHook('preSerialization', async () => { order.push('preSerialization'); });
      pipeline.addHook('onSend', async () => { order.push('onSend'); });
      pipeline.addHook('onResponse', async () => { order.push('onResponse'); });

      const ctx = createMockContext('http://localhost/test');
      const handler = async () => {
        order.push('handler');
        return new Response('ok');
      };

      const response = await pipeline.execute(ctx, handler);

      expect(response.status).toBe(200);
      // onResponse is fire-and-forget, so it may happen asynchronously
      expect(order.slice(0, 7)).toEqual([
        'onRequest',
        'preParsing',
        'preValidation',
        'preHandler',
        'handler',
        'preSerialization',
        'onSend',
      ]);
    });

    it('should pass route-level hooks through routeHooks', async () => {
      const order: string[] = [];

      pipeline.addHook('onRequest', async () => { order.push('global-onRequest'); });

      const routeHooks = {
        onRequest: [async () => { order.push('route-onRequest'); }],
        preHandler: [async () => { order.push('route-preHandler'); }],
      };

      const ctx = createMockContext('http://localhost/test');
      const handler = async () => new Response('ok');

      await pipeline.execute(ctx, handler, routeHooks);

      expect(order).toContain('global-onRequest');
      expect(order).toContain('route-onRequest');
      expect(order).toContain('route-preHandler');
    });

    it('should catch errors and delegate to handleError', async () => {
      const ctx = createMockContext('http://localhost/test');
      const handler = async () => {
        throw new Error('test error');
      };

      const response = await pipeline.execute(ctx, handler);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe('test error');
      expect(body.code).toBe('INTERNAL_ERROR');
    });

    it('should apply queued response headers (e.g. CORS) to response', async () => {
      const ctx = createMockContext('http://localhost/test');

      // Simulate CORS middleware queueing headers on the context
      pipeline.addHook('onRequest', async (c) => {
        c.mergeResponseHeaders({
          'Access-Control-Allow-Origin': 'http://example.com',
          'Access-Control-Allow-Credentials': 'true',
        });
      });

      const handler = async () => new Response('ok');
      const response = await pipeline.execute(ctx, handler);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://example.com');
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });
  });

  describe('setErrorHandler', () => {
    it('should use custom error handler', async () => {
      pipeline.setErrorHandler(async (error) => {
        return new Response(JSON.stringify({ custom: error.message }), {
          status: 418,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      const ctx = createMockContext('http://localhost/test');
      const response = await pipeline.handleError(new Error('teapot'), ctx);

      expect(response.status).toBe(418);
      const body = await response.json();
      expect(body.custom).toBe('teapot');
    });

    it('should fall back to default if custom error handler throws', async () => {
      pipeline.setErrorHandler(async () => {
        throw new Error('handler failed');
      });

      const ctx = createMockContext('http://localhost/test');
      const response = await pipeline.handleError(new Error('original'), ctx);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('original');
    });
  });

  describe('handleError', () => {
    it('should return a 500 JSON response by default', async () => {
      const ctx = createMockContext('http://localhost/test');
      const response = await pipeline.handleError(new Error('something broke'), ctx);

      expect(response.status).toBe(500);
      expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');

      const body = await response.json();
      expect(body.error).toBe('something broke');
      expect(body.code).toBe('INTERNAL_ERROR');
    });

    it('should run onError hooks before handling', async () => {
      const onErrorFn = vi.fn();
      pipeline.addHook('onError', onErrorFn);

      const ctx = createMockContext('http://localhost/test');
      await pipeline.handleError(new Error('fail'), ctx);

      expect(onErrorFn).toHaveBeenCalledOnce();
    });
  });

  describe('clone', () => {
    it('should create an independent copy of the pipeline', () => {
      const fn = vi.fn();
      pipeline.addHook('onRequest', fn);

      const cloned = pipeline.clone();

      // Cloned should have the same hooks
      expect(cloned.getHooks('onRequest')).toHaveLength(1);
      expect(cloned.getHooks('onRequest')[0]).toBe(fn);

      // Adding to original should not affect clone
      pipeline.addHook('onRequest', vi.fn());
      expect(pipeline.getHooks('onRequest')).toHaveLength(2);
      expect(cloned.getHooks('onRequest')).toHaveLength(1);
    });

    it('should clone the error handler', async () => {
      const customHandler = vi.fn(async () => new Response('custom', { status: 418 }));
      pipeline.setErrorHandler(customHandler);

      const cloned = pipeline.clone();
      const ctx = createMockContext('http://localhost/test');
      const response = await cloned.handleError(new Error('test'), ctx);

      expect(response.status).toBe(418);
      expect(customHandler).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should remove all hooks', () => {
      pipeline.addHook('onRequest', vi.fn());
      pipeline.addHook('preHandler', vi.fn());
      pipeline.addHook('onSend', vi.fn());

      pipeline.clear();

      expect(pipeline.getHooks('onRequest')).toHaveLength(0);
      expect(pipeline.getHooks('preHandler')).toHaveLength(0);
      expect(pipeline.getHooks('onSend')).toHaveLength(0);
    });
  });

  describe('getHooks', () => {
    it('should return a copy of hooks (not the original array)', () => {
      const fn = vi.fn();
      pipeline.addHook('onRequest', fn);

      const hooks = pipeline.getHooks('onRequest');
      hooks.push(vi.fn()); // mutate the returned copy

      // Original should not be affected
      expect(pipeline.getHooks('onRequest')).toHaveLength(1);
    });
  });
});

describe('compose', () => {
  it('should chain multiple middleware into one', async () => {
    const order: number[] = [];

    const m1 = async () => { order.push(1); };
    const m2 = async () => { order.push(2); };
    const m3 = async () => { order.push(3); };

    const composed = compose(m1, m2, m3);
    const ctx = createMockContext('http://localhost/test');

    await composed(ctx);

    expect(order).toEqual([1, 2, 3]);
  });

  it('should pass context to each middleware', async () => {
    const spy1 = vi.fn();
    const spy2 = vi.fn();

    const composed = compose(spy1, spy2);
    const ctx = createMockContext('http://localhost/test');

    await composed(ctx);

    expect(spy1).toHaveBeenCalledWith(ctx);
    expect(spy2).toHaveBeenCalledWith(ctx);
  });
});

describe('when', () => {
  it('should run middleware when condition is true', async () => {
    const middleware = vi.fn();
    const conditional = when(() => true, middleware);

    const ctx = createMockContext('http://localhost/test');
    await conditional(ctx);

    expect(middleware).toHaveBeenCalledOnce();
  });

  it('should skip middleware when condition is false', async () => {
    const middleware = vi.fn();
    const conditional = when(() => false, middleware);

    const ctx = createMockContext('http://localhost/test');
    await conditional(ctx);

    expect(middleware).not.toHaveBeenCalled();
  });

  it('should pass context to condition function', async () => {
    const middleware = vi.fn();
    const conditional = when(
      (ctx) => ctx.method === 'POST',
      middleware
    );

    const getCtx = createMockContext('http://localhost/test');
    await conditional(getCtx);
    expect(middleware).not.toHaveBeenCalled();

    const postCtx = createMockContext('http://localhost/test', { method: 'POST' });
    await conditional(postCtx);
    expect(middleware).toHaveBeenCalledOnce();
  });
});

describe('timing / timingEnd', () => {
  it('should measure execution time between timing and timingEnd', async () => {
    const startHook = timing('db-query');
    const endHook = timingEnd('db-query');

    const ctx = createMockContext('http://localhost/test');

    await startHook(ctx);
    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 10));
    await endHook(ctx);

    const duration = ctx.get<number>('timing:db-query:duration');
    expect(duration).toBeDefined();
    expect(duration).toBeGreaterThanOrEqual(0);
  });

  it('should store start time in context', async () => {
    const startHook = timing('render');
    const ctx = createMockContext('http://localhost/test');

    await startHook(ctx);

    const start = ctx.get<number>('timing:render:start');
    expect(start).toBeDefined();
    expect(typeof start).toBe('number');
  });

  it('should not set duration if timing was never started', async () => {
    const endHook = timingEnd('never-started');
    const ctx = createMockContext('http://localhost/test');

    await endHook(ctx);

    const duration = ctx.get<number>('timing:never-started:duration');
    expect(duration).toBeUndefined();
  });
});
