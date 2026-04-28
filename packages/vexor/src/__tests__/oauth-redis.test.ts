/**
 * Redis-backed OAuth Store Tests
 *
 * Tests against an in-memory fake that conforms to RedisLike. Validates
 * that both ioredis-style ('EX', seconds) and node-redis-style ({ EX })
 * call signatures are emitted correctly.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  RedisStateStore,
  RedisSessionStore,
  type RedisLike,
  type OAuthStateData,
  type OAuthUser,
} from '../auth/oauth.js';

// ---------------------------------------------------------------------------
// Fake Redis backed by a Map. Captures call args for assertion.
// ---------------------------------------------------------------------------

class FakeRedis implements RedisLike {
  store = new Map<string, string>();
  setCalls: unknown[][] = [];
  delCalls: string[] = [];

  async set(key: string, value: string, ...args: unknown[]) {
    this.setCalls.push([key, value, ...args]);
    this.store.set(key, value);
    return 'OK';
  }

  async get(key: string) {
    return this.store.get(key) ?? null;
  }

  async del(key: string) {
    this.delCalls.push(key);
    return this.store.delete(key) ? 1 : 0;
  }
}

const stateData: OAuthStateData = {
  provider: 'google',
  redirectUri: 'https://example.com/cb',
  createdAt: Date.now(),
};

const oauthUser: OAuthUser = {
  id: 'u1',
  provider: 'google',
  email: 'a@b.com',
  name: 'Alice',
} as OAuthUser;

// ---------------------------------------------------------------------------
// RedisStateStore
// ---------------------------------------------------------------------------

describe('RedisStateStore', () => {
  let redis: FakeRedis;

  beforeEach(() => {
    redis = new FakeRedis();
  });

  it('uses ioredis-style positional EX args by default', async () => {
    const store = new RedisStateStore(redis, { ttl: 300 });
    await store.set('abc', stateData);

    expect(redis.setCalls[0]).toEqual([
      'vexor:oauth:state:abc',
      JSON.stringify(stateData),
      'EX',
      300,
    ]);
  });

  it('uses node-redis-style { EX } when configured', async () => {
    const store = new RedisStateStore(redis, {
      ttl: 60,
      setStyle: 'options',
    });
    await store.set('xyz', stateData);

    expect(redis.setCalls[0]).toEqual([
      'vexor:oauth:state:xyz',
      JSON.stringify(stateData),
      { EX: 60 },
    ]);
  });

  it('defaults TTL to 600 seconds', async () => {
    const store = new RedisStateStore(redis);
    await store.set('a', stateData);
    expect(redis.setCalls[0][3]).toBe(600);
  });

  it('namespaces keys with the configured prefix', async () => {
    const store = new RedisStateStore(redis, { prefix: 'app:state:' });
    await store.set('k', stateData);
    expect(redis.setCalls[0][0]).toBe('app:state:k');
  });

  it('round-trips state data via get()', async () => {
    const store = new RedisStateStore(redis);
    await store.set('k', stateData);
    const result = await store.get('k');
    expect(result).toEqual(stateData);
  });

  it('returns null when the key is missing', async () => {
    const store = new RedisStateStore(redis);
    expect(await store.get('missing')).toBeNull();
  });

  it('drops and returns null on corrupted JSON', async () => {
    const store = new RedisStateStore(redis);
    redis.store.set('vexor:oauth:state:bad', '{not-valid');
    const result = await store.get('bad');

    expect(result).toBeNull();
    expect(redis.delCalls).toContain('vexor:oauth:state:bad');
  });

  it('delete() removes the namespaced key', async () => {
    const store = new RedisStateStore(redis);
    await store.set('k', stateData);
    await store.delete('k');

    expect(redis.delCalls).toContain('vexor:oauth:state:k');
    expect(await redis.get('vexor:oauth:state:k')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// RedisSessionStore
// ---------------------------------------------------------------------------

describe('RedisSessionStore', () => {
  let redis: FakeRedis;

  beforeEach(() => {
    redis = new FakeRedis();
  });

  it('defaults to a 24h TTL with the session prefix', async () => {
    const store = new RedisSessionStore(redis);
    await store.set('sid-1', oauthUser);
    expect(redis.setCalls[0][0]).toBe('vexor:oauth:session:sid-1');
    expect(redis.setCalls[0][3]).toBe(86400);
  });

  it('round-trips OAuthUser', async () => {
    const store = new RedisSessionStore(redis);
    await store.set('sid', oauthUser);
    const got = await store.get('sid');
    expect(got).toEqual(oauthUser);
  });

  it('get returns null for missing session', async () => {
    const store = new RedisSessionStore(redis);
    expect(await store.get('nope')).toBeNull();
  });

  it('delete removes the session', async () => {
    const store = new RedisSessionStore(redis);
    await store.set('sid', oauthUser);
    await store.delete('sid');
    expect(await redis.get('vexor:oauth:session:sid')).toBeNull();
  });

  it('drops corrupted JSON entries and returns null', async () => {
    const store = new RedisSessionStore(redis);
    redis.store.set('vexor:oauth:session:bad', '}{');
    const result = await store.get('bad');
    expect(result).toBeNull();
  });

  it('respects a custom prefix and TTL', async () => {
    const store = new RedisSessionStore(redis, {
      prefix: 'tenant42:sess:',
      ttl: 3600,
    });
    await store.set('s', oauthUser);
    expect(redis.setCalls[0][0]).toBe('tenant42:sess:s');
    expect(redis.setCalls[0][3]).toBe(3600);
  });
});

// ---------------------------------------------------------------------------
// Adapter compatibility — confirm sync/async clients both work
// ---------------------------------------------------------------------------

describe('RedisLike compatibility', () => {
  it('accepts a synchronous client (Map-style)', async () => {
    const map = new Map<string, string>();
    const sync: RedisLike = {
      set: (k: string, v: string) => {
        map.set(k, v);
      },
      get: (k: string) => map.get(k) ?? null,
      del: (k: string) => {
        map.delete(k);
      },
    };

    const store = new RedisStateStore(sync);
    await store.set('a', stateData);
    expect(await store.get('a')).toEqual(stateData);
  });

  it('handles get() returning a promise from an async client', async () => {
    const inner = new Map<string, string>();
    const asyncClient: RedisLike = {
      set: vi.fn(async (k: string, v: string) => {
        inner.set(k, v);
      }),
      get: vi.fn(async (k: string) => inner.get(k) ?? null),
      del: vi.fn(async (k: string) => {
        inner.delete(k);
      }),
    };

    const store = new RedisStateStore(asyncClient);
    await store.set('a', stateData);
    const got = await store.get('a');
    expect(got).toEqual(stateData);
  });
});
