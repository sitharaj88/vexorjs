import{j as e,C as t,I as s,L as a,A as o}from"./index-BWrueqsD.js";const r=`# Using the Vexor CLI
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
}`,n=`# Stage 1: Install dependencies
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

CMD ["node", "dist/index.js"]`,i=`# Install PM2 globally
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
};`,c=`# Start with PM2
pm2 start ecosystem.config.js --env production

# Monitor processes
pm2 monit

# View logs
pm2 logs vexor-app

# Graceful reload (zero downtime)
pm2 reload vexor-app

# Save process list for reboot persistence
pm2 save
pm2 startup`,l=`version: '3.8'

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
    driver: bridge`,d=`# .env.production
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
OTEL_SERVICE_NAME=vexor-api`,p=`import { Vexor } from '@vexorjs/core';

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
});`,h=`apiVersion: apps/v1
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
                  number: 80`,m=`import { Vexor } from '@vexorjs/core';
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
});`,u=`name: Deploy Vexor API

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
            -d '{"image": "\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}"}'`,g=`# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Deploy
railway up

# Set environment variables
railway variables set DATABASE_URL=your-db-url
railway variables set JWT_SECRET=your-secret`,x=`# Install Fly CLI and launch
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
fly scale count 3 --region iad,lax,cdg`,b=`# render.yaml (Blueprint)
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
    plan: starter`,f=`import { Vexor } from '@vexorjs/core';

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
process.on('SIGINT', () => shutdown('SIGINT'));`;function v(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"deployment",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"Deployment"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"Deploying a Vexor application to production is the process of transforming your local development project into a resilient, observable, and scalable service that can handle real-world traffic. Unlike development, where a single process on your laptop is sufficient, production deployment involves a series of deliberate decisions about containerization, process management, health monitoring, configuration management, and infrastructure orchestration."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The deployment story for a Node.js API framework like Vexor centers on a few core principles. First, the application must be compiled from TypeScript to optimized JavaScript so that the runtime does not pay the cost of type-checking or transpilation. Second, the runtime environment must be deterministic: the exact same dependencies, environment variables, and system libraries should be present in staging and production. Third, the application must be able to start, stop, and restart gracefully, without dropping in-flight requests or leaking resources like database connections."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"This guide covers the full deployment lifecycle, from building a production artifact, through containerizing it with Docker, managing it with process managers like PM2, orchestrating it on Kubernetes, and deploying to modern cloud platforms. Each section explains not just the configuration, but the reasoning behind each decision, so you can adapt these patterns to your specific infrastructure requirements."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"Whether you are deploying a single instance on a virtual machine or running a horizontally scaled cluster behind a load balancer, the concepts remain the same. The differences lie in which layer of the stack handles responsibilities like health checking, restart policies, secret injection, and traffic routing."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"building-for-production",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Building for Production"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The build step converts your TypeScript source code into plain JavaScript that Node.js can execute directly. This is a critical distinction from development, where tools like",e.jsx("code",{className:"prose-code",children:"tsx"})," or ",e.jsx("code",{className:"prose-code",children:"ts-node"})," handle transpilation on the fly at the cost of startup time and memory. In production, you want the fastest possible cold start and the smallest possible memory footprint, which means shipping pre-compiled JavaScript."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor's CLI wraps ",e.jsx("code",{className:"prose-code",children:"tsup"}),", a fast bundler built on esbuild, with sensible defaults for API applications. It outputs ESM modules, generates declaration files for any downstream consumers, and cleans the output directory before each build. If you need more control, such as custom entry points, external dependencies, or tree-shaking configuration, you can invoke ",e.jsx("code",{className:"prose-code",children:"tsup"})," directly or replace it with any TypeScript compiler."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Setting ",e.jsx("code",{className:"prose-code",children:"NODE_ENV=production"})," is essential. Vexor uses this flag internally to disable verbose error stack traces in HTTP responses, enable internal performance optimizations like route compilation caching, and suppress development-only warnings. Many third-party libraries also respect this variable, so omitting it can result in significantly degraded performance and unintended information leakage."]}),e.jsx(t,{code:r,language:"bash",filename:"package.json"}),e.jsxs(s,{variant:"tip",children:["Always set ",e.jsx("code",{className:"prose-code",children:"NODE_ENV=production"})," when starting your application. Vexor disables detailed error output and enables performance optimizations in production mode."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"docker",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Docker"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:'Containerization with Docker solves the fundamental deployment problem of environment consistency. When you build a Docker image, you capture not just your application code, but the exact Node.js version, operating system libraries, and native dependency binaries that your application needs. This eliminates the "works on my machine" class of bugs and makes deployments reproducible across any infrastructure that runs containers.'}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The multi-stage Dockerfile pattern shown below separates the build from three concerns into three stages. The first stage installs only production dependencies, the second stage installs all dependencies (including devDependencies like TypeScript) and compiles the application, and the third stage assembles the final image from the compiled output and production-only",e.jsx("code",{className:"prose-code",children:"node_modules"}),". This approach produces an image that is typically 80-90% smaller than a naive single-stage build, because TypeScript source code, build tools, and development dependencies are never included in the final layer."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Security is built into the image by creating a dedicated non-root user. Running as root inside a container is a well-known security anti-pattern because a container escape exploit gains the privileges of the container's user. The ",e.jsx("code",{className:"prose-code",children:"HEALTHCHECK"}),"instruction enables Docker's native health monitoring, which reports the container's status to orchestrators and allows automated restart policies to function correctly."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Alpine Linux is chosen as the base image for its minimal footprint (roughly 5MB), but you should be aware that Alpine uses ",e.jsx("code",{className:"prose-code",children:"musl"})," instead of",e.jsx("code",{className:"prose-code",children:"glibc"}),". If your application uses native Node.js addons that depend on glibc-specific behavior, consider using",e.jsx("code",{className:"prose-code",children:"node:22-slim"})," (Debian-based) instead."]}),e.jsx(t,{code:n,language:"dockerfile",filename:"Dockerfile"}),e.jsxs(s,{variant:"info",children:["The image runs as a non-root user for security. The built-in",e.jsx("code",{className:"prose-code",children:"HEALTHCHECK"})," instruction lets Docker monitor the container automatically."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"docker-compose",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Docker Compose"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"While a Dockerfile describes a single container, most production applications depend on external services like databases and caches. Docker Compose lets you define the entire application topology, including your Vexor API, a PostgreSQL database, and a Redis instance, as a single declarative configuration. This is invaluable for local development, staging environments, and small-scale production deployments where a full orchestrator like Kubernetes would be overkill."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The configuration below uses health checks on each service and the",e.jsx("code",{className:"prose-code",children:"depends_on"})," directive with",e.jsx("code",{className:"prose-code",children:"condition: service_healthy"})," to ensure that the database and cache are fully initialized before the Vexor application starts. Without this ordering, your application would attempt to connect to a database that is still running its initialization scripts, leading to cryptic connection errors on startup."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Named volumes (",e.jsx("code",{className:"prose-code",children:"postgres_data"})," and",e.jsx("code",{className:"prose-code",children:"redis_data"}),") persist data across container restarts. The bridge network isolates service-to-service communication, and environment variable interpolation (via the ",e.jsx("code",{className:"prose-code",children:"${JWT_SECRET}"})," syntax) allows secrets to be injected from a ",e.jsx("code",{className:"prose-code",children:".env"})," file or the host environment without being hard-coded in the Compose file."]}),e.jsx(t,{code:l,language:"yaml",filename:"docker-compose.yml"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"graceful-shutdown",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Graceful Shutdown"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Graceful shutdown is one of the most overlooked aspects of production deployment, yet it is essential for zero-downtime operations. When a process receives a termination signal (such as",e.jsx("code",{className:"prose-code",children:"SIGTERM"})," from Kubernetes during a rolling update, or",e.jsx("code",{className:"prose-code",children:"SIGINT"})," from PM2 during a reload), the application must stop accepting new connections, finish processing any in-flight requests, close database and cache connections cleanly, and then exit. If the process exits immediately, clients receive connection reset errors, database transactions may be left in an inconsistent state, and connection pools on the database server accumulate abandoned connections."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The shutdown handler below follows a specific order of operations. First, it calls",e.jsx("code",{className:"prose-code",children:"server.close()"}),", which tells Node.js to stop accepting new TCP connections while allowing existing connections to complete. Once all connections have drained, the callback fires and the application closes its database pool and Redis client. A safety timeout ensures that the process does not hang indefinitely if a connection refuses to close, which can happen if a long-running query or a misbehaving client keeps a connection alive."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["In a Kubernetes environment, the shutdown timeout should be shorter than the pod's",e.jsx("code",{className:"prose-code",children:"terminationGracePeriodSeconds"})," (which defaults to 30 seconds). If your application does not exit within that window, Kubernetes sends",e.jsx("code",{className:"prose-code",children:"SIGKILL"}),", which cannot be caught and results in an ungraceful termination. For PM2, the",e.jsx("code",{className:"prose-code",children:"kill_timeout"})," configuration serves a similar purpose."]}),e.jsx(t,{code:f,filename:"src/index.ts",showLineNumbers:!0}),e.jsx(s,{variant:"warning",children:"Always implement graceful shutdown in production. Without it, rolling deployments and scaling events will cause dropped requests and resource leaks."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"pm2",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Process Management with PM2"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"When deploying directly to a virtual machine or bare-metal server rather than using containers, you need a process manager to ensure your application stays running. PM2 is the most widely used process manager for Node.js in production. It provides automatic restarts when the process crashes, cluster mode for utilizing all CPU cores, log management with rotation, and zero-downtime reloads for deploying new code without dropping connections."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The cluster mode deserves special attention. Node.js runs JavaScript on a single thread, which means a single process can only saturate one CPU core. PM2's cluster mode spawns multiple worker processes (one per core when set to ",e.jsx("code",{className:"prose-code",children:"'max'"}),") and distributes incoming connections across them using round-robin scheduling. Each worker is an independent Node.js process with its own memory space and event loop, so a crash in one worker does not affect others. PM2 automatically restarts crashed workers, maintaining the desired number of instances at all times."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"max_memory_restart"})," setting acts as a safety net against memory leaks. If a worker's resident set size exceeds the configured threshold, PM2 gracefully restarts it. This is not a substitute for fixing memory leaks, but it prevents a single leak from consuming all available memory and destabilizing the entire server. The",e.jsx("code",{className:"prose-code",children:"merge_logs"})," option combines output from all workers into a single log stream, which simplifies log aggregation when you have many instances."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Zero-downtime reloads (",e.jsx("code",{className:"prose-code",children:"pm2 reload"}),") work by starting new workers with the updated code, waiting for them to signal readiness, and then gracefully shutting down old workers. This is distinct from ",e.jsx("code",{className:"prose-code",children:"pm2 restart"}),", which kills all workers simultaneously and causes a brief period of downtime."]}),e.jsx(t,{code:i,language:"javascript",filename:"ecosystem.config.js"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mt-4 mb-4",children:"Common PM2 commands for managing your application:"}),e.jsx(t,{code:c,language:"bash"}),e.jsxs(s,{variant:"tip",children:["Set ",e.jsx("code",{className:"prose-code",children:"instances: 'max'"})," to utilize all CPU cores. PM2 cluster mode distributes incoming connections across worker processes using round-robin scheduling."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"environment-variables",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Environment Configuration"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Environment variables are the standard mechanism for injecting configuration into a twelve-factor application. They separate secrets and environment-specific settings (database URLs, API keys, feature flags) from the application code, which means the same compiled artifact can run in development, staging, and production with different configuration. This separation is fundamental to reproducible deployments and eliminates the need to rebuild your application for each environment."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The configuration below covers the most common variables for a Vexor production deployment. Database and Redis connection strings point to your infrastructure. Authentication secrets must be cryptographically random and at least 32 characters long for JWT HMAC signing. CORS origins should be explicitly listed rather than using wildcards. Rate limiting parameters protect your API from abuse while allowing legitimate traffic. The observability settings configure OpenTelemetry export for distributed tracing and metrics collection."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"A critical best practice is to validate all required environment variables at startup, before the application begins accepting traffic. The fail-fast pattern shown below prevents the application from starting in a half-configured state, where it might serve requests successfully for most routes but fail catastrophically when a route needs a missing secret. This transforms a runtime error (which might not surface for hours) into a deployment-time error (which is caught immediately by health checks and rollback policies)."}),e.jsx(t,{code:d,language:"bash",filename:".env.production"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mt-4 mb-4",children:"Validate required variables at startup so missing configuration fails fast rather than causing runtime errors:"}),e.jsx(t,{code:p,filename:"src/index.ts"}),e.jsx(s,{variant:"warning",children:"Never hard-code secrets in your source code. Use your platform's secret management (Docker secrets, Kubernetes secrets, or your cloud provider's vault) for production credentials."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"health-checks",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Health Checks"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Health check endpoints are the communication channel between your application and its infrastructure. Load balancers use them to decide which instances should receive traffic. Container orchestrators use them to determine when to restart a failing container or when a new deployment is ready to serve requests. Monitoring systems use them to trigger alerts when something goes wrong. Without health checks, your infrastructure operates blind, routing traffic to broken instances and failing to detect degraded states."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The standard pattern uses three distinct endpoints, each serving a different purpose. The",e.jsx("code",{className:"prose-code",children:"/live"}),' endpoint (liveness probe) answers the question "is this process running and not deadlocked?" It should always return immediately with a 200 status and should never check external dependencies. If the liveness probe fails, the orchestrator kills the process and starts a new one. If you make the liveness probe depend on the database, a temporary database outage will cause all your application pods to restart simultaneously, making the situation worse.']}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"/ready"}),' endpoint (readiness probe) answers "can this instance handle traffic right now?" It checks that all dependencies, such as the database, cache, and external APIs, are reachable. When the readiness probe fails, the load balancer temporarily removes the instance from the rotation, but the process continues running. Once the dependency recovers, the readiness probe succeeds again and traffic is restored. This is the correct behavior for transient failures.']}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"/health"})," endpoint provides detailed diagnostic information including uptime, memory usage, and version. This endpoint should be protected in production (behind authentication or restricted to internal networks) because it exposes operational details that could be useful to an attacker. It is primarily used by operations teams for debugging and by monitoring dashboards for visibility."]}),e.jsx(t,{code:m,filename:"src/health.ts",showLineNumbers:!0}),e.jsxs(s,{variant:"info",children:["The ",e.jsx("code",{className:"prose-code",children:"/live"})," endpoint should always return quickly. The ",e.jsx("code",{className:"prose-code",children:"/ready"})," endpoint should verify that all dependencies (database, cache, external services) are reachable before reporting the application as ready to accept traffic."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"kubernetes",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Kubernetes"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Kubernetes is the industry standard for orchestrating containerized applications at scale. It provides declarative deployment management, automatic scaling, self-healing (restarting failed containers), rolling updates with zero downtime, service discovery, and secret management. For a Vexor application, a typical Kubernetes deployment consists of three resources: a Deployment that manages the application pods, a Service that provides stable internal networking, and an Ingress that exposes the service to external traffic."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The Deployment resource specifies the desired state: three replicas of the Vexor API container, each with defined CPU and memory requests and limits. Resource requests tell the scheduler how much capacity each pod needs, while limits prevent a single pod from consuming all resources on its node. Setting these correctly is critical: requests that are too low cause pods to be scheduled on nodes that cannot support them, while limits that are too high waste cluster capacity. For a typical Vexor API, start with 100m CPU and 128Mi memory as requests, and 500m CPU and 512Mi memory as limits, then adjust based on observed metrics."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Secrets are injected via Kubernetes Secret references rather than being stored in the Deployment manifest. This keeps sensitive values out of version control and allows them to be rotated independently of deployments. The liveness and readiness probes connect to the health check endpoints described in the previous section, giving Kubernetes the ability to automatically restart stuck processes and remove unhealthy pods from the Service's endpoint list."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Rolling updates happen automatically when you change the container image. Kubernetes creates new pods with the updated image, waits for their readiness probes to pass, and then terminates old pods. The ",e.jsx("code",{className:"prose-code",children:"maxSurge"})," and",e.jsx("code",{className:"prose-code",children:"maxUnavailable"})," settings (defaults: 25%) control how aggressively the rollout proceeds. If a new version fails its readiness check, the rollout stalls automatically, and you can roll back with a single command."]}),e.jsx(t,{code:h,language:"yaml",filename:"k8s/deployment.yaml"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"cicd-pipeline",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"CI/CD Pipeline"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"A CI/CD pipeline automates the path from code commit to production deployment, eliminating manual steps that are error-prone and time-consuming. The pipeline serves as both a quality gate and a deployment mechanism: every change is linted, built, and tested against a real database before it can reach production. This automation provides confidence that what you ship is what you tested."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The GitHub Actions workflow below is split into two jobs. The test job runs on every push and pull request, spinning up a PostgreSQL service container so integration tests run against a real database. Using a service container rather than mocking the database ensures that your tests catch SQL-level issues, schema mismatches, and transaction behavior that mocks would miss. The deploy job runs only on pushes to the main branch, and only after the test job succeeds. It builds a Docker image, tags it with both ",e.jsx("code",{className:"prose-code",children:"latest"}),"and the commit SHA (for traceability), and pushes it to the GitHub Container Registry."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The commit SHA tag is essential for production debugging. When you need to identify exactly which code is running in production, the image tag maps directly to a git commit. The",e.jsx("code",{className:"prose-code",children:"latest"})," tag provides convenience for development environments but should never be used as the sole tag in production, because it is mutable and does not guarantee which version is deployed."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The final deployment step triggers your production infrastructure. The example uses a webhook, but this could be replaced with a Kubernetes",e.jsx("code",{className:"prose-code",children:"kubectl set image"})," command, an SSH-based deployment script, or a platform-specific CLI invocation. The important principle is that the deployment is fully automated and idempotent: running the same pipeline twice with the same commit produces the same result."]}),e.jsx(t,{code:u,language:"yaml",filename:".github/workflows/deploy.yml"}),e.jsx(s,{variant:"tip",children:"Pin your action versions to specific SHAs or tags for reproducible builds. Use branch protection rules to require passing checks before merging to main."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"cloud-platforms",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Cloud Platforms"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Modern cloud platforms abstract away infrastructure management, letting you deploy a Vexor application without configuring servers, load balancers, or container orchestrators yourself. Each platform makes different trade-offs between simplicity, control, cost, and geographic distribution. The right choice depends on your team's operational capacity, your latency requirements, and your budget."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["All of these platforms support Vexor applications natively because Vexor produces a standard Node.js application. The platform detects your ",e.jsx("code",{className:"prose-code",children:"package.json"}),", runs your build script, and starts the output with ",e.jsx("code",{className:"prose-code",children:"node"}),". Health checks, environment variables, and scaling are configured through platform-specific mechanisms, but the application code remains identical across all of them."]}),e.jsx("h3",{className:"text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-8",children:"Railway"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Railway auto-detects Node.js projects and provisions infrastructure with minimal configuration. It is well-suited for small teams that want managed databases and automatic deployments from a git repository without writing any infrastructure configuration. Railway handles TLS termination, builds, and environment variable management through its dashboard and CLI."}),e.jsx(t,{code:g,language:"bash"}),e.jsx("h3",{className:"text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-8",children:"Fly.io"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Fly.io deploys Docker containers to edge locations worldwide, making it an excellent choice when low latency across multiple geographic regions is a priority. Unlike centralized platforms where all requests route to a single region, Fly.io runs your application in multiple data centers simultaneously. This is particularly effective for read-heavy APIs where you can pair edge compute with read replicas of your database. The",e.jsx("code",{className:"prose-code",children:"fly.toml"})," configuration defines your deployment topology, health checks, and scaling rules."]}),e.jsx(t,{code:x,language:"bash",filename:"fly.toml"}),e.jsx("h3",{className:"text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-8",children:"Render"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Render uses a Blueprint specification to define your entire infrastructure as code, including web services, databases, and environment variables in a single YAML file. This infrastructure-as-code approach means your entire stack can be version-controlled and reproduced from scratch. Render automatically provisions databases, generates secrets, and configures health check monitoring, making it a good middle ground between the simplicity of Railway and the flexibility of Kubernetes."}),e.jsx(t,{code:b,language:"yaml",filename:"render.yaml"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"best-practices",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Best Practices"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Successful production deployments follow a set of principles that apply regardless of your infrastructure choices. These practices reduce the blast radius of failures, speed up incident response, and make deployments a routine operation rather than a high-risk event."}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-left border-collapse",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"py-3 pr-4 text-slate-900 dark:text-white font-semibold",children:"Practice"}),e.jsx("th",{className:"py-3 text-slate-900 dark:text-white font-semibold",children:"Description"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Immutable artifacts"}),e.jsx("td",{className:"py-3",children:"Build a Docker image once and deploy it to every environment. Never modify a running container or rebuild for staging versus production. The image tag should be the git commit SHA."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Fail-fast startup"}),e.jsx("td",{className:"py-3",children:"Validate all required environment variables and test database connectivity before the server starts accepting traffic. A crash at startup is infinitely better than a crash on the first request."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Graceful shutdown"}),e.jsx("td",{className:"py-3",children:"Handle SIGTERM by draining in-flight requests, closing database connections, and exiting cleanly. This prevents dropped requests during rolling deployments and scaling events."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Separate liveness and readiness"}),e.jsx("td",{className:"py-3",children:"Never check external dependencies in your liveness probe. A database outage should remove pods from the load balancer (readiness), not trigger mass restarts (liveness)."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Secret rotation"}),e.jsx("td",{className:"py-3",children:"Use your platform's secret management (Kubernetes Secrets, Vault, cloud provider KMS) so secrets can be rotated without redeploying code. Never commit secrets to version control."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Structured logging"}),e.jsx("td",{className:"py-3",children:"Log in JSON format with consistent fields (timestamp, request ID, level, message). This enables log aggregation tools to parse, filter, and alert on structured data."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Rollback readiness"}),e.jsx("td",{className:"py-3",children:"Tag every deployment with its commit SHA and keep the previous image available. If a deployment causes issues, rolling back should be a single command that takes seconds, not minutes."})]})]})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(a,{to:"/advanced/testing",className:"btn-primary",children:["Testing Guide ",e.jsx(o,{className:"w-4 h-4 ml-2"})]}),e.jsx(a,{to:"/advanced/performance",className:"btn-secondary",children:"Performance Optimization"})]})]})]})}export{v as default};
