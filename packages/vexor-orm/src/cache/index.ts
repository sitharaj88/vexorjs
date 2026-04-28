/**
 * Query Result Cache
 *
 * TTL-based cache for SELECT query results. Pluggable backend via the
 * `QueryCacheStore` interface — ships with an in-memory implementation;
 * users can plug in Redis or any KV store.
 *
 * The cache is *opt-in per query*: callers wrap a query function in
 * `cache.wrap(key, ttlMs, fn)` rather than caching every call. This keeps
 * write paths and stale-sensitive reads out of the cache by default.
 */

export interface QueryCacheStore {
  get<T>(key: string): Promise<T | undefined> | T | undefined;
  set<T>(key: string, value: T, ttlMs: number): Promise<void> | void;
  delete(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
}

interface MemoryEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-memory store with per-entry TTL and a hard cap on total entries.
 *
 * Eviction is approximate-LRU: at capacity, the oldest entry by `expiresAt`
 * is dropped (cheap and good enough for query caches; if precision matters,
 * use a Redis-backed store instead).
 */
export class MemoryCacheStore implements QueryCacheStore {
  private store = new Map<string, MemoryEntry<unknown>>();
  private readonly maxEntries: number;

  constructor(options: { maxEntries?: number } = {}) {
    this.maxEntries = options.maxEntries ?? 1000;
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      this.evictOldest();
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  private evictOldest(): void {
    let oldestKey: string | undefined;
    let oldestExp = Infinity;
    for (const [k, e] of this.store.entries()) {
      if (e.expiresAt < oldestExp) {
        oldestExp = e.expiresAt;
        oldestKey = k;
      }
    }
    if (oldestKey !== undefined) this.store.delete(oldestKey);
  }
}

/**
 * Build a cache key from a SQL string and its params.
 */
export function buildCacheKey(
  sql: string,
  params: unknown[] = [],
  prefix = 'q'
): string {
  return `${prefix}:${sql}::${JSON.stringify(params ?? [])}`;
}

export interface QueryCacheOptions {
  store?: QueryCacheStore;
  defaultTtlMs?: number;
}

/**
 * Cache facade with a `wrap()` helper.
 *
 *   const cache = createQueryCache({ defaultTtlMs: 30_000 });
 *   const users = await cache.wrap(
 *     'users:list',
 *     60_000,
 *     () => db.execute('SELECT * FROM users')
 *   );
 */
export class QueryCache {
  readonly store: QueryCacheStore;
  readonly defaultTtlMs: number;

  constructor(options: QueryCacheOptions = {}) {
    this.store = options.store ?? new MemoryCacheStore();
    this.defaultTtlMs = options.defaultTtlMs ?? 60_000;
  }

  async get<T>(key: string): Promise<T | undefined> {
    return await this.store.get<T>(key);
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    await this.store.set(key, value, ttlMs ?? this.defaultTtlMs);
  }

  async delete(key: string): Promise<void> {
    await this.store.delete(key);
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }

  /**
   * Run `fn()` only on cache miss; cache the result for `ttlMs` (or default).
   * Concurrent callers with the same key all see the same in-flight promise.
   */
  async wrap<T>(
    key: string,
    ttlMs: number | undefined,
    fn: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) return cached;

    const inflight = this.inflight.get(key) as Promise<T> | undefined;
    if (inflight) return inflight;

    const promise = fn()
      .then(async (value) => {
        await this.set(key, value, ttlMs);
        return value;
      })
      .finally(() => {
        this.inflight.delete(key);
      });

    this.inflight.set(key, promise);
    return promise;
  }

  private inflight = new Map<string, Promise<unknown>>();
}

export function createQueryCache(options: QueryCacheOptions = {}): QueryCache {
  return new QueryCache(options);
}
