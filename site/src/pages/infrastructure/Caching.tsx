import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { createCache, createMemoryCache } from '@vexorjs/core';

// Quick start with memory cache
const cache = createMemoryCache({ ttl: 60_000 });

// Set a value (with optional per-key TTL)
await cache.set('user:1', { id: 1, name: 'Alice' });
await cache.set('session:abc', tokenData, { ttl: 300_000 });

// Get a value
const user = await cache.get<User>('user:1');

// Check existence
const exists = await cache.has('user:1');

// Delete a key
await cache.delete('user:1');

// Get or compute (atomic read-through)
const profile = await cache.getOrSet('profile:1', async () => {
  return await db.users.findById(1);
}, { ttl: 120_000 });

// Get all keys matching a pattern
const keys = await cache.keys('user:*');

// Clear all entries
await cache.clear();`;

const middlewareCachingCode = `import { Vexor, cacheMiddleware, createMemoryCache } from '@vexorjs/core';

const app = new Vexor();
const cache = createMemoryCache({ ttl: 60_000 });

// Apply cache middleware globally
app.addHook('onRequest', cacheMiddleware({
  store: cache,
  ttl: 30_000,
  // Only cache GET requests by default
  methods: ['GET'],
  // Custom key generator
  keyGenerator: (ctx) => \`cache:\${ctx.req.method}:\${ctx.req.url}\`,
  // Skip caching for authenticated requests
  skip: (ctx) => !!ctx.req.header('Authorization'),
  // Callbacks
  onHit: (ctx, key) => console.log(\`Cache hit: \${key}\`),
  onMiss: (ctx, key) => console.log(\`Cache miss: \${key}\`),
}));

// Route-level cache override
app.get('/api/products', {
  preHandler: [cacheMiddleware({ store: cache, ttl: 120_000 })],
}, async (ctx) => {
  const products = await db.products.findAll();
  return ctx.json(products);
});

// Disable caching for specific routes
app.get('/api/realtime', {
  preHandler: [cacheMiddleware({ skip: () => true })],
}, async (ctx) => {
  return ctx.json({ timestamp: Date.now() });
});`;

const lruCacheCode = `import { createCache, LRUCacheStore } from '@vexorjs/core';

// LRU cache with a maximum of 1000 entries
const cache = createCache({
  store: new LRUCacheStore({ maxSize: 1000 }),
  ttl: 60_000,
  prefix: 'app:',
});

// When the cache is full, the least recently used entry is evicted
await cache.set('item:1', data1);
await cache.set('item:2', data2);

// Accessing item:1 moves it to the front (most recently used)
await cache.get('item:1');

// Get cache statistics
const stats = cache.getStats();
console.log(stats);
// {
//   hits: 142,
//   misses: 38,
//   hitRate: 0.789,
//   size: 856,
//   evictions: 24,
// }

// Reset statistics
cache.resetStats();`;

const redisCacheCode = `import { createRedisCache } from '@vexorjs/core';
import { createClient } from 'redis';

// Connect to Redis
const redisClient = createClient({ url: 'redis://localhost:6379' });
await redisClient.connect();

// Create a Redis-backed cache
const cache = createRedisCache(redisClient, {
  ttl: 300_000,       // 5 minutes default TTL
  prefix: 'myapp:',   // Key prefix for namespacing
  cacheErrors: false,  // Don't cache error results
});

// Works exactly like the memory cache
await cache.set('user:1', { id: 1, name: 'Alice' });
const user = await cache.get<User>('user:1');

// Ideal for multi-instance deployments
// All app instances share the same cache
const session = await cache.getOrSet(\`session:\${token}\`, async () => {
  return await validateAndDecodeToken(token);
}, { ttl: 3600_000 });

// Pattern-based invalidation across all instances
await cache.invalidate('user:*');`;

const cacheInvalidationCode = `import { createMemoryCache } from '@vexorjs/core';

const cache = createMemoryCache({ ttl: 300_000 });

// Invalidate a single key
await cache.delete('user:1');

// Invalidate by pattern (glob-style matching)
await cache.invalidate('user:*');       // All user entries
await cache.invalidate('session:*');    // All sessions
await cache.invalidate('api:v1:*');     // All v1 API cache entries

// Invalidate on data mutation
app.put('/api/users/:id', async (ctx) => {
  const { id } = ctx.params;
  const data = ctx.body;

  // Update the database
  const user = await db.users.update(id, data);

  // Invalidate related cache entries
  await cache.delete(\`user:\${id}\`);
  await cache.invalidate(\`user:\${id}:*\`);    // Sub-resources
  await cache.invalidate('users:list:*');      // List caches

  return ctx.json(user);
});

// Invalidate everything
await cache.clear();`;

const staleWhileRevalidateCode = `import { createCache, MemoryCacheStore } from '@vexorjs/core';

// Stale-while-revalidate: serve stale data while fetching fresh data
const cache = createCache({
  store: new MemoryCacheStore(),
  ttl: 30_000,                     // Fresh for 30 seconds
  staleWhileRevalidate: 60_000,    // Serve stale for up to 60 more seconds
});

// First request: cache miss, fetches from source
const data1 = await cache.getOrSet('dashboard:stats', fetchStats);

// Within 30s: serves cached (fresh) data
const data2 = await cache.getOrSet('dashboard:stats', fetchStats);

// 30-90s after set: serves stale data immediately,
// triggers background revalidation
const data3 = await cache.getOrSet('dashboard:stats', fetchStats);
// Returns instantly with stale data
// fetchStats() runs in the background to update the cache

// After 90s (30s TTL + 60s stale window): cache miss, blocks on fetch
const data4 = await cache.getOrSet('dashboard:stats', fetchStats);

// This pattern is ideal for:
// - Dashboard data that can be slightly stale
// - API responses where latency matters more than freshness
// - High-traffic endpoints with expensive computations`;

export default function Caching() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="caching" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Caching
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Caching is one of the most effective techniques for improving the performance and scalability of any API-driven application. By storing the results of expensive operations -- database queries, external API calls, or complex computations -- in a fast intermediate layer, you can serve subsequent requests in microseconds instead of milliseconds or seconds. Vexor provides a first-class caching system that integrates directly with your application's request lifecycle, giving you fine-grained control over what gets cached, for how long, and where the cached data lives.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          At its core, Vexor's cache architecture follows a store-based abstraction. A <code className="prose-code">CacheManager</code> sits between your application code and the underlying storage engine, providing a unified API regardless of whether your data is stored in process memory, a bounded LRU structure, or a distributed Redis cluster. This means you can develop locally with a simple memory cache, then swap in Redis for production without changing any of your caching logic. The cache manager handles serialization, TTL tracking, key prefixing, and statistics collection transparently.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's cache system also supports two distinct usage patterns: direct programmatic caching, where you explicitly call <code className="prose-code">get</code>, <code className="prose-code">set</code>, and <code className="prose-code">getOrSet</code> in your handlers; and HTTP middleware caching, where the framework automatically intercepts responses and serves them from cache on subsequent requests. Both patterns can be combined -- for example, using middleware caching for public endpoints while using programmatic caching for fine-grained data-layer optimization inside your business logic.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Beyond basic get/set operations, Vexor includes built-in support for cache invalidation with glob patterns, stale-while-revalidate semantics for latency-sensitive endpoints, and runtime statistics for monitoring cache effectiveness. These features work consistently across all cache stores, so you get the same behavior whether running a single-process development server or a multi-instance production deployment.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's caching system is built on a layered architecture with three components: the <code className="prose-code">CacheManager</code>, the <code className="prose-code">CacheStore</code> interface, and optional <code className="prose-code">cacheMiddleware</code>. The cache manager is the primary API surface your code interacts with. It delegates storage to a pluggable store, and handles cross-cutting concerns like key prefixing, TTL enforcement, and statistics tracking.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When you call <code className="prose-code">cache.set(key, value, options)</code>, the manager serializes the value, computes the full key (applying any configured prefix), records a timestamp and TTL, then passes the entry to the underlying store. On read, <code className="prose-code">cache.get(key)</code> retrieves the entry from the store, checks whether the TTL has expired, and either returns the value or reports a miss. Expired entries are removed lazily on access rather than through a background sweeper, which keeps the implementation simple and avoids the overhead of timers or periodic scans.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">getOrSet</code> method implements the read-through caching pattern atomically. It first checks the cache; if the entry exists and is fresh, it returns immediately. If the entry is missing or expired, it invokes the factory function you provide, stores the result, and returns it. This eliminates a common race condition in manual cache-aside code where multiple concurrent requests all miss the cache and simultaneously hit the database. With <code className="prose-code">getOrSet</code>, only the first caller executes the factory; subsequent callers receive the cached result once it is available.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The middleware layer operates at the HTTP level. When a request arrives, the <code className="prose-code">cacheMiddleware</code> computes a cache key from the request (by default, a combination of the HTTP method and URL), checks the cache store, and short-circuits the response if a fresh entry is found. If no cached response exists, the request proceeds through your handler as normal, and the response body and headers are captured and stored in the cache for subsequent requests. This approach is transparent to your route handlers -- they do not need to know about caching at all.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The fastest way to start caching in Vexor is with <code className="prose-code">createMemoryCache</code>, which gives you an in-process cache backed by a simple <code className="prose-code">Map</code>. You provide a default TTL (time-to-live) in milliseconds, and all entries will automatically expire after that duration unless overridden on a per-key basis. This is ideal for development and single-instance deployments where you do not need shared state across processes.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The cache API is fully asynchronous, returning Promises for every operation. This ensures consistent behavior whether you are using an in-memory store (where operations resolve immediately) or a network-backed store like Redis (where operations involve I/O). The type parameter on <code className="prose-code">get</code> and <code className="prose-code">getOrSet</code> provides full TypeScript type safety, so you do not need to cast the returned values.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">getOrSet</code> method is the recommended way to implement read-through caching. Rather than manually checking the cache and falling back to a database query, you provide a factory function that only executes on a cache miss. This pattern reduces boilerplate, eliminates race conditions, and makes your caching intent explicit in the code.
        </p>
        <CodeBlock code={basicUsageCode} filename="cache.ts" showLineNumbers />
      </section>

      {/* Middleware Caching */}
      <section>
        <h2 id="middleware-caching" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Middleware Caching
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          While programmatic caching gives you precise control, many endpoints benefit from transparent HTTP-level caching that requires no changes to your route handlers. Vexor's <code className="prose-code">cacheMiddleware</code> intercepts incoming requests before they reach your handler, checks for a cached response, and returns it directly when available. This can dramatically reduce response times for read-heavy endpoints because the handler, database queries, and serialization logic are bypassed entirely on cache hits.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The middleware generates a cache key for each request using a configurable <code className="prose-code">keyGenerator</code> function. The default key combines the HTTP method and full URL, which works well for simple REST endpoints. For APIs with query parameters, pagination, or content negotiation, you can provide a custom key generator that incorporates the relevant request properties. The <code className="prose-code">skip</code> function lets you exclude certain requests from caching entirely -- a critical safeguard for authenticated endpoints where caching could accidentally serve one user's data to another.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You can apply the middleware globally, where it processes every request, or at the route level for fine-grained control. Route-level overrides take precedence, so you can set a conservative global TTL and extend it for endpoints that serve relatively static data. The <code className="prose-code">onHit</code> and <code className="prose-code">onMiss</code> callbacks provide observability hooks that you can wire to your logging or metrics system to monitor cache performance in production.
        </p>
        <CodeBlock code={middlewareCachingCode} filename="server.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Use the <code className="prose-code">skip</code> option to bypass caching for authenticated
          or dynamic requests. Caching responses that contain user-specific data can lead to serious data leaks where one user receives another user's cached response. Always skip caching when the response varies by the <code className="prose-code">Authorization</code> header, cookies, or other user-identifying information.
        </InfoBlock>
      </section>

      {/* When to Use Which Store */}
      <section>
        <h2 id="choosing-a-store" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Choosing a Cache Store
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor ships with three cache store implementations, each designed for a different set of constraints. Choosing the right store depends on your deployment topology, memory budget, and consistency requirements. All three stores implement the same <code className="prose-code">CacheStore</code> interface, so switching between them requires changing only the store construction -- your caching logic remains untouched.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <strong>MemoryCacheStore</strong> is the simplest option. It uses an in-process JavaScript <code className="prose-code">Map</code> to store entries, which means reads and writes complete in nanoseconds with no serialization overhead. The trade-off is that the cache is local to a single process -- if you run multiple application instances behind a load balancer, each instance maintains its own independent cache, which can lead to inconsistency and redundant memory usage. Memory caches are also lost when the process restarts. Use this store during development, in single-instance deployments, or for data where inconsistency between instances is acceptable.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <strong>LRUCacheStore</strong> adds a critical constraint: a maximum size. It implements the Least Recently Used eviction algorithm using a combination of a <code className="prose-code">Map</code> for O(1) lookups and a doubly-linked list for O(1) eviction ordering. When the cache reaches its <code className="prose-code">maxSize</code>, inserting a new entry automatically evicts the entry that has not been accessed for the longest time. This prevents unbounded memory growth, making it suitable for production single-instance deployments or for caching large numbers of small objects where you need predictable memory usage.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <strong>RedisCacheStore</strong> is the right choice for production multi-instance deployments. It stores entries in an external Redis server, which means all your application instances share a single cache. This provides consistency -- when one instance updates a cache entry, all instances see the change -- and persistence across process restarts. The trade-off is latency: every cache operation involves a network round-trip to Redis, typically adding 0.5-2ms per operation compared to in-memory access. Redis also handles its own memory management and eviction policies, so you should configure <code className="prose-code">maxmemory</code> and <code className="prose-code">maxmemory-policy</code> in your Redis server for production use.
        </p>
        <InfoBlock variant="info">
          A common pattern is to use a two-tier cache: an LRU memory cache in front of Redis. Hot data is served from process memory (fast), while cold data falls through to Redis (shared). Vexor does not provide a built-in tiered cache, but you can implement one by checking the memory cache first in your <code className="prose-code">getOrSet</code> factory.
        </InfoBlock>
      </section>

      {/* LRU Cache */}
      <section>
        <h2 id="lru-cache" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          LRU Cache
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The LRU (Least Recently Used) cache store provides bounded memory usage by automatically evicting the oldest unused entries when the cache is full. Unlike the basic memory store, which grows without limit until you manually clear it or entries expire, the LRU store guarantees that it will never hold more than <code className="prose-code">maxSize</code> entries at any time. This makes it safe for long-running production processes where unbounded caches could eventually exhaust available memory.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Internally, the LRU store maintains a doubly-linked list alongside a hash map. Every time an entry is accessed (via <code className="prose-code">get</code> or <code className="prose-code">getOrSet</code>), it is moved to the head of the linked list, marking it as the most recently used. When the cache reaches capacity and a new entry needs to be inserted, the entry at the tail of the list -- the one that has gone the longest without being accessed -- is evicted to make room. Both operations complete in O(1) time, so the LRU overhead is negligible regardless of cache size.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The built-in statistics tracking is particularly useful with LRU caches. The <code className="prose-code">getStats()</code> method returns hit count, miss count, hit rate, current size, and total eviction count. Monitoring these metrics helps you right-size your cache: a high eviction count relative to your total operations suggests the <code className="prose-code">maxSize</code> is too small, while a very low size relative to <code className="prose-code">maxSize</code> means you are over-provisioning. Aim for a hit rate above 80% for most workloads -- below 50% usually indicates the cache is too small or the TTL is too short for your access patterns.
        </p>
        <CodeBlock code={lruCacheCode} filename="lru-cache.ts" showLineNumbers />
        <InfoBlock variant="info">
          Use <code className="prose-code">getStats()</code> to monitor your cache hit rate. A hit
          rate below 50% may indicate your TTL is too short or your <code className="prose-code">maxSize</code> is
          too small. Consider logging stats periodically in production to catch cache sizing issues before they impact performance.
        </InfoBlock>
      </section>

      {/* Redis Cache */}
      <section>
        <h2 id="redis-cache" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Redis Cache
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For production deployments where your application runs as multiple instances behind a load balancer, an in-process cache creates a fundamental problem: each instance has its own isolated copy of the cache, leading to inconsistent data and wasted memory. A user might update their profile on instance A, which invalidates that instance's cache, but instances B and C continue serving stale data. The Redis cache store solves this by externalizing cache storage to a shared Redis server that all instances read from and write to.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's Redis integration uses native Redis TTL support rather than application-level expiration tracking. When you set an entry with a TTL, Vexor translates this into a Redis <code className="prose-code">PSETEX</code> command that sets the key and its expiration atomically. This means Redis handles expiration natively, and expired entries do not consume memory unnecessarily. Pattern-based invalidation uses Redis <code className="prose-code">SCAN</code> with glob matching, which is safe for production use as it does not block the Redis server the way the older <code className="prose-code">KEYS</code> command would.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Values are serialized to JSON before being stored in Redis and deserialized on retrieval. This means your cached objects must be JSON-serializable -- functions, circular references, and special JavaScript types like <code className="prose-code">Map</code> or <code className="prose-code">Set</code> are not supported. For most API use cases involving database records, configuration objects, and computed results, this is not a limitation. The <code className="prose-code">prefix</code> option is especially important when sharing a Redis instance across multiple applications or environments, as it namespaces your keys to prevent collisions.
        </p>
        <CodeBlock code={redisCacheCode} filename="redis-cache.ts" showLineNumbers />
        <InfoBlock variant="warning">
          Always use a <code className="prose-code">prefix</code> when sharing a Redis instance between
          multiple applications to avoid key collisions. A good convention is to use your application name and environment, such as <code className="prose-code">myapp:prod:</code> or <code className="prose-code">myapp:staging:</code>. This also makes it easy to flush a single application's cache using pattern-based invalidation without affecting other applications.
        </InfoBlock>
      </section>

      {/* Cache Invalidation */}
      <section>
        <h2 id="cache-invalidation" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Cache Invalidation
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Cache invalidation is often cited as one of the two hard problems in computer science, and for good reason. When your application modifies data that is also cached, you need a reliable strategy to ensure clients do not continue receiving stale results. Vexor provides three levels of invalidation: single-key deletion, pattern-based invalidation, and full cache clearing. Each has different performance characteristics and use cases.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Single-key deletion with <code className="prose-code">cache.delete(key)</code> is the most precise approach. When you know exactly which cache entry is affected by a mutation -- for example, updating a user's profile invalidates <code className="prose-code">user:123</code> -- this is the fastest and most targeted option. It completes in O(1) time for all store types.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Pattern-based invalidation with <code className="prose-code">cache.invalidate(pattern)</code> uses glob-style matching to remove groups of related entries. The pattern <code className="prose-code">user:123:*</code> removes all sub-resources for user 123 (posts, sessions, preferences), while <code className="prose-code">users:list:*</code> clears all cached list queries that might include the modified user. For the memory and LRU stores, pattern matching iterates over all keys; for Redis, it uses the cursor-based <code className="prose-code">SCAN</code> command. The return value is the number of entries that were removed, which can be useful for logging and monitoring.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The most effective invalidation strategy in practice is to invalidate eagerly on writes. Whenever a mutation handler (PUT, POST, DELETE) successfully modifies data, it should immediately invalidate all related cache entries before returning the response. This ensures the next read will trigger a fresh fetch. Avoid relying solely on TTL for correctness -- TTL-based expiration is a safety net, not a primary invalidation mechanism.
        </p>
        <CodeBlock code={cacheInvalidationCode} filename="invalidation.ts" showLineNumbers />
        <InfoBlock variant="warning">
          Be careful with broad invalidation patterns. A pattern like <code className="prose-code">*</code> will iterate over every key in the cache, which can be slow for large caches. Prefer specific patterns that target only the affected entries. Structure your cache keys hierarchically (e.g., <code className="prose-code">entity:id:subresource</code>) to make pattern-based invalidation more precise.
        </InfoBlock>
      </section>

      {/* Stale-While-Revalidate */}
      <section>
        <h2 id="stale-while-revalidate" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Stale-While-Revalidate
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Standard TTL-based caching has a sharp cliff: once an entry expires, the next request blocks while the data is recomputed or fetched from the origin. For high-traffic endpoints, this creates "thundering herd" spikes where many concurrent requests all experience a cache miss simultaneously, overwhelming the database with identical queries. The stale-while-revalidate pattern solves this by introducing a grace period after TTL expiration during which stale data is served immediately while a background refresh runs asynchronously.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Here is how the lifecycle works. When you configure a cache with a TTL of 30 seconds and a <code className="prose-code">staleWhileRevalidate</code> window of 60 seconds, each entry goes through three phases. During the first 30 seconds (the "fresh" phase), cached data is returned directly. From 30 to 90 seconds (the "stale" phase), the entry is technically expired, but <code className="prose-code">getOrSet</code> still returns the stale value immediately while spawning a background task to call the factory function and update the cache. After 90 seconds (the "dead" phase), the entry is fully expired and removed -- the next request blocks on the factory function just like a normal cache miss.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          This pattern is inspired by the HTTP <code className="prose-code">stale-while-revalidate</code> cache directive and is particularly effective for data that is expensive to compute but can tolerate being slightly out of date. Dashboard analytics, product catalog listings, leaderboards, and aggregated statistics are all excellent candidates. The key insight is that for most read-heavy endpoints, returning data that is a few seconds old is indistinguishable from returning fresh data from the user's perspective, but the performance difference can be enormous.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Be aware that the background revalidation runs asynchronously and does not propagate errors to the caller. If the factory function fails during background revalidation, the stale entry remains in the cache until the stale window expires. You should ensure your factory function has its own error handling and logging to catch failures that occur during background refreshes.
        </p>
        <CodeBlock code={staleWhileRevalidateCode} filename="swr-cache.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Stale-while-revalidate is ideal for dashboard data, product listings, and any endpoint where
          slightly outdated data is acceptable in exchange for consistent response times. Avoid using it for data that must be immediately consistent after writes, such as account balances or order statuses.
        </InfoBlock>
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Structure cache keys hierarchically.</strong> Use a consistent naming convention like <code className="prose-code">entity:id:subresource</code> (e.g., <code className="prose-code">user:42:profile</code>, <code className="prose-code">user:42:posts</code>). This makes pattern-based invalidation predictable and allows you to clear all data for a single entity without affecting unrelated entries. Include a version prefix (e.g., <code className="prose-code">v2:user:42</code>) if your cached data format might change across deployments.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Set TTLs based on data characteristics, not arbitrary defaults.</strong> User sessions might have a 30-minute TTL, product catalog data might be cached for an hour, and configuration data might be cached for the lifetime of the process. Shorter TTLs mean more cache misses (and more database load), while longer TTLs mean serving staler data. Profile your actual data change frequency and set TTLs accordingly.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Never cache responses that vary by user identity without incorporating the identity into the key.</strong> If your endpoint returns different data for different users, the cache key must include a user identifier. Forgetting this is one of the most common and dangerous caching bugs -- it causes one user to see another user's data. Alternatively, skip caching entirely for authenticated endpoints using the <code className="prose-code">skip</code> option.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Monitor cache performance in production.</strong> Log or export the metrics from <code className="prose-code">getStats()</code> to your monitoring system. Track hit rate, eviction rate, and the size of your cache over time. A sudden drop in hit rate could indicate a deployment changed your data access patterns, while a steadily climbing cache size might signal a memory leak from missing TTLs. Set up alerts for hit rates falling below your baseline.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          <strong>Use <code className="prose-code">getOrSet</code> instead of manual get-then-set patterns.</strong> Manual cache-aside code is prone to race conditions: two concurrent requests can both miss the cache and both hit the database. <code className="prose-code">getOrSet</code> handles this atomically and is the recommended approach for all read-through caching scenarios.
        </p>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          <code className="prose-code">cacheMiddleware(options)</code>
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Creates an HTTP caching middleware that automatically caches responses and serves them on subsequent matching requests. Attach it globally via <code className="prose-code">addHook</code> or at the route level via <code className="prose-code">preHandler</code>.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Option</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">store</code></td>
                <td className="py-3 px-4"><code className="prose-code">CacheStore</code></td>
                <td className="py-3 px-4"><code className="prose-code">MemoryCacheStore</code></td>
                <td className="py-3 px-4">The underlying cache store instance that persists cached responses. If omitted, a new in-memory store is created automatically. For production deployments with multiple instances, pass a shared Redis store to ensure all instances serve consistent cached data.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">ttl</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">60000</code></td>
                <td className="py-3 px-4">How long cached responses remain valid, in milliseconds. After expiration, the next matching request triggers a cache miss and the response is recomputed from the handler. Set to <code className="prose-code">0</code> to disable TTL-based expiration, in which case entries persist until explicitly invalidated or evicted by the store.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">keyGenerator</code></td>
                <td className="py-3 px-4"><code className="prose-code">(ctx: Context) =&gt; string</code></td>
                <td className="py-3 px-4"><code className="prose-code">method:url</code></td>
                <td className="py-3 px-4">A function that produces a unique cache key from the incoming request context. The default implementation concatenates the HTTP method and full URL. Override this to incorporate query parameters, headers, or user identifiers into the key when the response varies by those dimensions.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">skip</code></td>
                <td className="py-3 px-4"><code className="prose-code">(ctx: Context) =&gt; boolean</code></td>
                <td className="py-3 px-4"><code className="prose-code">undefined</code></td>
                <td className="py-3 px-4">A predicate function that determines whether caching should be bypassed for a given request. When it returns <code className="prose-code">true</code>, the request proceeds directly to the handler without checking or populating the cache. Use this to exclude authenticated requests, requests with specific headers, or any request where caching would be incorrect.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">methods</code></td>
                <td className="py-3 px-4"><code className="prose-code">string[]</code></td>
                <td className="py-3 px-4"><code className="prose-code">['GET']</code></td>
                <td className="py-3 px-4">An array of HTTP methods that are eligible for caching. Only requests matching one of these methods will be considered for cache lookup and storage. By default, only GET requests are cached because they are idempotent and safe. Adding POST or other methods is possible but should be done carefully to avoid caching side-effecting operations.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">staleWhileRevalidate</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">0</code></td>
                <td className="py-3 px-4">The duration in milliseconds after TTL expiration during which stale cached data may still be served while a background refresh runs. Set to <code className="prose-code">0</code> (default) to disable stale-while-revalidate behavior, meaning expired entries result in a synchronous cache miss. See the Stale-While-Revalidate section for details on how this lifecycle works.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">cacheErrors</code></td>
                <td className="py-3 px-4"><code className="prose-code">boolean</code></td>
                <td className="py-3 px-4"><code className="prose-code">false</code></td>
                <td className="py-3 px-4">Whether to cache error responses (HTTP 4xx and 5xx status codes). When <code className="prose-code">false</code> (the default), only successful responses are stored in the cache. Enable this cautiously -- caching a transient 500 error means subsequent requests will receive the error from cache instead of retrying the handler.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">onHit</code></td>
                <td className="py-3 px-4"><code className="prose-code">(ctx, key) =&gt; void</code></td>
                <td className="py-3 px-4"><code className="prose-code">undefined</code></td>
                <td className="py-3 px-4">A callback invoked whenever a request is served from the cache. Receives the request context and the cache key. Use this for logging, metrics, or debugging to track how often your cache is being utilized.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">onMiss</code></td>
                <td className="py-3 px-4"><code className="prose-code">(ctx, key) =&gt; void</code></td>
                <td className="py-3 px-4"><code className="prose-code">undefined</code></td>
                <td className="py-3 px-4">A callback invoked whenever a request does not find a matching entry in the cache, either because the key does not exist or because the entry has expired. The request proceeds to the handler as normal, and the response will be cached for future requests.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          <code className="prose-code">CacheManager</code> Methods
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">CacheManager</code> is returned by <code className="prose-code">createCache</code>, <code className="prose-code">createMemoryCache</code>, and <code className="prose-code">createRedisCache</code>. It provides the primary API for all cache operations.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Method</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">get</code></td>
                <td className="py-3 px-4"><code className="prose-code">get&lt;T&gt;(key: string): Promise&lt;T | undefined&gt;</code></td>
                <td className="py-3 px-4">Retrieves a cached value by its key. Returns the deserialized value if the entry exists and has not expired, or <code className="prose-code">undefined</code> if the key is not found or the entry's TTL has elapsed. For the LRU store, accessing an entry marks it as recently used, preventing it from being evicted.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">set</code></td>
                <td className="py-3 px-4"><code className="prose-code">set(key: string, value: unknown, opts?): Promise&lt;void&gt;</code></td>
                <td className="py-3 px-4">Stores a value in the cache under the given key. If the key already exists, its value and TTL are overwritten. The optional <code className="prose-code">opts</code> parameter accepts a <code className="prose-code">ttl</code> property (in milliseconds) that overrides the cache's default TTL for this specific entry. The value must be JSON-serializable for Redis stores.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">delete</code></td>
                <td className="py-3 px-4"><code className="prose-code">delete(key: string): Promise&lt;boolean&gt;</code></td>
                <td className="py-3 px-4">Removes a single entry from the cache by its exact key. Returns <code className="prose-code">true</code> if the entry existed and was removed, or <code className="prose-code">false</code> if the key was not found. This is the most efficient invalidation method when you know the exact key.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">has</code></td>
                <td className="py-3 px-4"><code className="prose-code">has(key: string): Promise&lt;boolean&gt;</code></td>
                <td className="py-3 px-4">Checks whether a key exists in the cache and has not expired. Returns <code className="prose-code">true</code> if the entry is present and still within its TTL, <code className="prose-code">false</code> otherwise. Note that this does not count as an access for LRU ordering purposes.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">clear</code></td>
                <td className="py-3 px-4"><code className="prose-code">clear(): Promise&lt;void&gt;</code></td>
                <td className="py-3 px-4">Removes all entries from the cache, regardless of their TTL or expiration status. For memory and LRU stores, this clears the internal data structures. For Redis stores, this removes all keys matching the configured prefix. Use with caution in production, as it will cause a burst of cache misses.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">keys</code></td>
                <td className="py-3 px-4"><code className="prose-code">keys(pattern?: string): Promise&lt;string[]&gt;</code></td>
                <td className="py-3 px-4">Returns an array of all cache keys, optionally filtered by a glob-style pattern. Without a pattern, returns all keys. For large caches, this operation can be memory-intensive as it materializes the full key list. In Redis, this uses the <code className="prose-code">SCAN</code> command to avoid blocking the server.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getOrSet</code></td>
                <td className="py-3 px-4"><code className="prose-code">getOrSet&lt;T&gt;(key, factory, opts?): Promise&lt;T&gt;</code></td>
                <td className="py-3 px-4">Atomic read-through caching. Checks the cache first; on a hit, returns the cached value. On a miss, calls the <code className="prose-code">factory</code> function to compute the value, stores it in the cache with the specified TTL, and returns it. This prevents the race condition where multiple concurrent misses all invoke the factory simultaneously. If the entry is in the stale-while-revalidate window, returns the stale value immediately and refreshes in the background.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">invalidate</code></td>
                <td className="py-3 px-4"><code className="prose-code">invalidate(pattern: string): Promise&lt;number&gt;</code></td>
                <td className="py-3 px-4">Removes all entries whose keys match the given glob-style pattern. Returns the count of entries that were removed. Supports standard glob wildcards: <code className="prose-code">*</code> matches any sequence of characters, <code className="prose-code">?</code> matches a single character. For Redis stores, uses the cursor-based <code className="prose-code">SCAN</code> command to avoid blocking.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getStats</code></td>
                <td className="py-3 px-4"><code className="prose-code">getStats(): CacheStats</code></td>
                <td className="py-3 px-4">Returns an object containing cache performance metrics: <code className="prose-code">hits</code> (total cache hit count), <code className="prose-code">misses</code> (total cache miss count), <code className="prose-code">hitRate</code> (ratio of hits to total requests, between 0 and 1), <code className="prose-code">size</code> (current number of entries), and <code className="prose-code">evictions</code> (total eviction count, LRU store only).</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">resetStats</code></td>
                <td className="py-3 px-4"><code className="prose-code">resetStats(): void</code></td>
                <td className="py-3 px-4">Resets all statistics counters (hits, misses, evictions) to zero. The cache contents are not affected. This is useful for benchmarking or for resetting metrics after a deployment to measure the new baseline performance.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Cache Stores
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          All stores implement the <code className="prose-code">CacheStore</code> interface and can be swapped interchangeably via the <code className="prose-code">store</code> option on <code className="prose-code">createCache</code>.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Store</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Options</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">MemoryCacheStore</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">A simple in-process store backed by a JavaScript <code className="prose-code">Map</code>. Offers the fastest read and write performance with no serialization overhead, but is not shared across processes and loses all data on restart. Best for development, testing, and single-instance deployments.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">LRUCacheStore</code></td>
                <td className="py-3 px-4"><code className="prose-code">maxSize: number</code></td>
                <td className="py-3 px-4">A bounded in-process store that evicts the least recently used entries when <code className="prose-code">maxSize</code> is reached. Uses a hash map plus doubly-linked list for O(1) access and eviction. Provides predictable memory usage for long-running processes. Best for production single-instance deployments or caching large numbers of entries where memory must be bounded.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">RedisCacheStore</code></td>
                <td className="py-3 px-4"><code className="prose-code">client, prefix?</code></td>
                <td className="py-3 px-4">A distributed store backed by an external Redis server. All application instances share the same cache, providing consistency and persistence across restarts. Values are JSON-serialized, and TTL is enforced by Redis natively. Adds network latency per operation (typically 0.5-2ms). Best for production multi-instance deployments where cache consistency matters.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/infrastructure/logging" className="btn-primary">
            Logging <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/infrastructure/config" className="btn-secondary">
            Configuration
          </Link>
        </div>
      </section>
    </div>
  );
}
