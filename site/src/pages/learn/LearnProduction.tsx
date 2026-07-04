import { Link } from 'react-router-dom';
import { ArrowRight, PartyPopper } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const dockerCode = `# Dockerfile for Vexor application
FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --production

# Build stage
FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production image
FROM base AS production
ENV NODE_ENV=production
ENV PORT=3000

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S vexor -u 1001

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER vexor
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]`;

const dockerComposeCode = `# docker-compose.yml
version: '3.9'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://vexor:secret@postgres:5432/vexor_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: vexor
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: vexor_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vexor"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:`;

const monitoringCode = `import { Vexor } from '@vexorjs/core';

const app = new Vexor();

// Health check endpoint
app.get('/health', async (ctx) => {
  const checks = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    },
    checks: {} as Record<string, any>
  };

  // Database health
  try {
    await db.query('SELECT 1');
    checks.checks.database = { status: 'up' };
  } catch {
    checks.checks.database = { status: 'down' };
    checks.status = 'degraded';
  }

  // Cache health
  try {
    await cache.ping();
    checks.checks.cache = { status: 'up' };
  } catch {
    checks.checks.cache = { status: 'down' };
    checks.status = 'degraded';
  }

  const statusCode = checks.status === 'healthy' ? 200 : 503;
  return ctx.status(statusCode).json(checks);
});

// Request logging & metrics via lifecycle hooks.
// ctx.elapsed tracks the time since the request started,
// so no manual timestamping is needed.
app.addHook('onResponse', async (ctx) => {
  const log = {
    requestId: ctx.requestId,
    method: ctx.method,
    path: ctx.path,
    duration: \`\${ctx.elapsed.toFixed(2)}ms\`,
    userAgent: ctx.headers.get('user-agent'),
    ip: ctx.ip,
    timestamp: new Date().toISOString()
  };

  // Structured logging (JSON for log aggregators)
  console.log(JSON.stringify(log));

  // Track metrics
  metrics.histogram('http_request_duration_ms', ctx.elapsed, {
    method: ctx.method,
    path: ctx.path
  });
});`;

const securityCode = `import { Vexor, cors, rateLimit } from '@vexorjs/core';

const app = new Vexor({ trustProxy: true });

// 1. Security Headers
// A global hook queues headers on every response with
// ctx.setResponseHeader() - they are applied by the pipeline
// even when the handler returns a raw Response.
app.addHook('onRequest', async (ctx) => {
  ctx.setResponseHeader('X-Content-Type-Options', 'nosniff');
  ctx.setResponseHeader('X-Frame-Options', 'DENY');
  ctx.setResponseHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  ctx.setResponseHeader('Content-Security-Policy', "default-src 'self'");
  ctx.setResponseHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  ctx.setResponseHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
});

// 2. Rate Limiting (built-in middleware)
// 100 requests per minute globally
app.use(rateLimit({ max: 100, windowMs: 60_000 }));

// Stricter limits for auth endpoints via route hooks:
// max 5 login attempts per 5 minutes
app.post('/auth/login', {
  hooks: {
    preHandler: [rateLimit({ max: 5, windowMs: 300_000 })]
  }
}, async (ctx) => {
  // ... validate credentials
  return ctx.json({ token: '...' });
});

// 3. Input Sanitization
// Sanitize in route handlers after parsing the body
async function sanitizedBody(ctx: any) {
  const body = await ctx.body();
  if (body && typeof body === 'object') {
    sanitizeObject(body);
  }
  return body;
}

function sanitizeObject(obj: Record<string, any>) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Strip potential XSS
      obj[key] = value
        .replace(/[<>]/g, '')
        .trim();
    } else if (typeof value === 'object' && value !== null) {
      sanitizeObject(value);
    }
  }
}

// 4. CORS Configuration
app.addHook('onRequest', cors({
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  maxAge: 86400
}));`;

const cicdCode = `# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm run test
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/test_db

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t myapp:latest .

      - name: Push to registry
        run: |
          docker tag myapp:latest registry.example.com/myapp:latest
          docker push registry.example.com/myapp:latest

      - name: Deploy
        run: |
          # Zero-downtime deployment
          ssh deploy@server 'cd /app && docker compose pull && docker compose up -d --no-deps app'`;

