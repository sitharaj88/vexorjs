/**
 * New Project Command
 *
 * Scaffolds a new Vexor project with configurable templates.
 */

import { mkdir, writeFile, readdir } from 'fs/promises';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

interface NewCommandOptions {
  template: 'api' | 'fullstack' | 'minimal';
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  git: boolean;
  install: boolean;
}

/**
 * Project templates
 */
const templates = {
  api: {
    description: 'REST API with authentication and database',
    files: getApiTemplate,
  },
  fullstack: {
    description: 'Full-stack with frontend integration',
    files: getFullstackTemplate,
  },
  minimal: {
    description: 'Minimal setup with just the essentials',
    files: getMinimalTemplate,
  },
};

/**
 * New project command handler
 */
export async function newCommand(name: string, options: NewCommandOptions): Promise<void> {
  const projectPath = resolve(process.cwd(), name);

  console.log(`\n🚀 Creating new Vexor project: ${name}\n`);

  // Check if directory exists
  try {
    const files = await readdir(projectPath);
    if (files.length > 0) {
      console.error(`❌ Directory "${name}" already exists and is not empty`);
      process.exit(1);
    }
  } catch {
    // Directory doesn't exist, create it
    await mkdir(projectPath, { recursive: true });
  }

  // Get template files
  const templateFn = templates[options.template]?.files ?? templates.api.files;
  const files = templateFn(name);

  // Create files
  console.log(`📁 Creating project structure...`);
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = join(projectPath, filePath);
    const dir = join(fullPath, '..');
    await mkdir(dir, { recursive: true });
    await writeFile(fullPath, content);
    console.log(`   ✓ ${filePath}`);
  }

  // Initialize git
  if (options.git !== false) {
    console.log(`\n📦 Initializing git repository...`);
    try {
      execSync('git init', { cwd: projectPath, stdio: 'ignore' });
      console.log(`   ✓ Git initialized`);
    } catch {
      console.log(`   ⚠ Git initialization failed`);
    }
  }

  // Install dependencies
  if (options.install !== false) {
    console.log(`\n📥 Installing dependencies...`);
    const installCmd = {
      npm: 'npm install',
      yarn: 'yarn',
      pnpm: 'pnpm install',
      bun: 'bun install',
    }[options.packageManager];

    try {
      execSync(installCmd, { cwd: projectPath, stdio: 'inherit' });
    } catch {
      console.log(`   ⚠ Dependency installation failed. Run "${installCmd}" manually.`);
    }
  }

  // Success message
  console.log(`\n✅ Project created successfully!\n`);
  console.log(`   cd ${name}`);
  if (options.install === false) {
    console.log(`   ${options.packageManager} install`);
  }
  console.log(`   ${options.packageManager === 'npm' ? 'npm run' : options.packageManager} dev\n`);
}

/**
 * API template files
 */
