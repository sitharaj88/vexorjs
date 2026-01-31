import CodeBlock from '../components/CodeBlock';

const nodeDeployCode = `// server.ts
import { Vexor } from '@vexorjs/core';
import { createApp } from './app';

const app = createApp();

const port = parseInt(process.env.PORT || '3000');
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(\`Server running on http://\${host}:\${port}\`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await app.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await app.close();
  process.exit(0);
});`;

const dockerfileCode = `# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

CMD ["node", "dist/server.js"]`;

const dockerComposeCode = `version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=\${JWT_SECRET}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=myapp
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:`;

const bunDeployCode = `// server.ts (Bun)
import { Vexor } from '@vexorjs/core';
import { createApp } from './app';

const app = createApp();

const port = parseInt(Bun.env.PORT || '3000');

// Bun auto-detects and uses its native HTTP server
app.listen(port, () => {
  console.log(\`Bun server running on port \${port}\`);
});`;

const bunDockerCode = `FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "dist/server.js"]`;

const lambdaCode = `// lambda.ts
import { Vexor, createLambdaHandler } from '@vexorjs/core';

const app = new Vexor();

app.get('/hello', (ctx) => {
  return ctx.json({ message: 'Hello from Lambda!' });
});

app.get('/users/:id', (ctx) => {
  return ctx.json({ userId: ctx.params.id });
});

// Export Lambda handler
export const handler = createLambdaHandler(app);`;

const lambdaStreamingCode = `// lambda-streaming.ts
import { Vexor, createStreamingLambdaHandler } from '@vexorjs/core';

const app = new Vexor();

app.get('/stream', async (ctx) => {
  async function* generate() {
    for (let i = 0; i < 10; i++) {
      yield { count: i };
      await new Promise(r => setTimeout(r, 100));
    }
  }

  return ctx.stream(generate());
});

// Export streaming Lambda handler
export const handler = createStreamingLambdaHandler(app);`;

const samTemplateCode = `# template.yaml (AWS SAM)
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 30
    MemorySize: 256
    Runtime: nodejs20.x
    Environment:
      Variables:
        NODE_ENV: production

Resources:
  ApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: dist/lambda.handler
      Events:
        Api:
          Type: HttpApi
          Properties:
            Path: /{proxy+}
            Method: ANY
    Metadata:
      BuildMethod: esbuild
      BuildProperties:
        Minify: true
        Target: "es2022"
        Sourcemap: true
        EntryPoints:
          - src/lambda.ts

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint
    Value: !Sub "https://\${ServerlessHttpApi}.execute-api.\${AWS::Region}.amazonaws.com"`;

const cloudflareCode = `// worker.ts
import { Vexor } from '@vexorjs/core';

const app = new Vexor();

app.get('/', (ctx) => {
  return ctx.json({
    message: 'Hello from Cloudflare Workers!',
    cf: ctx.cf // Cloudflare-specific properties
  });
});

app.get('/geo', (ctx) => {
  return ctx.json({
    country: ctx.cf?.country,
    city: ctx.cf?.city,
    timezone: ctx.cf?.timezone
  });
});

// Export for Cloudflare Workers
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  }
};`;

const wranglerCode = `# wrangler.toml
name = "my-vexor-api"
main = "src/worker.ts"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "your-d1-database-id"`;

const vercelCode = `// api/index.ts (Vercel Edge)
import { Vexor } from '@vexorjs/core';

const app = new Vexor();

app.get('/api', (ctx) => {
  return ctx.json({
    message: 'Hello from Vercel Edge!',
    region: process.env.VERCEL_REGION
  });
});

app.get('/api/users/:id', (ctx) => {
  return ctx.json({ userId: ctx.params.id });
});

// Export for Vercel Edge
export const config = {
  runtime: 'edge'
};

export default app.fetch;`;

const vercelConfigCode = `// vercel.json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ],
  "functions": {
    "api/index.ts": {
      "runtime": "edge"
    }
  }
}`;

const pmCode = `# ecosystem.config.js (PM2)
module.exports = {
  apps: [{
    name: 'vexor-api',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3001
    }
  }]
};

# Commands:
# pm2 start ecosystem.config.js
# pm2 start ecosystem.config.js --env staging
# pm2 reload vexor-api
# pm2 logs vexor-api
# pm2 monit`;

const nginxCode = `# /etc/nginx/sites-available/vexor-api
upstream vexor_cluster {
    least_conn;
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    location / {
        proxy_pass http://vexor_cluster;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://vexor_cluster;
        proxy_connect_timeout 5s;
        proxy_read_timeout 5s;
    }
}`;

const envExampleCode = `# .env.example
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgres://user:password@localhost:5432/myapp

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3001

# Logging
LOG_LEVEL=info`;

