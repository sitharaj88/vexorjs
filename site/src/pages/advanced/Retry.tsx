import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicUsageCode = `import { retry } from '@vexorjs/core/resilience';

// Retry an async operation with exponential backoff
const data = await retry(
  async () => {
    const res = await fetch('https://api.example.com/data');
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return res.json();
  },
  {
    maxAttempts: 3,      // Total attempts (1 initial + 2 retries)
    delay: 1_000,        // Start with 1 second delay
    backoffFactor: 2,    // Double the delay each retry
  }
);

// Timeline: attempt 1 → wait 1s → attempt 2 → wait 2s → attempt 3`;

const backoffStrategiesCode = `import { retry, backoffStrategies } from '@vexorjs/core/resilience';

// Constant delay: same wait between every retry
// Timeline: attempt → 1s → attempt → 1s → attempt
await retry(fetchData, {
  maxAttempts: 3,
  delay: backoffStrategies.constant(1_000),
});

// Linear delay: increases by a fixed amount each retry
// Timeline: attempt → 1s → attempt → 2s → attempt → 3s → attempt
await retry(fetchData, {
  maxAttempts: 4,
  delay: backoffStrategies.linear(1_000), // 1s, 2s, 3s, 4s...
});

// Exponential delay: doubles each retry (most common)
// Timeline: attempt → 1s → attempt → 2s → attempt → 4s → attempt
await retry(fetchData, {
  maxAttempts: 4,
  delay: backoffStrategies.exponential(1_000), // 1s, 2s, 4s, 8s...
});

// Exponential with jitter: adds randomness to prevent thundering herd
// Timeline: attempt → ~1.2s → attempt → ~1.8s → attempt → ~4.3s
await retry(fetchData, {
  maxAttempts: 4,
  delay: backoffStrategies.exponentialWithJitter(1_000),
});

// Fibonacci delay: grows slower than exponential
// Timeline: attempt → 1s → attempt → 1s → attempt → 2s → attempt → 3s
await retry(fetchData, {
  maxAttempts: 5,
  delay: backoffStrategies.fibonacci(1_000), // 1s, 1s, 2s, 3s, 5s...
});

// Custom backoff strategy
await retry(fetchData, {
  maxAttempts: 5,
  delay: (attempt: number) => {
    // Step function: quick retries first, then slow down
    if (attempt <= 2) return 500;
    if (attempt <= 4) return 5_000;
    return 30_000;
  },
});`;

const retryPredicatesCode = `import { retry, retryPredicates } from '@vexorjs/core/resilience';

// Only retry on specific error types
await retry(fetchData, {
  maxAttempts: 3,
  delay: 1_000,
  retryIf: retryPredicates.onErrorType(TypeError),
});

// Only retry when error message matches a pattern
await retry(fetchData, {
  maxAttempts: 3,
  delay: 1_000,
  retryIf: retryPredicates.onErrorMessage(/timeout|ECONNRESET/i),
});

// Only retry on specific HTTP status codes
await retry(
  async () => {
    const res = await fetch(url);
    if (!res.ok) {
      const err = new Error(\`HTTP \${res.status}\`);
      (err as any).status = res.status;
      throw err;
    }
    return res.json();
  },
  {
    maxAttempts: 3,
    delay: 1_000,
    retryIf: retryPredicates.onHttpStatus([429, 502, 503, 504]),
  }
);

// Retry on common transient errors (ECONNRESET, ETIMEDOUT, etc.)
await retry(fetchData, {
  maxAttempts: 3,
  delay: 1_000,
  retryIf: retryPredicates.transient(),
});

// Never retry (useful for disabling retries conditionally)
await retry(fetchData, {
  maxAttempts: 3,
  delay: 1_000,
  retryIf: retryPredicates.never(),
});

// Always retry (default behavior)
await retry(fetchData, {
  maxAttempts: 3,
  delay: 1_000,
  retryIf: retryPredicates.always(),
});`;

