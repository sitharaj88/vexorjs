/**
 * Caching Layer
 *
 * Flexible caching with multiple store backends (memory, Redis).
 * Supports TTL, invalidation, and cache-aside patterns.
 */

import type { VexorContext } from '../core/context.js';

// ============================================================================
// Types
// ============================================================================

export interface CacheOptions {
  /**
   * Time to live in seconds
   * Default: 300 (5 minutes)
   */
  ttl?: number;

  /**
   * Cache store
   * Default: MemoryStore
   */
  store?: CacheStore;

  /**
   * Key prefix
   * Default: 'cache:'
   */
  prefix?: string;

  /**
   * Key generator function
   */
  keyGenerator?: (ctx: VexorContext) => string;

  /**
   * Whether to cache errors
   * Default: false
   */
  cacheErrors?: boolean;

  /**
   * Stale-while-revalidate time in seconds
   * Default: 0 (disabled)
   */
  staleWhileRevalidate?: number;

  /**
   * Skip caching condition
   */
  skip?: (ctx: VexorContext) => boolean | Promise<boolean>;

  /**
   * Cache hit callback
   */
  onHit?: (key: string, ctx: VexorContext) => void;

  /**
   * Cache miss callback
   */
  onMiss?: (key: string, ctx: VexorContext) => void;
}

export interface CacheEntry<T = unknown> {
  value: T;
  createdAt: number;
  expiresAt: number;
  staleAt?: number;
}

export interface CacheStore {
  get<T>(key: string): Promise<CacheEntry<T> | null>;
  set<T>(key: string, entry: CacheEntry<T>): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  keys(pattern?: string): Promise<string[]>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

// ============================================================================
// Memory Store
// ============================================================================

export class MemoryCacheStore implements CacheStore {
  private cache = new Map<string, CacheEntry>();
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(cleanupIntervalMs: number = 60000) {
    this.cleanupInterval = setInterval(() => this.cleanup(), cleanupIntervalMs);
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  async set<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    this.cache.set(key, entry);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    const entry = await this.get(key);
    return entry !== null;
  }

  async keys(pattern?: string): Promise<string[]> {
    const allKeys = Array.from(this.cache.keys());
    if (!pattern) return allKeys;

    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return allKeys.filter((key) => regex.test(key));
  }

  shutdown(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// ============================================================================
// LRU Cache Store
// ============================================================================

export class LRUCacheStore implements CacheStore {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry;
  }

  async set<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    // Remove if exists to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, entry);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    const entry = await this.get(key);
    return entry !== null;
  }

  async keys(pattern?: string): Promise<string[]> {
    const allKeys = Array.from(this.cache.keys());
    if (!pattern) return allKeys;

    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return allKeys.filter((key) => regex.test(key));
  }
}

// ============================================================================
// Redis Store
// ============================================================================

export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<void>;
  del(key: string | string[]): Promise<void>;
  keys(pattern: string): Promise<string[]>;
  exists(key: string): Promise<number>;
  flushdb(): Promise<void>;
}

export class RedisCacheStore implements CacheStore {
  private client: RedisClient;
  private prefix: string;

