/**
 * Debug Module Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerDebugRoutes, debugMiddleware } from '../observability/debug.js';
import { Vexor } from '../core/app.js';
import { createMockRequest, createMockContext } from './helpers.js';

describe('registerDebugRoutes', () => {
  let app: Vexor;

  beforeEach(() => {
    app = new Vexor();
  });

  describe('default options', () => {
    it('should register debug index route at /__debug', () => {
      registerDebugRoutes(app);
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'GET', path: '/__debug' });
    });

    it('should register routes endpoint', () => {
      registerDebugRoutes(app);
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'GET', path: '/__debug/routes' });
      expect(routes).toContainEqual({ method: 'GET', path: '/__debug/routes.json' });
    });

    it('should register metrics endpoint', () => {
      registerDebugRoutes(app);
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'GET', path: '/__debug/metrics' });
      expect(routes).toContainEqual({ method: 'GET', path: '/__debug/metrics.json' });
    });

    it('should register health endpoint', () => {
      registerDebugRoutes(app);
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'GET', path: '/__debug/health' });
    });

    it('should not register config endpoint by default', () => {
      registerDebugRoutes(app);
      const routes = app.getRoutes();
      const configRoute = routes.find((r) => r.path === '/__debug/config');
      expect(configRoute).toBeUndefined();
    });
  });

  describe('custom basePath', () => {
    it('should register routes at custom base path', () => {
      registerDebugRoutes(app, { basePath: '/_dev' });
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'GET', path: '/_dev' });
      expect(routes).toContainEqual({ method: 'GET', path: '/_dev/routes' });
      expect(routes).toContainEqual({ method: 'GET', path: '/_dev/health' });
    });
  });

  describe('disabling endpoints', () => {
    it('should not register routes endpoint when routes=false', () => {
      registerDebugRoutes(app, { routes: false });
      const routes = app.getRoutes();
      const routesEndpoint = routes.find((r) => r.path === '/__debug/routes');
      expect(routesEndpoint).toBeUndefined();
    });

    it('should not register metrics endpoint when metrics=false', () => {
      registerDebugRoutes(app, { metrics: false });
      const routes = app.getRoutes();
      const metricsEndpoint = routes.find((r) => r.path === '/__debug/metrics');
      expect(metricsEndpoint).toBeUndefined();
    });

    it('should not register health endpoint when health=false', () => {
      registerDebugRoutes(app, { health: false });
      const routes = app.getRoutes();
      const healthEndpoint = routes.find((r) => r.path === '/__debug/health');
      expect(healthEndpoint).toBeUndefined();
    });
  });

  describe('config endpoint', () => {
    it('should register config endpoint when config=true', () => {
      registerDebugRoutes(app, { config: true });
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'GET', path: '/__debug/config' });
    });
  });

  describe('custom endpoints', () => {
    it('should register custom endpoints', () => {
      registerDebugRoutes(app, {
        custom: {
          version: () => ({ version: '1.0.0' }),
          status: () => ({ running: true }),
        },
      });
      const routes = app.getRoutes();
      expect(routes).toContainEqual({ method: 'GET', path: '/__debug/version' });
      expect(routes).toContainEqual({ method: 'GET', path: '/__debug/status' });
    });
  });

  // ============ Response Content ============

  describe('debug index response', () => {
    it('should return HTML page with debug info', async () => {
      registerDebugRoutes(app);

      const request = createMockRequest('http://localhost/__debug');
      const response = await app.handle(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');

      const html = await response.text();
      expect(html).toContain('Vexor Debug');
      expect(html).toContain('Quick Stats');
    });
  });

  describe('routes endpoint response', () => {
    it('should return HTML with routes table', async () => {
      app.get('/api/users', async (ctx) => ctx.json([]));
      registerDebugRoutes(app);

      const request = createMockRequest('http://localhost/__debug/routes');
      const response = await app.handle(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
      const html = await response.text();
      expect(html).toContain('Routes');
    });

    it('should return JSON from routes.json endpoint', async () => {
      app.get('/api/users', async (ctx) => ctx.json([]));
      registerDebugRoutes(app);

      const request = createMockRequest('http://localhost/__debug/routes.json');
      const response = await app.handle(request);

      expect(response.status).toBe(200);
    });
  });

  describe('health endpoint response', () => {
    it('should return health check JSON', async () => {
      registerDebugRoutes(app);

      const request = createMockRequest('http://localhost/__debug/health');
      const response = await app.handle(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.status).toBe('healthy');
      expect(body.uptime).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.memory).toBeDefined();
      expect(body.memory.rss).toBeDefined();
      expect(body.memory.heapUsed).toBeDefined();
      expect(body.pid).toBe(process.pid);
    });
  });

  describe('metrics endpoint response', () => {
    it('should return prometheus-formatted metrics', async () => {
      registerDebugRoutes(app);

      const request = createMockRequest('http://localhost/__debug/metrics');
      const response = await app.handle(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/plain');
    });
  });

  describe('config endpoint response', () => {
    it('should return config JSON when enabled', async () => {
      registerDebugRoutes(app, { config: true });

      const request = createMockRequest('http://localhost/__debug/config');
      const response = await app.handle(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toBeDefined();
    });
  });

  describe('custom endpoint response', () => {
    it('should return custom handler result as JSON', async () => {
      registerDebugRoutes(app, {
        custom: {
          info: () => ({ app: 'test', version: '2.0' }),
        },
      });

      const request = createMockRequest('http://localhost/__debug/info');
      const response = await app.handle(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.app).toBe('test');
      expect(body.version).toBe('2.0');
    });
  });
});

// ============================================================================
// Debug Middleware
// ============================================================================

describe('debugMiddleware', () => {
  it('should return a middleware function', () => {
    const middleware = debugMiddleware();
    expect(typeof middleware).toBe('function');
  });

  it('should call next() and return response', async () => {
    const middleware = debugMiddleware();
    const ctx = createMockContext('http://localhost/test');
    const next = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));

    const response = await middleware(ctx, next);

    expect(next).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
  });

  it('should add X-Response-Time header in non-production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    try {
      const middleware = debugMiddleware();
      const ctx = createMockContext('http://localhost/test');
      const next = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));

      const response = await middleware(ctx, next);

      expect(response.headers.get('X-Response-Time')).toBeDefined();
      expect(response.headers.get('X-Response-Time')).toMatch(/\d+\.\d+ms/);
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('should not add X-Response-Time in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      const middleware = debugMiddleware();
      const ctx = createMockContext('http://localhost/test');
      const next = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));

      const response = await middleware(ctx, next);

      expect(response.headers.get('X-Response-Time')).toBeNull();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
