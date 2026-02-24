import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const buildCode = `# Using the Vexor CLI
vexor build

# Or with tsup directly
npx tsup src/index.ts --format esm --dts --clean

# Or add to package.json scripts
{
  "scripts": {
    "build": "vexor build",
    "start": "node dist/index.js",
    "start:prod": "NODE_ENV=production node dist/index.js"
  }
}`;

const dockerfileCode = `# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: Build the application
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup --system vexor && adduser --system --ingroup vexor vexor

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

USER vexor
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]`;

const pm2Code = `# Install PM2 globally
npm install -g pm2

# ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'vexor-app',
      script: 'dist/index.js',
      instances: 'max',        // Use all CPU cores
      exec_mode: 'cluster',    // Enable cluster mode
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '512M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: 'logs/error.log',
      out_file: 'logs/output.log',
      merge_logs: true,
      autorestart: true,
      watch: false,
    },
  ],
};`;

const pm2CommandsCode = `# Start with PM2
pm2 start ecosystem.config.js --env production

# Monitor processes
pm2 monit

# View logs
pm2 logs vexor-app

# Graceful reload (zero downtime)
pm2 reload vexor-app

# Save process list for reboot persistence
pm2 save
pm2 startup`;

const dockerComposeCode = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "\${PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://vexor:secret@db:5432/vexor_db
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=\${JWT_SECRET}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - vexor-net

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: vexor_db
      POSTGRES_USER: vexor
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vexor -d vexor_db"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - vexor-net

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - vexor-net

volumes:
  postgres_data:
  redis_data:

networks:
  vexor-net:
    driver: bridge`;

const envCode = `# .env.production
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgres://user:password@host:5432/vexor_db
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# Redis
REDIS_URL=redis://host:6379

# Authentication
JWT_SECRET=your-production-secret-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Logging
LOG_LEVEL=warn

# Observability
OTEL_EXPORTER_OTLP_ENDPOINT=https://otel-collector:4317
OTEL_SERVICE_NAME=vexor-api`;

const envAppCode = `import { Vexor } from '@vexorjs/core';

const app = new Vexor();

