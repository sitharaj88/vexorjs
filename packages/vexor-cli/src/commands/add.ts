/**
 * Add Command
 *
 * Adds integrations, plugins, and features to Vexor projects.
 */

import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { resolve, join } from 'path';
import { execSync } from 'child_process';
import ora from 'ora';
import prompts from 'prompts';
import { logger } from '../utils/logger.js';

interface Integration {
  name: string;
  description: string;
  packages: {
    dependencies?: string[];
    devDependencies?: string[];
  };
  files?: Record<string, string>;
  scripts?: Record<string, string>;
  postInstall?: string[];
}

/**
 * Available integrations
 */
const integrations: Record<string, Integration> = {
  prisma: {
    name: 'Prisma ORM',
    description: 'Next-generation ORM for Node.js & TypeScript',
    packages: {
      dependencies: ['@prisma/client'],
      devDependencies: ['prisma'],
    },
    files: {
      'prisma/schema.prisma': `// Prisma Schema
// https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`,
    },
    scripts: {
      'db:generate': 'prisma generate',
      'db:push': 'prisma db push',
      'db:studio': 'prisma studio',
    },
    postInstall: ['npx prisma generate'],
  },

  redis: {
    name: 'Redis',
    description: 'In-memory data store for caching and pub/sub',
    packages: {
      dependencies: ['ioredis'],
      devDependencies: ['@types/ioredis'],
    },
    files: {
      'src/lib/redis.ts': `import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

export { redis };
export default redis;
`,
    },
  },

  vitest: {
    name: 'Vitest',
    description: 'Fast unit testing framework',
    packages: {
      devDependencies: ['vitest', '@vitest/coverage-v8', '@vitest/ui'],
    },
    files: {
      'vitest.config.ts': `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
`,
      'src/__tests__/example.test.ts': `import { describe, it, expect } from 'vitest';

describe('Example Test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });
});
`,
    },
    scripts: {
      test: 'vitest',
      'test:ui': 'vitest --ui',
      'test:coverage': 'vitest run --coverage',
    },
  },

  docker: {
    name: 'Docker',
    description: 'Containerization for production deployments',
    packages: {},
    files: {
      Dockerfile: `# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 vexor
USER vexor

COPY --from=builder --chown=vexor:nodejs /app/dist ./dist
COPY --from=builder --chown=vexor:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=vexor:nodejs /app/package.json ./

EXPOSE 3000
ENV PORT=3000

CMD ["node", "dist/index.js"]
`,
      '.dockerignore': `node_modules
dist
.git
.env
.env.local
*.log
.DS_Store
coverage
.nyc_output
`,
      'docker-compose.yml': `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: vexor_app
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`,
    },
    scripts: {
      'docker:build': 'docker build -t vexor-app .',
      'docker:run': 'docker run -p 3000:3000 vexor-app',
      'docker:compose': 'docker-compose up -d',
    },
  },

  eslint: {
    name: 'ESLint + Prettier',
    description: 'Code linting and formatting',
    packages: {
      devDependencies: [
        'eslint',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'prettier',
        'eslint-config-prettier',
        'eslint-plugin-prettier',
      ],
    },
    files: {
      'eslint.config.js': `import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default [
  eslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
];
`,
      '.prettierrc': `{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
`,
      '.prettierignore': `dist
node_modules
coverage
*.log
`,
    },
    scripts: {
      lint: 'eslint src/',
      'lint:fix': 'eslint src/ --fix',
      format: 'prettier --write src/',
    },
  },

  github: {
    name: 'GitHub Actions',
    description: 'CI/CD workflows for GitHub',
    packages: {},
    files: {
      '.github/workflows/ci.yml': `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
`,
      '.github/workflows/release.yml': `name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
`,
    },
  },

  swagger: {
    name: 'Swagger/OpenAPI',
    description: 'API documentation with Swagger UI',
    packages: {
      dependencies: ['swagger-ui-express'],
      devDependencies: ['@types/swagger-ui-express'],
    },
    files: {
      'src/openapi.ts': `import { OpenAPIDocument } from '@vexorjs/core';

export const openApiSpec: OpenAPIDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Vexor API',
    version: '1.0.0',
    description: 'API documentation',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  paths: {},
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};
`,
    },
  },

  sentry: {
    name: 'Sentry',
    description: 'Error tracking and performance monitoring',
    packages: {
      dependencies: ['@sentry/node'],
    },
    files: {
      'src/lib/sentry.ts': `import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
});

export { Sentry };
export default Sentry;
`,
    },
  },
};

/**
 * Check if file exists
 */
async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect package manager
 */
