import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { createCircuitBreaker } from '@vexorjs/core/resilience';

// Wrap an unreliable external service call
const breaker = createCircuitBreaker(
  async (userId: string) => {
    const res = await fetch(\`https://api.example.com/users/\${userId}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return res.json();
  },
  {
    failureThreshold: 5,     // Open after 5 consecutive failures
    resetTimeout: 30_000,    // Try again after 30 seconds
    timeout: 5_000,          // Timeout individual calls at 5s
  }
);

// Use the circuit breaker in your route
app.get('/users/:id', async (ctx) => {
  try {
    const user = await breaker.fire(ctx.params.id);
    return ctx.json(user);
  } catch (error) {
    if (breaker.isOpen) {
      return ctx.status(503).json({
        error: 'Service temporarily unavailable',
        retryAfter: 30,
      });
    }
    return ctx.status(500).json({ error: error.message });
  }
});`;

const withCircuitBreakerCode = `import { withCircuitBreaker } from '@vexorjs/core/resilience';

// Decorator-style wrapper for existing functions
const fetchUser = withCircuitBreaker(
  async (id: string) => {
    const res = await fetch(\`https://api.example.com/users/\${id}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return res.json();
  },
  { failureThreshold: 3, resetTimeout: 15_000 }
);

const fetchOrders = withCircuitBreaker(
  async (userId: string) => {
    const res = await fetch(\`https://api.example.com/orders?user=\${userId}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return res.json();
  },
  { failureThreshold: 5, resetTimeout: 30_000 }
);

// Each wrapped function has its own independent circuit
app.get('/dashboard/:id', async (ctx) => {
  const [user, orders] = await Promise.allSettled([
    fetchUser(ctx.params.id),
    fetchOrders(ctx.params.id),
  ]);

  return ctx.json({
    user: user.status === 'fulfilled' ? user.value : null,
    orders: orders.status === 'fulfilled' ? orders.value : [],
  });
});`;

const statesCode = `// Circuit Breaker State Machine
//
//   CLOSED ──(failure threshold reached)──> OPEN
//     ^                                       |
//     |                                       |
//     |                              (resetTimeout expires)
//     |                                       |
//     |                                       v
//     └──(success in half-open)──── HALF_OPEN
//                                       |
//                              (failure in half-open)
//                                       |
//                                       v
//                                     OPEN

import { createCircuitBreaker } from '@vexorjs/core/resilience';

const breaker = createCircuitBreaker(unreliableService, {
  failureThreshold: 5,
  resetTimeout: 30_000,
  halfOpenRequests: 3,  // Allow 3 test requests in HALF_OPEN
});

// Check the current state
console.log(breaker.currentState);
// => 'CLOSED' | 'OPEN' | 'HALF_OPEN'

// Boolean convenience checks
console.log(breaker.isClosed);   // true when healthy
console.log(breaker.isOpen);     // true when tripped

// Get detailed statistics
console.log(breaker.stats);
// => {
//   failures: 0,
//   successes: 42,
//   timeouts: 0,
//   fallbacks: 0,
//   lastFailure: null,
//   totalRequests: 42,
//   successRate: 1.0,
// }`;

const fallbackCode = `import { createCircuitBreaker } from '@vexorjs/core/resilience';

// Provide a fallback when the circuit is open
const breaker = createCircuitBreaker(
  async (productId: string) => {
    const res = await fetch(\`https://api.pricing.com/prices/\${productId}\`);
    if (!res.ok) throw new Error('Pricing service unavailable');
    return res.json();
  },
  {
    failureThreshold: 3,
    resetTimeout: 60_000,
    fallback: async (productId: string, error: Error) => {
      console.warn(\`Pricing fallback for \${productId}: \${error.message}\`);

      // Return cached or default pricing
      const cached = await cache.get(\`price:\${productId}\`);
      if (cached) return JSON.parse(cached);

      return {
        productId,
        price: null,
        currency: 'USD',
        source: 'fallback',
        message: 'Live pricing temporarily unavailable',
      };
    },
  }
);

app.get('/products/:id/price', async (ctx) => {
  // Fallback is returned transparently when circuit is open
  const pricing = await breaker.fire(ctx.params.id);
  return ctx.json(pricing);
});`;

const eventsCode = `import { createCircuitBreaker } from '@vexorjs/core/resilience';

const breaker = createCircuitBreaker(externalService, {
  failureThreshold: 5,
  resetTimeout: 30_000,
});

// Listen to state transitions
breaker.on('open', (stats) => {
  console.error('Circuit OPENED - service is unhealthy', stats);
  alerting.send({
    level: 'critical',
    message: 'External service circuit breaker opened',
    failures: stats.failures,
    lastFailure: stats.lastFailure,
  });
});

breaker.on('halfOpen', () => {
  console.info('Circuit HALF_OPEN - testing recovery');
});

breaker.on('close', (stats) => {
  console.info('Circuit CLOSED - service recovered', stats);
  alerting.send({
    level: 'resolved',
    message: 'External service circuit breaker closed',
    successRate: stats.successRate,
  });
});

// Track individual request outcomes
breaker.on('success', (duration) => {
  metrics.histogram('external_service_duration', duration);
});

breaker.on('failure', (error) => {
  metrics.counter('external_service_failures');
  console.error('Request failed:', error.message);
});

breaker.on('timeout', (duration) => {
  metrics.counter('external_service_timeouts');
  console.warn(\`Request timed out after \${duration}ms\`);
});

breaker.on('fallback', (error) => {
  metrics.counter('external_service_fallbacks');
});

// Remove a specific listener
const listener = () => console.log('opened');
breaker.on('open', listener);
breaker.off('open', listener);`;

const successRateCode = `import { createCircuitBreaker } from '@vexorjs/core/resilience';

// Open the circuit based on success rate over a rolling window
// instead of consecutive failure count
const breaker = createCircuitBreaker(paymentGateway, {
  // Success rate threshold (open if rate drops below 80%)
  successRateThreshold: 0.8,

  // Rolling window of 60 seconds
  rollingWindow: 60_000,

  // Minimum requests before evaluating success rate
  // Prevents opening on low traffic
  volumeThreshold: 20,

  // Recovery settings
  resetTimeout: 45_000,
  halfOpenRequests: 5,
});

// This is ideal for services with occasional expected errors
// (e.g., payment declines) where consecutive failures would
// trigger too aggressively.

app.post('/payments', async (ctx) => {
  const body = await ctx.req.json();

  try {
    const result = await breaker.fire(body);
    return ctx.json({ success: true, transactionId: result.id });
  } catch (error) {
    if (breaker.isOpen) {
      return ctx.status(503).json({
        error: 'Payment service temporarily unavailable',
        message: 'Please try again in a few moments',
      });
    }
    return ctx.status(400).json({
      error: 'Payment failed',
      message: error.message,
    });
  }
});`;

const httpProtectionCode = `import { Vexor } from '@vexorjs/core';
import { createCircuitBreaker } from '@vexorjs/core/resilience';

const app = new Vexor();

// Create circuit breakers for each upstream service
const userService = createCircuitBreaker(
  async (method: string, path: string, body?: unknown) => {
    const res = await fetch(\`http://user-service:3001\${path}\`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(\`User service: HTTP \${res.status}\`);
    return res.json();
  },
  {
    failureThreshold: 5,
    resetTimeout: 30_000,
    timeout: 3_000,
    fallback: async () => ({ error: 'User service unavailable' }),
  }
);

const orderService = createCircuitBreaker(
  async (method: string, path: string, body?: unknown) => {
    const res = await fetch(\`http://order-service:3002\${path}\`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(\`Order service: HTTP \${res.status}\`);
    return res.json();
  },
  {
    failureThreshold: 3,
    resetTimeout: 20_000,
    timeout: 5_000,
    fallback: async () => ({ error: 'Order service unavailable' }),
  }
);

// API gateway routes with circuit breaker protection
app.get('/api/users/:id', async (ctx) => {
  const user = await userService.fire('GET', \`/users/\${ctx.params.id}\`);
  return ctx.json(user);
});

app.get('/api/users/:id/orders', async (ctx) => {
  const orders = await orderService.fire('GET', \`/orders?userId=\${ctx.params.id}\`);
  return ctx.json(orders);
});

// Health check endpoint exposing circuit states
app.get('/health', (ctx) => {
  return ctx.json({
    status: 'ok',
    circuits: {
      userService: {
        state: userService.currentState,
        stats: userService.stats,
      },
      orderService: {
        state: orderService.currentState,
        stats: orderService.stats,
      },
    },
  });
});

// Manual controls for operational needs
app.post('/admin/circuits/:name/reset', (ctx) => {
  const circuits: Record<string, typeof userService> = {
    userService,
    orderService,
  };

  const circuit = circuits[ctx.params.name];
  if (!circuit) return ctx.status(404).json({ error: 'Unknown circuit' });

  circuit.reset();
  return ctx.json({ message: \`Circuit \${ctx.params.name} reset\` });
});`;

export default function CircuitBreaker() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="circuit-breaker" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Circuit Breaker
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Protect your application from cascading failures when upstream services go down. The circuit
          breaker pattern monitors failures and temporarily stops sending requests to unhealthy
          services, giving them time to recover while your application continues to function.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In any distributed system, the services you depend on will eventually fail. A database
          will become overloaded, a third-party API will go down, a network partition will make a
          microservice unreachable. The natural instinct is to keep retrying -- but this is exactly
          the wrong behavior when a service is struggling. If a downstream service is responding
          slowly due to overload, continuing to send requests compounds the problem. Your
          application's threads or event loop iterations pile up waiting for responses that may
          never come, your own response times degrade, and the failing service receives even more
          traffic that prevents it from recovering. This failure mode, where one service's problems
          cascade through the system, is one of the most common causes of total system outages.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The circuit breaker pattern, inspired by the electrical circuit breakers that protect your
          home from power surges, addresses this by monitoring the health of each external dependency
          and "tripping" when failures exceed a threshold. Once tripped, the breaker immediately
          rejects all subsequent requests to the failing service without actually sending them. This
          serves two purposes: it prevents your application from wasting resources on requests that
          will almost certainly fail, and it gives the downstream service breathing room to recover
          without being hammered by requests from every client that depends on it.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Vexor's circuit breaker implementation provides a complete solution with configurable
          failure thresholds, automatic recovery probing, fallback handlers, event-driven monitoring,
          and both consecutive-failure and success-rate-based tripping strategies. It is designed to
          wrap any async operation -- HTTP calls, database queries, gRPC requests, message queue
          publishes -- and can be used at any layer of your application, from route handlers to
          service clients.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A circuit breaker operates as a finite state machine with three states:{' '}
          <strong className="text-slate-900 dark:text-white">CLOSED</strong>,{' '}
          <strong className="text-slate-900 dark:text-white">OPEN</strong>, and{' '}
          <strong className="text-slate-900 dark:text-white">HALF_OPEN</strong>. Understanding
          these states and the transitions between them is essential to configuring the breaker
          correctly for your use case.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In the <strong className="text-slate-900 dark:text-white">CLOSED</strong> state, the
          circuit is operating normally. Every call to <code className="prose-code">breaker.fire()</code> is
          forwarded to the wrapped function, and the breaker tracks the outcome. Successful calls
          reset the failure counter. Failed calls increment it. When the failure counter reaches the
          configured <code className="prose-code">failureThreshold</code>, the breaker transitions
          to the OPEN state. Internally, the breaker maintains a counter that tracks consecutive
          failures (or, in success-rate mode, a sliding window of outcomes). Each successful call
          resets the consecutive counter to zero, so intermittent failures do not trip the breaker --
          only sustained sequences of failures do.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In the <strong className="text-slate-900 dark:text-white">OPEN</strong> state, the
          breaker short-circuits all calls. When <code className="prose-code">breaker.fire()</code> is
          called, it immediately throws a <code className="prose-code">CircuitOpenError</code> (or
          invokes the fallback if one is configured) without ever executing the wrapped function.
          This is the key protective behavior -- no network call is made, no resources are consumed
          waiting for a response, and no additional load is placed on the failing service. The
          breaker remains in the OPEN state for the duration of the <code className="prose-code">resetTimeout</code>.
          When the timeout expires, the breaker transitions to HALF_OPEN.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <strong className="text-slate-900 dark:text-white">HALF_OPEN</strong> state is the
          recovery probe. It allows a limited number of requests through (controlled by
          <code className="prose-code"> halfOpenRequests</code>) to test whether the downstream
          service has recovered. If these probe requests succeed, the breaker transitions back to
          CLOSED -- the service is healthy again, and normal traffic can resume. If any probe request
          fails, the breaker transitions back to OPEN and the reset timer restarts. This
          cautious probing strategy prevents a flood of requests from immediately re-overwhelming a
          service that has just started recovering.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The timeout mechanism deserves special attention. When the <code className="prose-code">timeout</code> option
          is configured, each call to the wrapped function is given a maximum execution time. If the
          call does not complete within this window, the breaker cancels it and counts the result as
          a failure. This is critical for detecting "gray failures" where a service is technically
          responding but doing so unacceptably slowly. Without timeout enforcement, a degraded
          service that takes 30 seconds per response would never trip the failure counter but would
          still degrade your application's performance.
        </p>
      </section>

      {/* When to Use */}
      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          When to Use
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use a circuit breaker when your application calls an external service that might become
          unavailable or degraded. This includes HTTP API calls to third-party services, database
          queries that might time out under load, gRPC calls to other microservices, and any I/O
          operation that can fail in ways that are likely to persist for a period of time.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Circuit breakers are most valuable when the cost of a failed request is high. If a failing
          call consumes a database connection pool slot for 30 seconds before timing out, a circuit
          breaker can prevent your pool from being exhausted. If a slow third-party API call blocks
          event loop time, a circuit breaker can prevent your application from becoming unresponsive.
          The general rule is: if a failure is likely to repeat for a sustained period (minutes, not
          milliseconds) and if each failed attempt consumes meaningful resources, a circuit breaker
          is the right tool.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You should generally <strong className="text-slate-900 dark:text-white">not</strong> use
          a circuit breaker for operations that fail transiently and recover within milliseconds (use
          retries instead), for local in-process operations that cannot cause cascading failures, or
          for operations where every call must be attempted regardless of recent history (like
          critical writes that cannot be deferred). In practice, circuit breakers and retries
          complement each other: retries handle transient glitches, while circuit breakers handle
          sustained outages. Vexor supports combining both patterns -- you can wrap a retried
          function inside a circuit breaker so that the breaker trips only when retries are
          consistently exhausted.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          A key trade-off to consider is the <code className="prose-code">failureThreshold</code>.
          Setting it too low (e.g., 1-2) makes the breaker overly sensitive, tripping on occasional
          network blips that would resolve on the next attempt. Setting it too high (e.g., 50) means
          your application will continue hammering a failing service for 50 requests before protecting
          itself. For most use cases, a threshold between 3 and 10 strikes the right balance. The
          <code className="prose-code"> resetTimeout</code> presents a similar trade-off: too short
          and the breaker oscillates between OPEN and HALF_OPEN without giving the service enough time
          to fully recover; too long and your application stays in degraded mode longer than necessary.
          Start with 15-60 seconds and adjust based on the typical recovery time of the service.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Wrap any async operation with <code className="prose-code">createCircuitBreaker</code> to
          protect it. The breaker tracks failures and opens the circuit when the failure threshold
          is reached, rejecting subsequent calls immediately instead of waiting for them to fail.
          The first argument is the async function you want to protect, and the second is a
          configuration object that controls the breaker's behavior.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The returned breaker object exposes a <code className="prose-code">fire()</code> method
          that accepts the same arguments as the wrapped function. Internally,
          <code className="prose-code"> fire()</code> checks the circuit state, either forwards the
          call or rejects it, and updates the failure/success counters based on the outcome. Your
          route handler should catch errors from <code className="prose-code">fire()</code> and
          check <code className="prose-code">breaker.isOpen</code> to determine whether the error
          is a circuit-open rejection (meaning the service is known to be down) or an actual request
          failure (meaning the call was attempted and failed).
        </p>
        <CodeBlock code={basicUsageCode} filename="routes/users.ts" showLineNumbers />
        <p className="text-slate-600 dark:text-slate-400 mb-4 mt-6">
          For a simpler decorator-style API, use <code className="prose-code">withCircuitBreaker</code> to
          wrap existing functions. Each wrapped function maintains its own independent circuit state.
          This is particularly useful when you have multiple service client functions and want each
          to have its own isolated failure tracking. The wrapped function has the same signature as
          the original, so it can be used as a drop-in replacement throughout your codebase.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Using <code className="prose-code">Promise.allSettled</code> with independent circuit
          breakers is a powerful pattern for dashboard-style endpoints that aggregate data from
          multiple services. If one service is down, the circuit breaker rejects instantly and you
          can return a partial response with the data that is available, rather than failing the
          entire request. This graceful degradation is one of the primary benefits of per-service
          circuit isolation.
        </p>
        <CodeBlock code={withCircuitBreakerCode} filename="routes/dashboard.ts" showLineNumbers />
        <InfoBlock variant="tip" title="Independent Circuits">
          Always create separate circuit breakers for each upstream service. If one service fails,
          you want to isolate the failure and continue serving requests that depend on healthy services.
          A single shared breaker across all services would cause a failure in one to block access to all.
        </InfoBlock>
      </section>

      {/* States Explained */}
      <section>
        <h2 id="states-explained" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          States Explained
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The circuit breaker's state machine is the core of its behavior. Understanding the
          transitions between states helps you configure the breaker's parameters correctly and
          debug issues when the breaker trips unexpectedly or stays open too long.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <strong className="text-slate-900 dark:text-white">CLOSED to OPEN</strong> transition
          occurs when the failure counter reaches the <code className="prose-code">failureThreshold</code>.
          In consecutive-failure mode, this means N failures in a row without an intervening success.
          In success-rate mode, this means the success rate over the rolling window has dropped below
          the threshold and the minimum volume requirement is met. When this transition fires, the
          breaker records the timestamp and emits an <code className="prose-code">'open'</code> event
          with the current statistics.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <strong className="text-slate-900 dark:text-white">OPEN to HALF_OPEN</strong> transition
          is timer-driven. After <code className="prose-code">resetTimeout</code> milliseconds have
          elapsed since the breaker opened, the next call to <code className="prose-code">fire()</code> triggers
          the transition. The breaker does not transition on its own -- it waits until a request
          arrives, which avoids unnecessary background timers. The
          <code className="prose-code"> halfOpenRequests</code> parameter controls how many probe
          requests are allowed through before a decision is made.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <strong className="text-slate-900 dark:text-white">HALF_OPEN resolution</strong> goes
          in one of two directions. If all probe requests succeed, the breaker transitions to CLOSED
          and resets its failure counter. If any probe request fails, the breaker immediately
          transitions back to OPEN and the reset timer starts over. This conservative approach ensures
          that the service is genuinely recovered before full traffic is restored. With
          <code className="prose-code"> halfOpenRequests</code> set to 3, for example, three
          consecutive successful probes are required before the circuit closes.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You can inspect the current state at any time through the <code className="prose-code">currentState</code>,
          <code className="prose-code"> isOpen</code>, and <code className="prose-code">isClosed</code> properties.
          The <code className="prose-code">stats</code> object provides a complete snapshot of the
          breaker's counters, including total requests, failures, successes, timeouts, fallbacks,
          the last failure timestamp, and the current success rate.
        </p>
        <CodeBlock code={statesCode} filename="states.ts" showLineNumbers />
      </section>

      {/* Fallback Handlers */}
      <section>
        <h2 id="fallback-handlers" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Fallback Handlers
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Instead of throwing an error when the circuit is open, provide a fallback function that
          returns a degraded response. Fallbacks receive the original arguments and the error that
          would have been thrown, so they can return cached data, defaults, or a graceful error message.
          This is one of the most powerful features of the circuit breaker pattern because it allows
          your application to continue functioning -- albeit in a degraded state -- even when a
          dependency is completely unavailable.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The fallback function is invoked in two situations: when the circuit is OPEN and a call
          is rejected without executing the wrapped function, and when the wrapped function throws
          an error while the circuit is in any state. In both cases, the fallback receives the
          original arguments (so it knows what was being requested) and the error (so it can log
          or inspect the cause). The fallback's return value is passed through to the caller as if
          the original function had succeeded, making the degradation transparent to calling code.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The best fallback strategies use cached data. If your application caches API responses (in
          Redis, in-memory, or any other store), the fallback can return the most recent cached
          version of the requested data. The data may be slightly stale, but it is far better than
          returning an error. For data that cannot be cached (like real-time pricing), return a
          clearly marked default or null value so the client knows the data is unavailable and can
          handle it appropriately.
        </p>
        <CodeBlock code={fallbackCode} filename="routes/pricing.ts" showLineNumbers />
        <InfoBlock variant="info" title="Fallback Best Practices">
          Fallbacks should be fast and reliable. Return cached data, pre-computed defaults, or static
          responses. Avoid calling other external services in your fallback, as they may also be
          experiencing issues during an outage. If the fallback itself can fail (e.g., a cache miss),
          have the fallback return a safe default value as a last resort rather than throwing an error.
        </InfoBlock>
      </section>

      {/* Events and Monitoring */}
      <section>
        <h2 id="events" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Events and Monitoring
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Circuit breakers emit events on state transitions and request outcomes. Use these for
          monitoring, alerting, and metrics collection. In production, circuit state changes are
          among the most important signals for understanding system health. An
          <code className="prose-code"> 'open'</code> event means one of your dependencies has
          become unhealthy, and a <code className="prose-code">'close'</code> event means it has
          recovered. These events should trigger alerts in your monitoring system so your operations
          team is aware of degraded service.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The event system follows a standard listener pattern. Attach listeners with
          <code className="prose-code"> on()</code> and remove them with
          <code className="prose-code"> off()</code>. State transition events
          (<code className="prose-code">'open'</code>, <code className="prose-code">'halfOpen'</code>,
          <code className="prose-code"> 'close'</code>) carry the current statistics object, which
          you can forward to your alerting system. Request outcome events
          (<code className="prose-code">'success'</code>, <code className="prose-code">'failure'</code>,
          <code className="prose-code"> 'timeout'</code>, <code className="prose-code">'fallback'</code>)
          carry the duration or error, which you can record as metrics for dashboards and SLO
          tracking.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A common monitoring pattern is to record the <code className="prose-code">'success'</code> event
          durations as a histogram metric. This gives you a distribution of response times for the
          upstream service, which you can use to detect latency degradation before it triggers the
          circuit breaker. Combined with failure and timeout counters, you get a complete picture of
          the dependency's health over time.
        </p>
        <CodeBlock code={eventsCode} filename="monitoring.ts" showLineNumbers />
      </section>

      {/* Success Rate Threshold */}
      <section>
        <h2 id="success-rate-threshold" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Success Rate Threshold
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The default consecutive-failure mode works well for services that either work or do not
          work. But some services have expected error rates. A payment gateway, for example, will
          decline a certain percentage of transactions as part of normal operation -- a declined
          payment is an error from the HTTP perspective but not a sign that the service is
          unhealthy. In these cases, consecutive-failure mode is too aggressive: a burst of declined
          payments could trip the breaker even though the service is functioning correctly.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Success-rate mode solves this by evaluating the ratio of successful calls to total calls
          over a rolling time window. The circuit opens only when the success rate drops below a
          configured threshold (e.g., 80%) <em>and</em> the minimum volume threshold has been met.
          The volume threshold prevents false positives during low-traffic periods: if only two
          requests have been made in the window and one failed, the 50% success rate should not
          trip the breaker because the sample size is too small to be meaningful.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The rolling window is implemented as a time-bucketed counter. The breaker divides the
          window into sub-buckets (e.g., a 60-second window might use 6 buckets of 10 seconds each)
          and discards the oldest bucket as time advances. This provides a smooth, continuously
          updating success rate rather than a sharp reset at window boundaries. The math is
          straightforward: <code className="prose-code">successRate = successes / totalRequests</code> over
          the current window, and the circuit opens when
          <code className="prose-code"> successRate &lt; successRateThreshold</code> and
          <code className="prose-code"> totalRequests &gt;= volumeThreshold</code>.
        </p>
        <CodeBlock code={successRateCode} filename="routes/payments.ts" showLineNumbers />
        <InfoBlock variant="warning" title="Volume Threshold">
          Always set <code className="prose-code">volumeThreshold</code> when using success rate mode.
          Without it, a single failure during low traffic could open the circuit. A threshold of 20
          ensures you have enough data to make an accurate assessment. For high-traffic services,
          increase this to 50 or 100 for even more statistical confidence.
        </InfoBlock>
      </section>

      {/* HTTP Service Protection */}
      <section>
        <h2 id="http-service-protection" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          HTTP Service Protection
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In a microservices architecture, use circuit breakers as an API gateway pattern to protect
          against failures in upstream services. Each service gets its own breaker with tuned thresholds,
          and you can expose circuit state through a health check endpoint. This pattern is the
          foundation of resilient service-to-service communication, and it scales naturally as you add
          more dependencies.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The health check endpoint is a critical operational tool. By exposing the current state and
          statistics of each circuit breaker, you give your load balancer, monitoring system, and
          operations team real-time visibility into dependency health. A Kubernetes readiness probe
          can check this endpoint and remove the pod from the service mesh if a critical dependency
          is down, preventing users from being routed to an instance that cannot serve their requests.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Manual circuit controls are equally important for operational scenarios. During a planned
          maintenance window for a downstream service, you can force-open the circuit to prevent
          any calls from being attempted, and force-close it when maintenance is complete. The
          <code className="prose-code"> reset()</code> method returns the circuit to CLOSED state
          and clears all statistics, which is useful after a deployment or configuration change
          that should invalidate the breaker's historical data.
        </p>
        <CodeBlock code={httpProtectionCode} filename="gateway.ts" showLineNumbers />
        <InfoBlock variant="tip" title="Manual Controls">
          Expose admin endpoints to manually reset or force-open circuit breakers during incidents.
          The <code className="prose-code">reset()</code> method returns the circuit to CLOSED state,
          while <code className="prose-code">open()</code> and <code className="prose-code">close()</code>{' '}
          provide direct state control. Protect these admin endpoints with authentication to prevent
          unauthorized manipulation.
        </InfoBlock>
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">One breaker per dependency, not per endpoint.</strong>{' '}
          If your user service has <code className="prose-code">/users/:id</code> and
          <code className="prose-code"> /users/:id/profile</code>, both endpoints share the same
          underlying service. Use one circuit breaker for the entire user service, not separate
          breakers per path. If the service is down, it is down for all endpoints.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Always set a timeout.</strong>{' '}
          Without a timeout, the breaker can only detect explicit errors (thrown exceptions). A
          service that hangs indefinitely will consume resources without ever tripping the breaker.
          Set the timeout to slightly above the service's P99 latency in normal conditions -- this
          ensures that abnormally slow responses are treated as failures.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Use fallbacks for user-facing endpoints.</strong>{' '}
          For any endpoint where users will see the result, provide a fallback that returns cached
          or default data. A product page that shows "Price unavailable" is better than a 503 error
          page. Reserve hard failures (no fallback) for internal services and background processes
          where partial data would cause downstream correctness issues.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Monitor circuit state transitions.</strong>{' '}
          Every <code className="prose-code">'open'</code> event should trigger an alert. Every
          <code className="prose-code"> 'close'</code> event should resolve it. If a circuit is
          oscillating rapidly between OPEN and CLOSED, the <code className="prose-code">resetTimeout</code> is
          probably too short -- the service recovers just enough to pass the probe but not enough to
          handle full traffic.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          <strong className="text-slate-900 dark:text-white">Test your circuit breaker configuration under load.</strong>{' '}
          In staging, simulate downstream failures by introducing artificial latency and errors into
          your test services. Verify that the breaker trips at the expected threshold, that fallbacks
          return correct data, that recovery probing works, and that your application's response times
          improve after the circuit opens (because resources are no longer wasted on failing calls).
        </p>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          Factory Functions
        </h3>
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
                <td className="py-3 px-4"><code className="prose-code">createCircuitBreaker</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(action, options?) =&gt; CircuitBreaker</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a circuit breaker that wraps an async action. The returned object provides fire() for executing the action through the circuit, state inspection properties, event listeners, and manual control methods. The breaker starts in the CLOSED state.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">withCircuitBreaker</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(fn, options?) =&gt; WrappedFunction</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Decorator-style wrapper that returns a function with the same signature as the original but with built-in circuit breaker protection. The circuit state is managed internally and is not directly accessible. Use createCircuitBreaker instead when you need to inspect state or attach event listeners.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          CircuitBreaker Instance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Member</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">fire(...args)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Promise&lt;T&gt;</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Executes the protected action through the circuit breaker. In CLOSED state, forwards the call and tracks the outcome. In OPEN state, immediately rejects with CircuitOpenError or invokes the fallback. In HALF_OPEN state, forwards the call as a recovery probe. Arguments are passed through to the wrapped function unchanged.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">open()</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Manually forces the circuit to the OPEN state, regardless of the current failure count. Useful during planned maintenance windows to prevent calls to a service that is known to be unavailable. Emits the 'open' event.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">close()</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Manually forces the circuit to the CLOSED state without resetting statistics. Resumes normal operation and allows all calls through. Use with caution -- if the underlying service is still failing, the circuit will trip again after failureThreshold failures.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">reset()</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Resets the circuit to CLOSED state and clears all statistics (failure count, success count, timeouts, etc.). Effectively creates a fresh circuit breaker with the same configuration. Useful after deploying a fix to the upstream service when you want a clean baseline.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">currentState</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">'CLOSED' | 'OPEN' | 'HALF_OPEN'</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The current state of the circuit breaker state machine. Read this to determine whether the circuit is operating normally (CLOSED), blocking requests (OPEN), or testing recovery (HALF_OPEN).</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">isOpen</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns true when the circuit is in OPEN state. Convenience property equivalent to currentState === 'OPEN'. Use in route handlers to return 503 responses with Retry-After headers.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">isClosed</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns true when the circuit is in CLOSED state. Convenience property equivalent to currentState === 'CLOSED'. Indicates normal, healthy operation.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">stats</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">CircuitBreakerStats</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns a snapshot of the circuit breaker's current statistics, including failures, successes, timeouts, fallbacks, lastFailure timestamp, totalRequests count, and successRate (0-1). Useful for health check endpoints and metrics collection.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">on(event, listener)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Subscribes to a circuit breaker event. Supported events are 'open', 'halfOpen', 'close' (state transitions), and 'success', 'failure', 'timeout', 'fallback' (request outcomes). Multiple listeners can be attached to the same event.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">off(event, listener)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Removes a previously attached event listener. The listener reference must be the same function instance that was passed to on(). No-op if the listener is not currently attached.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          CircuitBreakerOptions
        </h3>
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
                <td className="py-3 px-4"><code className="prose-code">failureThreshold</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">5</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Number of consecutive failures required to trip the circuit from CLOSED to OPEN. A single successful call resets the counter to zero. Lower values make the breaker more sensitive; higher values tolerate more intermittent failures before tripping. Ignored when successRateThreshold is set.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">resetTimeout</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">30000</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Time in milliseconds the circuit stays in OPEN state before transitioning to HALF_OPEN for recovery probing. Set this based on the typical recovery time of the downstream service. Too short causes oscillation; too long delays recovery. Common values range from 15000 (15s) to 120000 (2min).</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">rollingWindow</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Rolling time window in milliseconds for success rate calculation. Only used when successRateThreshold is set. The window is divided into sub-buckets for smooth expiration. Common values are 30000 (30s) to 120000 (2min) depending on traffic volume.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">volumeThreshold</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Minimum number of requests within the rolling window before the success rate is evaluated. Prevents the circuit from opening during low-traffic periods when a small number of failures would create a misleadingly low success rate. Set to at least 10-20 for statistical significance.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">timeout</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Maximum execution time in milliseconds for each individual call. If the wrapped function does not resolve or reject within this window, the call is aborted and counted as a failure. Essential for detecting "gray failures" where a service responds but too slowly to be useful.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">fallback</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(...args, error) =&gt; T</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Function called when the circuit is open or when the wrapped function fails. Receives the original call arguments followed by the error. Should return a value of the same type as the wrapped function (cached data, defaults, or a degraded response). Must be fast and should not call other external services.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">successRateThreshold</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Success rate (0-1) below which the circuit opens. When set, the breaker uses success-rate mode instead of consecutive-failure mode. A value of 0.8 means the circuit opens when fewer than 80% of requests succeed within the rolling window. Requires rollingWindow to be set.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">halfOpenRequests</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">1</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Number of test requests allowed through in HALF_OPEN state before deciding to close or reopen the circuit. All probe requests must succeed for the circuit to close. A single failure sends the circuit back to OPEN. Higher values provide more confidence but delay full recovery.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          Events
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Event</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Payload</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">open</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">CircuitBreakerStats</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Emitted when the circuit transitions from CLOSED (or HALF_OPEN) to OPEN. The stats payload includes the failure count, last failure details, and success rate at the time of tripping. Use this to trigger critical-level alerts in your monitoring system.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">halfOpen</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Emitted when the circuit transitions from OPEN to HALF_OPEN after the resetTimeout expires. Indicates that recovery probing has begun. No payload because no new data is available at transition time.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">close</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">CircuitBreakerStats</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Emitted when the circuit transitions from HALF_OPEN to CLOSED after successful recovery probes. Indicates the downstream service has recovered and full traffic can resume. Use this to auto-resolve alerts that were triggered by the 'open' event.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">success</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number (duration ms)</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Emitted after a successful call. The payload is the call duration in milliseconds. Record this as a histogram metric to track upstream service latency over time and detect degradation before it triggers the circuit breaker.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">failure</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Error</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Emitted after a failed call (exception thrown by the wrapped function). The payload is the original error. Increment a failure counter metric and log the error message for debugging. This event fires before the fallback is invoked.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">timeout</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number (duration ms)</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Emitted when a call exceeds the configured timeout. The payload is the elapsed time in milliseconds (which will be approximately equal to the timeout value). Timeouts are counted as failures for the purpose of tripping the circuit.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">fallback</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Error</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Emitted when the fallback function is invoked, either because the circuit is open or because the wrapped function failed. The payload is the error that triggered the fallback. Track this metric to understand how often your application serves degraded responses.</td>
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
          <Link to="/advanced/retry" className="btn-primary">
            Retry Patterns <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/advanced/adapters" className="btn-secondary">
            Adapters & Runtimes
          </Link>
        </div>
      </section>
    </div>
  );
}
