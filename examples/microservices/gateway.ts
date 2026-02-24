/**
 * API Gateway Service
 *
 * Demonstrates Vexor's microservices features:
 * - API Gateway pattern
 * - Circuit breaker for resilience
 * - Service discovery
 * - Distributed tracing with OpenTelemetry
 * - Rate limiting
 * - Request aggregation
 *
 * Run with: npx tsx examples/microservices/gateway.ts
 */

import { Vexor, VexorContext, createCircuitBreaker, Tracer, MetricsRegistry } from '@vexorjs/core';

// ============================================================================
// Configuration
// ============================================================================

const SERVICES = {
  users: { url: 'http://localhost:3011', name: 'user-service' },
  products: { url: 'http://localhost:3012', name: 'product-service' },
  orders: { url: 'http://localhost:3013', name: 'order-service' },
};

// ============================================================================
// Initialize Components
// ============================================================================

const app = new Vexor({
  port: 3010,
  logging: true,
});

// Initialize tracer
const tracer = new Tracer({
  serviceName: 'api-gateway',
  enabled: true,
});

// Initialize metrics
const metrics = new MetricsRegistry();
const proxyRequests = metrics.counter('proxy_requests', 'Total proxy requests', ['service', 'status']);
const rateLimitExceeded = metrics.counter('rate_limit_exceeded', 'Rate limit exceeded count');
const gatewayErrors = metrics.counter('gateway_errors', 'Gateway errors', ['path']);
const requestDuration = metrics.histogram('request_duration_ms', 'Request duration in ms', ['path', 'method']);

