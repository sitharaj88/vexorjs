import CodeBlock from '../../components/CodeBlock';

const dockerfileCode = `# Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]`;

const dockerComposeCode = `# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://postgres:password@db:5432/vexor
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: vexor
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:`;

const cloudflareCode = `// For Cloudflare Workers
// vexor.config.ts
import { defineConfig } from 'vexor';

export default defineConfig({
  adapter: 'cloudflare',
  entry: 'src/index.ts',
});

// src/index.ts
import { Vexor } from 'vexor';

const app = new Vexor();

app.get('/', async (ctx) => {
  return ctx.json({ message: 'Hello from the edge!' });
});

export default app; // Export for Cloudflare Workers`;

const vercelCode = `// vercel.json
{
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ]
}

// Or use Edge Functions
// api/index.ts
import { Vexor } from 'vexor';

const app = new Vexor();

app.get('/api/hello', async (ctx) => {
  return ctx.json({ message: 'Hello!' });
});

export const config = {
  runtime: 'edge',
};

export default app;`;

const envCode = `# .env.production
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgres://user:password@host:5432/dbname

# Redis (for sessions, caching)
REDIS_URL=redis://host:6379

# Auth
JWT_SECRET=your-super-secret-key
SESSION_SECRET=another-secret-key

# Observability
OTEL_EXPORTER_OTLP_ENDPOINT=https://otel-collector:4317`;

const healthCheckCode = `// Health check endpoint for load balancers
app.get('/health', async (ctx) => {
  // Check database connection
  try {
    await db.select().from(sql\`SELECT 1\`);
  } catch (error) {
    return ctx.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
    });
  }

  return ctx.json({
    status: 'healthy',
    version: process.env.APP_VERSION,
    uptime: process.uptime(),
  });
});

// Kubernetes probes
app.get('/ready', async (ctx) => {
  // Check all dependencies
  return ctx.json({ ready: true });
});

app.get('/live', async (ctx) => {
  return ctx.json({ alive: true });
});`;

export default function Deployment() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="deployment" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Deployment Guide
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Learn how to deploy your Vexor application to production environments.
        </p>
      </div>

      <section>
        <h2 id="docker" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Docker
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Build a production-ready Docker image.
        </p>
        <CodeBlock code={dockerfileCode} language="dockerfile" filename="Dockerfile" />
      </section>

      <section>
        <h2 id="docker-compose" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Docker Compose
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Run your application with all dependencies.
        </p>
        <CodeBlock code={dockerComposeCode} language="yaml" filename="docker-compose.yml" />
      </section>

      <section>
        <h2 id="cloudflare" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Cloudflare Workers
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Deploy to Cloudflare's edge network.
        </p>
        <CodeBlock code={cloudflareCode} />
      </section>

      <section>
        <h2 id="vercel" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Vercel
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Deploy to Vercel with serverless functions or edge runtime.
        </p>
        <CodeBlock code={vercelCode} />
      </section>

      <section>
        <h2 id="environment" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Environment Variables
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Configure your application for production.
        </p>
        <CodeBlock code={envCode} language="bash" filename=".env.production" />
      </section>

      <section>
        <h2 id="health-checks" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Health Checks
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Add health check endpoints for load balancers and Kubernetes.
        </p>
        <CodeBlock code={healthCheckCode} showLineNumbers />
      </section>
    </div>
  );
}
