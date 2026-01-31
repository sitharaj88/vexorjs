/**
 * Rate Limiting Middleware
 *
 * Flexible rate limiting with multiple store options (memory, Redis).
 * Supports sliding window and fixed window algorithms.
 */

import type { VexorContext } from '../core/context.js';

// ============================================================================
// Types
// ============================================================================

export interface RateLimitOptions {
  /** Time window in milliseconds (default: 60000 = 1 minute) */
  windowMs?: number;
  /** Maximum requests per window (default: 100) */
  max?: number;
  /** Key generator function (default: IP-based) */
  keyGenerator?: (ctx: VexorContext) => string;
  /** Skip function - return true to skip rate limiting */
  skip?: (ctx: VexorContext) => boolean | Promise<boolean>;
  /** Handler when rate limit is exceeded */
  handler?: (ctx: VexorContext, info: RateLimitInfo) => Response | Promise<Response>;
  /** Whether to send rate limit headers (default: true) */
  headers?: boolean;
  /** Store for rate limit data (default: MemoryStore) */
  store?: RateLimitStore;
  /** Message when rate limited */
  message?: string | object;
  /** Status code when rate limited (default: 429) */
  statusCode?: number;
  /** Skip successful requests from counting */
  skipSuccessfulRequests?: boolean;
  /** Skip failed requests from counting */
  skipFailedRequests?: boolean;
  /** Standard headers (draft-6, draft-7, or false) */
  standardHeaders?: 'draft-6' | 'draft-7' | boolean;
  /** Legacy headers (X-RateLimit-*) */
  legacyHeaders?: boolean;
}

export interface RateLimitInfo {
  /** Total requests allowed per window */
  limit: number;
  /** Remaining requests in current window */
  remaining: number;
  /** Unix timestamp when the window resets */
  resetTime: number;
  /** Whether the request was rate limited */
  limited: boolean;
}

export interface RateLimitStore {
  /** Increment the counter and return current info */
  increment(key: string): Promise<RateLimitInfo>;
  /** Decrement the counter (for skipSuccessfulRequests/skipFailedRequests) */
  decrement(key: string): Promise<void>;
  /** Reset the counter for a key */
  reset(key: string): Promise<void>;
  /** Get current info without incrementing */
  get(key: string): Promise<RateLimitInfo | null>;
  /** Shutdown the store */
  shutdown?(): Promise<void>;
}

// ============================================================================
// Memory Store
// ============================================================================

interface MemoryStoreEntry {
  count: number;
  resetTime: number;
}

export class MemoryStore implements RateLimitStore {
  private hits = new Map<string, MemoryStoreEntry>();
  private windowMs: number;
  private max: number;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(options: { windowMs: number; max: number }) {
    this.windowMs = options.windowMs;
    this.max = options.max;

    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  async increment(key: string): Promise<RateLimitInfo> {
    const now = Date.now();
    let entry = this.hits.get(key);

    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    entry.count++;
    this.hits.set(key, entry);

    return {
      limit: this.max,
      remaining: Math.max(0, this.max - entry.count),
      resetTime: entry.resetTime,
      limited: entry.count > this.max,
    };
  }

  async decrement(key: string): Promise<void> {
    const entry = this.hits.get(key);
    if (entry && entry.count > 0) {
      entry.count--;
      this.hits.set(key, entry);
    }
  }

  async reset(key: string): Promise<void> {
    this.hits.delete(key);
  }

  async get(key: string): Promise<RateLimitInfo | null> {
    const entry = this.hits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return null;
    }

    return {
      limit: this.max,
      remaining: Math.max(0, this.max - entry.count),
      resetTime: entry.resetTime,
      limited: entry.count > this.max,
    };
  }

  async shutdown(): Promise<void> {
    clearInterval(this.cleanupInterval);
    this.hits.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.hits) {
      if (now > entry.resetTime) {
        this.hits.delete(key);
      }
    }
  }
}

// ============================================================================
// Sliding Window Store
// ============================================================================

