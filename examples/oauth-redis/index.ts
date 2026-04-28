/**
 * OAuth + Redis Example
 *
 * Wires up the GitHub OAuth provider with a Redis-backed state and session
 * store, suitable for multi-instance production deployments where the
 * default in-memory store would not be safe.
 *
 * Run with: npx tsx examples/oauth-redis/index.ts
 *
 * Required env:
 *   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, REDIS_URL
 */

import { Vexor, providers, RedisStateStore, RedisSessionStore } from '@vexorjs/core';
import type { RedisLike } from '@vexorjs/core';

// ---------------------------------------------------------------------------
// In a real app this would be `new Redis(process.env.REDIS_URL!)`.
// We use a fake here so the example is self-runnable without Redis.
// ---------------------------------------------------------------------------

class FakeRedis implements RedisLike {
  private store = new Map<string, string>();
  async set(key: string, value: string) {
    this.store.set(key, value);
    return 'OK';
  }
  async get(key: string) {
    return this.store.get(key) ?? null;
  }
  async del(key: string) {
    return this.store.delete(key) ? 1 : 0;
  }
}

const redis: RedisLike =
  process.env.REDIS_URL && process.env.NODE_ENV !== 'demo'
    // Replace with: new Redis(process.env.REDIS_URL)
    ? (() => {
        throw new Error(
          'Install ioredis and uncomment the import in this example to use a real Redis.'
        );
      })()
    : new FakeRedis();

const stateStore = new RedisStateStore(redis, {
  ttl: 600,
  prefix: 'app:oauth:state:',
});

const sessionStore = new RedisSessionStore(redis, {
  ttl: 86400,
  prefix: 'app:oauth:session:',
});

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const app = new Vexor({ port: 3000, logging: true });

const githubProvider = providers.github(
  process.env.GITHUB_CLIENT_ID ?? 'demo-client-id',
  process.env.GITHUB_CLIENT_SECRET ?? 'demo-client-secret'
);

app.get('/', (ctx) =>
  ctx.json({
    name: 'oauth-redis-example',
    login: '/auth/github',
  })
);

// In a real app you'd plumb stateStore/sessionStore into your auth handlers.
// Sketch:
//
//   const oauth = createOAuth({
//     providers: { github: githubProvider },
//     stateStore,
//     sessionStore,
//     redirectUri: 'http://localhost:3000/auth/github/callback',
//   });
//
//   app.get('/auth/github',          oauth.authorize('github'));
//   app.get('/auth/github/callback', oauth.callback('github'));

app.get('/health', (ctx) =>
  ctx.json({ status: 'ok', stateStore: 'redis', sessionStore: 'redis' })
);

app.listen(3000).then(() => {
  console.log(`
  Provider: ${githubProvider.name}
  State TTL:   ${600}s   (RedisStateStore)
  Session TTL: ${86400}s (RedisSessionStore)

  In production, replace FakeRedis with:
      import Redis from 'ioredis';
      const redis = new Redis(process.env.REDIS_URL!);
  `);
});