// Helper function to create a service fetcher that accepts unknown args
function createServiceFetcher(serviceUrl: string) {
  return async (...args: unknown[]) => {
    const path = args[0] as string;
    const options = (args[1] as RequestInit) || {};
    const response = await fetch(`${serviceUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response;
  };
}

// Create circuit breakers for each service
const circuitBreakers = {
  users: createCircuitBreaker(
    createServiceFetcher(SERVICES.users.url),
    { failureThreshold: 3, resetTimeout: 30000, halfOpenRequests: 2 }
  ),
  products: createCircuitBreaker(
    createServiceFetcher(SERVICES.products.url),
    { failureThreshold: 3, resetTimeout: 30000, halfOpenRequests: 2 }
  ),
  orders: createCircuitBreaker(
    createServiceFetcher(SERVICES.orders.url),
    { failureThreshold: 3, resetTimeout: 30000, halfOpenRequests: 2 }
  ),
};

// Rate limiter state
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

// ============================================================================
// Middleware
// ============================================================================

// Request tracing middleware
app.use(async (ctx: VexorContext) => {
  const traceId = ctx.header('x-trace-id') || crypto.randomUUID();
  const spanId = crypto.randomUUID().slice(0, 16);

  ctx.set('traceId', traceId);
  ctx.set('spanId', spanId);
  ctx.set('startTime', Date.now());

  // Add trace headers to response
  ctx.res.header('X-Trace-Id', traceId);
  ctx.res.header('X-Span-Id', spanId);
});

// Rate limiting helper
async function checkRateLimit(ctx: VexorContext): Promise<Response | void> {
  const clientIp = ctx.header('x-forwarded-for') || ctx.header('x-real-ip') || 'unknown';
  const now = Date.now();

  let limiter = rateLimiter.get(clientIp);
  if (!limiter || limiter.resetAt < now) {
    limiter = { count: 0, resetAt: now + RATE_WINDOW };
    rateLimiter.set(clientIp, limiter);
  }

  limiter.count++;

  if (limiter.count > RATE_LIMIT) {
    rateLimitExceeded.inc();
    return ctx.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((limiter.resetAt - now) / 1000),
    });
  }

  ctx.res.header('X-RateLimit-Limit', String(RATE_LIMIT));
  ctx.res.header('X-RateLimit-Remaining', String(RATE_LIMIT - limiter.count));
  ctx.res.header('X-RateLimit-Reset', String(Math.ceil(limiter.resetAt / 1000)));
}

// Response time tracking
app.addHook('onSend', async (ctx: VexorContext) => {
  const startTime = ctx.get('startTime') as number;
  const duration = Date.now() - startTime;

  ctx.res.header('X-Response-Time', `${duration}ms`);
  requestDuration.observe(duration, { path: ctx.path, method: ctx.method });
});

// ============================================================================
// Helper Functions
// ============================================================================

interface ProxyOptions {
  service: keyof typeof SERVICES;
  path: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  ctx: VexorContext;
}

async function proxyRequest(options: ProxyOptions): Promise<Response> {
  const { service, path, method = 'GET', body, headers = {}, ctx } = options;

  // Check rate limit
  const rateLimitResponse = await checkRateLimit(ctx);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const breaker = circuitBreakers[service];

  const traceId = ctx.get('traceId') as string;
  const spanId = ctx.get('spanId') as string;

  // Record span
  const span = tracer.startSpan(`${service}:${method}:${path}`, {
    parent: traceId && spanId ? { traceId, spanId, traceFlags: 1 } : undefined,
    attributes: {
      'http.method': method,
      'http.url': `${SERVICES[service].url}${path}`,
      'service.name': SERVICES[service].name,
    },
  });

  try {
    const result = await breaker.fire(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-Id': span.context.traceId,
        'X-Parent-Span-Id': span.context.spanId,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    span.setStatus('ok');
    span.end();
    proxyRequests.inc({ service, status: 'success' });
    return result as Response;
  } catch (error) {
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    span.end();
    proxyRequests.inc({ service, status: 'error' });

    if (breaker.currentState === 'OPEN') {
      return new Response(JSON.stringify({
        error: `Service ${service} is temporarily unavailable`,
        code: 'SERVICE_UNAVAILABLE',
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    throw error;
  }
}

// ============================================================================
// Routes
// ============================================================================

// Health check with service status
app.get('/health', async (ctx) => {
  const serviceHealth: Record<string, unknown> = {};

  for (const [name, breaker] of Object.entries(circuitBreakers)) {
    const state = breaker.currentState;
    const stats = breaker.stats;

    serviceHealth[name] = {
      status: state === 'CLOSED' ? 'healthy' :
              state === 'HALF_OPEN' ? 'recovering' : 'unhealthy',
      circuitState: state,
      stats: {
        failures: stats.failures,
        successes: stats.successes,
        lastFailure: stats.lastFailure ? new Date(stats.lastFailure).toISOString() : null,
      },
    };
  }

  return ctx.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: serviceHealth,
    metrics: {
      rateLimitedClients: rateLimiter.size,
    },
  });
});

// Gateway info
app.get('/', (ctx) => {
  return ctx.json({
    name: 'Vexor API Gateway',
    version: '1.0.0',
    services: Object.entries(SERVICES).map(([name, config]) => ({
      name,
      url: config.url,
      status: circuitBreakers[name as keyof typeof circuitBreakers].currentState,
    })),
    features: [
      'Circuit Breaker',
      'Rate Limiting',
      'Distributed Tracing',
      'Metrics Collection',
      'Request Aggregation',
    ],
  });
});

// ============================================================================
// User Service Proxy
// ============================================================================

app.group('/api/users', (users) => {
  users.get('/', async (ctx) => {
    const response = await proxyRequest({
      service: 'users',
      path: '/users',
      ctx,
    });
    const data = await response.json();
    return ctx.status(response.status).json(data);
  });

  users.get('/:id', async (ctx) => {
    const response = await proxyRequest({
      service: 'users',
      path: `/users/${ctx.params.id}`,
      ctx,
    });
    const data = await response.json();
    return ctx.status(response.status).json(data);
  });

  users.post('/', async (ctx) => {
    const body = await ctx.readJson();
    const response = await proxyRequest({
      service: 'users',
      path: '/users',
      method: 'POST',
      body,
      ctx,
    });
    const data = await response.json();
    return ctx.status(response.status).json(data);
  });
});

// ============================================================================
// Product Service Proxy
// ============================================================================

app.group('/api/products', (products) => {
  products.get('/', async (ctx) => {
    const queryString = ctx.req.url.split('?')[1] || '';
    const response = await proxyRequest({
      service: 'products',
      path: `/products${queryString ? `?${queryString}` : ''}`,
      ctx,
    });
    const data = await response.json();
    return ctx.status(response.status).json(data);
  });

  products.get('/:id', async (ctx) => {
    const response = await proxyRequest({
      service: 'products',
      path: `/products/${ctx.params.id}`,
      ctx,
    });
    const data = await response.json();
    return ctx.status(response.status).json(data);
  });

  products.post('/', async (ctx) => {
    const body = await ctx.readJson();
    const response = await proxyRequest({
      service: 'products',
      path: '/products',
      method: 'POST',
      body,
      ctx,
    });
    const data = await response.json();
    return ctx.status(response.status).json(data);
  });
});

// ============================================================================
// Order Service Proxy
// ============================================================================

app.group('/api/orders', (orders) => {
  orders.get('/', async (ctx) => {
    const authHeader = ctx.header('authorization');
    const response = await proxyRequest({
      service: 'orders',
      path: '/orders',
      headers: authHeader ? { Authorization: authHeader } : {},
      ctx,
    });
    const data = await response.json();
    return ctx.status(response.status).json(data);
  });

  orders.get('/:id', async (ctx) => {
    const authHeader = ctx.header('authorization');
    const response = await proxyRequest({
      service: 'orders',
      path: `/orders/${ctx.params.id}`,
      headers: authHeader ? { Authorization: authHeader } : {},
      ctx,
    });
    const data = await response.json();
    return ctx.status(response.status).json(data);
  });

  orders.post('/', async (ctx) => {
    const authHeader = ctx.header('authorization');
    const body = await ctx.readJson();
    const response = await proxyRequest({
      service: 'orders',
      path: '/orders',
      method: 'POST',
      body,
      headers: authHeader ? { Authorization: authHeader } : {},
      ctx,
    });
    const data = await response.json();
    return ctx.status(response.status).json(data);
  });
});

// ============================================================================
// Aggregation Endpoints
// ============================================================================

// Get user with their orders (aggregated from multiple services)
app.get('/api/users/:id/full', async (ctx) => {
  const userId = ctx.params.id;
  const traceId = ctx.get('traceId') as string;
  const spanId = ctx.get('spanId') as string;

  // Start aggregation span
  const span = tracer.startSpan('aggregate:user-full', {
    parent: traceId && spanId ? { traceId, spanId, traceFlags: 1 } : undefined,
    attributes: { userId },
  });

  try {
    // Fetch user and orders in parallel
    const [userResponse, ordersResponse] = await Promise.allSettled([
      proxyRequest({ service: 'users', path: `/users/${userId}`, ctx }),
      proxyRequest({ service: 'orders', path: `/orders?userId=${userId}`, ctx }),
    ]);

    const result: Record<string, unknown> = {};

    // Handle user response
    if (userResponse.status === 'fulfilled') {
      const userData = await userResponse.value.json();
      if (userResponse.value.ok) {
        result.user = userData;
      }
    } else {
      result.user = { error: 'Failed to fetch user' };
    }

    // Handle orders response
    if (ordersResponse.status === 'fulfilled') {
      const ordersData = await ordersResponse.value.json();
      if (ordersResponse.value.ok) {
        result.orders = ordersData;
      }
    } else {
      result.orders = { error: 'Failed to fetch orders' };
    }

    span.setStatus('ok');
    span.end();
    return ctx.json(result);
  } catch (error) {
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    span.end();
    throw error;
  }
});

// Dashboard endpoint (aggregates stats from all services)
app.get('/api/dashboard', async (ctx) => {
  const traceId = ctx.get('traceId') as string;
  const spanId = ctx.get('spanId') as string;

  const span = tracer.startSpan('aggregate:dashboard', {
    parent: traceId && spanId ? { traceId, spanId, traceFlags: 1 } : undefined,
  });

  try {
    // Fetch stats from all services in parallel
    const [usersResponse, productsResponse, ordersResponse] = await Promise.allSettled([
      proxyRequest({ service: 'users', path: '/stats', ctx }),
      proxyRequest({ service: 'products', path: '/stats', ctx }),
      proxyRequest({ service: 'orders', path: '/stats', ctx }),
    ]);

    const dashboard: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      gateway: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
      services: {},
    };

    // Aggregate responses
    const serviceResults = [
      { name: 'users', response: usersResponse },
      { name: 'products', response: productsResponse },
      { name: 'orders', response: ordersResponse },
    ];

    for (const { name, response } of serviceResults) {
      if (response.status === 'fulfilled' && response.value.ok) {
        (dashboard.services as Record<string, unknown>)[name] = await response.value.json();
      } else {
        (dashboard.services as Record<string, unknown>)[name] = {
          status: 'unavailable',
          circuitState: circuitBreakers[name as keyof typeof circuitBreakers].currentState,
        };
      }
    }

    span.setStatus('ok');
    span.end();
    return ctx.json(dashboard);
  } catch (error) {
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    span.end();
    throw error;
  }
});

// ============================================================================
// Metrics & Debug Endpoints
// ============================================================================

app.get('/metrics', (ctx) => {
  return ctx.text(metrics.toPrometheus());
});

app.get('/traces', (ctx) => {
  // Note: In production, use a proper trace exporter like OTLP
  return ctx.json({
    message: 'Tracing enabled - traces are exported to console or configured exporter',
    info: 'Use OpenTelemetry collector for trace aggregation',
  });
});

// Force circuit breaker states (for testing)
app.post('/debug/circuit/:service/:action', (ctx) => {
  const service = ctx.params.service as keyof typeof circuitBreakers;
  const action = ctx.params.action;

  if (!circuitBreakers[service]) {
    return ctx.notFound('Service not found');
  }

  const breaker = circuitBreakers[service];

  switch (action) {
    case 'open':
      breaker.open();
      break;
    case 'close':
      breaker.close();
      break;
    case 'reset':
      breaker.reset();
      break;
    default:
      return ctx.badRequest('Invalid action. Use: open, close, reset');
  }

  return ctx.json({
    service,
    action,
    newState: breaker.currentState,
  });
});

// ============================================================================
// Error Handler
// ============================================================================

app.setErrorHandler(async (error, ctx) => {
  console.error(`Gateway error: ${error.message}`);
  gatewayErrors.inc({ path: ctx.path });

  return ctx.status(500).json({
    error: 'Gateway error',
    message: error.message,
    traceId: ctx.get('traceId'),
    requestId: ctx.requestId,
  });
});

// Print routes
app.printRoutes();

// Start server
app.listen(3010).then(() => {
  const addr = app.address();
  if (addr) {
    console.log(`
    API Gateway started!

    Gateway URL: http://localhost:${addr.port}

    This is the API Gateway for the microservices architecture.
    It provides:
    - Request routing to backend services
    - Circuit breaker for fault tolerance
    - Rate limiting (${RATE_LIMIT} req/min)
    - Distributed tracing
    - Request aggregation

    Backend Services (start separately):
    - User Service:    npx tsx examples/microservices/user-service.ts
    - Product Service: npx tsx examples/microservices/product-service.ts
    - Order Service:   npx tsx examples/microservices/order-service.ts

    API Endpoints:
    - GET  /health          - Gateway and service health
    - GET  /metrics         - Prometheus-style metrics
    - GET  /traces          - Recent distributed traces

    User Service:
    - GET  /api/users       - List users
    - GET  /api/users/:id   - Get user by ID
    - POST /api/users       - Create user

    Product Service:
    - GET  /api/products    - List products
    - GET  /api/products/:id - Get product
    - POST /api/products    - Create product

    Order Service:
    - GET  /api/orders      - List orders
    - GET  /api/orders/:id  - Get order
    - POST /api/orders      - Create order

    Aggregation:
    - GET  /api/users/:id/full  - User with orders
    - GET  /api/dashboard       - Combined dashboard

    Debug:
    - POST /debug/circuit/:service/open   - Force open circuit
    - POST /debug/circuit/:service/close  - Force close circuit
    - POST /debug/circuit/:service/reset  - Reset circuit
    `);
  }
});
