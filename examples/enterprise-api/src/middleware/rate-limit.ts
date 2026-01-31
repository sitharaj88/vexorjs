/**
 * Rate Limiting Middleware
 *
 * Token bucket algorithm implementation for rate limiting.
 * Works with Vexor's hook pattern (no next() function).
 */

import type { VexorContext } from '@vexorjs/core';
import { config } from '../config/index.js';
import { RateLimitError } from './error-handler.js';

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (ctx: VexorContext) => string;
  skip?: (ctx: VexorContext) => boolean;
  onLimitReached?: (ctx: VexorContext) => void;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
}, 60000); // Clean up every minute

const defaultOptions: RateLimitOptions = {
  windowMs: config.rateLimitWindowMs,
  maxRequests: config.rateLimitMaxRequests,
  keyGenerator: (ctx) => {
    // Use user ID if authenticated, otherwise use IP
    const userId = (ctx as any).userId;
    if (userId) return `user:${userId}`;

    // Get IP from various headers
    const forwardedFor = ctx.header('x-forwarded-for');
    if (forwardedFor) return `ip:${forwardedFor.split(',')[0].trim()}`;

    const realIp = ctx.header('x-real-ip');
    if (realIp) return `ip:${realIp}`;

    return 'ip:unknown';
  },
};

export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...defaultOptions, ...options };

  return async (ctx: VexorContext): Promise<void> => {
    // Skip rate limiting in test environment
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    // Skip if configured
    if (opts.skip && opts.skip(ctx)) {
      return;
    }

    const key = opts.keyGenerator!(ctx);
    const now = Date.now();

    let entry = store.get(key);

    if (!entry || entry.resetTime < now) {
      // Create new window
      entry = {
        count: 0,
        resetTime: now + opts.windowMs,
      };
      store.set(key, entry);
    }

    entry.count++;

    const remaining = Math.max(0, opts.maxRequests - entry.count);
    const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);

    // Store rate limit info in context for headers
    (ctx as any)._rateLimitHeaders = {
      'X-RateLimit-Limit': opts.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetSeconds.toString(),
    };

    if (entry.count > opts.maxRequests) {
      // Rate limit exceeded
      if (opts.onLimitReached) {
        opts.onLimitReached(ctx);
      }

      (ctx as any)._rateLimitHeaders['Retry-After'] = resetSeconds.toString();

      // Store rate limit exceeded flag for error handler
      (ctx as any)._rateLimitExceeded = true;
      (ctx as any)._rateLimitRetryAfter = resetSeconds;

      // Throw error to be caught by error handler
      throw new RateLimitError(resetSeconds);
    }
  };
}

/**
 * Stricter rate limit for sensitive endpoints (login, etc.)
 */
export function strictRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  });
}

/**
 * Helper to add rate limit headers to a response
 */
export function addRateLimitHeaders(ctx: VexorContext, headers: Headers): void {
  const rateLimitHeaders = (ctx as any)._rateLimitHeaders;
  if (rateLimitHeaders) {
    for (const [key, value] of Object.entries(rateLimitHeaders)) {
      headers.set(key, value as string);
    }
  }
}

/**
 * Reset rate limit for testing
 */
export function resetRateLimitStore(): void {
  store.clear();
}