interface SlidingWindowEntry {
  timestamps: number[];
}

export class SlidingWindowStore implements RateLimitStore {
  private hits = new Map<string, SlidingWindowEntry>();
  private windowMs: number;
  private max: number;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(options: { windowMs: number; max: number }) {
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  async increment(key: string): Promise<RateLimitInfo> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let entry = this.hits.get(key);
    if (!entry) {
      entry = { timestamps: [] };
    }

    // Remove expired timestamps
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

    // Add current timestamp
    entry.timestamps.push(now);
    this.hits.set(key, entry);

    const count = entry.timestamps.length;

    return {
      limit: this.max,
      remaining: Math.max(0, this.max - count),
      resetTime: now + this.windowMs,
      limited: count > this.max,
    };
  }

  async decrement(key: string): Promise<void> {
    const entry = this.hits.get(key);
    if (entry && entry.timestamps.length > 0) {
      entry.timestamps.pop();
      this.hits.set(key, entry);
    }
  }

  async reset(key: string): Promise<void> {
    this.hits.delete(key);
  }

  async get(key: string): Promise<RateLimitInfo | null> {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const entry = this.hits.get(key);

    if (!entry) {
      return null;
    }

    const validTimestamps = entry.timestamps.filter((t) => t > windowStart);
    const count = validTimestamps.length;

    return {
      limit: this.max,
      remaining: Math.max(0, this.max - count),
      resetTime: now + this.windowMs,
      limited: count > this.max,
    };
  }

  async shutdown(): Promise<void> {
    clearInterval(this.cleanupInterval);
    this.hits.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, entry] of this.hits) {
      entry.timestamps = entry.timestamps.filter((t) => t > windowStart);
      if (entry.timestamps.length === 0) {
        this.hits.delete(key);
      }
    }
  }
}

// ============================================================================
// Redis Store (for distributed rate limiting)
// ============================================================================

export interface RedisClient {
  eval(script: string, keys: string[], args: (string | number)[]): Promise<unknown>;
  del(key: string): Promise<void>;
  get(key: string): Promise<string | null>;
}

export class RedisStore implements RateLimitStore {
  private client: RedisClient;
  private windowMs: number;
  private max: number;
  private prefix: string;

  constructor(options: {
    client: RedisClient;
    windowMs: number;
    max: number;
    prefix?: string;
  }) {
    this.client = options.client;
    this.windowMs = options.windowMs;
    this.max = options.max;
    this.prefix = options.prefix ?? 'rl:';
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async increment(key: string): Promise<RateLimitInfo> {
    const redisKey = this.getKey(key);
    const now = Date.now();
    const resetTime = now + this.windowMs;

    // Lua script for atomic sliding window rate limiting
    const script = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local window = tonumber(ARGV[2])
      local limit = tonumber(ARGV[3])

      -- Remove old entries
      redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)

      -- Add current timestamp
      redis.call('ZADD', key, now, now .. ':' .. math.random())

      -- Get count
      local count = redis.call('ZCARD', key)

      -- Set expiry
      redis.call('PEXPIRE', key, window)

      return count
    `;

    const count = (await this.client.eval(
      script,
      [redisKey],
      [now, this.windowMs, this.max]
    )) as number;

    return {
      limit: this.max,
      remaining: Math.max(0, this.max - count),
      resetTime,
      limited: count > this.max,
    };
  }

  async decrement(key: string): Promise<void> {
    const redisKey = this.getKey(key);
    const script = `
      local key = KEYS[1]
      local members = redis.call('ZRANGE', key, -1, -1)
      if #members > 0 then
        redis.call('ZREM', key, members[1])
      end
    `;
    await this.client.eval(script, [redisKey], []);
  }

  async reset(key: string): Promise<void> {
    await this.client.del(this.getKey(key));
  }

  async get(key: string): Promise<RateLimitInfo | null> {
    const redisKey = this.getKey(key);
    const now = Date.now();

    const script = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local window = tonumber(ARGV[2])

      redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)
      return redis.call('ZCARD', key)
    `;

    const count = (await this.client.eval(
      script,
      [redisKey],
      [now, this.windowMs]
    )) as number;

    if (count === 0) {
      return null;
    }

    return {
      limit: this.max,
      remaining: Math.max(0, this.max - count),
      resetTime: now + this.windowMs,
      limited: count > this.max,
    };
  }
}