// Validate required environment variables at startup
const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(\`Missing required env var: \${key}\`);
    process.exit(1);
  }
}

// Access typed config
const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  db: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  logLevel: process.env.LOG_LEVEL || 'info',
};

app.listen(config.port, () => {
  console.log(\`Server running on port \${config.port}\`);
});`;

const k8sDeploymentCode = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: vexor-api
  labels:
    app: vexor-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vexor-api
  template:
    metadata:
      labels:
        app: vexor-api
    spec:
      containers:
        - name: vexor-api
          image: registry.example.com/vexor-api:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: vexor-secrets
                  key: database-url
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: vexor-secrets
                  key: jwt-secret
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /live
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: vexor-api-svc
spec:
  selector:
    app: vexor-api
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: vexor-api-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: vexor-api-svc
                port:
                  number: 80`;

const healthCheckCode = `import { Vexor } from '@vexorjs/core';
import { db } from './db';

const app = new Vexor();

// Liveness probe: is the process running?
app.get('/live', async (ctx) => {
  return ctx.json({ alive: true });
});

// Readiness probe: can the app serve traffic?
app.get('/ready', async (ctx) => {
  try {
    // Check database connectivity
    await db.execute('SELECT 1');

    return ctx.json({
      ready: true,
      checks: {
        database: 'connected',
      },
    });
  } catch (error) {
    return ctx.status(503).json({
      ready: false,
      checks: {
        database: 'disconnected',
      },
    });
  }
});

// Detailed health endpoint (protect in production)
app.get('/health', async (ctx) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  return ctx.json({
    status: 'healthy',
    version: process.env.APP_VERSION || '1.0.0',
    uptime: Math.floor(uptime),
    memory: {
      rss: \`\${Math.round(memoryUsage.rss / 1024 / 1024)}MB\`,
      heapUsed: \`\${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB\`,
      heapTotal: \`\${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB\`,
    },
    timestamp: new Date().toISOString(),
  });
});`;

const cicdCode = `name: Deploy Vexor API

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: vexor_test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
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

      - name: Run tests
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/vexor_test
        run: npm run test:ci

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:latest
            \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}

      - name: Deploy to production
        run: |
          # Trigger deployment via webhook, SSH, or platform CLI
          curl -X POST \${{ secrets.DEPLOY_WEBHOOK_URL }} \\
            -H "Authorization: Bearer \${{ secrets.DEPLOY_TOKEN }}" \\
            -d '{"image": "\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}"}'`;

const railwayCode = `# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Deploy
railway up

# Set environment variables
railway variables set DATABASE_URL=your-db-url
railway variables set JWT_SECRET=your-secret`;

const flyioCode = `# Install Fly CLI and launch
fly launch

# fly.toml
app = "vexor-api"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "3000"

[http_service]
  internal_port = 3000
  force_https = true

  [[http_service.checks]]
    grace_period = "10s"
    interval = "30s"
    method = "GET"
    path = "/health"
    timeout = "5s"

# Deploy
fly deploy

# Set secrets
fly secrets set DATABASE_URL=your-db-url JWT_SECRET=your-secret

# Scale
fly scale count 3 --region iad,lax,cdg`;

const renderCode = `# render.yaml (Blueprint)
services:
  - type: web
    name: vexor-api
    runtime: node
    buildCommand: npm ci && npm run build
    startCommand: node dist/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: vexor-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
    healthCheckPath: /health
    autoDeploy: true

databases:
  - name: vexor-db
    plan: starter`;

const gracefulShutdownCode = `import { Vexor } from '@vexorjs/core';

const app = new Vexor();

// ... register routes ...

const server = app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Graceful shutdown handler
function shutdown(signal: string) {
  console.log(\`Received \${signal}. Starting graceful shutdown...\`);

  // Stop accepting new connections
  server.close(async () => {
    console.log('HTTP server closed.');

    // Close database connections
    await db.disconnect();
    console.log('Database connections closed.');

    // Close Redis connections
    await redis.quit();
    console.log('Redis connections closed.');

    process.exit(0);
  });

  // Force exit if shutdown takes too long
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));`;

export default function Deployment() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="deployment" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Deployment
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Deploying a Vexor application to production is the process of transforming your local development
          project into a resilient, observable, and scalable service that can handle real-world traffic.
          Unlike development, where a single process on your laptop is sufficient, production deployment
          involves a series of deliberate decisions about containerization, process management, health
          monitoring, configuration management, and infrastructure orchestration.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The deployment story for a Node.js API framework like Vexor centers on a few core principles.
          First, the application must be compiled from TypeScript to optimized JavaScript so that the
          runtime does not pay the cost of type-checking or transpilation. Second, the runtime environment
          must be deterministic: the exact same dependencies, environment variables, and system libraries
          should be present in staging and production. Third, the application must be able to start, stop,
          and restart gracefully, without dropping in-flight requests or leaking resources like database
          connections.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          This guide covers the full deployment lifecycle, from building a production artifact, through
          containerizing it with Docker, managing it with process managers like PM2, orchestrating it
          on Kubernetes, and deploying to modern cloud platforms. Each section explains not just the
          configuration, but the reasoning behind each decision, so you can adapt these patterns to
          your specific infrastructure requirements.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Whether you are deploying a single instance on a virtual machine or running a horizontally
          scaled cluster behind a load balancer, the concepts remain the same. The differences lie in
          which layer of the stack handles responsibilities like health checking, restart policies,
          secret injection, and traffic routing.
        </p>
      </div>

      <section>
        <h2 id="building-for-production" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Building for Production
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The build step converts your TypeScript source code into plain JavaScript that Node.js can
          execute directly. This is a critical distinction from development, where tools like
          <code className="prose-code">tsx</code> or <code className="prose-code">ts-node</code> handle
          transpilation on the fly at the cost of startup time and memory. In production, you want the
          fastest possible cold start and the smallest possible memory footprint, which means shipping
          pre-compiled JavaScript.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's CLI wraps <code className="prose-code">tsup</code>, a fast bundler built on esbuild,
          with sensible defaults for API applications. It outputs ESM modules, generates declaration
          files for any downstream consumers, and cleans the output directory before each build. If you
          need more control, such as custom entry points, external dependencies, or tree-shaking
          configuration, you can invoke <code className="prose-code">tsup</code> directly or replace
          it with any TypeScript compiler.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Setting <code className="prose-code">NODE_ENV=production</code> is essential. Vexor uses this
          flag internally to disable verbose error stack traces in HTTP responses, enable internal
          performance optimizations like route compilation caching, and suppress development-only
          warnings. Many third-party libraries also respect this variable, so omitting it can result
          in significantly degraded performance and unintended information leakage.
        </p>
        <CodeBlock code={buildCode} language="bash" filename="package.json" />
        <InfoBlock variant="tip">
          Always set <code className="prose-code">NODE_ENV=production</code> when starting your
          application. Vexor disables detailed error output and enables performance optimizations
          in production mode.
        </InfoBlock>
      </section>

      <section>
        <h2 id="docker" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Docker
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Containerization with Docker solves the fundamental deployment problem of environment
          consistency. When you build a Docker image, you capture not just your application code, but
          the exact Node.js version, operating system libraries, and native dependency binaries that
          your application needs. This eliminates the "works on my machine" class of bugs and makes
          deployments reproducible across any infrastructure that runs containers.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The multi-stage Dockerfile pattern shown below separates the build from three concerns into
          three stages. The first stage installs only production dependencies, the second stage installs
          all dependencies (including devDependencies like TypeScript) and compiles the application, and
          the third stage assembles the final image from the compiled output and production-only
          <code className="prose-code">node_modules</code>. This approach produces an image that is
          typically 80-90% smaller than a naive single-stage build, because TypeScript source code,
          build tools, and development dependencies are never included in the final layer.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Security is built into the image by creating a dedicated non-root user. Running as root inside
          a container is a well-known security anti-pattern because a container escape exploit gains the
          privileges of the container's user. The <code className="prose-code">HEALTHCHECK</code>
          instruction enables Docker's native health monitoring, which reports the container's status
          to orchestrators and allows automated restart policies to function correctly.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Alpine Linux is chosen as the base image for its minimal footprint (roughly 5MB), but you
          should be aware that Alpine uses <code className="prose-code">musl</code> instead of
          <code className="prose-code">glibc</code>. If your application uses native Node.js addons
          that depend on glibc-specific behavior, consider using
          <code className="prose-code">node:22-slim</code> (Debian-based) instead.
        </p>
        <CodeBlock code={dockerfileCode} language="dockerfile" filename="Dockerfile" />
        <InfoBlock variant="info">
          The image runs as a non-root user for security. The built-in
          <code className="prose-code">HEALTHCHECK</code> instruction lets Docker monitor the
          container automatically.
        </InfoBlock>
      </section>

      <section>
        <h2 id="docker-compose" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Docker Compose
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          While a Dockerfile describes a single container, most production applications depend on
          external services like databases and caches. Docker Compose lets you define the entire
          application topology, including your Vexor API, a PostgreSQL database, and a Redis instance,
          as a single declarative configuration. This is invaluable for local development, staging
          environments, and small-scale production deployments where a full orchestrator like
          Kubernetes would be overkill.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The configuration below uses health checks on each service and the
          <code className="prose-code">depends_on</code> directive with
          <code className="prose-code">condition: service_healthy</code> to ensure that the database
          and cache are fully initialized before the Vexor application starts. Without this ordering,
          your application would attempt to connect to a database that is still running its
          initialization scripts, leading to cryptic connection errors on startup.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Named volumes (<code className="prose-code">postgres_data</code> and
          <code className="prose-code">redis_data</code>) persist data across container restarts.
          The bridge network isolates service-to-service communication, and environment variable
          interpolation (via the <code className="prose-code">$&#123;JWT_SECRET&#125;</code> syntax) allows
          secrets to be injected from a <code className="prose-code">.env</code> file or the host
          environment without being hard-coded in the Compose file.
        </p>
        <CodeBlock code={dockerComposeCode} language="yaml" filename="docker-compose.yml" />
      </section>

      <section>
        <h2 id="graceful-shutdown" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Graceful Shutdown
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Graceful shutdown is one of the most overlooked aspects of production deployment, yet it is
          essential for zero-downtime operations. When a process receives a termination signal (such as
          <code className="prose-code">SIGTERM</code> from Kubernetes during a rolling update, or
          <code className="prose-code">SIGINT</code> from PM2 during a reload), the application must
          stop accepting new connections, finish processing any in-flight requests, close database and
          cache connections cleanly, and then exit. If the process exits immediately, clients receive
          connection reset errors, database transactions may be left in an inconsistent state, and
          connection pools on the database server accumulate abandoned connections.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The shutdown handler below follows a specific order of operations. First, it calls
          <code className="prose-code">server.close()</code>, which tells Node.js to stop accepting
          new TCP connections while allowing existing connections to complete. Once all connections
          have drained, the callback fires and the application closes its database pool and Redis
          client. A safety timeout ensures that the process does not hang indefinitely if a connection
          refuses to close, which can happen if a long-running query or a misbehaving client keeps a
          connection alive.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In a Kubernetes environment, the shutdown timeout should be shorter than the pod's
          <code className="prose-code">terminationGracePeriodSeconds</code> (which defaults to 30
          seconds). If your application does not exit within that window, Kubernetes sends
          <code className="prose-code">SIGKILL</code>, which cannot be caught and results in an
          ungraceful termination. For PM2, the
          <code className="prose-code">kill_timeout</code> configuration serves a similar purpose.
        </p>
        <CodeBlock code={gracefulShutdownCode} filename="src/index.ts" showLineNumbers />
        <InfoBlock variant="warning">
          Always implement graceful shutdown in production. Without it, rolling deployments and
          scaling events will cause dropped requests and resource leaks.
        </InfoBlock>
      </section>

      <section>
        <h2 id="pm2" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Process Management with PM2
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When deploying directly to a virtual machine or bare-metal server rather than using containers,
          you need a process manager to ensure your application stays running. PM2 is the most widely
          used process manager for Node.js in production. It provides automatic restarts when the
          process crashes, cluster mode for utilizing all CPU cores, log management with rotation,
          and zero-downtime reloads for deploying new code without dropping connections.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The cluster mode deserves special attention. Node.js runs JavaScript on a single thread, which
          means a single process can only saturate one CPU core. PM2's cluster mode spawns multiple
          worker processes (one per core when set to <code className="prose-code">'max'</code>) and
          distributes incoming connections across them using round-robin scheduling. Each worker is an
          independent Node.js process with its own memory space and event loop, so a crash in one
          worker does not affect others. PM2 automatically restarts crashed workers, maintaining the
          desired number of instances at all times.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">max_memory_restart</code> setting acts as a safety net
          against memory leaks. If a worker's resident set size exceeds the configured threshold, PM2
          gracefully restarts it. This is not a substitute for fixing memory leaks, but it prevents a
          single leak from consuming all available memory and destabilizing the entire server. The
          <code className="prose-code">merge_logs</code> option combines output from all workers into
          a single log stream, which simplifies log aggregation when you have many instances.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Zero-downtime reloads (<code className="prose-code">pm2 reload</code>) work by starting new
          workers with the updated code, waiting for them to signal readiness, and then gracefully
          shutting down old workers. This is distinct from <code className="prose-code">pm2 restart</code>,
          which kills all workers simultaneously and causes a brief period of downtime.
        </p>
        <CodeBlock code={pm2Code} language="javascript" filename="ecosystem.config.js" />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          Common PM2 commands for managing your application:
        </p>
        <CodeBlock code={pm2CommandsCode} language="bash" />
        <InfoBlock variant="tip">
          Set <code className="prose-code">instances: 'max'</code> to utilize all CPU cores.
          PM2 cluster mode distributes incoming connections across worker processes using
          round-robin scheduling.
        </InfoBlock>
      </section>

      <section>
        <h2 id="environment-variables" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Environment Configuration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Environment variables are the standard mechanism for injecting configuration into a
          twelve-factor application. They separate secrets and environment-specific settings (database
          URLs, API keys, feature flags) from the application code, which means the same compiled
          artifact can run in development, staging, and production with different configuration.
          This separation is fundamental to reproducible deployments and eliminates the need to
          rebuild your application for each environment.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The configuration below covers the most common variables for a Vexor production deployment.
          Database and Redis connection strings point to your infrastructure. Authentication secrets
          must be cryptographically random and at least 32 characters long for JWT HMAC signing.
          CORS origins should be explicitly listed rather than using wildcards. Rate limiting
          parameters protect your API from abuse while allowing legitimate traffic. The observability
          settings configure OpenTelemetry export for distributed tracing and metrics collection.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A critical best practice is to validate all required environment variables at startup, before
          the application begins accepting traffic. The fail-fast pattern shown below prevents the
          application from starting in a half-configured state, where it might serve requests
          successfully for most routes but fail catastrophically when a route needs a missing secret.
          This transforms a runtime error (which might not surface for hours) into a deployment-time
          error (which is caught immediately by health checks and rollback policies).
        </p>
        <CodeBlock code={envCode} language="bash" filename=".env.production" />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          Validate required variables at startup so missing configuration fails fast
          rather than causing runtime errors:
        </p>
        <CodeBlock code={envAppCode} filename="src/index.ts" />
        <InfoBlock variant="warning">
          Never hard-code secrets in your source code. Use your platform's secret management
          (Docker secrets, Kubernetes secrets, or your cloud provider's vault) for production
          credentials.
        </InfoBlock>
      </section>

      <section>
        <h2 id="health-checks" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Health Checks
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Health check endpoints are the communication channel between your application and its
          infrastructure. Load balancers use them to decide which instances should receive traffic.
          Container orchestrators use them to determine when to restart a failing container or when
          a new deployment is ready to serve requests. Monitoring systems use them to trigger alerts
          when something goes wrong. Without health checks, your infrastructure operates blind,
          routing traffic to broken instances and failing to detect degraded states.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The standard pattern uses three distinct endpoints, each serving a different purpose. The
          <code className="prose-code">/live</code> endpoint (liveness probe) answers the question
          "is this process running and not deadlocked?" It should always return immediately with a
          200 status and should never check external dependencies. If the liveness probe fails, the
          orchestrator kills the process and starts a new one. If you make the liveness probe depend
          on the database, a temporary database outage will cause all your application pods to restart
          simultaneously, making the situation worse.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">/ready</code> endpoint (readiness probe) answers "can this
          instance handle traffic right now?" It checks that all dependencies, such as the database,
          cache, and external APIs, are reachable. When the readiness probe fails, the load balancer
          temporarily removes the instance from the rotation, but the process continues running. Once
          the dependency recovers, the readiness probe succeeds again and traffic is restored. This is
          the correct behavior for transient failures.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">/health</code> endpoint provides detailed diagnostic
          information including uptime, memory usage, and version. This endpoint should be protected
          in production (behind authentication or restricted to internal networks) because it exposes
          operational details that could be useful to an attacker. It is primarily used by operations
          teams for debugging and by monitoring dashboards for visibility.
        </p>
        <CodeBlock code={healthCheckCode} filename="src/health.ts" showLineNumbers />
        <InfoBlock variant="info">
          The <code className="prose-code">/live</code> endpoint should always return quickly.
          The <code className="prose-code">/ready</code> endpoint should verify that all
          dependencies (database, cache, external services) are reachable before reporting
          the application as ready to accept traffic.
        </InfoBlock>
      </section>

      <section>
        <h2 id="kubernetes" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Kubernetes
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Kubernetes is the industry standard for orchestrating containerized applications at scale.
          It provides declarative deployment management, automatic scaling, self-healing (restarting
          failed containers), rolling updates with zero downtime, service discovery, and secret
          management. For a Vexor application, a typical Kubernetes deployment consists of three
          resources: a Deployment that manages the application pods, a Service that provides
          stable internal networking, and an Ingress that exposes the service to external traffic.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The Deployment resource specifies the desired state: three replicas of the Vexor API
          container, each with defined CPU and memory requests and limits. Resource requests tell
          the scheduler how much capacity each pod needs, while limits prevent a single pod from
          consuming all resources on its node. Setting these correctly is critical: requests that are
          too low cause pods to be scheduled on nodes that cannot support them, while limits that
          are too high waste cluster capacity. For a typical Vexor API, start with 100m CPU and
          128Mi memory as requests, and 500m CPU and 512Mi memory as limits, then adjust based on
          observed metrics.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Secrets are injected via Kubernetes Secret references rather than being stored in the
          Deployment manifest. This keeps sensitive values out of version control and allows them
          to be rotated independently of deployments. The liveness and readiness probes connect to
          the health check endpoints described in the previous section, giving Kubernetes the ability
          to automatically restart stuck processes and remove unhealthy pods from the Service's
          endpoint list.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Rolling updates happen automatically when you change the container image. Kubernetes creates
          new pods with the updated image, waits for their readiness probes to pass, and then
          terminates old pods. The <code className="prose-code">maxSurge</code> and
          <code className="prose-code">maxUnavailable</code> settings (defaults: 25%) control how
          aggressively the rollout proceeds. If a new version fails its readiness check, the rollout
          stalls automatically, and you can roll back with a single command.
        </p>
        <CodeBlock code={k8sDeploymentCode} language="yaml" filename="k8s/deployment.yaml" />
      </section>

      <section>
        <h2 id="cicd-pipeline" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          CI/CD Pipeline
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A CI/CD pipeline automates the path from code commit to production deployment, eliminating
          manual steps that are error-prone and time-consuming. The pipeline serves as both a quality
          gate and a deployment mechanism: every change is linted, built, and tested against a real
          database before it can reach production. This automation provides confidence that what you
          ship is what you tested.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The GitHub Actions workflow below is split into two jobs. The test job runs on every push
          and pull request, spinning up a PostgreSQL service container so integration tests run against
          a real database. Using a service container rather than mocking the database ensures that your
          tests catch SQL-level issues, schema mismatches, and transaction behavior that mocks would
          miss. The deploy job runs only on pushes to the main branch, and only after the test job
          succeeds. It builds a Docker image, tags it with both <code className="prose-code">latest</code>
          and the commit SHA (for traceability), and pushes it to the GitHub Container Registry.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The commit SHA tag is essential for production debugging. When you need to identify exactly
          which code is running in production, the image tag maps directly to a git commit. The
          <code className="prose-code">latest</code> tag provides convenience for development
          environments but should never be used as the sole tag in production, because it is
          mutable and does not guarantee which version is deployed.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The final deployment step triggers your production infrastructure. The example uses a
          webhook, but this could be replaced with a Kubernetes
          <code className="prose-code">kubectl set image</code> command, an SSH-based deployment
          script, or a platform-specific CLI invocation. The important principle is that the deployment
          is fully automated and idempotent: running the same pipeline twice with the same commit
          produces the same result.
        </p>
        <CodeBlock code={cicdCode} language="yaml" filename=".github/workflows/deploy.yml" />
        <InfoBlock variant="tip">
          Pin your action versions to specific SHAs or tags for reproducible builds. Use branch
          protection rules to require passing checks before merging to main.
        </InfoBlock>
      </section>

      <section>
        <h2 id="cloud-platforms" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Cloud Platforms
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Modern cloud platforms abstract away infrastructure management, letting you deploy a Vexor
          application without configuring servers, load balancers, or container orchestrators yourself.
          Each platform makes different trade-offs between simplicity, control, cost, and geographic
          distribution. The right choice depends on your team's operational capacity, your latency
          requirements, and your budget.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          All of these platforms support Vexor applications natively because Vexor produces a standard
          Node.js application. The platform detects your <code className="prose-code">package.json</code>,
          runs your build script, and starts the output with <code className="prose-code">node</code>.
          Health checks, environment variables, and scaling are configured through platform-specific
          mechanisms, but the application code remains identical across all of them.
        </p>

        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-8">
          Railway
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Railway auto-detects Node.js projects and provisions infrastructure with minimal
          configuration. It is well-suited for small teams that want managed databases and
          automatic deployments from a git repository without writing any infrastructure
          configuration. Railway handles TLS termination, builds, and environment variable
          management through its dashboard and CLI.
        </p>
        <CodeBlock code={railwayCode} language="bash" />

        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-8">
          Fly.io
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Fly.io deploys Docker containers to edge locations worldwide, making it an excellent choice
          when low latency across multiple geographic regions is a priority. Unlike centralized
          platforms where all requests route to a single region, Fly.io runs your application in
          multiple data centers simultaneously. This is particularly effective for read-heavy APIs
          where you can pair edge compute with read replicas of your database. The
          <code className="prose-code">fly.toml</code> configuration defines your deployment
          topology, health checks, and scaling rules.
        </p>
        <CodeBlock code={flyioCode} language="bash" filename="fly.toml" />

        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-8">
          Render
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Render uses a Blueprint specification to define your entire infrastructure as code,
          including web services, databases, and environment variables in a single YAML file. This
          infrastructure-as-code approach means your entire stack can be version-controlled and
          reproduced from scratch. Render automatically provisions databases, generates secrets, and
          configures health check monitoring, making it a good middle ground between the simplicity
          of Railway and the flexibility of Kubernetes.
        </p>
        <CodeBlock code={renderCode} language="yaml" filename="render.yaml" />
      </section>

      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Successful production deployments follow a set of principles that apply regardless of your
          infrastructure choices. These practices reduce the blast radius of failures, speed up
          incident response, and make deployments a routine operation rather than a high-risk event.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 pr-4 text-slate-900 dark:text-white font-semibold">Practice</th>
                <th className="py-3 text-slate-900 dark:text-white font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Immutable artifacts</td>
                <td className="py-3">Build a Docker image once and deploy it to every environment. Never modify a running container or rebuild for staging versus production. The image tag should be the git commit SHA.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Fail-fast startup</td>
                <td className="py-3">Validate all required environment variables and test database connectivity before the server starts accepting traffic. A crash at startup is infinitely better than a crash on the first request.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Graceful shutdown</td>
                <td className="py-3">Handle SIGTERM by draining in-flight requests, closing database connections, and exiting cleanly. This prevents dropped requests during rolling deployments and scaling events.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Separate liveness and readiness</td>
                <td className="py-3">Never check external dependencies in your liveness probe. A database outage should remove pods from the load balancer (readiness), not trigger mass restarts (liveness).</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Secret rotation</td>
                <td className="py-3">Use your platform's secret management (Kubernetes Secrets, Vault, cloud provider KMS) so secrets can be rotated without redeploying code. Never commit secrets to version control.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Structured logging</td>
                <td className="py-3">Log in JSON format with consistent fields (timestamp, request ID, level, message). This enables log aggregation tools to parse, filter, and alert on structured data.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Rollback readiness</td>
                <td className="py-3">Tag every deployment with its commit SHA and keep the previous image available. If a deployment causes issues, rolling back should be a single command that takes seconds, not minutes.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/advanced/testing" className="btn-primary">
            Testing Guide <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/advanced/performance" className="btn-secondary">
            Performance Optimization
          </Link>
        </div>
      </section>
    </div>
  );
}
