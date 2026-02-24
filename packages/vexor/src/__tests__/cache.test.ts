/**
 * Cache Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MemoryCacheStore,
  LRUCacheStore,
  CacheManager,
  createMemoryCache,
  createCache,
} from '../cache/index.js';
import type { CacheEntry } from '../cache/index.js';

/**
 * Helper: create a cache entry with the given value and TTL (ms)
 */
function makeEntry<T>(value: T, ttlMs: number): CacheEntry<T> {
  const now = Date.now();
  return {
    value,
    createdAt: now,
    expiresAt: now + ttlMs,
  };
}

describe('MemoryCacheStore', () => {
  let store: MemoryCacheStore;

  beforeEach(() => {
    // Use a very large cleanup interval to avoid interference in tests
    store = new MemoryCacheStore(999999);
  });

  it('should set and get a value', async () => {
    const entry = makeEntry('hello', 60_000);
    await store.set('key1', entry);

    const result = await store.get<string>('key1');
    expect(result).not.toBeNull();
    expect(result!.value).toBe('hello');
  });

  it('should return null for non-existent key', async () => {
    const result = await store.get('missing');
    expect(result).toBeNull();
  });

  it('should delete a key', async () => {
    await store.set('key1', makeEntry('val', 60_000));
    await store.delete('key1');

    const result = await store.get('key1');
    expect(result).toBeNull();
  });

  it('should clear all entries', async () => {
    await store.set('a', makeEntry(1, 60_000));
    await store.set('b', makeEntry(2, 60_000));
    await store.clear();

    expect(await store.get('a')).toBeNull();
    expect(await store.get('b')).toBeNull();
  });

  it('should check if a key exists with has()', async () => {
    await store.set('exists', makeEntry(true, 60_000));

    expect(await store.has('exists')).toBe(true);
    expect(await store.has('nope')).toBe(false);
  });

  it('should return all keys with keys()', async () => {
    await store.set('alpha', makeEntry(1, 60_000));
    await store.set('beta', makeEntry(2, 60_000));

    const keys = await store.keys();
    expect(keys).toContain('alpha');
    expect(keys).toContain('beta');
  });

  it('should return null for expired entries', async () => {
    // Create an entry that already expired (TTL of -1ms)
    const entry = makeEntry('stale', -1);
    await store.set('expired', entry);

    const result = await store.get('expired');
    expect(result).toBeNull();
  });

  it('should report has() as false for expired entries', async () => {
    const entry = makeEntry('stale', -1);
    await store.set('expired', entry);

    expect(await store.has('expired')).toBe(false);
  });
});