  constructor(client: RedisClient, prefix: string = '') {
    this.client = client;
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return this.prefix + key;
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    const data = await this.client.get(this.getKey(key));
    if (!data) return null;

    try {
      const entry = JSON.parse(data) as CacheEntry<T>;

      // Check expiration (Redis TTL should handle this, but double-check)
      if (Date.now() > entry.expiresAt) {
        await this.delete(key);
        return null;
      }

      return entry;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    const ttlSeconds = Math.ceil((entry.expiresAt - Date.now()) / 1000);
    await this.client.set(
      this.getKey(key),
      JSON.stringify(entry),
      { EX: ttlSeconds }
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.del(this.getKey(key));
  }

  async clear(): Promise<void> {
    const keys = await this.keys('*');
    if (keys.length > 0) {
      await this.client.del(keys.map((k) => this.getKey(k)));
    }
  }

  async has(key: string): Promise<boolean> {
    const exists = await this.client.exists(this.getKey(key));
    return exists > 0;
  }

  async keys(pattern?: string): Promise<string[]> {
    const redisPattern = this.getKey(pattern || '*');
    const keys = await this.client.keys(redisPattern);
    return keys.map((k) => k.slice(this.prefix.length));
  }
}

// ============================================================================
// Cache Manager
// ============================================================================

export class CacheManager {
  private store: CacheStore;
  private defaultTtl: number;
  private prefix: string;
  private stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };

  constructor(options: {
    store?: CacheStore;
    ttl?: number;
    prefix?: string;
  } = {}) {
    this.store = options.store ?? new MemoryCacheStore();
    this.defaultTtl = options.ttl ?? 300;
    this.prefix = options.prefix ?? 'cache:';
  }

  private getKey(key: string): string {
    return this.prefix + key;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = await this.store.get<T>(this.getKey(key));

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const now = Date.now();
    const ttlMs = (ttl ?? this.defaultTtl) * 1000;

    const entry: CacheEntry<T> = {
      value,
      createdAt: now,
      expiresAt: now + ttlMs,
    };

    await this.store.set(this.getKey(key), entry);
    this.stats.sets++;
  }

  async delete(key: string): Promise<void> {
    await this.store.delete(this.getKey(key));
    this.stats.deletes++;
  }

  async has(key: string): Promise<boolean> {
    return this.store.has(this.getKey(key));
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }

  async keys(pattern?: string): Promise<string[]> {
    return this.store.keys(pattern ? this.prefix + pattern : undefined);
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  async invalidate(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    for (const key of keys) {
      await this.store.delete(key);
    }
    return keys.length;
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  resetStats(): void {
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }
}

// ============================================================================
// Cache Middleware
// ============================================================================

/**
 * Create cache middleware for response caching
 */
export function cacheMiddleware(options: CacheOptions = {}) {
  const ttl = options.ttl ?? 300;
  const store = options.store ?? new MemoryCacheStore();
  const prefix = options.prefix ?? 'http:';
  const staleWhileRevalidate = options.staleWhileRevalidate ?? 0;

  const defaultKeyGenerator = (ctx: VexorContext) => {
    return `${ctx.method}:${ctx.url}`;
  };

  const keyGenerator = options.keyGenerator ?? defaultKeyGenerator;

  return async (ctx: VexorContext): Promise<Response | void> => {
    // Only cache GET requests by default
    if (ctx.method !== 'GET') {
      return;
    }

    // Check skip condition
    if (options.skip && await options.skip(ctx)) {
      return;
    }

    const key = prefix + keyGenerator(ctx);
    const entry = await store.get<{ status: number; headers: [string, string][]; body: string }>(key);

    if (entry) {
      // Check if stale
      const isStale = entry.staleAt && Date.now() > entry.staleAt;

      if (!isStale || staleWhileRevalidate === 0) {
        // Return cached response
        options.onHit?.(key, ctx);

        const headers = new Headers(entry.value.headers);
        headers.set('X-Cache', 'HIT');

        return new Response(entry.value.body, {
          status: entry.value.status,
          headers,
        });
      }

      // Stale-while-revalidate: return stale and trigger background refresh
      // (In a real implementation, this would trigger a background task)
      options.onHit?.(key, ctx);

      const headers = new Headers(entry.value.headers);
      headers.set('X-Cache', 'STALE');

      return new Response(entry.value.body, {
        status: entry.value.status,
        headers,
      });
    }

    options.onMiss?.(key, ctx);

    // Store key for caching the response later
    (ctx as any)._cacheKey = key;
    (ctx as any)._cacheOptions = { ttl, store, staleWhileRevalidate };
  };
}

/**
 * Cache a response (call after getting response)
 */
export async function cacheResponse(
  ctx: VexorContext,
  response: Response
): Promise<Response> {
  const key = (ctx as any)._cacheKey;
  const options = (ctx as any)._cacheOptions;

  if (!key || !options) {
    return response;
  }

  // Don't cache error responses
  if (response.status >= 400) {
    return response;
  }

  const now = Date.now();
  const ttlMs = options.ttl * 1000;
  const staleMs = options.staleWhileRevalidate * 1000;

  // Clone response to read body
  const clonedResponse = response.clone();
  const body = await clonedResponse.text();

  // Convert headers to array of tuples
  const headerEntries: [string, string][] = [];
  response.headers.forEach((value, key) => {
    headerEntries.push([key, value]);
  });

  const entry: CacheEntry<{ status: number; headers: [string, string][]; body: string }> = {
    value: {
      status: response.status,
      headers: headerEntries,
      body,
    },
    createdAt: now,
    expiresAt: now + ttlMs + staleMs,
    ...(staleMs > 0 && { staleAt: now + ttlMs }),
  };

  await options.store.set(key, entry);

  // Add cache header
  const headers = new Headers(response.headers);
  headers.set('X-Cache', 'MISS');

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a cache instance
 */
export function createCache(options?: {
  store?: CacheStore;
  ttl?: number;
  prefix?: string;
}): CacheManager {
  return new CacheManager(options);
}

/**
 * Create a memory cache
 */
export function createMemoryCache(options?: {
  ttl?: number;
  maxSize?: number;
  prefix?: string;
}): CacheManager {
  const store = options?.maxSize
    ? new LRUCacheStore(options.maxSize)
    : new MemoryCacheStore();

  return new CacheManager({
    store,
    ttl: options?.ttl,
    prefix: options?.prefix,
  });
}

/**
 * Create a Redis cache
 */
export function createRedisCache(
  client: RedisClient,
  options?: {
    ttl?: number;
    prefix?: string;
  }
): CacheManager {
  return new CacheManager({
    store: new RedisCacheStore(client, options?.prefix ?? 'cache:'),
    ttl: options?.ttl,
    prefix: '',
  });
}
