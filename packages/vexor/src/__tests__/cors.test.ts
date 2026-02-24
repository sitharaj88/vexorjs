/**
 * CORS Middleware Tests
 */

import { describe, it, expect } from 'vitest';
import {
  cors,
  simpleCors,
  corsWithOrigins,
  corsWithPattern,
  getCorsHeaders,
  applyCorsHeaders,
} from '../middleware/cors.js';
import { createMockContext } from './helpers.js';

/**
 * Helper: create a context with an Origin header
 */
function createCtxWithOrigin(origin: string, method = 'GET', extraHeaders?: Record<string, string>) {
  const headers: Record<string, string> = { Origin: origin, ...extraHeaders };
  return createMockContext('http://localhost/test', {
    method,
    headers,
  });
}

describe('cors', () => {
  describe('default options', () => {
    it('should allow wildcard origin "*" by default', async () => {
      const middleware = cors();
      const ctx = createCtxWithOrigin('http://example.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers).toBeDefined();
      expect(headers!['Access-Control-Allow-Origin']).toBe('http://example.com');
    });

    it('should set wildcard when no origin header and default options', async () => {
      const middleware = cors();
      const ctx = createMockContext('http://localhost/test');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers).toBeDefined();
      expect(headers!['Access-Control-Allow-Origin']).toBe('*');
    });
  });

  describe('string origin', () => {
    it('should match specific string origin', async () => {
      const middleware = cors({ origin: 'http://example.com' });
      const ctx = createCtxWithOrigin('http://example.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Access-Control-Allow-Origin']).toBe('http://example.com');
    });

    it('should not set header when origin does not match string', async () => {
      const middleware = cors({ origin: 'http://example.com' });
      const ctx = createCtxWithOrigin('http://other.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Access-Control-Allow-Origin']).toBeUndefined();
    });
  });

  describe('RegExp origin', () => {
    it('should match origin against regex', async () => {
      const middleware = cors({ origin: /\.example\.com$/ });
      const ctx = createCtxWithOrigin('http://app.example.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Access-Control-Allow-Origin']).toBe('http://app.example.com');
    });

    it('should not set header when regex does not match', async () => {
      const middleware = cors({ origin: /\.example\.com$/ });
      const ctx = createCtxWithOrigin('http://evil.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Access-Control-Allow-Origin']).toBeUndefined();
    });
  });

  describe('array of origins', () => {
    it('should match when origin is in the array', async () => {
      const middleware = cors({ origin: ['http://a.com', 'http://b.com'] });
      const ctx = createCtxWithOrigin('http://b.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Access-Control-Allow-Origin']).toBe('http://b.com');
    });

    it('should not set header when origin is not in array', async () => {
      const middleware = cors({ origin: ['http://a.com', 'http://b.com'] });
      const ctx = createCtxWithOrigin('http://c.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Access-Control-Allow-Origin']).toBeUndefined();
    });

    it('should support RegExp in the array', async () => {
      const middleware = cors({ origin: [/\.example\.com$/] });
      const ctx = createCtxWithOrigin('http://sub.example.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Access-Control-Allow-Origin']).toBe('http://sub.example.com');
    });
  });

  describe('function-based origin', () => {
    it('should use sync function to determine origin (returning true)', async () => {
      const middleware = cors({
        origin: (origin) => origin.endsWith('.trusted.com'),
      });
      const ctx = createCtxWithOrigin('http://app.trusted.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Access-Control-Allow-Origin']).toBe('http://app.trusted.com');
    });

    it('should not set header when function returns false', async () => {
      const middleware = cors({
        origin: () => false,
      });
      const ctx = createCtxWithOrigin('http://example.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Access-Control-Allow-Origin']).toBeUndefined();
    });
  });

  describe('origin: true', () => {
    it('should reflect the request origin', async () => {
      const middleware = cors({ origin: true });
      const ctx = createCtxWithOrigin('http://anything.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Access-Control-Allow-Origin']).toBe('http://anything.com');
    });
  });

  describe('origin: false', () => {
    it('should not set Access-Control-Allow-Origin header', async () => {
      const middleware = cors({ origin: false });
      const ctx = createCtxWithOrigin('http://example.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Access-Control-Allow-Origin']).toBeUndefined();
    });
  });

  describe('credentials', () => {
    it('should set Access-Control-Allow-Credentials when credentials: true', async () => {
      const middleware = cors({ origin: '*', credentials: true });
      const ctx = createCtxWithOrigin('http://example.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Access-Control-Allow-Credentials']).toBe('true');
    });

    it('should not set credentials header when credentials: false', async () => {
      const middleware = cors({ origin: '*', credentials: false });
      const ctx = createCtxWithOrigin('http://example.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Access-Control-Allow-Credentials']).toBeUndefined();
    });
  });

  describe('preflight (OPTIONS)', () => {
    it('should return 204 with correct headers on OPTIONS', async () => {
      const middleware = cors({ origin: '*' });
      const ctx = createCtxWithOrigin('http://example.com', 'OPTIONS');

      const response = await middleware(ctx);

      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(Response);
      expect((response as Response).status).toBe(204);
      expect((response as Response).headers.get('Access-Control-Allow-Methods')).toContain('GET');
      expect((response as Response).headers.get('Content-Length')).toBe('0');
    });

    it('should include Access-Control-Allow-Methods', async () => {
      const middleware = cors({
        origin: '*',
        methods: ['GET', 'POST'],
      });
      const ctx = createCtxWithOrigin('http://example.com', 'OPTIONS');

      const response = await middleware(ctx) as Response;

      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST');
    });

    it('should respect preflightContinue: true and not short-circuit', async () => {
      const middleware = cors({ origin: '*', preflightContinue: true });
      const ctx = createCtxWithOrigin('http://example.com', 'OPTIONS');

      const result = await middleware(ctx);

      // When preflightContinue is true, middleware returns void (undefined)
      expect(result).toBeUndefined();

      // But headers should still be stored in context
      const headers = getCorsHeaders(ctx);
      expect(headers).toBeDefined();
      expect(headers!['Access-Control-Allow-Methods']).toBeDefined();
    });

    it('should reflect access-control-request-headers when allowedHeaders is empty', async () => {
      const middleware = cors({ origin: '*' });
      const ctx = createCtxWithOrigin('http://example.com', 'OPTIONS', {
        'Access-Control-Request-Headers': 'X-Custom-Header, Authorization',
      });

      const response = await middleware(ctx) as Response;

      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
        'X-Custom-Header, Authorization'
      );
    });

    it('should set maxAge header on preflight', async () => {
      const middleware = cors({ origin: '*', maxAge: 86400 });
      const ctx = createCtxWithOrigin('http://example.com', 'OPTIONS');

      const response = await middleware(ctx) as Response;

      expect(response.headers.get('Access-Control-Max-Age')).toBe('86400');
    });

    it('should use custom optionsSuccessStatus', async () => {
      const middleware = cors({ origin: '*', optionsSuccessStatus: 200 });
      const ctx = createCtxWithOrigin('http://example.com', 'OPTIONS');

      const response = await middleware(ctx) as Response;

      expect(response.status).toBe(200);
    });
  });

  describe('exposedHeaders', () => {
    it('should set Access-Control-Expose-Headers on normal requests', async () => {
      const middleware = cors({
        origin: '*',
        exposedHeaders: ['X-Request-Id', 'X-Total-Count'],
      });
      const ctx = createCtxWithOrigin('http://example.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Access-Control-Expose-Headers']).toBe('X-Request-Id, X-Total-Count');
    });

    it('should handle string exposedHeaders', async () => {
      const middleware = cors({
        origin: '*',
        exposedHeaders: 'X-Custom',
      });
      const ctx = createCtxWithOrigin('http://example.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Access-Control-Expose-Headers']).toBe('X-Custom');
    });
  });

  describe('Vary header', () => {
    it('should set Vary: Origin when origin is not wildcard "*"', async () => {
      const middleware = cors({ origin: 'http://example.com' });
      const ctx = createCtxWithOrigin('http://example.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Vary']).toBe('Origin');
    });

    it('should not set Vary when origin is "*"', async () => {
      const middleware = cors({ origin: '*' });
      const ctx = createCtxWithOrigin('http://example.com');

      await middleware(ctx);

      const headers = getCorsHeaders(ctx);
      expect(headers!['Vary']).toBeUndefined();
    });
  });
});