const scalingCode = `// Scaling Strategies for Vexor Applications
//
// Vertical Scaling: Bigger server (CPU, RAM)
//   - Simple but has limits
//   - Good for databases
//
// Horizontal Scaling: More servers behind a load balancer
//   - Requires stateless application design
//   - Infinite scaling potential

import { Vexor } from '@vexorjs/core';
import cluster from 'node:cluster';
import os from 'node:os';

// Cluster mode: Use all CPU cores
if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(\`Primary process starting \${numCPUs} workers\`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code) => {
    console.error(\`Worker \${worker.process.pid} exited (code: \${code}). Restarting...\`);
    cluster.fork(); // Auto-restart crashed workers
  });
} else {
  // Graceful shutdown is built in: Vexor handles SIGTERM/SIGINT,
  // stops accepting new connections, and drains in-flight requests
  // before exiting - essential for zero-downtime deployments.
  const app = new Vexor({
    gracefulShutdown: { timeout: 10_000 }, // or simply: true
  });

  app.get('/api/health', async (ctx) => {
    return ctx.json({
      worker: process.pid,
      uptime: process.uptime()
    });
  });

  app.listen(3000);
  console.log(\`Worker \${process.pid} started\`);
}

// Need to clean up other resources (database pools, cache
// connections)? Close the server manually:
//
// process.on('SIGTERM', async () => {
//   await app.close({ timeout: 10_000 }); // drain in-flight requests
//   await db.close();
//   await cache.disconnect();
//   process.exit(0);
// });`;

const envConfigCode = `// Environment Configuration Best Practices

// 1. Use a config module - single source of truth
interface Config {
  port: number;
  env: string;
  database: { url: string; pool: { min: number; max: number } };
  redis: { url: string };
  auth: { secret: string; tokenExpiry: string };
  cors: { origins: string[] };
}

function loadConfig(): Config {
  const required = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(\`Missing required env var: \${key}\`);
    return value;
  };

  return {
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
    database: {
      url: required('DATABASE_URL'),
      pool: {
        min: parseInt(process.env.DB_POOL_MIN || '2'),
        max: parseInt(process.env.DB_POOL_MAX || '10')
      }
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    auth: {
      secret: required('JWT_SECRET'),
      tokenExpiry: process.env.TOKEN_EXPIRY || '1h'
    },
    cors: {
      origins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',')
    }
  };
}

const config = loadConfig();

// 2. Example .env file (never commit this!)
// .env
// NODE_ENV=production
// PORT=3000
// DATABASE_URL=postgres://user:pass@host:5432/dbname
// REDIS_URL=redis://host:6379
// JWT_SECRET=your-256-bit-secret
// CORS_ORIGINS=https://app.example.com,https://admin.example.com

// 3. .env.example (commit this as a template)
// NODE_ENV=development
// PORT=3000
// DATABASE_URL=postgres://localhost:5432/myapp_dev
// JWT_SECRET=change-me-in-production
// CORS_ORIGINS=http://localhost:3000`;

const chapters = [
  { num: '01', title: 'Docker & Containers', desc: 'Containerize your Vexor application', color: 'from-sky-500 to-blue-600' },
  { num: '02', title: 'Monitoring & Logging', desc: 'Health checks, metrics, and structured logs', color: 'from-green-500 to-teal-600' },
  { num: '03', title: 'Security Hardening', desc: 'Headers, rate limiting, CORS, sanitization', color: 'from-red-500 to-rose-600' },
  { num: '04', title: 'CI/CD Pipelines', desc: 'Automated testing and deployment', color: 'from-purple-500 to-indigo-600' },
  { num: '05', title: 'Scaling & Clustering', desc: 'Multi-core, load balancing, graceful shutdown', color: 'from-amber-500 to-orange-600' },
  { num: '06', title: 'Environment Config', desc: 'Secrets, env vars, and configuration management', color: 'from-pink-500 to-fuchsia-600' },
];

