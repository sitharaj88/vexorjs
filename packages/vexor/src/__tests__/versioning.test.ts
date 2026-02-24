/**
 * API Versioning Middleware Tests
 *
 * Tests for versioning strategies, helpers, and deprecation middleware
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  versioning,
  getApiVersion,
  isVersion,
  deprecated,
  applyDeprecationHeaders,
  applyVersionHeader,
} from '../middleware/versioning.js';
import { createMockContext } from './helpers.js';

describe('Versioning Middleware', () => {
  describe('Path strategy', () => {
    it('extracts version from /v1/users', async () => {
      const middleware = versioning({ strategy: 'path', prefix: 'v' });

      const ctx = createMockContext('http://localhost/v1/users');
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('1');
    });

    it('extracts version from /v2/products/123', async () => {
      const middleware = versioning({ strategy: 'path', prefix: 'v' });

      const ctx = createMockContext('http://localhost/v2/products/123');
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('2');
    });

    it('extracts version with custom prefix', async () => {
      const middleware = versioning({ strategy: 'path', prefix: 'api-v' });

      const ctx = createMockContext('http://localhost/api-v3/users');
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('3');
    });

    it('falls back to default version when path has no version', async () => {
      const middleware = versioning({
        strategy: 'path',
        prefix: 'v',
        defaultVersion: '1',
      });

      const ctx = createMockContext('http://localhost/users');
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('1');
    });
  });

  describe('Header strategy', () => {
    it('extracts from X-API-Version header', async () => {
      const middleware = versioning({ strategy: 'header' });

      const ctx = createMockContext('http://localhost/users', {
        headers: { 'x-api-version': '2' },
      });
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('2');
    });

    it('extracts from custom header name', async () => {
      const middleware = versioning({
        strategy: 'header',
        header: 'Accept-Version',
      });

      const ctx = createMockContext('http://localhost/users', {
        headers: { 'accept-version': '3' },
      });
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('3');
    });

    it('falls back to default when header is missing', async () => {
      const middleware = versioning({
        strategy: 'header',
        defaultVersion: '1',
      });

      const ctx = createMockContext('http://localhost/users');
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('1');
    });
  });

  describe('Query strategy', () => {
    it('extracts from ?version=2 param', async () => {
      const middleware = versioning({ strategy: 'query' });

      const ctx = createMockContext('http://localhost/users?version=2');
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('2');
    });

    it('extracts from custom query param name', async () => {
      const middleware = versioning({
        strategy: 'query',
        queryParam: 'api_version',
      });

      const ctx = createMockContext('http://localhost/users?api_version=5');
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('5');
    });

    it('falls back to default when query param is missing', async () => {
      const middleware = versioning({
        strategy: 'query',
        defaultVersion: '1',
      });

      const ctx = createMockContext('http://localhost/users');
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('1');
    });
  });

  describe('Media-type strategy', () => {
    it('extracts from Accept header', async () => {
      const middleware = versioning({ strategy: 'media-type', vendor: 'myapp' });

      const ctx = createMockContext('http://localhost/users', {
        headers: { 'accept': 'application/vnd.myapp.v3+json' },
      });
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('3');
    });

    it('extracts with default vendor name', async () => {
      const middleware = versioning({ strategy: 'media-type' });

      const ctx = createMockContext('http://localhost/users', {
        headers: { 'accept': 'application/vnd.api.v2+json' },
      });
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('2');
    });

    it('falls back to default when accept header does not match pattern', async () => {
      const middleware = versioning({
        strategy: 'media-type',
        defaultVersion: '1',
      });

      const ctx = createMockContext('http://localhost/users', {
        headers: { 'accept': 'application/json' },
      });
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('1');
    });
  });

  describe('Custom strategy', () => {
    it('uses provided extractor function', async () => {
      const middleware = versioning({
        strategy: 'custom',
        extractor: (ctx) => {
          const token = ctx.header('authorization');
          // Extract version from a custom scheme
          if (token?.startsWith('V2-')) return '2';
          return null;
        },
        defaultVersion: '1',
      });

      const ctx = createMockContext('http://localhost/users', {
        headers: { 'authorization': 'V2-some-token' },
      });
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('2');
    });

    it('falls back to default when extractor returns null', async () => {
      const middleware = versioning({
        strategy: 'custom',
        extractor: () => null,
        defaultVersion: '3',
      });

      const ctx = createMockContext('http://localhost/users');
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('3');
    });
  });

  describe('Default version fallback', () => {
    it('falls back to defaultVersion when version not found', async () => {
      const middleware = versioning({
        strategy: 'header',
        defaultVersion: '5',
      });

      const ctx = createMockContext('http://localhost/users');
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('5');
    });

    it('uses "1" as default when defaultVersion is not specified', async () => {
      const middleware = versioning({ strategy: 'header' });

      const ctx = createMockContext('http://localhost/users');
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('1');
    });
  });

  describe('getApiVersion', () => {
    it('reads version from context', async () => {
      const middleware = versioning({ strategy: 'path' });
      const ctx = createMockContext('http://localhost/v4/items');
      await middleware(ctx);

      expect(getApiVersion(ctx)).toBe('4');
    });

    it('returns "1" when no version has been set', () => {
      const ctx = createMockContext('http://localhost/users');
      expect(getApiVersion(ctx)).toBe('1');
    });
  });

  describe('isVersion', () => {
    it('returns true when version matches', async () => {
      const middleware = versioning({ strategy: 'path' });
      const ctx = createMockContext('http://localhost/v2/users');
      await middleware(ctx);

      expect(isVersion(ctx, '2')).toBe(true);
    });

    it('returns false when version does not match', async () => {
      const middleware = versioning({ strategy: 'path' });
      const ctx = createMockContext('http://localhost/v1/users');
      await middleware(ctx);

      expect(isVersion(ctx, '2')).toBe(false);
    });
  });

  describe('deprecated middleware', () => {
    it('sets Deprecation header', async () => {
      const middleware = deprecated();
      const ctx = createMockContext('http://localhost/v1/users');
      await middleware(ctx);

      const headers = (ctx as any)._deprecationHeaders;
      expect(headers).toBeDefined();
      expect(headers['Deprecation']).toBe('true');
    });

    it('sets X-Deprecation-Notice with message', async () => {
      const middleware = deprecated('Use v2 instead');
      const ctx = createMockContext('http://localhost/v1/users');
      await middleware(ctx);

      const headers = (ctx as any)._deprecationHeaders;
      expect(headers['X-Deprecation-Notice']).toBe('Use v2 instead');
    });

    it('sets Sunset header with date', async () => {
      const sunsetDate = new Date('2025-12-31T00:00:00Z');
      const middleware = deprecated('Deprecated', sunsetDate);
      const ctx = createMockContext('http://localhost/v1/users');
      await middleware(ctx);

      const headers = (ctx as any)._deprecationHeaders;
      expect(headers['Sunset']).toBe(sunsetDate.toUTCString());
    });

    it('applyDeprecationHeaders applies headers to response', async () => {
      const middleware = deprecated('Use v2 instead', new Date('2025-12-31'));
      const ctx = createMockContext('http://localhost/v1/users');
      await middleware(ctx);

      const response = new Response('OK', { status: 200 });
      const modified = applyDeprecationHeaders(ctx, response);

      expect(modified.headers.get('Deprecation')).toBe('true');
      expect(modified.headers.get('X-Deprecation-Notice')).toBe('Use v2 instead');
      expect(modified.headers.get('Sunset')).toBeDefined();
    });

    it('applyDeprecationHeaders returns unchanged response when no deprecation', () => {
      const ctx = createMockContext('http://localhost/v2/users');
      const response = new Response('OK', { status: 200 });
      const result = applyDeprecationHeaders(ctx, response);

      // Should return the same response object
      expect(result).toBe(response);
    });
  });

  describe('applyVersionHeader', () => {
    it('adds version header to response', async () => {
      const middleware = versioning({
        strategy: 'path',
        responseHeader: true,
        responseHeaderName: 'X-API-Version',
      });
      const ctx = createMockContext('http://localhost/v3/users');
      await middleware(ctx);

      const response = new Response('OK', { status: 200 });
      const modified = applyVersionHeader(ctx, response);

      expect(modified.headers.get('X-API-Version')).toBe('3');
    });

    it('returns unchanged response when responseHeader is false', async () => {
      const middleware = versioning({
        strategy: 'path',
        responseHeader: false,
      });
      const ctx = createMockContext('http://localhost/v1/users');
      await middleware(ctx);

      const response = new Response('OK', { status: 200 });
      const result = applyVersionHeader(ctx, response);

      expect(result).toBe(response);
    });
  });
});