describe('LRUCacheStore', () => {
  it('should evict the oldest entry when at capacity', async () => {
    const store = new LRUCacheStore(2);

    await store.set('a', makeEntry('A', 60_000));
    await store.set('b', makeEntry('B', 60_000));
    await store.set('c', makeEntry('C', 60_000)); // should evict 'a'

    expect(await store.get('a')).toBeNull();
    expect(await store.get('b')).not.toBeNull();
    expect(await store.get('c')).not.toBeNull();
  });

  it('should move item to most-recently-used on get', async () => {
    const store = new LRUCacheStore(2);

    await store.set('a', makeEntry('A', 60_000));
    await store.set('b', makeEntry('B', 60_000));

    // Access 'a' to make it most recently used
    await store.get('a');

    // Add 'c' - should evict 'b' (the least recently used), not 'a'
    await store.set('c', makeEntry('C', 60_000));

    expect(await store.get('a')).not.toBeNull();
    expect(await store.get('b')).toBeNull();
    expect(await store.get('c')).not.toBeNull();
  });

  it('should return null for expired entries', async () => {
    const store = new LRUCacheStore(10);
    await store.set('old', makeEntry('expired', -1));

    expect(await store.get('old')).toBeNull();
  });

  it('should update position when setting existing key', async () => {
    const store = new LRUCacheStore(2);

    await store.set('a', makeEntry('A', 60_000));
    await store.set('b', makeEntry('B', 60_000));

    // Update 'a' to move it to most recently used
    await store.set('a', makeEntry('A-updated', 60_000));

    // Add 'c' - should evict 'b', not 'a'
    await store.set('c', makeEntry('C', 60_000));

    const a = await store.get('a');
    expect(a).not.toBeNull();
    expect(a!.value).toBe('A-updated');
    expect(await store.get('b')).toBeNull();
  });

  it('should support clear', async () => {
    const store = new LRUCacheStore(5);
    await store.set('x', makeEntry(1, 60_000));
    await store.set('y', makeEntry(2, 60_000));

    await store.clear();

    expect(await store.get('x')).toBeNull();
    expect(await store.get('y')).toBeNull();
  });

  it('should support has and delete', async () => {
    const store = new LRUCacheStore(5);
    await store.set('k', makeEntry('v', 60_000));

    expect(await store.has('k')).toBe(true);
    await store.delete('k');
    expect(await store.has('k')).toBe(false);
  });
});

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager({
      store: new MemoryCacheStore(999999),
      ttl: 60,
      prefix: 'test:',
    });
  });

  describe('get', () => {
    it('should return null on cache miss and increment misses', async () => {
      const result = await cache.get('nonexistent');
      expect(result).toBeNull();

      const stats = cache.getStats();
      expect(stats.misses).toBe(1);
    });
  });

  describe('set/get round-trip', () => {
    it('should store and retrieve a value, incrementing sets and hits', async () => {
      await cache.set('user:1', { name: 'Alice' });
      const result = await cache.get('user:1');

      expect(result).toEqual({ name: 'Alice' });

      const stats = cache.getStats();
      expect(stats.sets).toBe(1);
      expect(stats.hits).toBe(1);
    });
  });

  describe('TTL expiration', () => {
    it('should expire entries after TTL', async () => {
      // Use a very short TTL
      const shortCache = new CacheManager({
        store: new MemoryCacheStore(999999),
        ttl: 0, // 0 seconds = immediate expiration
        prefix: 'short:',
      });

      await shortCache.set('key', 'value');

      // The TTL is 0s, meaning expiresAt = now, so next read should be expired
      // We need a tiny delay to ensure Date.now() moves past expiresAt
      await new Promise((resolve) => setTimeout(resolve, 5));

      const result = await shortCache.get('key');
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should remove an entry and increment deletes', async () => {
      await cache.set('to-remove', 'value');
      await cache.delete('to-remove');

      const result = await cache.get('to-remove');
      expect(result).toBeNull();

      const stats = cache.getStats();
      expect(stats.deletes).toBe(1);
    });
  });

  describe('getOrSet', () => {
    it('should return cached value on hit', async () => {
      await cache.set('cached', 'existing');

      const factory = vi.fn(() => 'new-value');
      const result = await cache.getOrSet('cached', factory);

      expect(result).toBe('existing');
      expect(factory).not.toHaveBeenCalled();
    });

    it('should call factory and cache result on miss', async () => {
      const factory = vi.fn(() => 'computed');
      const result = await cache.getOrSet('fresh', factory);

      expect(result).toBe('computed');
      expect(factory).toHaveBeenCalledOnce();

      // Verify it was cached
      const cached = await cache.get('fresh');
      expect(cached).toBe('computed');
    });

    it('should support async factory functions', async () => {
      const result = await cache.getOrSet('async-key', async () => {
        return 'async-value';
      });

      expect(result).toBe('async-value');
    });
  });

  describe('getStats', () => {
    it('should return correct hit rate', async () => {
      await cache.set('a', 1);
      await cache.get('a'); // hit
      await cache.get('a'); // hit
      await cache.get('missing'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.sets).toBe(1);
      expect(stats.hitRate).toBeCloseTo(2 / 3);
    });

    it('should return 0 hit rate when no requests made', () => {
      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('has', () => {
    it('should return true for existing key', async () => {
      await cache.set('present', 'yes');
      expect(await cache.has('present')).toBe(true);
    });

    it('should return false for missing key', async () => {
      expect(await cache.has('absent')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', async () => {
      await cache.set('x', 1);
      await cache.set('y', 2);
      await cache.clear();

      expect(await cache.get('x')).toBeNull();
      expect(await cache.get('y')).toBeNull();
    });
  });

  describe('resetStats', () => {
    it('should reset all counters', async () => {
      await cache.set('a', 1);
      await cache.get('a');
      await cache.get('miss');

      cache.resetStats();
      const stats = cache.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.sets).toBe(0);
      expect(stats.deletes).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });
});

describe('factory functions', () => {
  describe('createMemoryCache', () => {
    it('should create a CacheManager with MemoryCacheStore by default', async () => {
      const cache = createMemoryCache({ ttl: 30 });

      await cache.set('key', 'value');
      const result = await cache.get('key');
      expect(result).toBe('value');
    });

    it('should create a CacheManager with LRU store when maxSize is specified', async () => {
      const cache = createMemoryCache({ maxSize: 2, ttl: 60 });

      await cache.set('a', 1);
      await cache.set('b', 2);
      await cache.set('c', 3); // should evict 'a'

      expect(await cache.get('a')).toBeNull();
      expect(await cache.get('b')).not.toBeNull();
    });
  });

  describe('createCache', () => {
    it('should create a CacheManager with default options', async () => {
      const cache = createCache();

      await cache.set('hello', 'world');
      expect(await cache.get('hello')).toBe('world');
    });

    it('should respect custom prefix', async () => {
      const cache = createCache({ prefix: 'custom:' });

      await cache.set('key', 'val');
      const result = await cache.get('key');
      expect(result).toBe('val');
    });
  });
});