describe('simpleCors', () => {
  it('should create a CORS middleware that reflects origin and allows credentials', async () => {
    const middleware = simpleCors();
    const ctx = createCtxWithOrigin('http://any-origin.com');

    await middleware(ctx);

    const headers = getCorsHeaders(ctx);
    expect(headers!['Access-Control-Allow-Origin']).toBe('http://any-origin.com');
    expect(headers!['Access-Control-Allow-Credentials']).toBe('true');
  });
});

describe('corsWithOrigins', () => {
  it('should create CORS middleware allowing specific origins', async () => {
    const middleware = corsWithOrigins(['http://a.com', 'http://b.com']);

    const ctxA = createCtxWithOrigin('http://a.com');
    await middleware(ctxA);
    expect(getCorsHeaders(ctxA)!['Access-Control-Allow-Origin']).toBe('http://a.com');

    const ctxC = createCtxWithOrigin('http://c.com');
    await middleware(ctxC);
    expect(getCorsHeaders(ctxC)!['Access-Control-Allow-Origin']).toBeUndefined();
  });
});

describe('corsWithPattern', () => {
  it('should create CORS middleware matching a regex pattern', async () => {
    const middleware = corsWithPattern(/\.myapp\.com$/);

    const ctx = createCtxWithOrigin('http://sub.myapp.com');
    await middleware(ctx);
    expect(getCorsHeaders(ctx)!['Access-Control-Allow-Origin']).toBe('http://sub.myapp.com');

    const ctxBad = createCtxWithOrigin('http://evil.com');
    await middleware(ctxBad);
    expect(getCorsHeaders(ctxBad)!['Access-Control-Allow-Origin']).toBeUndefined();
  });
});

describe('getCorsHeaders', () => {
  it('should read _corsHeaders from context', async () => {
    const middleware = cors({ origin: '*' });
    const ctx = createCtxWithOrigin('http://example.com');

    await middleware(ctx);

    const headers = getCorsHeaders(ctx);
    expect(headers).toBeDefined();
    expect(headers!['Access-Control-Allow-Origin']).toBeDefined();
  });

  it('should return undefined if no CORS headers set', () => {
    const ctx = createMockContext('http://localhost/test');
    expect(getCorsHeaders(ctx)).toBeUndefined();
  });
});

describe('applyCorsHeaders', () => {
  it('should apply CORS headers from context to a response', async () => {
    const middleware = cors({ origin: true, credentials: true });
    const ctx = createCtxWithOrigin('http://example.com');

    await middleware(ctx);

    const originalResponse = new Response('hello', { status: 200 });
    const newResponse = applyCorsHeaders(ctx, originalResponse);

    expect(newResponse.headers.get('Access-Control-Allow-Origin')).toBe('http://example.com');
    expect(newResponse.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    expect(newResponse.status).toBe(200);
  });

  it('should return original response if no CORS headers on context', () => {
    const ctx = createMockContext('http://localhost/test');
    const response = new Response('hello');

    const result = applyCorsHeaders(ctx, response);
    expect(result).toBe(response);
  });
});
