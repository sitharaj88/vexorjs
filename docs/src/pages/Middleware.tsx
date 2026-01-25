import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

const hooksOverviewCode = `// Vexor uses a hook-based middleware system
// Hooks run at specific points in the request lifecycle

app.addHook('onRequest', async (ctx) => {
  // First hook - runs for every request
  console.log(\`[\${new Date().toISOString()}] \${ctx.req.method} \${ctx.req.url}\`);
});

app.addHook('preValidation', async (ctx) => {
  // Before schema validation
  // Modify request before validation if needed
});

app.addHook('preHandler', async (ctx) => {
  // After validation, before handler
  // Good for authorization checks
});

app.addHook('onSend', async (ctx, response) => {
  // Before sending response
  // Can modify or replace the response
  return response;
});

app.addHook('onError', async (ctx, error) => {
  // When an error is thrown
  console.error('Error:', error);
});`;

const authMiddlewareCode = `// Authentication middleware
async function authMiddleware(ctx: Context) {
  const token = ctx.req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return ctx.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = await verifyToken(token);
    ctx.set('user', payload);
  } catch (error) {
    return ctx.status(401).json({ error: 'Invalid token' });
  }
}

// Apply to specific routes
app.get('/profile', {
  preHandler: [authMiddleware],
}, async (ctx) => {
  const user = ctx.get('user');
  return ctx.json({ user });
});

// Apply to a group
const protected = app.group('/api', {
  preHandler: [authMiddleware],
});

protected.get('/data', async (ctx) => {
  // User is authenticated here
  return ctx.json({ data: 'secret' });
});`;

const loggingMiddlewareCode = `// Request logging middleware
app.addHook('onRequest', async (ctx) => {
  const start = Date.now();
  ctx.set('requestStart', start);

  // Log request
  console.log(\`→ \${ctx.req.method} \${ctx.req.path}\`);
});

app.addHook('onSend', async (ctx, response) => {
  const start = ctx.get('requestStart') as number;
  const duration = Date.now() - start;

  // Log response
  console.log(\`← \${response.status} \${ctx.req.path} (\${duration}ms)\`);

  return response;
});`;

const corsMiddlewareCode = `// CORS middleware
function cors(options: CorsOptions = {}) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    headers = ['Content-Type', 'Authorization'],
    credentials = false,
  } = options;

  return async (ctx: Context) => {
    // Set CORS headers
    ctx.header('Access-Control-Allow-Origin', origin);
    ctx.header('Access-Control-Allow-Methods', methods.join(', '));
    ctx.header('Access-Control-Allow-Headers', headers.join(', '));

    if (credentials) {
      ctx.header('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight
    if (ctx.req.method === 'OPTIONS') {
      return ctx.status(204).send();
    }
  };
}

// Apply globally
app.addHook('onRequest', cors({ origin: 'https://example.com' }));`;

const rateLimitMiddlewareCode = `// Rate limiting middleware
const rateLimiter = createRateLimiter({
  window: 60 * 1000, // 1 minute
  max: 100,          // 100 requests per window
});

async function rateLimit(ctx: Context) {
  const ip = ctx.req.header('x-forwarded-for') || 'unknown';
  const result = rateLimiter.check(ip);

  if (!result.allowed) {
    ctx.header('Retry-After', String(result.retryAfter));
    return ctx.status(429).json({
      error: 'Too many requests',
      retryAfter: result.retryAfter,
    });
  }

  ctx.header('X-RateLimit-Limit', String(result.limit));
  ctx.header('X-RateLimit-Remaining', String(result.remaining));
}

// Apply to specific routes
app.get('/api/data', {
  preHandler: [rateLimit],
}, handler);`;

const errorHandlingCode = `// Global error handler
app.addHook('onError', async (ctx, error) => {
  // Log the error
  console.error('Error:', error);

  // Handle known error types
  if (error instanceof ValidationError) {
    return ctx.status(400).json({
      error: 'Validation failed',
      details: error.issues,
    });
  }

  if (error instanceof NotFoundError) {
    return ctx.status(404).json({
      error: 'Not found',
      message: error.message,
    });
  }

  // Default error response
  return ctx.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
});`;

const middlewareOrderCode = `// Middleware execution order is guaranteed

// Global hooks run first
app.addHook('onRequest', globalLogger);      // 1
app.addHook('preHandler', globalAuth);        // 2

// Group hooks run next
const api = app.group('/api', {
  preHandler: [groupMiddleware],              // 3
});

// Route hooks run last
api.get('/data', {
  preHandler: [routeMiddleware],              // 4
}, handler);                                   // 5

// Order: globalLogger → globalAuth → groupMiddleware → routeMiddleware → handler`;

export default function Middleware() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="middleware" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Middleware
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Vexor uses a hook-based middleware system that gives you precise control over
          the request lifecycle. Run code before validation, before handlers, or on errors.
        </p>
      </div>

      {/* Hooks Overview */}
      <section>
        <h2 id="hooks-overview" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Lifecycle Hooks
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Register hooks to run code at specific points in the request lifecycle.
        </p>
        <CodeBlock code={hooksOverviewCode} showLineNumbers />

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Hook</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">When</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Use Case</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">onRequest</code></td>
                <td className="py-3 px-4">First, for every request</td>
                <td className="py-3 px-4">Logging, CORS, early returns</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">preValidation</code></td>
                <td className="py-3 px-4">Before schema validation</td>
                <td className="py-3 px-4">Content negotiation, body transformation</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">preHandler</code></td>
                <td className="py-3 px-4">After validation, before handler</td>
                <td className="py-3 px-4">Authorization, rate limiting</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">onSend</code></td>
                <td className="py-3 px-4">Before sending response</td>
                <td className="py-3 px-4">Response transformation, headers</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">onError</code></td>
                <td className="py-3 px-4">When error occurs</td>
                <td className="py-3 px-4">Error handling, logging</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Authentication */}
      <section>
        <h2 id="authentication" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Authentication Middleware
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Protect routes with authentication middleware. Apply to specific routes or entire groups.
        </p>
        <CodeBlock code={authMiddlewareCode} />
      </section>

      {/* Logging */}
      <section>
        <h2 id="logging" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Request Logging
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Log requests and responses with timing information.
        </p>
        <CodeBlock code={loggingMiddlewareCode} />
      </section>

      {/* CORS */}
      <section>
        <h2 id="cors" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          CORS Middleware
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Handle Cross-Origin Resource Sharing (CORS) for your API.
        </p>
        <CodeBlock code={corsMiddlewareCode} />
      </section>

      {/* Rate Limiting */}
      <section>
        <h2 id="rate-limiting" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Rate Limiting
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Protect your API from abuse with rate limiting.
        </p>
        <CodeBlock code={rateLimitMiddlewareCode} />
      </section>

      {/* Error Handling */}
      <section>
        <h2 id="error-handling" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Error Handling
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Catch and handle errors globally with the <code className="prose-code">onError</code> hook.
        </p>
        <CodeBlock code={errorHandlingCode} />
      </section>

      {/* Middleware Order */}
      <section>
        <h2 id="middleware-order" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Middleware Order
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Middleware executes in a predictable order: global → group → route.
        </p>
        <CodeBlock code={middlewareOrderCode} />
        <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-amber-800 dark:text-amber-200 text-sm">
              <strong>Important:</strong> If middleware returns a response, the chain stops.
              Subsequent middleware and the handler will not run.
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/context" className="btn-primary">
            Learn about Context <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/guides/authentication" className="btn-secondary">
            Authentication Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