async function detectPackageManager(): Promise<'npm' | 'yarn' | 'pnpm' | 'bun'> {
  const cwd = process.cwd();
  if (await fileExists(join(cwd, 'bun.lockb'))) return 'bun';
  if (await fileExists(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (await fileExists(join(cwd, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

/**
 * Install packages
 */
async function installPackages(
  packages: string[],
  isDev: boolean,
  pm: 'npm' | 'yarn' | 'pnpm' | 'bun'
): Promise<void> {
  if (packages.length === 0) return;

  const commands = {
    npm: isDev ? `npm install -D ${packages.join(' ')}` : `npm install ${packages.join(' ')}`,
    yarn: isDev ? `yarn add -D ${packages.join(' ')}` : `yarn add ${packages.join(' ')}`,
    pnpm: isDev ? `pnpm add -D ${packages.join(' ')}` : `pnpm add ${packages.join(' ')}`,
    bun: isDev ? `bun add -d ${packages.join(' ')}` : `bun add ${packages.join(' ')}`,
  };

  execSync(commands[pm], { stdio: 'inherit' });
}

/**
 * Update package.json scripts
 */
async function updatePackageScripts(scripts: Record<string, string>): Promise<void> {
  const pkgPath = resolve(process.cwd(), 'package.json');
  const content = await readFile(pkgPath, 'utf-8');
  const pkg = JSON.parse(content);

  pkg.scripts = { ...pkg.scripts, ...scripts };

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

/**
 * Add command - adds an integration to the project
 */
export async function addCommand(name?: string): Promise<void> {
  // Check if in a Vexor project
  if (!(await fileExists(resolve(process.cwd(), 'package.json')))) {
    logger.error('Not in a Vexor project. Run this command from your project root.');
    process.exit(1);
  }

  let integrationName = name;

  // Interactive mode if no name provided
  if (!integrationName) {
    const choices = Object.entries(integrations).map(([key, value]) => ({
      title: value.name,
      description: value.description,
      value: key,
    }));

    const response = await prompts({
      type: 'select',
      name: 'integration',
      message: 'Which integration would you like to add?',
      choices,
    });

    if (!response.integration) {
      logger.info('No integration selected');
      return;
    }

    integrationName = response.integration;
  }

  if (!integrationName) {
    logger.error('No integration specified');
    process.exit(1);
  }

  const integration = integrations[integrationName as keyof typeof integrations];

  if (!integration) {
    logger.error(`Unknown integration: ${integrationName}`);
    logger.blank();
    logger.info('Available integrations:');
    logger.list(Object.entries(integrations).map(([key, val]) => `${key} - ${val.description}`));
    process.exit(1);
  }

  logger.title(`Adding ${integration.name}`);
  logger.subtitle(integration.description);
  logger.blank();

  const pm = await detectPackageManager();

  // Install dependencies
  if (integration.packages.dependencies?.length) {
    const spinner = ora('Installing dependencies...').start();
    try {
      await installPackages(integration.packages.dependencies, false, pm);
      spinner.succeed('Dependencies installed');
    } catch (error) {
      spinner.fail('Failed to install dependencies');
      throw error;
    }
  }

  // Install dev dependencies
  if (integration.packages.devDependencies?.length) {
    const spinner = ora('Installing dev dependencies...').start();
    try {
      await installPackages(integration.packages.devDependencies, true, pm);
      spinner.succeed('Dev dependencies installed');
    } catch (error) {
      spinner.fail('Failed to install dev dependencies');
      throw error;
    }
  }

  // Create files
  if (integration.files) {
    const spinner = ora('Creating files...').start();
    try {
      for (const [filePath, content] of Object.entries(integration.files)) {
        const fullPath = resolve(process.cwd(), filePath);
        const dir = join(fullPath, '..');
        await mkdir(dir, { recursive: true });
        await writeFile(fullPath, content as string);
      }
      spinner.succeed('Files created');
    } catch (error) {
      spinner.fail('Failed to create files');
      throw error;
    }
  }

  // Add scripts
  if (integration.scripts) {
    const spinner = ora('Adding scripts...').start();
    try {
      await updatePackageScripts(integration.scripts);
      spinner.succeed('Scripts added to package.json');
    } catch (error) {
      spinner.fail('Failed to add scripts');
      throw error;
    }
  }

  // Run post-install commands
  if (integration.postInstall?.length) {
    for (const cmd of integration.postInstall) {
      const spinner = ora(`Running: ${cmd}`).start();
      try {
        execSync(cmd, { stdio: 'pipe' });
        spinner.succeed(`Completed: ${cmd}`);
      } catch {
        spinner.warn(`Warning: ${cmd} failed (may need manual setup)`);
      }
    }
  }

  logger.blank();
  logger.success(`${integration.name} added successfully!`);

  // Show next steps
  if (integration.scripts) {
    logger.blank();
    logger.info('New scripts available:');
    logger.list(Object.entries(integration.scripts).map(([k, v]) => `${pm} run ${k}`));
  }
}

/**
 * List available integrations
 */
export async function listIntegrationsCommand(): Promise<void> {
  logger.title('Available Integrations');
  logger.blank();

  const rows: string[][] = Object.entries(integrations).map(([key, val]) => [
    key,
    val.name,
    val.description,
  ]);

  logger.table(['Command', 'Name', 'Description'], rows);
  logger.blank();
  logger.info('Usage: vexor add <integration>');
  logger.info('       vexor add (interactive mode)');
}

export default { addCommand, listIntegrationsCommand };