const combiningPredicatesCode = `import { retry, retryPredicates } from '@vexorjs/core/resilience';

// Combine multiple predicates with logical OR
const shouldRetry = (error: Error) => {
  return (
    retryPredicates.transient()(error) ||
    retryPredicates.onHttpStatus([429, 503])(error) ||
    retryPredicates.onErrorMessage(/rate limit/i)(error)
  );
};

await retry(fetchData, {
  maxAttempts: 5,
  delay: 1_000,
  backoffFactor: 2,
  retryIf: shouldRetry,
});

// With retry callback for logging
await retry(fetchData, {
  maxAttempts: 5,
  delay: 1_000,
  backoffFactor: 2,
  retryIf: shouldRetry,
  onRetry: (error, attempt, delay) => {
    console.warn(
      \`Retry attempt \${attempt}: \${error.message} (waiting \${delay}ms)\`
    );
    metrics.counter('retries', {
      attempt,
      error: error.message,
    });
  },
});`;

const retryableFunctionsCode = `import { retryable } from '@vexorjs/core/resilience';

// Make any function automatically retryable
const fetchUser = retryable(
  async (userId: string) => {
    const res = await fetch(\`https://api.example.com/users/\${userId}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return res.json();
  },
  {
    maxAttempts: 3,
    delay: 500,
    backoffFactor: 2,
    retryIf: (error) => error.message.includes('503'),
  }
);

// Use like a normal function - retries happen transparently
const user = await fetchUser('user-123');

// Works great with Vexor routes
const fetchProduct = retryable(
  async (id: string) => {
    const res = await fetch(\`https://api.catalog.com/products/\${id}\`);
    if (!res.ok) throw new Error(\`Catalog service: HTTP \${res.status}\`);
    return res.json();
  },
  { maxAttempts: 3, delay: 1_000, backoffFactor: 2 }
);

app.get('/products/:id', async (ctx) => {
  const product = await fetchProduct(ctx.params.id);
  return ctx.json(product);
});`;

const retryWithResultCode = `import { retryWithResult } from '@vexorjs/core/resilience';

// Get detailed information about the retry outcome
const result = await retryWithResult(
  async () => {
    const res = await fetch('https://api.example.com/data');
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return res.json();
  },
  {
    maxAttempts: 5,
    delay: 1_000,
    backoffFactor: 2,
    maxDelay: 10_000,
    jitter: true,
    timeout: 30_000,
  }
);

// RetryResult shape:
// {
//   success: boolean,
//   value: T | undefined,
//   error: Error | undefined,
//   attempts: number,
//   totalTime: number,
// }

if (result.success) {
  console.log(\`Success after \${result.attempts} attempt(s) in \${result.totalTime}ms\`);
  console.log('Data:', result.value);
} else {
  console.error(
    \`Failed after \${result.attempts} attempts over \${result.totalTime}ms\`
  );
  console.error('Last error:', result.error?.message);
}

// Use in routes for detailed error responses
app.get('/api/external-data', async (ctx) => {
  const result = await retryWithResult(fetchExternalData, {
    maxAttempts: 3,
    delay: 500,
    backoffFactor: 2,
  });

  if (!result.success) {
    return ctx.status(502).json({
      error: 'Upstream service failed',
      attempts: result.attempts,
      totalTime: result.totalTime,
      lastError: result.error?.message,
    });
  }

  ctx.header('X-Retry-Attempts', String(result.attempts));
  ctx.header('X-Response-Time', \`\${result.totalTime}ms\`);
  return ctx.json(result.value);
});`;

