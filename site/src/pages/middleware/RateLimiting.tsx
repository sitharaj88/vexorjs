import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { Vexor } from '@vexorjs/core';
import { rateLimit } from '@vexorjs/core/middleware';

const app = new Vexor();

// Apply rate limiting globally
app.addHook('onRequest', rateLimit({
  windowMs: 60 * 1000,  // 1 minute window
  max: 100,             // 100 requests per window
  headers: true,        // Send X-RateLimit-* headers
}));

// Apply to specific routes
app.get('/api/search', {
  preHandler: [rateLimit({ windowMs: 60_000, max: 20 })],
}, async (ctx) => {
  const results = await search(ctx.query.q);
  return ctx.json({ results });
});

app.listen(3000);`;

const keyGeneratorCode = `import { rateLimit, getRateLimitInfo } from '@vexorjs/core/middleware';

// Rate limit by API key instead of IP
app.addHook('onRequest', rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (ctx) => {
    // Use API key from header, fall back to IP
    return ctx.req.header('x-api-key') || ctx.req.ip;
  },
  handler: (ctx, info) => {
    return ctx.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil(info.resetTime / 1000),
      limit: info.limit,
      remaining: 0,
    });
  },
}));

// Check rate limit info in handlers
app.get('/api/status', async (ctx) => {
  const info = getRateLimitInfo(ctx);

  return ctx.json({
    limit: info.limit,
    remaining: info.remaining,
    resetsAt: new Date(info.resetTime).toISOString(),
  });
});`;

const slidingWindowCode = `import { rateLimit, SlidingWindowStore } from '@vexorjs/core/middleware';

// Sliding window provides smoother rate limiting
// than fixed windows, avoiding burst traffic at
// window boundaries.
app.addHook('onRequest', rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  store: new SlidingWindowStore({
    windowMs: 60 * 1000,
    precision: 10,  // 10 sub-windows for accuracy
  }),
}));

