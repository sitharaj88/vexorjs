/**
 * Swagger UI / ReDoc / Scalar Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  swaggerUI,
  registerSwaggerUI,
  reDoc,
  registerReDoc,
  scalar,
  registerScalar,
} from '../openapi/swagger-ui.js';
import type { SwaggerUIOptions, ReDocOptions, ScalarOptions, OpenAPISpec } from '../openapi/swagger-ui.js';
import { Vexor } from '../core/app.js';
import { createMockContext, createMockRequest } from './helpers.js';

// ============================================================================
// Test OpenAPI Spec
// ============================================================================

const testSpec: OpenAPISpec = {
  openapi: '3.0.3',
  info: {
    title: 'Test API',
    version: '1.0.0',
    description: 'A test API',
  },
  paths: {
    '/users': {
      get: {
        summary: 'List users',
        responses: { '200': { description: 'Success' } },
      },
    },
  },
};

// ============================================================================
// Swagger UI Middleware
// ============================================================================

describe('swaggerUI', () => {
  describe('middleware creation', () => {
    it('should return a middleware function', () => {
      const middleware = swaggerUI();
      expect(typeof middleware).toBe('function');
    });
  });

  describe('default options', () => {
    it('should serve HTML at /docs', async () => {
      const middleware = swaggerUI();
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);

      expect(response).toBeDefined();
      expect(response!.status).toBe(200);
      expect(response!.headers.get('content-type')).toContain('text/html');
    });

    it('should serve HTML at /docs/ (trailing slash)', async () => {
      const middleware = swaggerUI();
      const ctx = createMockContext('http://localhost/docs/');

      const response = await middleware(ctx);

      expect(response).toBeDefined();
      expect(response!.status).toBe(200);
    });

    it('should return undefined for non-matching paths', async () => {
      const middleware = swaggerUI();
      const ctx = createMockContext('http://localhost/other');

      const result = await middleware(ctx);

      expect(result).toBeUndefined();
    });
  });

  describe('HTML generation', () => {
    it('should include default title', async () => {
      const middleware = swaggerUI();
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('<title>API Documentation</title>');
    });

    it('should include swagger-ui CSS and JS from CDN', async () => {
      const middleware = swaggerUI();
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('swagger-ui-dist');
      expect(html).toContain('swagger-ui.css');
      expect(html).toContain('swagger-ui-bundle.js');
    });

    it('should include default specPath /openapi.json', async () => {
      const middleware = swaggerUI();
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('/openapi.json');
    });

    it('should set Cache-Control header', async () => {
      const middleware = swaggerUI();
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      expect(response!.headers.get('cache-control')).toContain('public');
    });
  });

  describe('custom options', () => {
    it('should use custom path', async () => {
      const middleware = swaggerUI({ path: '/api-docs' });

      const matchCtx = createMockContext('http://localhost/api-docs');
      const matchResponse = await middleware(matchCtx);
      expect(matchResponse).toBeDefined();

      const noMatchCtx = createMockContext('http://localhost/docs');
      const noMatchResponse = await middleware(noMatchCtx);
      expect(noMatchResponse).toBeUndefined();
    });

    it('should use custom title', async () => {
      const middleware = swaggerUI({ title: 'My Custom API' });
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('<title>My Custom API</title>');
    });

    it('should use custom specPath', async () => {
      const middleware = swaggerUI({ specPath: '/api/spec.json' });
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('/api/spec.json');
    });

    it('should include inline spec when provided', async () => {
      const middleware = swaggerUI({ spec: testSpec });
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('Test API');
    });

    it('should include favicon when provided', async () => {
      const middleware = swaggerUI({ favicon: '/favicon.png' });
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('/favicon.png');
    });
  });

  describe('dark mode', () => {
    it('should include dark mode styles when enabled', async () => {
      const middleware = swaggerUI({ darkMode: true });
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('invert(88%)');
      expect(html).toContain('hue-rotate(180deg)');
    });

    it('should not include dark mode styles by default', async () => {
      const middleware = swaggerUI();
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).not.toContain('invert(88%)');
    });
  });

  describe('custom CSS and JS', () => {
    it('should include custom CSS', async () => {
      const middleware = swaggerUI({ customCss: '.my-class { color: red; }' });
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('.my-class { color: red; }');
    });

    it('should include custom JavaScript', async () => {
      const middleware = swaggerUI({ customJs: 'console.log("hello");' });
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('console.log("hello");');
    });
  });

  describe('Swagger UI configuration options', () => {
    it('should include displayRequestDuration', async () => {
      const middleware = swaggerUI({ displayRequestDuration: true });
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('"displayRequestDuration":true');
    });

    it('should include docExpansion', async () => {
      const middleware = swaggerUI({ docExpansion: 'full' });
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('"docExpansion":"full"');
    });

    it('should include tryItOutEnabled', async () => {
      const middleware = swaggerUI({ tryItOutEnabled: true });
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('"tryItOutEnabled":true');
    });
  });

  describe('version', () => {
    it('should use default version 5.11.0', async () => {
      const middleware = swaggerUI();
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('swagger-ui-dist@5.11.0');
    });

    it('should use custom version', async () => {
      const middleware = swaggerUI({ version: '4.15.0' });
      const ctx = createMockContext('http://localhost/docs');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('swagger-ui-dist@4.15.0');
    });
  });
});

// ============================================================================
// registerSwaggerUI
// ============================================================================

describe('registerSwaggerUI', () => {
  let app: Vexor;

  beforeEach(() => {
    app = new Vexor();
  });

  it('should register Swagger UI route on app', () => {
    registerSwaggerUI(app);
    const routes = app.getRoutes();
    expect(routes).toContainEqual({ method: 'GET', path: '/docs' });
  });

  it('should register at custom path', () => {
    registerSwaggerUI(app, { path: '/swagger' });
    const routes = app.getRoutes();
    expect(routes).toContainEqual({ method: 'GET', path: '/swagger' });
  });

  it('should register spec route when spec is provided', () => {
    registerSwaggerUI(app, { spec: testSpec });
    const routes = app.getRoutes();
    expect(routes).toContainEqual({ method: 'GET', path: '/openapi.json' });
  });

  it('should not register spec route when no spec provided', () => {
    registerSwaggerUI(app);
    const routes = app.getRoutes();
    const specRoute = routes.find((r) => r.path === '/openapi.json');
    expect(specRoute).toBeUndefined();
  });

  it('should serve HTML with correct content', async () => {
    registerSwaggerUI(app, { title: 'My API Docs' });

    const request = createMockRequest('http://localhost/docs');
    const response = await app.handle(request);

    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('<title>My API Docs</title>');
    expect(html).toContain('swagger-ui');
  });

  it('should serve spec as JSON when spec is provided', async () => {
    registerSwaggerUI(app, { spec: testSpec });

    const request = createMockRequest('http://localhost/openapi.json');
    const response = await app.handle(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.openapi).toBe('3.0.3');
    expect(body.info.title).toBe('Test API');
  });
});

// ============================================================================
// ReDoc Middleware
// ============================================================================

describe('reDoc', () => {
  describe('middleware creation', () => {
    it('should return a middleware function', () => {
      const middleware = reDoc();
      expect(typeof middleware).toBe('function');
    });
  });

  describe('default options', () => {
    it('should serve HTML at /redoc', async () => {
      const middleware = reDoc();
      const ctx = createMockContext('http://localhost/redoc');

      const response = await middleware(ctx);

      expect(response).toBeDefined();
      expect(response!.status).toBe(200);
      expect(response!.headers.get('content-type')).toContain('text/html');
    });

    it('should serve HTML at /redoc/ (trailing slash)', async () => {
      const middleware = reDoc();
      const ctx = createMockContext('http://localhost/redoc/');

      const response = await middleware(ctx);
      expect(response).toBeDefined();
    });

    it('should return undefined for non-matching paths', async () => {
      const middleware = reDoc();
      const ctx = createMockContext('http://localhost/other');

      const result = await middleware(ctx);
      expect(result).toBeUndefined();
    });
  });

  describe('HTML generation', () => {
    it('should include default title', async () => {
      const middleware = reDoc();
      const ctx = createMockContext('http://localhost/redoc');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('<title>API Documentation</title>');
    });

    it('should include Redoc script', async () => {
      const middleware = reDoc();
      const ctx = createMockContext('http://localhost/redoc');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('redoc.standalone.js');
      expect(html).toContain('Redoc.init');
    });

    it('should include specPath reference', async () => {
      const middleware = reDoc();
      const ctx = createMockContext('http://localhost/redoc');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('/openapi.json');
    });
  });

  describe('custom options', () => {
    it('should use custom path', async () => {
      const middleware = reDoc({ path: '/api-reference' });

      const matchCtx = createMockContext('http://localhost/api-reference');
      const matchResponse = await middleware(matchCtx);
      expect(matchResponse).toBeDefined();

      const noMatchCtx = createMockContext('http://localhost/redoc');
      const noMatchResponse = await middleware(noMatchCtx);
      expect(noMatchResponse).toBeUndefined();
    });

    it('should use custom title', async () => {
      const middleware = reDoc({ title: 'My ReDoc' });
      const ctx = createMockContext('http://localhost/redoc');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('<title>My ReDoc</title>');
    });

    it('should include inline spec when provided', async () => {
      const middleware = reDoc({ spec: testSpec });
      const ctx = createMockContext('http://localhost/redoc');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('Test API');
    });

    it('should include favicon when provided', async () => {
      const middleware = reDoc({ favicon: '/icon.png' });
      const ctx = createMockContext('http://localhost/redoc');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('/icon.png');
    });
  });

  describe('theme support', () => {
    it('should include theme options in configuration', async () => {
      const middleware = reDoc({
        theme: {
          colors: { primary: { main: '#ff0000' } },
          typography: { fontSize: '16px' },
        },
      });
      const ctx = createMockContext('http://localhost/redoc');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('#ff0000');
    });
  });
});

// ============================================================================
// registerReDoc
// ============================================================================

describe('registerReDoc', () => {
  let app: Vexor;

  beforeEach(() => {
    app = new Vexor();
  });

  it('should register ReDoc route on app', () => {
    registerReDoc(app);
    const routes = app.getRoutes();
    expect(routes).toContainEqual({ method: 'GET', path: '/redoc' });
  });

  it('should register at custom path', () => {
    registerReDoc(app, { path: '/reference' });
    const routes = app.getRoutes();
    expect(routes).toContainEqual({ method: 'GET', path: '/reference' });
  });

  it('should register spec route when spec is provided', () => {
    registerReDoc(app, { spec: testSpec });
    const routes = app.getRoutes();
    expect(routes).toContainEqual({ method: 'GET', path: '/openapi.json' });
  });

  it('should serve HTML with correct content', async () => {
    registerReDoc(app, { title: 'My ReDoc' });

    const request = createMockRequest('http://localhost/redoc');
    const response = await app.handle(request);

    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('<title>My ReDoc</title>');
    expect(html).toContain('Redoc.init');
  });
});

// ============================================================================
// Scalar Middleware
// ============================================================================

describe('scalar', () => {
  describe('middleware creation', () => {
    it('should return a middleware function', () => {
      const middleware = scalar();
      expect(typeof middleware).toBe('function');
    });
  });

  describe('default options', () => {
    it('should serve HTML at /scalar', async () => {
      const middleware = scalar();
      const ctx = createMockContext('http://localhost/scalar');

      const response = await middleware(ctx);

      expect(response).toBeDefined();
      expect(response!.status).toBe(200);
      expect(response!.headers.get('content-type')).toContain('text/html');
    });

    it('should serve HTML at /scalar/ (trailing slash)', async () => {
      const middleware = scalar();
      const ctx = createMockContext('http://localhost/scalar/');

      const response = await middleware(ctx);
      expect(response).toBeDefined();
    });

    it('should return undefined for non-matching paths', async () => {
      const middleware = scalar();
      const ctx = createMockContext('http://localhost/other');

      const result = await middleware(ctx);
      expect(result).toBeUndefined();
    });
  });

  describe('HTML generation', () => {
    it('should include default title', async () => {
      const middleware = scalar();
      const ctx = createMockContext('http://localhost/scalar');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('<title>API Reference</title>');
    });

    it('should include Scalar script', async () => {
      const middleware = scalar();
      const ctx = createMockContext('http://localhost/scalar');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('@scalar/api-reference');
      expect(html).toContain('api-reference');
    });

    it('should include specPath as data attribute', async () => {
      const middleware = scalar();
      const ctx = createMockContext('http://localhost/scalar');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('data-url="/openapi.json"');
    });
  });

  describe('custom options', () => {
    it('should use custom path', async () => {
      const middleware = scalar({ path: '/api-ref' });

      const matchCtx = createMockContext('http://localhost/api-ref');
      const matchResponse = await middleware(matchCtx);
      expect(matchResponse).toBeDefined();
    });

    it('should use custom title', async () => {
      const middleware = scalar({ title: 'My Scalar' });
      const ctx = createMockContext('http://localhost/scalar');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('<title>My Scalar</title>');
    });

    it('should include inline spec when provided', async () => {
      const middleware = scalar({ spec: testSpec });
      const ctx = createMockContext('http://localhost/scalar');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('Test API');
    });
  });

  describe('theme support', () => {
    it('should use default purple theme', async () => {
      const middleware = scalar();
      const ctx = createMockContext('http://localhost/scalar');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('"theme":"purple"');
    });

    it('should use custom theme', async () => {
      const middleware = scalar({ theme: 'moon' });
      const ctx = createMockContext('http://localhost/scalar');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('"theme":"moon"');
    });
  });

  describe('dark mode', () => {
    it('should support dark mode option', async () => {
      const middleware = scalar({ darkMode: true });
      const ctx = createMockContext('http://localhost/scalar');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('"darkMode":true');
    });
  });

  describe('custom CSS', () => {
    it('should include custom CSS', async () => {
      const middleware = scalar({ customCss: 'body { background: black; }' });
      const ctx = createMockContext('http://localhost/scalar');

      const response = await middleware(ctx);
      const html = await response!.text();

      expect(html).toContain('body { background: black; }');
    });
  });
});

// ============================================================================
// registerScalar
// ============================================================================

describe('registerScalar', () => {
  let app: Vexor;

  beforeEach(() => {
    app = new Vexor();
  });

  it('should register Scalar route on app', () => {
    registerScalar(app);
    const routes = app.getRoutes();
    expect(routes).toContainEqual({ method: 'GET', path: '/scalar' });
  });

  it('should register at custom path', () => {
    registerScalar(app, { path: '/api-ref' });
    const routes = app.getRoutes();
    expect(routes).toContainEqual({ method: 'GET', path: '/api-ref' });
  });

  it('should register spec route when spec is provided', () => {
    registerScalar(app, { spec: testSpec });
    const routes = app.getRoutes();
    expect(routes).toContainEqual({ method: 'GET', path: '/openapi.json' });
  });

  it('should not register spec route when no spec provided', () => {
    registerScalar(app);
    const routes = app.getRoutes();
    const specRoute = routes.find((r) => r.path === '/openapi.json');
    expect(specRoute).toBeUndefined();
  });

  it('should serve HTML with correct content', async () => {
    registerScalar(app, { title: 'My Scalar Docs' });

    const request = createMockRequest('http://localhost/scalar');
    const response = await app.handle(request);

    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('<title>My Scalar Docs</title>');
    expect(html).toContain('@scalar/api-reference');
  });

  it('should serve spec as JSON when spec is provided', async () => {
    registerScalar(app, { spec: testSpec });

    const request = createMockRequest('http://localhost/openapi.json');
    const response = await app.handle(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.openapi).toBe('3.0.3');
  });
});