export default function Retry() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="retry-patterns" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Retry Patterns
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Handle transient failures gracefully with configurable retry strategies. Vexor provides
          exponential backoff, jitter, custom predicates, and detailed result tracking to make
          your application resilient against temporary network issues and service outages.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Transient failures are the most common type of error in distributed systems. A TCP
          connection is reset because a load balancer recycled a backend. A DNS lookup times out
          because of momentary network congestion. A third-party API returns a 503 because it is
          deploying a new version. These failures are temporary by nature -- the same request that
          failed would likely succeed if tried again a few seconds later. Retrying is the correct
          response to transient failures, but the way you retry matters enormously. A naive retry
          loop that immediately re-sends the request can cause more problems than it solves,
          particularly when the failure is caused by the service being overloaded in the first place.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The core challenge with retries is the thundering herd problem. Imagine a service that
          goes down for 5 seconds. Every client that tried to reach it during those 5 seconds will
          retry at nearly the same moment, creating a spike of traffic that can be several times
          larger than normal load. If the service was struggling under normal load, this retry spike
          can push it back into failure, causing another round of retries, and so on in a cascading
          feedback loop. Exponential backoff mitigates this by spreading retries over increasing
          time intervals, and jitter further randomizes the timing so that clients do not
          synchronize their retries. These two techniques -- backoff and jitter -- are the
          foundation of every production retry strategy.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Equally important is knowing <em>when</em> to retry. Not all errors are transient. A
          400 Bad Request error means your request is malformed -- retrying will produce the exact
          same error. A 401 Unauthorized means your credentials are wrong -- retrying will not fix
          that. Only errors that indicate a temporary condition (503 Service Unavailable, 429 Too
          Many Requests, connection timeouts, DNS resolution failures) should trigger retries. Vexor's
          retry predicates give you fine-grained control over which errors trigger retries and which
          are propagated immediately.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          There is also the question of idempotency. Retrying a GET request is safe because it has
          no side effects. Retrying a POST request that creates a resource is potentially dangerous --
          if the first request succeeded but the response was lost due to a network error, the retry
          would create a duplicate. For non-idempotent operations, you must either use idempotency
          keys (unique tokens that the server uses to deduplicate requests) or accept that retries
          may produce side effects and design your system to handle duplicates.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's retry mechanism is a loop with three phases: execute, evaluate, and wait. In the
          execute phase, the wrapped async function is called. In the evaluate phase, the outcome is
          inspected -- if the function returned successfully, the result is returned to the caller
          and the loop ends; if it threw an error, the retry predicate is consulted to determine
          whether the error is retryable. In the wait phase, the backoff strategy computes the delay
          for the next attempt, and the loop sleeps for that duration before the next execute phase.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The backoff computation is where the math lives. For exponential backoff, the delay for
          attempt N is calculated as <code className="prose-code">baseDelay * backoffFactor^(N-1)</code>.
          With a base delay of 1000ms and a factor of 2, the sequence is 1000ms, 2000ms, 4000ms,
          8000ms, and so on. The <code className="prose-code">maxDelay</code> cap prevents this from
          growing unboundedly -- without it, the 10th retry would wait over 8 minutes. When jitter
          is enabled, a random factor between 0 and 1 is multiplied with the computed delay, so the
          actual wait for a 4000ms delay might be anywhere between 0ms and 4000ms. This
          randomization is what prevents the thundering herd: even if a thousand clients all fail at
          the same time, their retries are spread randomly across the backoff window.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">timeout</code> option applies globally across all attempts.
          If the total elapsed time (including execution time and wait time) exceeds the timeout, the
          retry loop is aborted and the last error is thrown. This prevents retries from running
          indefinitely in situations where the caller has a deadline (such as an HTTP request that
          must respond within a certain time). The per-attempt timeout, if needed, should be enforced
          by the wrapped function itself (for example, using <code className="prose-code">AbortSignal.timeout()</code> in
          fetch calls).
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Internally, Vexor tracks the number of attempts and total elapsed time for observability.
          The <code className="prose-code">onRetry</code> callback fires before each retry (not
          before the initial attempt), receiving the error, attempt number, and computed delay. This
          is the integration point for logging and metrics -- you can record how often retries occur,
          which errors trigger them, and how long the total retry sequence takes.
        </p>
      </section>

      {/* When to Use */}
      <section>
        <h2 id="when-to-use" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          When to Use
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use retries for operations that are likely to succeed on a subsequent attempt. This
          includes network calls that failed due to connection issues, API calls that returned
          transient error codes (429, 502, 503, 504), database queries that timed out due to
          momentary load, and any I/O operation that can fail due to conditions that resolve on
          their own within seconds.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Do <strong className="text-slate-900 dark:text-white">not</strong> use retries for errors
          that are deterministic and permanent. A 400 Bad Request, 401 Unauthorized, 403 Forbidden,
          or 404 Not Found will return the same response on every attempt. Retrying these wastes
          time and resources. Vexor's retry predicates help you enforce this distinction -- the
          <code className="prose-code"> transient()</code> predicate retries only on connection-level
          errors, and <code className="prose-code">onHttpStatus()</code> lets you whitelist specific
          status codes.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Consider the trade-off between retry count and total latency. Three retries with
          exponential backoff (1s, 2s, 4s) add up to 7 seconds of waiting. If your API has a 10-second
          timeout, you have only 3 seconds of execution time across all attempts. For latency-sensitive
          endpoints, use fewer retries with shorter delays. For background jobs or batch processing,
          you can afford more retries with longer delays.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Retries and circuit breakers complement each other. Retries handle brief glitches (a
          single failed request that succeeds on the next try). Circuit breakers handle sustained
          outages (a service that is down for minutes). You can compose them by wrapping a retried
          function inside a circuit breaker: the retry handles transient blips, and if retries are
          consistently exhausted, the circuit breaker trips to stop wasting resources on a service
          that is genuinely down. Vexor supports this composition naturally because both
          <code className="prose-code"> retryable()</code> and <code className="prose-code">withCircuitBreaker()</code> wrap
          async functions with the same signature.
        </p>
      </section>

      {/* Basic Usage */}
      <section>
        <h2 id="basic-usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Usage
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">retry</code> function wraps an async operation and
          automatically retries it when it throws an error, up to a configurable number of attempts
          with a delay between each retry. It returns a promise that resolves with the successful
          result or rejects with the last error after all attempts are exhausted.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">maxAttempts</code> parameter counts the total number of
          invocations, including the initial attempt. Setting it to 3 means the function will be
          called at most three times: once initially, and twice more as retries. The
          <code className="prose-code"> delay</code> parameter sets the wait time before the first
          retry, and <code className="prose-code">backoffFactor</code> multiplies the delay after
          each subsequent retry. With a delay of 1000 and a factor of 2, the wait times are 1s, 2s,
          4s, 8s, and so on.
        </p>
        <CodeBlock code={basicUsageCode} filename="basic-retry.ts" showLineNumbers />
        <InfoBlock variant="info" title="Attempt Count">
          The <code className="prose-code">maxAttempts</code> option is the total number of attempts,
          including the initial call. Setting it to 3 means 1 initial attempt plus 2 retries. Setting
          it to 1 effectively disables retries -- the function is called once and any error is thrown
          immediately.
        </InfoBlock>
      </section>

      {/* Backoff Strategies */}
      <section>
        <h2 id="backoff-strategies" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Backoff Strategies
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The choice of backoff strategy significantly affects both recovery behavior and system
          load during outages. Different strategies suit different failure patterns, and understanding
          the math behind each helps you choose the right one for your use case.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Constant backoff</strong> uses the same
          delay between every retry. This is the simplest strategy and works well when the expected
          recovery time is consistent (e.g., retrying a lock acquisition that is held for a known
          duration). The downside is that all clients retry at the same intervals, which can create
          periodic traffic spikes.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Exponential backoff</strong> is the
          most widely recommended strategy. By doubling the delay on each attempt, it quickly
          backs off from a failing service, reducing load during extended outages. The formula is
          <code className="prose-code"> delay = base * 2^attempt</code>, producing a sequence like
          1s, 2s, 4s, 8s, 16s. The <code className="prose-code">maxDelay</code> cap prevents
          extreme wait times on later attempts.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Exponential with jitter</strong> is
          the gold standard for production systems. It takes the exponential delay and multiplies
          it by a random factor, typically <code className="prose-code">Math.random()</code> (full
          jitter) or <code className="prose-code">0.5 + Math.random() * 0.5</code> (decorrelated
          jitter). This randomization prevents the thundering herd problem by ensuring that even
          clients that failed at the same instant will retry at different times. AWS, Google Cloud,
          and other major cloud providers recommend this strategy in their SDKs.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Fibonacci backoff</strong> grows more
          slowly than exponential (1, 1, 2, 3, 5, 8, 13...). This is useful when you want moderate
          backoff without the aggressive doubling of exponential. It provides a middle ground between
          linear and exponential growth, making it suitable for services that typically recover within
          a few seconds but occasionally take longer.
        </p>
        <CodeBlock code={backoffStrategiesCode} filename="backoff.ts" showLineNumbers />
        <InfoBlock variant="tip" title="Jitter Recommended">
          Always use jitter in production. Without it, all clients that failed at the same time will
          retry at the same time, potentially overloading the recovering service. The{' '}
          <code className="prose-code">exponentialWithJitter</code> strategy adds a random factor
          between 0 and 1 to the calculated delay. For latency-sensitive applications, use decorrelated
          jitter which guarantees a minimum wait time of 50% of the computed delay.
        </InfoBlock>
      </section>

      {/* Retry Predicates */}
      <section>
        <h2 id="retry-predicates" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Retry Predicates
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Not all errors should be retried. A 400 Bad Request will fail every time, but a 503 Service
          Unavailable might succeed on the next attempt. Retry predicates are functions that inspect
          an error and return a boolean indicating whether the error is worth retrying. Using the
          right predicate prevents wasting time and resources on errors that will never resolve
          through retries.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor provides built-in predicates for the most common scenarios. The
          <code className="prose-code"> transient()</code> predicate matches network-level errors
          like ECONNRESET (connection was reset by the remote side), ETIMEDOUT (connection attempt
          timed out), ECONNREFUSED (no server listening on the target port), and EPIPE (write to a
          closed socket). These are the classic transient errors that occur due to momentary network
          conditions and almost always resolve on retry. The <code className="prose-code">onHttpStatus()</code> predicate
          matches errors that carry an HTTP status code, allowing you to retry only on specific codes
          like 429 (rate limited -- the server asked you to slow down) and 503 (service unavailable --
          the server is temporarily overloaded).
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When the built-in predicates do not match your needs, you can write custom predicates as
          plain functions. A predicate receives the Error object and returns true to retry or false
          to propagate the error immediately. You can inspect any property of the error -- its type,
          message, status code, or custom fields -- to make the decision. This flexibility lets you
          build predicates that match your specific error taxonomy.
        </p>
        <CodeBlock code={retryPredicatesCode} filename="predicates.ts" showLineNumbers />
        <InfoBlock variant="warning" title="Idempotency">
          Only retry operations that are safe to repeat. GET requests are naturally idempotent,
          but POST requests may not be. For non-idempotent operations, use idempotency keys or
          ensure your backend handles duplicate requests correctly. A common pattern is to generate
          a UUID on the client side and send it as an <code className="prose-code">Idempotency-Key</code> header.
          The server stores the result keyed by this UUID and returns the cached result on duplicate
          requests instead of processing the operation again.
        </InfoBlock>
      </section>

      {/* Combining Predicates */}
      <section>
        <h2 id="combining-predicates" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Combining Predicates
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Real-world retry logic often requires combining multiple conditions. You might want to
          retry on transient network errors <em>or</em> specific HTTP status codes <em>or</em> errors
          with certain message patterns. Because predicates are plain functions that return booleans,
          you can compose them with standard JavaScript logical operators.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">onRetry</code> callback is your hook into the retry loop
          for observability. It fires before each retry (not before the initial attempt) and receives
          the error that triggered the retry, the attempt number (1-indexed, where 1 is the first
          retry), and the computed delay in milliseconds. Use this to log retry activity, increment
          metrics counters, and track how often each error type triggers retries. In production, a
          sudden increase in retry rate is often the first signal that a dependency is degrading --
          catching this early can prevent an outage.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When combining predicates, think carefully about the logical relationship. Use OR (||) when
          any matching condition should trigger a retry. Use AND (&&) when multiple conditions must
          all be true -- for example, retrying only on 503 errors that also contain a specific
          header indicating a temporary condition. You can also negate predicates to create
          exclusion lists: retry on everything except 400-level client errors.
        </p>
        <CodeBlock code={combiningPredicatesCode} filename="combined.ts" showLineNumbers />
      </section>

      {/* Retryable Functions */}
      <section>
        <h2 id="retryable-functions" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Retryable Functions
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use <code className="prose-code">retryable</code> to create a permanently wrapped version
          of a function that automatically retries on failure. The returned function has the same
          signature as the original but includes built-in retry logic. This is the preferred approach
          when you want to define retry behavior once at service initialization time and have every
          call site benefit from it automatically.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">retryable</code> function is particularly valuable in
          service client patterns. Instead of wrapping every individual call to an external API with
          retry logic, you wrap the client function once at module scope. Every route handler,
          middleware, or background job that calls the wrapped function gets retries for free without
          any additional code. This centralizes retry configuration and prevents inconsistencies
          where some call sites retry and others do not.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The trade-off compared to using <code className="prose-code">retry()</code> directly is
          that the retry configuration is fixed at creation time. If you need different retry
          parameters for different call sites (e.g., more retries for background jobs than for
          user-facing requests), use <code className="prose-code">retry()</code> directly at each
          call site instead.
        </p>
        <CodeBlock code={retryableFunctionsCode} filename="retryable.ts" showLineNumbers />
        <InfoBlock variant="tip" title="Service Clients">
          Use <code className="prose-code">retryable</code> to wrap external service client methods
          at initialization time, so every call site benefits from retries without extra code. This
          pattern works well with dependency injection -- you can create retryable versions of your
          service clients and inject them into your route handlers.
        </InfoBlock>
      </section>

      {/* Result Details */}
      <section>
        <h2 id="result-details" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Result Details
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use <code className="prose-code">retryWithResult</code> when you need detailed information
          about the retry outcome. Unlike <code className="prose-code">retry</code> which throws
          on final failure, <code className="prose-code">retryWithResult</code> always returns a result
          object with success status, attempt count, total time, and the final value or error. This
          is useful when you want to include retry metadata in your response (for observability) or
          when you want to handle the final failure differently depending on how many attempts were
          made.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">RetryResult</code> object provides five fields.
          <code className="prose-code"> success</code> is a boolean indicating whether any attempt
          succeeded. <code className="prose-code">value</code> holds the return value of the
          successful attempt (undefined on failure). <code className="prose-code">error</code> holds
          the last error thrown (undefined on success). <code className="prose-code">attempts</code> is
          the total number of attempts made (including the initial call).
          <code className="prose-code"> totalTime</code> is the wall-clock time in milliseconds from
          the start of the first attempt to the completion of the last attempt, including all wait
          times between retries.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A common pattern is to include retry metadata in response headers. Setting
          <code className="prose-code"> X-Retry-Attempts</code> tells the client how many attempts
          were needed, and <code className="prose-code">X-Response-Time</code> includes the total
          time including retries. This metadata is invaluable for debugging latency issues -- if a
          response took 5 seconds but only needed 1 retry, you know the delay came from the backoff
          wait time, not from slow execution.
        </p>
        <CodeBlock code={retryWithResultCode} filename="result-details.ts" showLineNumbers />
        <InfoBlock variant="info" title="Total Time">
          The <code className="prose-code">totalTime</code> field includes both execution time and
          delay time between retries. Use it to set appropriate client-facing timeouts or to include
          in response headers for observability. If totalTime is consistently close to your API's
          timeout limit, consider reducing maxAttempts or delay to leave more room for execution.
        </InfoBlock>
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Always use jitter in production.</strong>{' '}
          Pure exponential backoff without jitter synchronizes retry traffic. When a service recovers,
          all clients that were waiting will retry at the same mathematical intervals, creating
          periodic traffic spikes. Jitter breaks this synchronization and distributes load more
          evenly during recovery.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Set a maxDelay cap.</strong>{' '}
          Without a cap, exponential backoff grows without bound. The 10th retry with a 1-second
          base delay would wait over 17 minutes. Set maxDelay to a reasonable upper bound (e.g.,
          30-60 seconds) to prevent unreasonably long waits on later attempts.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Implement retry budgets.</strong>{' '}
          In high-traffic systems, limit the total number of retries across all requests, not just
          per request. If 1000 requests are in flight and each retries 3 times, the failing service
          receives 3000 additional requests. A retry budget (e.g., "retries may not exceed 20% of
          total traffic") prevents retries from amplifying an overload situation.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong className="text-slate-900 dark:text-white">Use predicates to avoid retrying permanent errors.</strong>{' '}
          Every retry on a permanent error adds latency without any chance of success. Use the
          <code className="prose-code"> transient()</code> predicate for network errors and
          <code className="prose-code"> onHttpStatus([429, 502, 503, 504])</code> for HTTP errors. Treat
          all 4xx errors (except 429) as permanent and propagate them immediately.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          <strong className="text-slate-900 dark:text-white">Log every retry.</strong>{' '}
          Use the <code className="prose-code">onRetry</code> callback to record the error, attempt
          number, and delay for every retry. This data is critical for understanding retry behavior
          in production. If a particular error is being retried thousands of times per minute, the
          predicate may be too broad, or the error may not actually be transient.
        </p>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">
          Functions
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
                <td className="py-3 px-4"><code className="prose-code">retry</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(operation, options?) =&gt; Promise&lt;T&gt;</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Executes an async operation with automatic retries. Returns a promise that resolves with the successful result or rejects with the last error after all attempts are exhausted. The operation is called with no arguments; use a closure to pass context.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">retryWithResult</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(operation, options?) =&gt; Promise&lt;RetryResult&lt;T&gt;&gt;</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Like retry but never throws. Always returns a RetryResult object containing success status, value or error, attempt count, and total elapsed time. Use when you need retry metadata for logging, response headers, or conditional error handling.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">retryable</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(fn, options?) =&gt; WrappedFunction</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Creates a permanently retryable version of a function. The returned function has the same signature and type as the original, but automatically retries on failure according to the configured options. Retry configuration is fixed at creation time.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          RetryOptions
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
                <td className="py-3 px-4"><code className="prose-code">maxAttempts</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">3</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Total number of attempts including the initial call. Setting to 1 disables retries. Setting to 3 means the operation is called up to 3 times (1 initial + 2 retries). Higher values increase resilience but also increase maximum latency.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">delay</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number | (attempt) =&gt; number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">1000</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Delay in milliseconds before the first retry. When a number, this is the base delay for backoff calculations. When a function, it receives the attempt number (1-indexed) and returns the delay in milliseconds, giving you complete control over the timing sequence.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">maxDelay</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Maximum delay cap in milliseconds. The computed delay (after applying backoffFactor and jitter) is clamped to this value. Prevents exponential backoff from producing unreasonably long wait times on later attempts. Recommended to set explicitly when using exponential backoff.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">backoffFactor</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">2</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Multiplier applied to the delay after each retry. A factor of 2 doubles the delay (exponential backoff). A factor of 1 produces constant delay. A factor of 1.5 produces moderate growth. Only applies when delay is a number, not a function.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">jitter</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">false</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">When true, multiplies the computed delay by a random factor between 0 and 1 (full jitter). This randomization prevents the thundering herd problem by ensuring that clients who failed at the same time do not retry at the same time. Strongly recommended for production use.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">retryIf</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(error: Error) =&gt; boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">always()</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Predicate function that determines whether a specific error should trigger a retry. Receives the thrown Error object and returns true to retry or false to propagate immediately. When false is returned, the retry loop stops and the error is thrown (or included in RetryResult) regardless of remaining attempts.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">onRetry</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(error, attempt, delay) =&gt; void</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Callback invoked before each retry (not before the initial attempt). Receives the error that triggered the retry, the retry number (1 for the first retry, 2 for the second, etc.), and the computed delay in milliseconds. Use for logging, metrics, and observability.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">timeout</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">-</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Total timeout in milliseconds across all attempts, including both execution time and wait time. When exceeded, the retry loop aborts immediately and the last error is thrown. Use to ensure that retries do not exceed your API's overall response time budget.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          RetryResult&lt;T&gt;
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Field</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">success</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Whether the operation eventually succeeded on any attempt. When true, value is populated. When false, error is populated with the last error from the final attempt.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">value</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">T | undefined</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The return value from the successful attempt. Undefined when success is false. This is the same value that retry() would have resolved with.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">error</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Error | undefined</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">The error from the last failed attempt. Undefined when success is true. If the retry was aborted by the retryIf predicate, this is the non-retryable error. If all attempts were exhausted, this is the error from the final attempt.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">attempts</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Total number of attempts made, including the initial call. A value of 1 means the operation succeeded on the first try with no retries. A value equal to maxAttempts means all attempts were used.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">totalTime</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Total wall-clock elapsed time in milliseconds from the start of the first attempt to the completion of the last attempt, including execution time and all backoff delays. Useful for response time tracking and timeout management.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          retryPredicates
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Predicate</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">always()</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">() =&gt; (error) =&gt; true</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns a predicate that retries on any error regardless of type or message. This is the default behavior when no retryIf option is specified. Use with caution in production -- it will retry permanent errors like 400 Bad Request.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">never()</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">() =&gt; (error) =&gt; false</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns a predicate that never retries, effectively disabling retry behavior while keeping the retry wrapper in place. Useful for conditionally disabling retries based on configuration without changing the code structure.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">onErrorType(type)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(ErrorClass) =&gt; (error) =&gt; boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns a predicate that retries only when the error is an instance of the specified Error class. Uses instanceof checking, so it matches the class and all subclasses. Useful for targeting specific error types like TypeError, RangeError, or custom error classes.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">onErrorMessage(pattern)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(RegExp) =&gt; (error) =&gt; boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns a predicate that retries when the error message matches the given regular expression. Tests against error.message using RegExp.test(). Useful for matching error messages from libraries that do not use custom error classes.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">onHttpStatus(codes)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(number[]) =&gt; (error) =&gt; boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns a predicate that retries when the error has a status property matching one of the specified HTTP status codes. Checks error.status and error.statusCode. Common retryable codes are 429 (rate limited), 502 (bad gateway), 503 (service unavailable), and 504 (gateway timeout).</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">transient()</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">() =&gt; (error) =&gt; boolean</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns a predicate that retries on common transient network errors: ECONNRESET, ETIMEDOUT, ECONNREFUSED, EPIPE, ENOTFOUND, EAI_AGAIN, and UND_ERR_CONNECT_TIMEOUT. These are errors caused by temporary network conditions that typically resolve within seconds.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">
          backoffStrategies
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Strategy</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Signature</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4"><code className="prose-code">constant(delay)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(number) =&gt; (attempt) =&gt; number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Returns the same delay for every attempt. Produces a flat retry pattern: wait, retry, wait, retry. Best for retrying operations with predictable recovery times, such as lock contention or rate limiting with a known cooldown period.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">linear(base)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(number) =&gt; (attempt) =&gt; number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Increases the delay linearly by the base amount on each attempt (base * attempt). Grows more slowly than exponential, providing moderate backoff. Sequence with base=1000: 1s, 2s, 3s, 4s, 5s.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">exponential(base)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(number) =&gt; (attempt) =&gt; number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Doubles the delay on each attempt (base * 2^attempt). The most common strategy for network retries because it quickly reduces request rate during extended outages. Sequence with base=1000: 1s, 2s, 4s, 8s, 16s. Always pair with maxDelay to prevent extreme wait times.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">exponentialWithJitter(base)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(number) =&gt; (attempt) =&gt; number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Applies exponential backoff then multiplies by a random factor between 0 and 1 (full jitter). Prevents the thundering herd problem by randomizing retry times. The recommended strategy for all production use cases. Actual delays vary on each invocation.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">fibonacci(base)</code></td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">(number) =&gt; (attempt) =&gt; number</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Follows the Fibonacci sequence growth pattern (base * fib(attempt)). Grows more slowly than exponential but faster than linear. Sequence with base=1000: 1s, 1s, 2s, 3s, 5s, 8s, 13s. A good middle-ground for services with variable recovery times.</td>
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
          <Link to="/advanced/serialization" className="btn-primary">
            Fast Serialization <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/advanced/circuit-breaker" className="btn-secondary">
            Circuit Breaker
          </Link>
        </div>
      </section>
    </div>
  );
}
