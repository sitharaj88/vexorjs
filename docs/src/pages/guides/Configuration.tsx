import CodeBlock from '../../components/CodeBlock';

const envFileCode = `# .env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgres://user:password@localhost:5432/mydb

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
SESSION_SECRET=another-secret-key

# External Services
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password

# Feature Flags
ENABLE_CACHE=true
ENABLE_RATE_LIMIT=true`;

const configModuleCode = `// src/config/index.ts
import { z } from 'zod';

// Define configuration schema
const configSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']),
  port: z.number().default(3000),

  database: z.object({
    url: z.string().url(),
    poolSize: z.number().default(10),
  }),

  redis: z.object({
    url: z.string().url().optional(),
  }),

  auth: z.object({
    jwtSecret: z.string().min(32),
    jwtExpiresIn: z.string().default('7d'),
    sessionSecret: z.string().min(32),
  }),

  features: z.object({
    enableCache: z.boolean().default(true),
    enableRateLimit: z.boolean().default(true),
  }),
});

// Parse and validate configuration
function loadConfig() {
  const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),

    database: {
      url: process.env.DATABASE_URL,
      poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    },

    redis: {
      url: process.env.REDIS_URL,
    },

    auth: {
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
      sessionSecret: process.env.SESSION_SECRET,
    },

    features: {
      enableCache: process.env.ENABLE_CACHE === 'true',
      enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true',
    },
  };

  // Validate and return
  return configSchema.parse(config);
}

export const config = loadConfig();
export type Config = z.infer<typeof configSchema>;`;

const appConfigCode = `// src/app.ts
import { Vexor } from '@vexorjs/core';
import { config } from './config';

const app = new Vexor({
  // Logger based on environment
  logger: config.nodeEnv !== 'test',

  // Trust proxy in production (behind load balancer)
  trustProxy: config.nodeEnv === 'production',

  // Body size limit
  bodyLimit: 1024 * 1024, // 1MB
});

// Environment-specific middleware
if (config.features.enableRateLimit) {
  app.addHook('preHandler', rateLimitMiddleware);
}

if (config.features.enableCache) {
  app.addHook('onSend', cacheMiddleware);
}

// Start server
app.listen(config.port).then(() => {
  console.log(\`Server running on port \${config.port} [\${config.nodeEnv}]\`);
});`;

const multiEnvCode = `# Directory structure
config/
├── default.ts      # Default values
├── development.ts  # Development overrides
├── production.ts   # Production overrides
└── test.ts         # Test overrides

# config/default.ts
export default {
  port: 3000,
  logLevel: 'info',
  database: {
    poolSize: 10,
  },
};

# config/development.ts
export default {
  logLevel: 'debug',
  database: {
    poolSize: 5,
  },
};

# config/production.ts
export default {
  logLevel: 'warn',
  database: {
    poolSize: 20,
  },
};

# Load based on NODE_ENV
import defaultConfig from './default';

const envConfig = await import(\`./\${process.env.NODE_ENV || 'development'}.ts\`);
export const config = { ...defaultConfig, ...envConfig.default };`;

const secretsCode = `// Never commit secrets to version control!

// Use environment variables
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

// For local development, use .env file
// For production, use:
// - Environment variables in your hosting platform
// - Secret managers (AWS Secrets Manager, HashiCorp Vault)
// - Kubernetes secrets

// Example: Load from AWS Secrets Manager
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

async function loadSecrets() {
  if (process.env.NODE_ENV === 'production') {
    const client = new SecretsManagerClient({ region: 'us-east-1' });
    const command = new GetSecretValueCommand({ SecretId: 'my-app/secrets' });
    const response = await client.send(command);
    return JSON.parse(response.SecretString!);
  }

  // In development, use .env
  return {
    jwtSecret: process.env.JWT_SECRET,
    dbPassword: process.env.DB_PASSWORD,
  };
}`;

const typeSafeConfigCode = `// Type-safe configuration access
import { config } from './config';

// TypeScript knows the shape
const port: number = config.port;
const isDev: boolean = config.nodeEnv === 'development';

// Use in handlers
app.get('/config', async (ctx) => {
  // Only expose safe config values
  return ctx.json({
    environment: config.nodeEnv,
    features: config.features,
  });
});

// Use for conditional logic
if (config.redis.url) {
  // Redis is configured, use it for caching
  const redis = new Redis(config.redis.url);
  app.register('cache', redis);
} else {
  // Fall back to in-memory cache
  app.register('cache', new MemoryCache());
}`;

export default function Configuration() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="configuration" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Configuration Guide
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Learn how to configure your Vexor application for different environments.
        </p>
      </div>

      <section>
        <h2 id="env-files" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Environment Variables
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use <code className="prose-code">.env</code> files for local development.
        </p>
        <CodeBlock code={envFileCode} language="bash" filename=".env" />
      </section>

      <section>
        <h2 id="config-module" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Configuration Module
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Create a centralized configuration module with validation.
        </p>
        <CodeBlock code={configModuleCode} showLineNumbers />
      </section>

      <section>
        <h2 id="app-config" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Using Configuration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Apply configuration to your Vexor application.
        </p>
        <CodeBlock code={appConfigCode} showLineNumbers />
      </section>

      <section>
        <h2 id="multi-env" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Multi-Environment Setup
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Organize configuration files by environment.
        </p>
        <CodeBlock code={multiEnvCode} />
      </section>

      <section>
        <h2 id="secrets" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Managing Secrets
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Securely manage sensitive configuration values.
        </p>
        <CodeBlock code={secretsCode} showLineNumbers />
      </section>

      <section>
        <h2 id="type-safe" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Type-Safe Configuration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Leverage TypeScript for configuration type safety.
        </p>
        <CodeBlock code={typeSafeConfigCode} />
      </section>
    </div>
  );
}
