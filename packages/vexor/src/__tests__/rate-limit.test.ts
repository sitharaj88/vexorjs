/**
 * Rate Limit Middleware Tests
 *
 * Tests for MemoryStore, SlidingWindowStore, and rateLimit middleware
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MemoryStore,
  SlidingWindowStore,
  rateLimit,
  getRateLimitInfo,
} from '../middleware/rate-limit.js';
import { createMockContext } from './helpers.js';

describe('Rate Limit Middleware', () => {
  describe('MemoryStore', () => {
    let store: MemoryStore;

    beforeEach(() => {
      store = new MemoryStore({ windowMs: 60000, max: 10 });
    });

    it('increment creates entry with correct count, remaining, resetTime', async () => {
      const info = await store.increment('test-key');

      expect(info.limit).toBe(10);
      expect(info.remaining).toBe(9);
      expect(info.resetTime).toBeGreaterThan(Date.now() - 1000);
      expect(info.resetTime).toBeLessThanOrEqual(Date.now() + 60000);
      expect(info.limited).toBe(false);
    });

    it('increment resets after window expires', async () => {
      // Create a store with a very short window
      const shortStore = new MemoryStore({ windowMs: 50, max: 10 });

      await shortStore.increment('key');
      await shortStore.increment('key');
      const before = await shortStore.increment('key');
      expect(before.remaining).toBe(7);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 60));

      const after = await shortStore.increment('key');
      expect(after.remaining).toBe(9); // Reset, so only 1 hit
      await shortStore.shutdown();
    });

    it('decrement reduces count', async () => {
      await store.increment('key');
      await store.increment('key');
      const before = await store.get('key');
      expect(before!.remaining).toBe(8);

      await store.decrement('key');
      const after = await store.get('key');
      expect(after!.remaining).toBe(9);
    });

    it('reset removes entry', async () => {
      await store.increment('key');
      await store.increment('key');
      const before = await store.get('key');
      expect(before).not.toBeNull();

      await store.reset('key');
      const after = await store.get('key');
      expect(after).toBeNull();
    });

    it('get returns null for expired entries', async () => {
      const shortStore = new MemoryStore({ windowMs: 50, max: 10 });
      await shortStore.increment('key');

      // Wait for the window to expire
      await new Promise((resolve) => setTimeout(resolve, 60));

      const info = await shortStore.get('key');
      expect(info).toBeNull();
      await shortStore.shutdown();
    });

    it('tracks multiple increments correctly', async () => {
      for (let i = 0; i < 10; i++) {
        await store.increment('key');
      }

      const info = await store.get('key');
      expect(info!.remaining).toBe(0);
      expect(info!.limited).toBe(false);

      // One more puts us over
      const overLimit = await store.increment('key');
      expect(overLimit.remaining).toBe(0);
      expect(overLimit.limited).toBe(true);
    });

    it('shutdown clears all entries and stops cleanup interval', async () => {
      await store.increment('key1');
      await store.increment('key2');

      await store.shutdown();

      const info1 = await store.get('key1');
      const info2 = await store.get('key2');
      expect(info1).toBeNull();
      expect(info2).toBeNull();
    });
  });

  describe('SlidingWindowStore', () => {
    let store: SlidingWindowStore;

    beforeEach(() => {
      store = new SlidingWindowStore({ windowMs: 60000, max: 10 });
    });

    it('tracks timestamps in rolling window', async () => {
      const info1 = await store.increment('key');
      expect(info1.remaining).toBe(9);

      const info2 = await store.increment('key');
      expect(info2.remaining).toBe(8);

      const info3 = await store.increment('key');
      expect(info3.remaining).toBe(7);
    });

    it('removes expired timestamps on increment', async () => {
      const shortStore = new SlidingWindowStore({ windowMs: 50, max: 10 });

      await shortStore.increment('key');
      await shortStore.increment('key');
      await shortStore.increment('key');

      // Wait for the window to expire
      await new Promise((resolve) => setTimeout(resolve, 60));

      // This increment should clear old timestamps and start fresh
      const info = await shortStore.increment('key');
      expect(info.remaining).toBe(9); // Only 1 active timestamp
      await shortStore.shutdown();
    });

    it('decrement removes the most recent timestamp', async () => {
      await store.increment('key');
      await store.increment('key');
      await store.increment('key');

      const before = await store.get('key');
      expect(before!.remaining).toBe(7);

      await store.decrement('key');
      const after = await store.get('key');
      expect(after!.remaining).toBe(8);
    });

    it('reset removes all timestamps for a key', async () => {
      await store.increment('key');
      await store.increment('key');

      await store.reset('key');
      const info = await store.get('key');
      expect(info).toBeNull();
    });

    it('get returns null for non-existent key', async () => {
      const info = await store.get('nonexistent');
      expect(info).toBeNull();
    });

    it('correctly identifies when limit is exceeded', async () => {
      for (let i = 0; i < 10; i++) {
        await store.increment('key');
      }

      const atLimit = await store.get('key');
      expect(atLimit!.remaining).toBe(0);
      expect(atLimit!.limited).toBe(false);

      const overLimit = await store.increment('key');
      expect(overLimit.limited).toBe(true);
      expect(overLimit.remaining).toBe(0);
    });
  });

  describe('rateLimit middleware', () => {
    it('allows requests within limit', async () => {
      const middleware = rateLimit({ max: 5, windowMs: 60000 });

      const ctx = createMockContext('http://localhost/test', {
        headers: { 'x-forwarded-for': '127.0.0.1' },
      });

      const result = await middleware(ctx);
      expect(result).toBeUndefined();

      const info = getRateLimitInfo(ctx);
      expect(info).toBeDefined();
      expect(info!.limited).toBe(false);
      expect(info!.remaining).toBe(4);
    });

    it('returns 429 when exceeded', async () => {
      const middleware = rateLimit({ max: 2, windowMs: 60000 });

      // Exhaust the limit with 2 requests
      for (let i = 0; i < 2; i++) {
        const ctx = createMockContext('http://localhost/test', {
          headers: { 'x-forwarded-for': '10.0.0.1' },
        });
        await middleware(ctx);
      }

      // Third request should be rate limited
      const ctx = createMockContext('http://localhost/test', {
        headers: { 'x-forwarded-for': '10.0.0.1' },
      });
      const response = await middleware(ctx);

      expect(response).toBeInstanceOf(Response);
      expect(response!.status).toBe(429);

      const body = await response!.json();
      expect(body.error).toBe('Too Many Requests');
    });

    it('skip function bypasses rate limiting', async () => {
      const middleware = rateLimit({
        max: 1,
        windowMs: 60000,
        skip: () => true,
      });

      const ctx = createMockContext('http://localhost/test', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });
      const result = await middleware(ctx);

      expect(result).toBeUndefined();
      // When skipped, no rate limit info should be set
      const info = getRateLimitInfo(ctx);
      expect(info).toBeUndefined();
    });

    it('custom keyGenerator', async () => {
      const middleware = rateLimit({
        max: 2,
        windowMs: 60000,
        keyGenerator: (ctx) => ctx.header('x-api-key') || 'anonymous',
      });

      // Two requests with different API keys should not share limits
      const ctx1 = createMockContext('http://localhost/test', {
        headers: { 'x-api-key': 'key-a' },
      });
      const ctx2 = createMockContext('http://localhost/test', {
        headers: { 'x-api-key': 'key-b' },
      });

      await middleware(ctx1);
      await middleware(ctx2);

      const info1 = getRateLimitInfo(ctx1);
      const info2 = getRateLimitInfo(ctx2);

      expect(info1!.remaining).toBe(1);
      expect(info2!.remaining).toBe(1);
    });

    it('sets rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining)', async () => {
      const middleware = rateLimit({
        max: 100,
        windowMs: 60000,
        headers: true,
        legacyHeaders: true,
      });

      const ctx = createMockContext('http://localhost/test', {
        headers: { 'x-forwarded-for': '172.16.0.1' },
      });
      await middleware(ctx);

      const headers = (ctx as any)._rateLimitHeaders;
      expect(headers).toBeDefined();
      expect(headers['X-RateLimit-Limit']).toBe('100');
      expect(headers['X-RateLimit-Remaining']).toBe('99');
      expect(headers['X-RateLimit-Reset']).toBeDefined();
    });

    it('sets standard draft-6 headers', async () => {
      const middleware = rateLimit({
        max: 50,
        windowMs: 60000,
        headers: true,
        standardHeaders: 'draft-6',
      });

      const ctx = createMockContext('http://localhost/test', {
        headers: { 'x-forwarded-for': '172.16.0.2' },
      });
      await middleware(ctx);

      const headers = (ctx as any)._rateLimitHeaders;
      expect(headers['RateLimit-Limit']).toBe('50');
      expect(headers['RateLimit-Remaining']).toBe('49');
      expect(headers['RateLimit-Reset']).toBeDefined();
    });

    it('uses default IP-based key generator from x-forwarded-for', async () => {
      const middleware = rateLimit({ max: 5, windowMs: 60000 });

      const ctx1 = createMockContext('http://localhost/test', {
        headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
      });
      await middleware(ctx1);

      const ctx2 = createMockContext('http://localhost/test', {
        headers: { 'x-forwarded-for': '1.2.3.4' },
      });
      await middleware(ctx2);

      // Same IP (1.2.3.4) should share the counter
      const info = getRateLimitInfo(ctx2);
      expect(info!.remaining).toBe(3);
    });

    it('custom handler is called when rate limited', async () => {
      const customHandler = vi.fn((_ctx, _info) => {
        return new Response('Custom rate limit response', { status: 429 });
      });

      const middleware = rateLimit({
        max: 1,
        windowMs: 60000,
        handler: customHandler,
      });

      // First request - allowed
      const ctx1 = createMockContext('http://localhost/test', {
        headers: { 'x-forwarded-for': '10.10.10.10' },
      });
      await middleware(ctx1);

      // Second request - should trigger handler
      const ctx2 = createMockContext('http://localhost/test', {
        headers: { 'x-forwarded-for': '10.10.10.10' },
      });
      const response = await middleware(ctx2);

      expect(customHandler).toHaveBeenCalledOnce();
      expect(response).toBeInstanceOf(Response);
      expect(response!.status).toBe(429);
    });
  });
});