// ============================================================================
// Rate Limit Middleware
// ============================================================================

function getClientIp(ctx: VexorContext): string {
  const forwardedFor = ctx.header('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = ctx.header('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

const defaultOptions: Required<Omit<RateLimitOptions, 'store'>> & { store?: RateLimitStore } = {
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  keyGenerator: getClientIp,
  skip: () => false,
  handler: (ctx, info) => {
    return ctx
      .status(429)
      .json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((info.resetTime - Date.now()) / 1000)} seconds.`,
        retryAfter: Math.ceil((info.resetTime - Date.now()) / 1000),
      });
  },
  headers: true,
  message: 'Too many requests, please try again later.',
  statusCode: 429,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  standardHeaders: 'draft-6',
  legacyHeaders: true,
};

/**
 * Create rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const opts = { ...defaultOptions, ...options };

  // Create default store if not provided
  const store = opts.store ?? new MemoryStore({
    windowMs: opts.windowMs,
    max: opts.max,
  });

  return async (ctx: VexorContext): Promise<Response | void> => {
    // Check if we should skip
    if (await opts.skip(ctx)) {
      return;
    }

    // Generate key
    const key = opts.keyGenerator(ctx);

    // Increment counter
    const info = await store.increment(key);

    // Store info for later use (e.g., in error handler)
    (ctx as any)._rateLimitInfo = info;

    // Add headers
    if (opts.headers) {
      const headers: Record<string, string> = {};

      if (opts.legacyHeaders) {
        headers['X-RateLimit-Limit'] = String(info.limit);
        headers['X-RateLimit-Remaining'] = String(info.remaining);
        headers['X-RateLimit-Reset'] = String(Math.ceil(info.resetTime / 1000));
      }

      if (opts.standardHeaders === 'draft-6') {
        headers['RateLimit-Limit'] = String(info.limit);
        headers['RateLimit-Remaining'] = String(info.remaining);
        headers['RateLimit-Reset'] = String(Math.ceil((info.resetTime - Date.now()) / 1000));
      } else if (opts.standardHeaders === 'draft-7') {
        headers['RateLimit'] = `limit=${info.limit}, remaining=${info.remaining}, reset=${Math.ceil((info.resetTime - Date.now()) / 1000)}`;
      }

      // Store headers for response
      (ctx as any)._rateLimitHeaders = headers;
    }

    // Check if rate limited
    if (info.limited) {
      return opts.handler(ctx, info);
    }
  };
}

/**
 * Get rate limit info from context
 */
export function getRateLimitInfo(ctx: VexorContext): RateLimitInfo | undefined {
  return (ctx as any)._rateLimitInfo;
}

/**
 * Create a rate limiter with custom key prefix
 */
export function createRateLimiter(options: RateLimitOptions = {}) {
  return rateLimit(options);
}

// Export convenience functions
export const slowDown = (options: RateLimitOptions & {
  delayAfter?: number;
  delayMs?: number;
  maxDelayMs?: number;
}) => {
  const delayAfter = options.delayAfter ?? Math.floor((options.max ?? 100) / 2);
  const delayMs = options.delayMs ?? 1000;
  const maxDelayMs = options.maxDelayMs ?? 5000;

  return async (ctx: VexorContext): Promise<void> => {
    const info = getRateLimitInfo(ctx);
    if (info) {
      const requestsOverLimit = (options.max ?? 100) - info.remaining - delayAfter;
      if (requestsOverLimit > 0) {
        const delay = Math.min(requestsOverLimit * delayMs, maxDelayMs);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };
};
