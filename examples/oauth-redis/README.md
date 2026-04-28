# OAuth with Redis-backed stores

Demonstrates `RedisStateStore` and `RedisSessionStore` for production OAuth
flows in multi-instance deployments. The example uses an in-process fake
Redis client so it runs standalone; swap to `ioredis` for real use.

```bash
npx tsx examples/oauth-redis/index.ts
```

To use a real Redis instance:

```bash
npm install ioredis
```

Then in `index.ts`:

```ts
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL!);
```

The stores accept any client conforming to `RedisLike` — `ioredis`,
`node-redis` v4+ (use `setStyle: 'options'`), `@upstash/redis`, or your
own thin wrapper.