function getApiTemplate(name: string): Record<string, string> {
  return {
    'package.json': JSON.stringify({
      name,
      version: '0.0.1',
      type: 'module',
      scripts: {
        dev: 'tsx watch src/index.ts',
        build: 'tsup src/index.ts --format esm --dts',
        start: 'node dist/index.js',
        'db:migrate': 'vexor db:migrate',
        'db:rollback': 'vexor db:rollback',
      },
      dependencies: {
        vexor: '^0.0.1',
        'vexor-orm': '^0.0.1',
      },
      devDependencies: {
        '@types/node': '^22.0.0',
        tsup: '^8.5.0',
        tsx: '^4.0.0',
        typescript: '^5.8.0',
        'vexor-cli': '^0.0.1',
      },
    }, null, 2),

    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        outDir: './dist',
        rootDir: './src',
        declaration: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    }, null, 2),

    'src/index.ts': `/**
 * ${name} - Vexor Application
 */

import { Vexor, Type } from 'vexor';
import { db } from './db/index.js';
import { userRoutes } from './routes/users.js';

const app = new Vexor();

// Health check
app.get('/health', {
  response: {
    200: Type.Object({
      status: Type.String(),
      timestamp: Type.String(),
    }),
  },
}, async (ctx) => {
  return ctx.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Register routes
userRoutes(app);

// Start server
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.listen(port, () => {
  console.log(\`🚀 Server running at http://localhost:\${port}\`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\\nShutting down...');
  await db.close();
  process.exit(0);
});
`,

    'src/db/index.ts': `/**
 * Database Configuration
 */

import { connect, type Database } from 'vexor-orm';

export let db: Database;

export async function initDatabase(): Promise<Database> {
  db = await connect({
    driver: 'sqlite',
    filename: './data/app.db',
  });

  // Run migrations
  await db.migrate();

  return db;
}

// Initialize on import
initDatabase().catch(console.error);

export { db as default };
`,

    'src/db/schema.ts': `/**
 * Database Schema
 */

import { table, column } from 'vexor-orm';

export const users = table('users', {
  id: column.serial().primaryKey(),
  name: column.varchar(255).notNull(),
  email: column.varchar(255).unique().notNull(),
  password: column.varchar(255).notNull(),
  createdAt: column.timestamp().defaultNow(),
  updatedAt: column.timestamp().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
`,

    'src/routes/users.ts': `/**
 * User Routes
 */

import { Vexor, Type } from 'vexor';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

const UserSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  email: Type.String({ format: 'email' }),
  createdAt: Type.String(),
});

const CreateUserSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8 }),
});

export function userRoutes(app: Vexor): void {
  // List users
  app.get('/users', {
    response: {
      200: Type.Array(UserSchema),
    },
  }, async (ctx) => {
    const userList = await db.findMany(users);
    return ctx.json(userList.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt?.toISOString() ?? '',
    })));
  });

  // Get user by ID
  app.get('/users/:id', {
    params: Type.Object({ id: Type.String() }),
    response: {
      200: UserSchema,
      404: Type.Object({ error: Type.String() }),
    },
  }, async (ctx) => {
    const { id } = ctx.params;
    const user = await db.findOne(users, { id: parseInt(id) });

    if (!user) {
      return ctx.json({ error: 'User not found' }, 404);
    }

    return ctx.json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt?.toISOString() ?? '',
    });
  });

  // Create user
  app.post('/users', {
    body: CreateUserSchema,
    response: {
      201: UserSchema,
      400: Type.Object({ error: Type.String() }),
    },
  }, async (ctx) => {
    const { name, email, password } = ctx.body;

    // Check if email exists
    const existing = await db.findOne(users, { email });
    if (existing) {
      return ctx.json({ error: 'Email already exists' }, 400);
    }

    // Create user (password should be hashed in production)
    const user = await db.insertInto(users, {
      name,
      email,
      password, // Hash this in production!
    });

    return ctx.json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt?.toISOString() ?? '',
    }, 201);
  });
}
`,

    '.gitignore': `node_modules/
dist/
data/
.env
.env.local
*.log
.DS_Store
`,

    '.env.example': `# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=./data/app.db
`,

    'README.md': `# ${name}

A Vexor application.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

## Database

\`\`\`bash
# Run migrations
npm run db:migrate

# Rollback migrations
npm run db:rollback
\`\`\`
`,
  };
}

/**
 * Fullstack template files
 */
function getFullstackTemplate(name: string): Record<string, string> {
  const apiFiles = getApiTemplate(name);

  return {
    ...apiFiles,
    'src/index.ts': apiFiles['src/index.ts'].replace(
      'const port',
      `// Serve static files
app.get('/*', async (ctx) => {
  // In production, serve from dist/public
  return ctx.text('Frontend not built', 404);
});

const port`
    ),
    'public/index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
</head>
<body>
  <div id="app">
    <h1>Welcome to ${name}</h1>
    <p>Edit public/index.html to get started.</p>
  </div>
</body>
</html>
`,
  };
}

/**
 * Minimal template files
 */
function getMinimalTemplate(name: string): Record<string, string> {
  return {
    'package.json': JSON.stringify({
      name,
      version: '0.0.1',
      type: 'module',
      scripts: {
        dev: 'tsx watch src/index.ts',
        build: 'tsup src/index.ts --format esm',
        start: 'node dist/index.js',
      },
      dependencies: {
        vexor: '^0.0.1',
      },
      devDependencies: {
        '@types/node': '^22.0.0',
        tsup: '^8.5.0',
        tsx: '^4.0.0',
        typescript: '^5.8.0',
      },
    }, null, 2),

    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        outDir: './dist',
        rootDir: './src',
      },
      include: ['src/**/*'],
    }, null, 2),

    'src/index.ts': `import { Vexor } from 'vexor';

const app = new Vexor();

app.get('/', async (ctx) => {
  return ctx.json({ message: 'Hello from Vexor!' });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
`,

    '.gitignore': `node_modules/
dist/
.env
`,
  };
}