// Different limits for different user tiers
app.addHook('onRequest', async (ctx) => {
  const user = ctx.get('user');
  const tier = user?.tier || 'free';

  const limits: Record<string, number> = {
    free: 30,
    pro: 200,
    enterprise: 1000,
  };

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: limits[tier],
    store: new SlidingWindowStore({ windowMs: 60_000 }),
    keyGenerator: () => \`\${tier}:\${user?.id || ctx.req.ip}\`,
  });

  return limiter(ctx);
});`;

const redisStoreCode = `import { rateLimit, RedisStore } from '@vexorjs/core/middleware';
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

// Use Redis for distributed rate limiting
// across multiple server instances
app.addHook('onRequest', rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  store: new RedisStore({
    client: redis,
    prefix: 'rl:',       // Key prefix in Redis
    resetExpiryOnChange: false,
  }),
}));

// Separate limits for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:',
  }),
  handler: (ctx) => {
    return ctx.status(429).json({
      error: 'Too many login attempts',
      message: 'Please try again in 15 minutes',
    });
  },
});

app.post('/auth/login', { preHandler: [authLimiter] }, loginHandler);
app.post('/auth/register', { preHandler: [authLimiter] }, registerHandler);`;

const slowDownCode = `import { slowDown } from '@vexorjs/core/middleware';

// Progressive slow-down: adds delay instead of blocking
// Delay increases with each request beyond the threshold
app.addHook('onRequest', slowDown({
  windowMs: 60 * 1000,       // 1 minute window
  delayAfter: 50,            // Start delaying after 50 requests
  delayMs: 500,              // Add 500ms per request over limit
  maxDelayMs: 10_000,        // Cap delay at 10 seconds
}));

// Combine slow-down with hard rate limit
app.addHook('onRequest', slowDown({
  windowMs: 60 * 1000,
  delayAfter: 80,
  delayMs: 200,
}));

app.addHook('onRequest', rateLimit({
  windowMs: 60 * 1000,
  max: 120,  // Hard cap after slow-down
}));`;

const standaloneCode = `import { createRateLimiter } from '@vexorjs/core/middleware';

// Create a standalone rate limiter for custom logic
const limiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
});

app.post('/api/expensive-operation', async (ctx) => {
  const key = ctx.get('user')?.id || ctx.req.ip;
  const result = limiter.check(key);

  if (!result.allowed) {
    return ctx.status(429).json({
      error: 'Operation rate limited',
      retryAfter: result.retryAfter,
    });
  }

  // Perform expensive operation
  const data = await performExpensiveWork();
  return ctx.json({ data });
});`;

export default function RateLimiting() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="rate-limiting" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Rate Limiting
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Rate limiting is one of the most critical safeguards for any production API. Without it, a single
          misbehaving client -- whether a buggy script, a scraper, or a deliberate attacker -- can overwhelm
          your server, starve legitimate users of resources, and drive up infrastructure costs. Vexor provides
          a comprehensive rate limiting system with fixed window, sliding window, and progressive slow-down
          strategies, backed by pluggable storage engines that scale from a single process to a globally
          distributed fleet.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          At its core, rate limiting works by tracking how many requests each client has made within a
          defined time window. When a client exceeds the allowed threshold, subsequent requests are rejected
          with an HTTP 429 (Too Many Requests) response until the window resets. The middleware identifies
          clients using a configurable key -- typically the IP address, but often an API key, user ID, or
          a composite identifier that groups requests in whatever way makes sense for your application.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Vexor ships with three complementary approaches. The <code className="prose-code">rateLimit</code> middleware
          provides hard request caps that block traffic once a threshold is reached. The{' '}
          <code className="prose-code">slowDown</code> middleware adds progressive artificial latency to discourage
          abuse without outright blocking. And the <code className="prose-code">createRateLimiter</code> function
          gives you a standalone rate limiter you can use anywhere in your application logic, not just as middleware.
          All three approaches share the same storage backends, so you can mix and match them freely.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When a request arrives, the rate limiting middleware computes a key for the client (by default, the
          IP address), then looks up the current request count for that key in the configured store. If the
          count is below the maximum, the middleware increments it and allows the request to proceed. If the
          count has reached or exceeded the maximum, the middleware short-circuits the request pipeline and
          returns a 429 response. This entire check-and-increment operation is atomic, so even under high
          concurrency, counts remain accurate.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <strong>fixed window</strong> algorithm (the default) divides time into discrete intervals. For example,
          with a 60-second window and a max of 100 requests, the counter resets to zero at the start of each
          new minute. This approach is simple and memory-efficient, but it has a well-known edge case: a
          client can send 100 requests at the end of one window and 100 more at the start of the next,
          effectively making 200 requests in a short burst that spans the boundary.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <strong>sliding window</strong> algorithm addresses this by dividing each time window into N
          sub-buckets (controlled by the <code className="prose-code">precision</code> option). Instead of a single
          counter that resets abruptly, the algorithm maintains counts across these sub-buckets and computes a
          weighted sum based on how much of each sub-bucket overlaps with the current window. As old sub-buckets
          expire, their counts are dropped from the total. The result is a much smoother rate limiting curve
          that prevents boundary bursts, at the cost of slightly higher memory usage per client key.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Both algorithms support the same set of response headers. When <code className="prose-code">headers</code> is
          enabled, every response includes <code className="prose-code">X-RateLimit-Limit</code> (the maximum
          number of requests allowed), <code className="prose-code">X-RateLimit-Remaining</code> (how many
          requests are left in the current window), and <code className="prose-code">X-RateLimit-Reset</code> (the
          Unix timestamp in seconds when the window resets). These headers let well-behaved clients self-throttle
          and implement retry logic without guessing.
        </p>
      </section>

      {/* When to Use */}
      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          When to Use Each Strategy
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Choose fixed window</strong> when simplicity and low memory usage matter most. It is ideal for
          internal APIs, development environments, or situations where boundary bursts are acceptable. The
          fixed window uses a single counter per key, making it the lightest option in terms of both memory
          and computation.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Choose sliding window</strong> when you need smooth, predictable traffic shaping -- for example,
          on public APIs where you have contractual rate limits (SLA tiers), or on endpoints that are expensive
          to serve and cannot tolerate even brief bursts. The precision parameter lets you tune the
          trade-off between accuracy and memory: a precision of 10 divides each window into 10 sub-buckets, while
          a precision of 60 gives per-second granularity within a one-minute window.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Choose progressive slow-down</strong> when you want to discourage abuse without hard-blocking
          users. This works well for endpoints like search or autocomplete, where occasional heavy use is normal
          but sustained hammering should be disincentivized. You can layer slow-down in front of a hard rate limit
          as a two-stage defense: first slow the client down, then block if they persist.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Choose the standalone limiter</strong> when rate limiting logic needs to happen inside your
          handler rather than as middleware. This is useful for operations where you want to check the limit
          conditionally -- for example, only rate limiting writes but not reads, or applying different limits
          based on the request body content.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">rateLimit</code> middleware limits the number of requests
          a client can make within a time window. By default, it uses the client IP address as the key
          and an in-memory store to track request counts. You can apply it globally to protect your entire
          API, or attach it to specific routes that need tighter limits.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When applied globally via <code className="prose-code">addHook('onRequest', ...)</code>, the
          middleware runs before any route handler, ensuring every endpoint is protected. When applied as
          a <code className="prose-code">preHandler</code> on a specific route, only that route is rate
          limited -- useful for expensive operations like search, export, or payment processing that need
          lower limits than the rest of your API.
        </p>
        <CodeBlock code={basicUsageCode} showLineNumbers />
        <InfoBlock variant="info" title="Rate Limit Headers">
          When <code className="prose-code">headers</code> is enabled, responses include{' '}
          <code className="prose-code">X-RateLimit-Limit</code>,{' '}
          <code className="prose-code">X-RateLimit-Remaining</code>, and{' '}
          <code className="prose-code">X-RateLimit-Reset</code> headers so clients can
          track their usage. Well-designed API clients use these headers to implement
          backoff strategies and avoid hitting the limit in the first place.
        </InfoBlock>
      </section>

      {/* Custom Key Generator */}
      <section>
        <h2 id="custom-key-generator" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Custom Key Generator
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The key generator determines how requests are grouped for counting purposes. By default, Vexor uses
          the client IP address, which works well for most scenarios. However, IP-based limiting has
          limitations: users behind a shared NAT or corporate proxy will share the same IP address, causing
          them to share a rate limit unfairly. Conversely, a single user with multiple IP addresses (such
          as a mobile client switching between Wi-Fi and cellular) can circumvent IP-based limits.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For authenticated APIs, rate limiting by API key or user ID is almost always a better approach. This
          ensures each client gets their own fair allocation regardless of network topology. You can also
          combine multiple factors -- for example, using the API key when present and falling back to IP
          for unauthenticated requests. The <code className="prose-code">keyGenerator</code> function receives
          the full request context, so you have access to headers, cookies, query parameters, and any values
          set by earlier middleware.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">handler</code> option lets you customize the response that is sent
          when a client exceeds their limit. The default handler returns a simple 429 JSON response, but in
          practice you may want to include retry timing information, a link to your rate limit documentation,
          or a human-readable message. The handler receives a <code className="prose-code">RateLimitInfo</code> object
          containing the limit, remaining count, and reset time, so you can include this data in your response.
        </p>
        <CodeBlock code={keyGeneratorCode} showLineNumbers />
      </section>

      {/* Sliding Window */}
      <section>
        <h2 id="sliding-window" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Sliding Window
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The default fixed window algorithm can allow bursts of traffic at window boundaries. Consider a
          60-second window with a max of 100 requests: a client can make 100 requests in the last second
          of one window and 100 more in the first second of the next, effectively sending 200 requests
          in two seconds. For many APIs, this burst pattern is acceptable. For others -- especially those
          with strict SLA guarantees or expensive backend operations -- it is not.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The sliding window algorithm solves this by maintaining fine-grained sub-buckets within each window.
          Under the hood, <code className="prose-code">SlidingWindowStore</code> divides your configured{' '}
          <code className="prose-code">windowMs</code> into <code className="prose-code">precision</code> number
          of sub-windows. Each sub-window tracks its own count. When evaluating a request, the store calculates
          a weighted sum of all sub-windows that overlap with the current sliding window, proportionally
          weighting the oldest sub-window based on how much of it falls within the window. This produces a
          smooth, continuously moving rate limit that never has a sharp reset boundary.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">precision</code> parameter controls the granularity and memory
          trade-off. A precision of 10 (the default) provides good accuracy for most use cases while keeping
          memory usage low. A precision of 60 for a 60-second window gives per-second granularity, which
          is useful when you need very precise traffic shaping but increases memory usage by 6x per client key.
          In practice, a precision between 10 and 20 is sufficient for most production workloads.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You can combine sliding windows with dynamic key generators to enforce different rate limits based
          on user tier, subscription plan, or any other criteria. The example below demonstrates how to
          create tiered rate limits where free users get 30 requests per minute, pro users get 200, and
          enterprise users get 1000, all using the sliding window algorithm for smooth enforcement.
        </p>
        <CodeBlock code={slidingWindowCode} showLineNumbers />
        <InfoBlock variant="tip" title="Per-User Limits">
          When implementing tiered limits, make sure the key generator includes both the tier and the user
          identifier. Using a key format like <code className="prose-code">{`\${tier}:\${userId}`}</code> ensures
          that changing a user's tier immediately applies the new limit, since the key changes and the old
          counter is no longer consulted.
        </InfoBlock>
      </section>

      {/* Redis Store */}
      <section>
        <h2 id="redis-store" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Redis Store
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The default in-memory store works perfectly for single-process deployments, but it has an inherent
          limitation: each server instance maintains its own independent counters. If you run three instances
          behind a load balancer, a client could make 100 requests to each instance and effectively get 300
          requests per window instead of 100. In any multi-instance production deployment, you need a shared
          store that all instances can read and write to.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="prose-code">RedisStore</code> solves this by storing rate limit counters in Redis,
          which all your server instances share. The store uses atomic Redis operations (INCR and EXPIRE) to
          ensure counters are updated correctly even under high concurrency. Each client key is stored as a
          Redis key with the configured prefix, and the key automatically expires when the window resets, so
          there is no manual cleanup required. Redis's sub-millisecond latency means the overhead of the
          external store is negligible for most workloads.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">prefix</code> option lets you namespace your rate limit keys, which
          is important when multiple services share the same Redis instance. Using distinct prefixes like{' '}
          <code className="prose-code">rl:api:</code> and <code className="prose-code">rl:auth:</code> also makes
          it easy to inspect and debug rate limit state using Redis CLI tools. The{' '}
          <code className="prose-code">resetExpiryOnChange</code> option controls whether hitting the rate limit
          extends the expiry window -- set it to <code className="prose-code">false</code> (the default) to use
          fixed expiry, or <code className="prose-code">true</code> if you want the window to extend each time the
          client makes a request.
        </p>
        <CodeBlock code={redisStoreCode} showLineNumbers />
        <InfoBlock variant="warning" title="Auth Endpoints">
          Always apply strict rate limits to authentication endpoints (login, register, password reset)
          to prevent brute-force attacks. Use a longer window and lower max count than your general API limits.
          A common pattern is 5 attempts per 15 minutes for login endpoints, which is generous enough for
          legitimate users who mistype their password but restrictive enough to make brute-force attacks
          impractical.
        </InfoBlock>
      </section>

      {/* Slow Down */}
      <section>
        <h2 id="slow-down" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Progressive Slow Down
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Hard rate limiting is a binary response: requests are either allowed or blocked. This works well for
          preventing abuse, but it can create a poor experience for legitimate users who accidentally exceed
          the limit. The <code className="prose-code">slowDown</code> middleware provides a gentler alternative
          by progressively adding artificial delay to responses as a client approaches the threshold.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Under the hood, <code className="prose-code">slowDown</code> tracks request counts the same way{' '}
          <code className="prose-code">rateLimit</code> does, but instead of blocking requests that exceed
          the threshold, it introduces a delay that increases linearly with each additional request. The
          delay is calculated as <code className="prose-code">(requestCount - delayAfter) * delayMs</code>,
          capped at <code className="prose-code">maxDelayMs</code>. For example, with{' '}
          <code className="prose-code">delayAfter: 50</code> and <code className="prose-code">delayMs: 500</code>,
          the 51st request is delayed by 500ms, the 52nd by 1000ms, and so on.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A common production pattern is to layer slow-down in front of a hard rate limit. The slow-down acts
          as an early warning: well-behaved clients that respect the increasing latency will naturally back
          off before hitting the hard limit. Aggressive clients that ignore the delay still get blocked at
          the hard cap. This two-stage approach provides a better user experience while maintaining strong
          protection against abuse.
        </p>
        <CodeBlock code={slowDownCode} showLineNumbers />
      </section>

      {/* Standalone Limiter */}
      <section>
        <h2 id="standalone-limiter" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Standalone Limiter
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Sometimes you need rate limiting logic inside a handler rather than as middleware -- for example,
          when only certain code paths within a route need to be limited, or when the limit depends on
          data that is only available after parsing the request body. The{' '}
          <code className="prose-code">createRateLimiter</code> function creates a standalone rate limiter
          with a simple <code className="prose-code">.check(key)</code> method that you can call anywhere.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The standalone limiter uses the same underlying algorithms and stores as the middleware version.
          The <code className="prose-code">.check(key)</code> method returns an object with{' '}
          <code className="prose-code">allowed</code> (boolean indicating whether the request should proceed),{' '}
          <code className="prose-code">remaining</code> (number of requests left in the window), and{' '}
          <code className="prose-code">retryAfter</code> (seconds until the window resets, if the request was
          denied). This gives you complete control over how to handle the result -- you can return a 429, queue
          the operation for later, or fall back to a cached response.
        </p>
        <CodeBlock code={standaloneCode} showLineNumbers />
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Always enable rate limit headers.</strong> The{' '}
          <code className="prose-code">X-RateLimit-*</code> headers are essential for API consumers.
          Well-designed SDKs and clients use these headers to implement automatic backoff, and your
          support team will thank you when debugging rate limit issues because the headers make the
          current state visible in every response.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Set different limits for different endpoints.</strong> A global rate limit is a good
          baseline, but individual endpoints have different costs. A lightweight status check can handle
          thousands of requests per minute, while a complex search query or data export might need limits
          an order of magnitude lower. Apply route-specific limits using{' '}
          <code className="prose-code">preHandler</code> for expensive operations.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Use Redis in production.</strong> The in-memory store is convenient for development, but
          any production deployment with more than one server instance needs a shared store. Even if you
          run a single instance today, using Redis from the start saves you from a subtle bug when you
          eventually scale out.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Document your rate limits.</strong> Publish your rate limit policy in your API documentation.
          Include the limits, the window sizes, the key strategy (IP, API key, etc.), and what headers
          clients should watch. This prevents confusion and reduces support tickets.
        </p>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The rate limiting module exposes three main functions: <code className="prose-code">rateLimit</code> for
          middleware-based hard limits, <code className="prose-code">slowDown</code> for progressive delay, and{' '}
          <code className="prose-code">createRateLimiter</code> for standalone use in handlers. All three share
          the same underlying counter infrastructure and can use any of the available storage backends.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          rateLimit(options)
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Creates a middleware function that enforces a hard request cap per client within a rolling time window.
          When the limit is exceeded, subsequent requests receive a 429 status code until the window resets.
          Returns a Vexor middleware function suitable for use with <code className="prose-code">addHook</code> or{' '}
          <code className="prose-code">preHandler</code>.
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
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">windowMs</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">60000</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The duration of the time window in milliseconds. Counters are reset after this period. Shorter windows (e.g., 10 seconds) provide tighter burst control but are more sensitive to normal traffic fluctuations. Longer windows (e.g., 15 minutes) smooth out traffic patterns but allow larger absolute bursts within the window.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">max</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">100</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The maximum number of requests a single client can make within the time window. Once this count is reached, all subsequent requests from the same client receive a 429 response until the window resets. Set this based on your expected legitimate usage patterns, with headroom for normal traffic spikes.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">keyGenerator</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(ctx: Context) =&gt; string</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">ctx.req.ip</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">A function that returns a unique string identifier for each client. Requests with the same key share a counter. The function receives the full request context, so you can derive the key from headers, cookies, query parameters, or values set by earlier middleware. Common strategies include using an API key, user ID, or a combination of IP and user agent.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">handler</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(ctx: Context, info: RateLimitInfo) =&gt; Response</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">429 JSON</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">A custom function that is called when a client exceeds the rate limit. The default handler returns a JSON response with a 429 status. The info parameter contains the limit, remaining count, and reset time, which you can include in your custom error response. This is also the right place to log rate limit violations for monitoring.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">headers</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">true</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">When enabled, the middleware adds X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset headers to every response (not just 429 responses). These headers allow clients to monitor their usage and implement proactive backoff. Disable this only if you have a specific reason to hide rate limit information from clients.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">store</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">MemoryStore | SlidingWindowStore | RedisStore</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">MemoryStore</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The storage backend used to persist request counters. MemoryStore is suitable for single-instance deployments and development. SlidingWindowStore provides smoother rate limiting with sub-window precision. RedisStore is required for multi-instance production deployments where counters must be shared across servers.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          slowDown(options)
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Creates a middleware function that progressively adds artificial delay to responses as a client
          approaches a threshold. Unlike <code className="prose-code">rateLimit</code>, this middleware never
          outright blocks a request -- it only slows the response down, giving clients a signal to back off.
          The delay is calculated as <code className="prose-code">(requestCount - delayAfter) * delayMs</code>,
          capped at <code className="prose-code">maxDelayMs</code>.
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
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">windowMs</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">60000</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The duration of the time window in milliseconds. The request counter resets after this period, and accumulated delays drop back to zero. Use the same window size as your rate limiter if combining the two.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">delayAfter</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">1</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The number of requests a client can make within the window before delay starts being applied. Requests at or below this threshold are served without any added latency. Set this to a number that represents normal, expected usage so that typical users are never affected.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">delayMs</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">1000</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The amount of delay in milliseconds added for each request over the delayAfter threshold. This delay is cumulative: the first request over the threshold gets 1x this delay, the second gets 2x, and so on. Choose a value that is noticeable to automated clients but not punishing for a human who made a few extra requests.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">maxDelayMs</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Infinity</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The maximum delay in milliseconds that can be applied to a single request. Without this cap, the delay grows indefinitely with each additional request, which could cause very long response times and hold server connections open. Set this to a reasonable upper bound (e.g., 10-20 seconds) to prevent resource exhaustion.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Helper Functions
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          These utility functions provide access to rate limit state within your handlers, and allow you to
          create standalone rate limiters for use outside the middleware pipeline.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Function</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">getRateLimitInfo</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(ctx: Context) =&gt; RateLimitInfo</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Retrieves the current rate limit state for the request, including the configured limit, remaining request count, and the Unix timestamp when the window resets. This is useful for building status endpoints or including rate limit information in your API responses. Only available after the rate limit middleware has run.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">createRateLimiter</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(options: RateLimitOptions) =&gt; RateLimiter</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a standalone rate limiter instance with a <code className="prose-code">.check(key)</code> method. Call <code className="prose-code">check(key)</code> to atomically increment the counter for the given key and receive an object with allowed, remaining, and retryAfter fields. Use this when you need rate limiting logic inside a handler rather than as middleware.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next-steps" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/middleware/cors" className="btn-primary">
            CORS Middleware <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/middleware" className="btn-secondary">
            Middleware Overview
          </Link>
        </div>
      </section>
    </div>
  );
}
