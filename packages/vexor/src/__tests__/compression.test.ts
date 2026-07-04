/**
 * Compression Middleware Tests
 *
 * Tests for parseAcceptEncoding, selectEncoding, isCompressible,
 * compressResponse, and Vary header handling
 */

import { describe, it, expect, } from 'vitest';
import {
  compressResponse,
  isCompressible,
  compression,
} from '../middleware/compression.js';
import { createMockContext } from './helpers.js';

/**
 * We need to test the non-exported helpers (parseAcceptEncoding, selectEncoding)
 * through the public API (compressResponse), plus test isCompressible directly.
 */

describe('Compression Middleware', () => {
  describe('parseAcceptEncoding (tested via compressResponse)', () => {
    it('handles quality values and ordering', async () => {
      // Create a response with compressible content above threshold
      const body = 'x'.repeat(2048);
      const response = new Response(body, {
        headers: { 'content-type': 'text/plain' },
      });

      // gzip has higher quality (1.0 default) vs deflate (0.5)
      const ctx = createMockContext('http://localhost/test', {
        headers: { 'accept-encoding': 'deflate;q=0.5, gzip' },
      });

      const compressed = await compressResponse(response, ctx);
      // gzip should be selected because it has higher q-value
      expect(compressed.headers.get('content-encoding')).toBe('gzip');
    });

    it('respects q=0 to exclude encodings', async () => {
      const body = 'x'.repeat(2048);
      const response = new Response(body, {
        headers: { 'content-type': 'text/plain' },
      });

      // gzip is excluded with q=0
      const ctx = createMockContext('http://localhost/test', {
        headers: { 'accept-encoding': 'gzip;q=0, deflate' },
      });

      const compressed = await compressResponse(response, ctx);
      expect(compressed.headers.get('content-encoding')).toBe('deflate');
    });

    it('returns uncompressed when no accepted encodings match', async () => {
      const body = 'x'.repeat(2048);
      const response = new Response(body, {
        headers: { 'content-type': 'text/plain' },
      });

      const ctx = createMockContext('http://localhost/test', {
        headers: { 'accept-encoding': 'br' }, // br not in default supported
      });

      const result = await compressResponse(response, ctx);
      expect(result.headers.get('content-encoding')).toBeNull();
    });
  });

  describe('selectEncoding (tested via compressResponse)', () => {
    it('picks first matching supported encoding', async () => {
      const body = 'x'.repeat(2048);
      const response = new Response(body, {
        headers: { 'content-type': 'text/plain' },
      });

      const ctx = createMockContext('http://localhost/test', {
        headers: { 'accept-encoding': 'gzip, deflate' },
      });

      const compressed = await compressResponse(response, ctx);
      expect(compressed.headers.get('content-encoding')).toBe('gzip');
    });

    it('selects deflate when gzip is not accepted', async () => {
      const body = 'x'.repeat(2048);
      const response = new Response(body, {
        headers: { 'content-type': 'text/plain' },
      });

      const ctx = createMockContext('http://localhost/test', {
        headers: { 'accept-encoding': 'deflate' },
      });

      const compressed = await compressResponse(response, ctx);
      expect(compressed.headers.get('content-encoding')).toBe('deflate');
    });
  });

  describe('isCompressible', () => {
    it('checks against known text types', () => {
      expect(isCompressible('text/plain')).toBe(true);
      expect(isCompressible('text/html')).toBe(true);
      expect(isCompressible('text/css')).toBe(true);
    });

    it('checks against known application types', () => {
      expect(isCompressible('application/json')).toBe(true);
      expect(isCompressible('application/javascript')).toBe(true);
      expect(isCompressible('application/xml')).toBe(true);
    });

    it('checks SVG as compressible', () => {
      expect(isCompressible('image/svg+xml')).toBe(true);
    });

    it('returns false for binary types', () => {
      expect(isCompressible('image/png')).toBe(false);
      expect(isCompressible('image/jpeg')).toBe(false);
      expect(isCompressible('application/octet-stream')).toBe(false);
      expect(isCompressible('video/mp4')).toBe(false);
    });

    it('returns false for empty content type', () => {
      expect(isCompressible('')).toBe(false);
    });

    it('handles content type with parameters', () => {
      expect(isCompressible('text/html; charset=utf-8')).toBe(true);
      expect(isCompressible('application/json; charset=utf-8')).toBe(true);
    });
  });

  describe('compressResponse', () => {
    it('with gzip accept-encoding compresses above threshold', async () => {
      const body = 'x'.repeat(2048);
      const response = new Response(body, {
        headers: { 'content-type': 'text/plain' },
      });

      const ctx = createMockContext('http://localhost/test', {
        headers: { 'accept-encoding': 'gzip' },
      });

      const compressed = await compressResponse(response, ctx);

      expect(compressed.headers.get('content-encoding')).toBe('gzip');
      // Compressed size should be less than original
      const compressedBody = await compressed.arrayBuffer();
      expect(compressedBody.byteLength).toBeLessThan(body.length);
    });

    it('skips below threshold', async () => {
      const body = 'short'; // Well under 1024 byte threshold
      const response = new Response(body, {
        headers: { 'content-type': 'text/plain' },
      });

      const ctx = createMockContext('http://localhost/test', {
        headers: { 'accept-encoding': 'gzip' },
      });

      const result = await compressResponse(response, ctx);

      expect(result.headers.get('content-encoding')).toBeNull();
      const resultBody = await result.text();
      expect(resultBody).toBe(body);
    });

    it('skips non-compressible content types', async () => {
      const body = 'x'.repeat(2048);
      const response = new Response(body, {
        headers: { 'content-type': 'image/png' },
      });

      const ctx = createMockContext('http://localhost/test', {
        headers: { 'accept-encoding': 'gzip' },
      });

      const result = await compressResponse(response, ctx);
      expect(result.headers.get('content-encoding')).toBeNull();
    });

    it('respects already-encoded responses', async () => {
      const body = 'x'.repeat(2048);
      const response = new Response(body, {
        headers: {
          'content-type': 'text/plain',
          'content-encoding': 'br',
        },
      });

      const ctx = createMockContext('http://localhost/test', {
        headers: { 'accept-encoding': 'gzip' },
      });

      const result = await compressResponse(response, ctx);
      // Should not double-encode
      expect(result.headers.get('content-encoding')).toBe('br');
    });

    it('uses custom threshold option', async () => {
      const body = 'x'.repeat(100);
      const response = new Response(body, {
        headers: { 'content-type': 'text/plain' },
      });

      const ctx = createMockContext('http://localhost/test', {
        headers: { 'accept-encoding': 'gzip' },
      });

      const compressed = await compressResponse(response, ctx, {
        threshold: 50,
        encodings: ['gzip', 'deflate'],
        level: 6,
        filter: (_ctx: any, contentType: string) => contentType.startsWith('text/'),
        memLevel: 8,
        vary: true,
      });
      expect(compressed.headers.get('content-encoding')).toBe('gzip');
    });
  });

  describe('Vary header', () => {
    it('adds Vary: Accept-Encoding header', async () => {
      const body = 'x'.repeat(2048);
      const response = new Response(body, {
        headers: { 'content-type': 'text/plain' },
      });

      const ctx = createMockContext('http://localhost/test', {
        headers: { 'accept-encoding': 'gzip' },
      });

      const compressed = await compressResponse(response, ctx);
      expect(compressed.headers.get('vary')).toBe('Accept-Encoding');
    });

    it('appends to existing Vary header', async () => {
      const body = 'x'.repeat(2048);
      const response = new Response(body, {
        headers: {
          'content-type': 'text/plain',
          'vary': 'Origin',
        },
      });

      const ctx = createMockContext('http://localhost/test', {
        headers: { 'accept-encoding': 'gzip' },
      });

      const compressed = await compressResponse(response, ctx);
      const vary = compressed.headers.get('vary');
      expect(vary).toContain('Origin');
      expect(vary).toContain('Accept-Encoding');
    });

    it('does not duplicate Accept-Encoding in Vary header', async () => {
      const body = 'x'.repeat(2048);
      const response = new Response(body, {
        headers: {
          'content-type': 'text/plain',
          'vary': 'Accept-Encoding',
        },
      });

      const ctx = createMockContext('http://localhost/test', {
        headers: { 'accept-encoding': 'gzip' },
      });

      const compressed = await compressResponse(response, ctx);
      const vary = compressed.headers.get('vary')!;
      const occurrences = vary.split('Accept-Encoding').length - 1;
      expect(occurrences).toBe(1);
    });

    it('respects vary: false option', async () => {
      const body = 'x'.repeat(2048);
      const response = new Response(body, {
        headers: { 'content-type': 'text/plain' },
      });

      const ctx = createMockContext('http://localhost/test', {
        headers: { 'accept-encoding': 'gzip' },
      });

      const compressed = await compressResponse(response, ctx, {
        vary: false,
        encodings: ['gzip', 'deflate'],
        threshold: 1024,
        level: 6,
        filter: (_ctx: any, contentType: string) => contentType.startsWith('text/'),
        memLevel: 8,
      });
      expect(compressed.headers.get('vary')).toBeNull();
    });
  });

  describe('compression middleware factory', () => {
    it('stores compression options in context', async () => {
      const middleware = compression({ threshold: 512, level: 9 });
      const ctx = createMockContext('http://localhost/test');

      await middleware(ctx);

      const opts = (ctx as any)._compressionOptions;
      expect(opts).toBeDefined();
      expect(opts.threshold).toBe(512);
      expect(opts.level).toBe(9);
    });
  });
});
