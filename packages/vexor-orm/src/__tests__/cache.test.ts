/**
 * Query Cache Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  MemoryCacheStore,
  QueryCache,
  buildCacheKey,
  createQueryCache,
} from '../cache/index.js';

describe('buildCacheKey', () => {
  it('combines prefix, SQL, and serialized params', () => {
    expect(buildCacheKey('SELECT 1 WHERE x=$1', [42])).toBe(
      'q:SELECT 1 WHERE x=$1::[42]'
    );
  });

  it('uses an empty array for missing params', () => {
    expect(buildCacheKey('SELECT 1')).toBe('q:SELECT 1::[]');
  });

  it('respects custom prefixes (useful for cache invalidation by namespace)', () => {
    expect(buildCacheKey('SELECT 1', [], 'users')).toBe('users:SELECT 1::[]');
  });

  it('different params produce different keys', () => {
    expect(buildCacheKey('q', [1])).not.toBe(buildCacheKey('q', [2]));
  });
});

describe('MemoryCacheStore', () => {
  let store: MemoryCacheStore;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new MemoryCacheStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns undefined for missing keys', () => {
    expect(store.get('missing')).toBeUndefined();
  });

  it('stores and retrieves values', () => {
    store.set('a', 'value', 1000);
    expect(store.get('a')).toBe('value');
  });

  it('expires entries after their TTL', () => {
    store.set('a', 'value', 1000);
    vi.advanceTimersByTime(1001);
    expect(store.get('a')).toBeUndefined();
  });

  it('deletes specific keys', () => {
    store.set('a', 1, 1000);
    store.set('b', 2, 1000);
    store.delete('a');
    expect(store.get('a')).toBeUndefined();
    expect(store.get('b')).toBe(2);
  });

  it('clear() removes all entries', () => {
    store.set('a', 1, 1000);
    store.set('b', 2, 1000);
    store.clear();
    expect(store.size()).toBe(0);
  });

  it('evicts oldest entry when at capacity', () => {
    const small = new MemoryCacheStore({ maxEntries: 2 });
    small.set('a', 1, 1000);
    vi.advanceTimersByTime(10);
    small.set('b', 2, 1000);
    vi.advanceTimersByTime(10);
    small.set('c', 3, 1000); // 'a' should be evicted (oldest expiresAt)

    expect(small.get('a')).toBeUndefined();
    expect(small.get('b')).toBe(2);
    expect(small.get('c')).toBe(3);
  });

  it('overwriting an existing key does not trigger eviction', () => {
    const small = new MemoryCacheStore({ maxEntries: 2 });
    small.set('a', 1, 1000);
    small.set('b', 2, 1000);
    small.set('a', 11, 1000);

    expect(small.size()).toBe(2);
    expect(small.get('a')).toBe(11);
    expect(small.get('b')).toBe(2);
  });
});

describe('QueryCache', () => {
  let cache: QueryCache;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = createQueryCache({ defaultTtlMs: 1000 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('wrap returns the function result on a miss and caches it', async () => {
    const fn = vi.fn().mockResolvedValue('value');

    const a = await cache.wrap('key', undefined, fn);
    const b = await cache.wrap('key', undefined, fn);

    expect(a).toBe('value');
    expect(b).toBe('value');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('wrap respects per-call TTL override', async () => {
    const fn = vi.fn().mockResolvedValue(42);
    await cache.wrap('k', 500, fn);

    vi.advanceTimersByTime(600);
    await cache.wrap('k', 500, fn);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('wrap dedupes concurrent in-flight calls for the same key', async () => {
    let resolveFn!: (v: string) => void;
    const slow = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveFn = resolve;
        })
    );

    const p1 = cache.wrap('shared', 1000, slow);
    const p2 = cache.wrap('shared', 1000, slow);

    // Allow the cache lookup microtasks (`await store.get`) to flush so the
    // wrapped fn has a chance to register itself in the inflight map.
    await vi.advanceTimersByTimeAsync(0);

    expect(slow).toHaveBeenCalledTimes(1);

    resolveFn('done');
    expect(await p1).toBe('done');
    expect(await p2).toBe('done');
  });

  it('delete removes a single entry', async () => {
    await cache.set('a', 1);
    await cache.delete('a');
    expect(await cache.get('a')).toBeUndefined();
  });

  it('clear empties the cache', async () => {
    await cache.set('a', 1);
    await cache.set('b', 2);
    await cache.clear();
    expect(await cache.get('a')).toBeUndefined();
    expect(await cache.get('b')).toBeUndefined();
  });

  it('supports a custom store backend', async () => {
    const calls: string[] = [];
    const customStore = {
      get: vi.fn(async () => undefined),
      set: vi.fn(async (k: string) => {
        calls.push(`set:${k}`);
      }),
      delete: vi.fn(async () => {}),
      clear: vi.fn(async () => {}),
    };

    const c = new QueryCache({ store: customStore });
    await c.wrap('x', 1000, async () => 'v');

    expect(customStore.get).toHaveBeenCalledWith('x');
    expect(calls).toEqual(['set:x']);
  });

  it('failures in the wrapped fn do not poison subsequent calls', async () => {
    const failing = vi
      .fn<[], Promise<string>>()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce('ok');

    await expect(cache.wrap('k', 1000, failing)).rejects.toThrow('boom');
    const result = await cache.wrap('k', 1000, failing);
    expect(result).toBe('ok');
  });
});