export default function DeploymentPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-4">Deployment</h1>
        <p className="text-lg text-slate-400">
          Deploy Vexor applications to Node.js, Bun, AWS Lambda, Cloudflare Workers, and more.
        </p>
      </div>

      {/* Deployment Options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { name: 'Node.js', href: '#nodejs' },
          { name: 'Docker', href: '#docker' },
          { name: 'Bun', href: '#bun' },
          { name: 'AWS Lambda', href: '#lambda' },
          { name: 'Cloudflare', href: '#cloudflare' },
          { name: 'Vercel Edge', href: '#vercel' },
          { name: 'PM2 Cluster', href: '#pm2' },
          { name: 'Nginx', href: '#nginx' }
        ].map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-vexor-500/50 transition-colors text-center text-sm"
          >
            {item.name}
          </a>
        ))}
      </div>

      {/* Environment Variables */}
      <section id="env">
        <h2 className="text-2xl font-bold mb-4">Environment Variables</h2>
        <p className="text-slate-400 mb-4">
          Always use environment variables for configuration. Never commit secrets to version control.
        </p>
        <CodeBlock code={envExampleCode} filename=".env.example" showLineNumbers />
      </section>

      {/* Node.js */}
      <section id="nodejs">
        <h2 className="text-2xl font-bold mb-4">Node.js Deployment</h2>
        <p className="text-slate-400 mb-4">
          Standard Node.js deployment with graceful shutdown handling.
        </p>
        <CodeBlock code={nodeDeployCode} filename="server.ts" showLineNumbers />
      </section>

      {/* Docker */}
      <section id="docker">
        <h2 className="text-2xl font-bold mb-4">Docker</h2>
        <p className="text-slate-400 mb-4">
          Multi-stage Docker build for optimized production images.
        </p>
        <CodeBlock code={dockerfileCode} filename="Dockerfile" showLineNumbers />

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Docker Compose</h3>
          <p className="text-slate-400 mb-4">
            Full stack deployment with PostgreSQL and Redis.
          </p>
          <CodeBlock code={dockerComposeCode} filename="docker-compose.yml" showLineNumbers />
        </div>
      </section>

      {/* Bun */}
      <section id="bun">
        <h2 className="text-2xl font-bold mb-4">Bun Deployment</h2>
        <p className="text-slate-400 mb-4">
          Vexor automatically uses Bun's native HTTP server for maximum performance.
        </p>
        <CodeBlock code={bunDeployCode} filename="server.ts" showLineNumbers />

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Bun Dockerfile</h3>
          <CodeBlock code={bunDockerCode} filename="Dockerfile.bun" showLineNumbers />
        </div>

        <div className="mt-6 p-4 bg-vexor-500/10 border border-vexor-500/20 rounded-xl">
          <p className="text-sm text-slate-300">
            <strong className="text-vexor-400">Performance Tip:</strong> Bun's native HTTP server is significantly
            faster than Node.js. Expect 2-3x higher throughput for compute-bound workloads.
          </p>
        </div>
      </section>

      {/* AWS Lambda */}
      <section id="lambda">
        <h2 className="text-2xl font-bold mb-4">AWS Lambda</h2>
        <p className="text-slate-400 mb-4">
          Deploy as a serverless function with API Gateway.
        </p>
        <CodeBlock code={lambdaCode} filename="lambda.ts" showLineNumbers />

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Lambda Streaming</h3>
          <p className="text-slate-400 mb-4">
            Use response streaming for large responses or real-time data.
          </p>
          <CodeBlock code={lambdaStreamingCode} filename="lambda-streaming.ts" showLineNumbers />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">SAM Template</h3>
          <CodeBlock code={samTemplateCode} filename="template.yaml" showLineNumbers />
        </div>
      </section>

      {/* Cloudflare Workers */}
      <section id="cloudflare">
        <h2 className="text-2xl font-bold mb-4">Cloudflare Workers</h2>
        <p className="text-slate-400 mb-4">
          Deploy to the edge for ultra-low latency worldwide.
        </p>
        <CodeBlock code={cloudflareCode} filename="worker.ts" showLineNumbers />

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Wrangler Configuration</h3>
          <CodeBlock code={wranglerCode} filename="wrangler.toml" showLineNumbers />
        </div>
      </section>

      {/* Vercel Edge */}
      <section id="vercel">
        <h2 className="text-2xl font-bold mb-4">Vercel Edge</h2>
        <p className="text-slate-400 mb-4">
          Deploy to Vercel's edge network with zero configuration.
        </p>
        <CodeBlock code={vercelCode} filename="api/index.ts" showLineNumbers />

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Vercel Configuration</h3>
          <CodeBlock code={vercelConfigCode} filename="vercel.json" showLineNumbers />
        </div>
      </section>

      {/* PM2 */}
      <section id="pm2">
        <h2 className="text-2xl font-bold mb-4">PM2 Cluster Mode</h2>
        <p className="text-slate-400 mb-4">
          Run multiple instances with automatic load balancing and zero-downtime reloads.
        </p>
        <CodeBlock code={pmCode} filename="ecosystem.config.js" showLineNumbers />
      </section>

      {/* Nginx */}
      <section id="nginx">
        <h2 className="text-2xl font-bold mb-4">Nginx Reverse Proxy</h2>
        <p className="text-slate-400 mb-4">
          Production-ready Nginx configuration with SSL and load balancing.
        </p>
        <CodeBlock code={nginxCode} filename="nginx.conf" showLineNumbers />
      </section>

      {/* Best Practices */}
      <section className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
        <h2 className="text-xl font-bold mb-4">Production Checklist</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 text-vexor-400">Security</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Use HTTPS everywhere</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Set secure headers (CORS, CSP, HSTS)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Rate limit API endpoints</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Validate all inputs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Use environment variables for secrets</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-vexor-400">Performance</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Enable compression</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Use connection pooling for databases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Implement caching strategies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Monitor with health checks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Set up logging and tracing</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-vexor-400">Reliability</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Handle graceful shutdown</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Use circuit breakers for external services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Implement retry logic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Set appropriate timeouts</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-vexor-400">Operations</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Set up CI/CD pipelines</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Configure alerts and monitoring</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Plan for database backups</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">&#x2713;</span>
                <span>Document runbooks</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