export default function LearnProduction() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm font-medium mb-4">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          Expert
        </div>
        <h1 id="production" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Production & DevOps
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
          Ship with confidence. Learn Docker, CI/CD pipelines, monitoring, security hardening,
          scaling strategies, and production-grade configuration.
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chapters.map((item) => (
          <div key={item.num} className="relative p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-primary-500/50 transition-colors">
            <span className={`text-xs font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
              CHAPTER {item.num}
            </span>
            <h3 className="font-semibold mt-1 text-slate-900 dark:text-white">{item.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Chapter 1: Docker */}
      <section id="docker">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-sky-500 mr-2">01</span> Docker & Containers
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Containerize your Vexor app for consistent deployments. Multi-stage builds keep images small,
          and health checks ensure reliability.
        </p>

        <div className="space-y-6">
          <CodeBlock code={dockerCode} language="docker" filename="Dockerfile" showLineNumbers />
          <CodeBlock code={dockerComposeCode} language="yaml" filename="docker-compose.yml" showLineNumbers />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Multi-Stage Build</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Separate build and production stages. Only production dependencies ship in the final image.
            </p>
          </div>
          <div className="p-4 bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Non-Root User</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Always run as a non-root user in production. Limits damage from container escapes.
            </p>
          </div>
          <div className="p-4 bg-sky-50 dark:bg-sky-500/5 border border-sky-200 dark:border-sky-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Health Checks</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Docker and orchestrators use health checks to restart unhealthy containers automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Chapter 2: Monitoring */}
      <section id="monitoring">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-green-500 mr-2">02</span> Monitoring & Observability
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You can't fix what you can't see. Health endpoints, structured logging, and request metrics
          give you visibility into your production system.
        </p>
        <CodeBlock code={monitoringCode} filename="monitoring.ts" showLineNumbers />

        <InfoBlock variant="info" title="Built-in modules">
          Vexor ships production-ready building blocks for all of this: the{' '}
          <Link to="/middleware/health" className="underline">health check middleware</Link> with liveness
          and readiness probes, <Link to="/infrastructure/logging" className="underline">structured logging</Link>,{' '}
          <Link to="/observability/metrics" className="underline">Prometheus-compatible metrics</Link>, and{' '}
          <Link to="/observability/tracing" className="underline">distributed tracing</Link>.
        </InfoBlock>

        <div className="mt-6 p-4 bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-xl">
          <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">The Three Pillars of Observability</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Logs</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Structured JSON logs for debugging. Use log levels (error, warn, info, debug).</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Metrics</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Request latency, error rates, throughput. Use histograms and counters.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Traces</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Follow a request across services. Identify bottlenecks in distributed systems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 3: Security */}
      <section id="security">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-red-500 mr-2">03</span> Security Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Security is not optional. Protect your API with headers, rate limiting, input sanitization,
          and proper CORS configuration. The security-headers hook below uses{' '}
          <code className="prose-code">ctx.setResponseHeader()</code>, which queues headers that the
          pipeline applies to the final response -- even when a handler returns a raw{' '}
          <code className="prose-code">Response</code>.
        </p>
        <CodeBlock code={securityCode} filename="security.ts" showLineNumbers />

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">OWASP Top 10 Checklist</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { threat: 'Injection', fix: 'Use parameterized queries (Vexor ORM handles this)' },
              { threat: 'Broken Auth', fix: 'Hash passwords, use JWT with short expiry, rate limit login' },
              { threat: 'Sensitive Data', fix: 'HTTPS only, never log secrets, encrypt at rest' },
              { threat: 'XXE', fix: 'Disable XML parsing, use JSON exclusively' },
              { threat: 'Broken Access Control', fix: 'Role-based hooks, validate ownership' },
              { threat: 'Misconfiguration', fix: 'Security headers, disable debug in production' },
              { threat: 'XSS', fix: 'Sanitize output, Content-Security-Policy header' },
              { threat: 'Insecure Deserialization', fix: 'Schema validation on all inputs' },
            ].map((item) => (
              <div key={item.threat} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <span className="text-red-500 font-medium text-sm flex-shrink-0 w-32">{item.threat}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{item.fix}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapter 4: CI/CD */}
      <section id="cicd">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-purple-500 mr-2">04</span> CI/CD Pipelines
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Automate your entire workflow: lint, test, build, and deploy on every push.
          Never manually deploy again.
        </p>
        <CodeBlock code={cicdCode} language="yaml" filename=".github/workflows/ci.yml" showLineNumbers />
      </section>

      {/* Chapter 5: Scaling */}
      <section id="scaling">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-amber-500 mr-2">05</span> Scaling & Clustering
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use the Node.js cluster module to utilize all CPU cores. Graceful shutdown is built into Vexor:
          pass <code className="prose-code">gracefulShutdown: true</code> (or an options object) to the
          constructor and the server drains in-flight requests on SIGTERM/SIGINT before exiting -- the key
          to zero-downtime deployments.
        </p>
        <CodeBlock code={scalingCode} filename="cluster.ts" showLineNumbers />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Horizontal Scaling</h4>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <p>&#x2022; Add more servers behind a load balancer</p>
              <p>&#x2022; Application must be stateless</p>
              <p>&#x2022; Store sessions in Redis, not memory</p>
              <p>&#x2022; Use shared file storage (S3) for uploads</p>
            </div>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Load Balancing</h4>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <p>&#x2022; Round-robin: Even distribution</p>
              <p>&#x2022; Least connections: Route to least busy</p>
              <p>&#x2022; IP hash: Same client, same server</p>
              <p>&#x2022; Tools: Nginx, HAProxy, AWS ALB</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 6: Environment Config */}
      <section id="config">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-pink-500 mr-2">06</span> Environment Configuration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Separate configuration from code. Use environment variables with validation,
          and never commit secrets to version control. For larger apps, Vexor's{' '}
          <Link to="/infrastructure/config" className="underline text-primary-600 dark:text-primary-400">configuration module</Link>{' '}
          loads and validates config from files and the environment.
        </p>
        <CodeBlock code={envConfigCode} filename="config.ts" showLineNumbers />
      </section>

      {/* Completion */}
      <section className="card bg-slate-50 dark:bg-slate-800/50 text-center">
        <PartyPopper className="w-10 h-10 mx-auto mb-4 text-primary-500" />
        <h2 id="training-complete" className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
          Training Complete!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-xl mx-auto">
          You've covered everything from HTTP basics to production deployment. You're now equipped to
          build, ship, and scale production-grade APIs with Vexor.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/getting-started" className="btn-primary">
            Start Building <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/core-concepts" className="btn-secondary">
            Explore Core Concepts
          </Link>
        </div>
      </section>
    </div>
  );
}
