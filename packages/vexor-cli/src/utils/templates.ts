export interface ProjectTemplate {
  name: string;
  description: string;
  files: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

export const templates: Record<string, ProjectTemplate> = {
  api: {
    name: 'REST API',
    description: 'Full-featured REST API with authentication, database, and validation',
    dependencies: {
      '@vexorjs/core': '^1.0.0',
      '@vexorjs/orm': '^1.0.0',
    },
    devDependencies: {
      '@types/node': '^22.0.0',
      'typescript': '^5.8.0',
      'tsx': '^4.7.0',
    },
    scripts: {
      'dev': 'tsx watch src/index.ts',
      'build': 'tsc',
      'start': 'node dist/index.js',
      'db:migrate': 'vexor db:migrate',
      'db:seed': 'vexor db:seed',
    },
    files: {
      'src/index.ts': `import { Vexor, cors, rateLimit, createLogger } from '@vexorjs/core';
import { userRoutes } from './routes/users';
import { authRoutes } from './routes/auth';
import { db } from './db';

const app = new Vexor({
  logging: { level: process.env.LOG_LEVEL || 'info' }
});

// Global middleware
app.use(cors());
app.use(rateLimit({ max: 100, windowMs: 60000 }));

// Health check
app.get('/health', (ctx) => {
  return ctx.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.group('/api/v1', (api) => {
  api.use('/auth', authRoutes);
  api.use('/users', userRoutes);
});

// Start server
const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
  console.log(\`🚀 Server running on http://localhost:\${port}\`);
  console.log(\`📚 API docs at http://localhost:\${port}/docs\`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await db.close();
  process.exit(0);
});
`,
      'src/routes/users.ts': `import { Vexor, Type } from '@vexorjs/core';
import { UserService } from '../services/user';
import { authMiddleware } from '../middleware/auth';

const router = new Vexor();
const userService = new UserService();

// Get all users
router.get('/', authMiddleware, async (ctx) => {
  const users = await userService.findAll();
  return ctx.json(users);
});

// Get user by ID
router.get('/:id', {
  params: Type.Object({ id: Type.String() })
}, async (ctx) => {
  const user = await userService.findById(ctx.params.id);
  if (!user) {
    return ctx.status(404).json({ error: 'User not found' });
  }
  return ctx.json(user);
});

// Create user
router.post('/', {
  body: Type.Object({
    name: Type.String({ minLength: 1, maxLength: 100 }),
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8 })
  })
}, async (ctx) => {
  const user = await userService.create(ctx.body);
  return ctx.status(201).json(user);
});

// Update user
router.put('/:id', {
  params: Type.Object({ id: Type.String() }),
  body: Type.Object({
    name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
    email: Type.Optional(Type.String({ format: 'email' }))
  })
}, authMiddleware, async (ctx) => {
  const user = await userService.update(ctx.params.id, ctx.body);
  return ctx.json(user);
});

// Delete user
router.delete('/:id', {
  params: Type.Object({ id: Type.String() })
}, authMiddleware, async (ctx) => {
  await userService.delete(ctx.params.id);
  return ctx.status(204).text('');
});

export { router as userRoutes };
`,
      'src/routes/auth.ts': `import { Vexor, Type, createJWT } from '@vexorjs/core';
import { UserService } from '../services/user';

const router = new Vexor();
const userService = new UserService();
const jwt = createJWT({ secret: process.env.JWT_SECRET || 'change-this-secret' });

// Login
router.post('/login', {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String()
  })
}, async (ctx) => {
  const { email, password } = ctx.body;

  const user = await userService.findByEmail(email);
  if (!user || !(await userService.verifyPassword(password, user.password))) {
    return ctx.status(401).json({ error: 'Invalid credentials' });
  }

  const token = await jwt.sign({
    sub: user.id,
    email: user.email
  }, { expiresIn: '24h' });

  return ctx.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// Register
router.post('/register', {
  body: Type.Object({
    name: Type.String({ minLength: 1, maxLength: 100 }),
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8 })
  })
}, async (ctx) => {
  const existingUser = await userService.findByEmail(ctx.body.email);
  if (existingUser) {
    return ctx.status(400).json({ error: 'Email already registered' });
  }

  const user = await userService.create(ctx.body);
  const token = await jwt.sign({
    sub: user.id,
    email: user.email
  }, { expiresIn: '24h' });

  return ctx.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// Get current user
router.get('/me', async (ctx) => {
  const header = ctx.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    return ctx.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = await jwt.verify(header.slice(7));
    const user = await userService.findById(payload.sub as string);
    return ctx.json({ id: user?.id, name: user?.name, email: user?.email });
  } catch {
    return ctx.status(401).json({ error: 'Invalid token' });
  }
});

export { router as authRoutes };
`,
      'src/services/user.ts': `import { db } from '../db';
import { users } from '../db/schema';
import { eq } from '@vexorjs/orm';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';

export class UserService {
  async findAll() {
    return db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt
    }).from(users);
  }

  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async create(data: { name: string; email: string; password: string }) {
    const hashedPassword = await this.hashPassword(data.password);
    const [user] = await db.insert(users).values({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    }).returning();
    return { id: user.id, name: user.name, email: user.email };
  }

  async update(id: string, data: { name?: string; email?: string }) {
    const [user] = await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return { id: user.id, name: user.name, email: user.email };
  }

  async delete(id: string) {
    await db.delete(users).where(eq(users.id, id));
  }

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const hash = createHash('sha256').update(password + salt).digest('hex');
    return \`\${salt}:\${hash}\`;
  }

  async verifyPassword(password: string, stored: string): Promise<boolean> {
    const [salt, hash] = stored.split(':');
    const testHash = createHash('sha256').update(password + salt).digest('hex');
    return timingSafeEqual(Buffer.from(hash), Buffer.from(testHash));
  }
}
`,
      'src/middleware/auth.ts': `import { VexorContext, createJWT } from '@vexorjs/core';

const jwt = createJWT({ secret: process.env.JWT_SECRET || 'change-this-secret' });

export async function authMiddleware(ctx: VexorContext, next: () => Promise<void>) {
  const header = ctx.headers.get('authorization');

  if (!header?.startsWith('Bearer ')) {
    return ctx.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  try {
    const token = header.slice(7);
    const payload = await jwt.verify(token);
    ctx.state.user = payload;
    await next();
  } catch (error) {
    return ctx.status(401).json({ error: 'Invalid or expired token' });
  }
}
`,
      'src/db/index.ts': `import { Database, PostgresDriver } from '@vexorjs/orm';

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/vexor_app';

export const db = new Database({
  driver: new PostgresDriver({
    connectionString: databaseUrl,
    pool: {
      min: 2,
      max: 10,
    }
  })
});
`,
      'src/db/schema.ts': `import { defineTable, column } from '@vexorjs/orm';

export const users = defineTable('users', {
  id: column.uuid().primaryKey().defaultRandom(),
  name: column.varchar(100).notNull(),
  email: column.varchar(255).unique().notNull(),
  password: column.varchar(255).notNull(),
  createdAt: column.timestamp().defaultNow(),
  updatedAt: column.timestamp().defaultNow(),
});
`,
      'src/db/migrations/001_create_users.ts': `import { Migration } from '@vexorjs/orm';

export const migration: Migration = {
  name: '001_create_users',

  async up(db) {
    await db.schema.createTable('users', (table) => {
      table.uuid('id').primaryKey().defaultRandom();
      table.varchar('name', 100).notNull();
      table.varchar('email', 255).unique().notNull();
      table.varchar('password', 255).notNull();
      table.timestamp('created_at').defaultNow();
      table.timestamp('updated_at').defaultNow();
    });

    await db.schema.createIndex('users', 'idx_users_email', ['email']);
  },

  async down(db) {
    await db.schema.dropTable('users');
  }
};
`,
      '.env.example': `# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/vexor_app

# Auth
JWT_SECRET=your-super-secret-key-change-this-in-production
`,
      '.gitignore': `node_modules/
dist/
.env
.env.local
*.log
.DS_Store
coverage/
`,
      'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
`,
      'README.md': `# {{name}}

A Vexor-powered REST API.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
\`\`\`

## Scripts

- \`npm run dev\` - Start development server with hot reload
- \`npm run build\` - Build for production
- \`npm start\` - Start production server
- \`npm run db:migrate\` - Run database migrations
- \`npm run db:seed\` - Seed the database

## API Endpoints

- \`POST /api/v1/auth/register\` - Register a new user
- \`POST /api/v1/auth/login\` - Login and get JWT token
- \`GET /api/v1/auth/me\` - Get current user
- \`GET /api/v1/users\` - List all users (requires auth)
- \`GET /api/v1/users/:id\` - Get user by ID
- \`POST /api/v1/users\` - Create a new user
- \`PUT /api/v1/users/:id\` - Update user (requires auth)
- \`DELETE /api/v1/users/:id\` - Delete user (requires auth)
`,
    },
  },

  minimal: {
    name: 'Minimal',
    description: 'Minimal setup with just the essentials',
    dependencies: {
      '@vexorjs/core': '^1.0.0',
    },
    devDependencies: {
      '@types/node': '^22.0.0',
      'typescript': '^5.8.0',
      'tsx': '^4.7.0',
    },
    scripts: {
      'dev': 'tsx watch src/index.ts',
      'build': 'tsc',
      'start': 'node dist/index.js',
    },
    files: {
      'src/index.ts': `import { Vexor } from '@vexorjs/core';

const app = new Vexor();

app.get('/', (ctx) => {
  return ctx.json({ message: 'Hello, Vexor!' });
});

app.get('/health', (ctx) => {
  return ctx.json({ status: 'ok' });
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
  console.log(\`Server running on http://localhost:\${port}\`);
});
`,
      '.gitignore': `node_modules/
dist/
.env
*.log
.DS_Store
`,
      'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}
`,
      'README.md': `# {{name}}

A minimal Vexor application.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`
`,
    },
  },

  microservice: {
    name: 'Microservice',
    description: 'Microservice with health checks, tracing, and resilience patterns',
    dependencies: {
      '@vexorjs/core': '^1.0.0',
    },
    devDependencies: {
      '@types/node': '^22.0.0',
      'typescript': '^5.8.0',
      'tsx': '^4.7.0',
    },
    scripts: {
      'dev': 'tsx watch src/index.ts',
      'build': 'tsc',
      'start': 'node dist/index.js',
    },
    files: {
      'src/index.ts': `import {
  Vexor,
  cors,
  compression,
  healthCheck,
  memoryCheck,
  createTracer,
  createCircuitBreaker,
  retry
} from '@vexorjs/core';

const app = new Vexor({
  logging: { level: 'info' }
});

// Initialize tracer for distributed tracing
const tracer = createTracer({
  serviceName: process.env.SERVICE_NAME || '{{name}}',
  endpoint: process.env.OTEL_ENDPOINT
});

// Circuit breaker for external services
const externalServiceBreaker = createCircuitBreaker({
  name: 'external-api',
  timeout: 5000,
  errorThreshold: 50,
  resetTimeout: 30000
});

// Middleware
app.use(cors());
app.use(compression());

// Health check with custom checks
app.use(healthCheck({
  path: '/health',
  checks: [
    memoryCheck('memory', { maxHeapUsed: 500 * 1024 * 1024 }),
    {
      name: 'ready',
      check: async () => true
    }
  ]
}));

// Liveness probe
app.get('/live', (ctx) => ctx.json({ status: 'alive' }));

// Ready probe
app.get('/ready', (ctx) => ctx.json({ status: 'ready' }));

// Example endpoint with retry and circuit breaker
app.get('/api/data', async (ctx) => {
  const span = tracer.startSpan('fetch-data');

  try {
    const data = await externalServiceBreaker.fire(async () => {
      return retry(async () => {
        // Simulate external API call
        return { items: [], timestamp: Date.now() };
      }, { retries: 3, minTimeout: 1000 });
    });

    span.setStatus('ok');
    return ctx.json(data);
  } catch (error) {
    span.setStatus('error');
    span.recordException(error as Error);
    return ctx.status(503).json({ error: 'Service unavailable' });
  } finally {
    span.end();
  }
});

// Metrics endpoint
app.get('/metrics', (ctx) => {
  return ctx.text(\`# HELP requests_total Total requests
# TYPE requests_total counter
requests_total 0
\`);
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
  console.log(\`🔧 Microservice running on http://localhost:\${port}\`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down...');
  tracer.shutdown();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
`,
      '.env.example': `PORT=3000
SERVICE_NAME={{name}}
OTEL_ENDPOINT=http://localhost:4318/v1/traces
`,
      '.gitignore': `node_modules/
dist/
.env
*.log
.DS_Store
`,
      'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}
`,
      'Dockerfile': `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
`,
      'README.md': `# {{name}}

A Vexor microservice with observability and resilience patterns.

## Features

- Health checks (/health, /live, /ready)
- Distributed tracing (OpenTelemetry)
- Circuit breaker for external services
- Retry with exponential backoff
- Prometheus metrics (/metrics)
- Docker ready

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Docker

\`\`\`bash
docker build -t {{name}} .
docker run -p 3000:3000 {{name}}
\`\`\`
`,
    },
  },

  websocket: {
    name: 'WebSocket',
    description: 'Real-time WebSocket server with rooms and pub/sub',
    dependencies: {
      '@vexorjs/core': '^1.0.0',
    },
    devDependencies: {
      '@types/node': '^22.0.0',
      'typescript': '^5.8.0',
      'tsx': '^4.7.0',
    },
    scripts: {
      'dev': 'tsx watch src/index.ts',
      'build': 'tsc',
      'start': 'node dist/index.js',
    },
    files: {
      'src/index.ts': `import { Vexor, Type, createEventBus, MemoryPubSubAdapter } from '@vexorjs/core';

const app = new Vexor();

// Create event bus for pub/sub
const eventBus = createEventBus({
  adapter: new MemoryPubSubAdapter()
});

// Track connected clients
const clients = new Map<string, { rooms: Set<string> }>();

// REST API
app.get('/health', (ctx) => ctx.json({ status: 'ok', clients: clients.size }));

// WebSocket chat endpoint
app.ws('/chat/:room', {
  message: Type.Object({
    type: Type.Union([
      Type.Literal('message'),
      Type.Literal('typing'),
      Type.Literal('join'),
      Type.Literal('leave')
    ]),
    content: Type.Optional(Type.String()),
    username: Type.String()
  })
}, {
  open(ws, ctx) {
    const room = ctx.params.room;
    const clientId = ws.id;

    // Track client
    clients.set(clientId, { rooms: new Set([room]) });

    // Subscribe to room
    ws.subscribe(\`room:\${room}\`);

    // Notify room of new user
    ws.publish(\`room:\${room}\`, JSON.stringify({
      type: 'system',
      content: 'A new user joined the room',
      timestamp: Date.now()
    }));

    console.log(\`Client \${clientId} joined room \${room}\`);
  },

  message(ws, data, ctx) {
    const room = ctx.params.room;

    // Broadcast message to room
    ws.publish(\`room:\${room}\`, JSON.stringify({
      ...data,
      from: ws.id,
      timestamp: Date.now()
    }));
  },

  close(ws, code, reason, ctx) {
    const room = ctx.params.room;
    const clientId = ws.id;

    // Clean up
    clients.delete(clientId);
    ws.unsubscribe(\`room:\${room}\`);

    // Notify room
    ws.publish(\`room:\${room}\`, JSON.stringify({
      type: 'system',
      content: 'A user left the room',
      timestamp: Date.now()
    }));

    console.log(\`Client \${clientId} left room \${room}\`);
  }
});

// SSE endpoint for notifications
app.get('/events', async (ctx) => {
  const stream = ctx.sse();

  stream.send({ event: 'connected', data: { timestamp: Date.now() } });

  // Subscribe to global events
  const unsubscribe = await eventBus.subscribe('notifications', (data) => {
    stream.send({ event: 'notification', data });
  });

  ctx.onClose(() => {
    unsubscribe();
    stream.close();
  });

  return stream.response();
});

// API to send notifications
app.post('/notify', {
  body: Type.Object({
    message: Type.String()
  })
}, async (ctx) => {
  await eventBus.publish('notifications', {
    message: ctx.body.message,
    timestamp: Date.now()
  });
  return ctx.json({ success: true });
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
  console.log(\`🔌 WebSocket server running on http://localhost:\${port}\`);
  console.log(\`   Connect to ws://localhost:\${port}/chat/:room\`);
});
`,
      'public/index.html': `<!DOCTYPE html>
<html>
<head>
  <title>Vexor Chat</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #1a1a2e; color: #eee; }
    #app { max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { margin-bottom: 20px; color: #00d9ff; }
    #messages { height: 400px; overflow-y: auto; background: #16213e; border-radius: 8px; padding: 10px; margin-bottom: 10px; }
    .message { padding: 8px 12px; margin: 4px 0; border-radius: 4px; background: #0f3460; }
    .message.system { background: #533483; font-style: italic; }
    #form { display: flex; gap: 10px; }
    input { flex: 1; padding: 10px; border: none; border-radius: 4px; background: #16213e; color: #eee; }
    button { padding: 10px 20px; border: none; border-radius: 4px; background: #00d9ff; color: #000; cursor: pointer; }
    button:hover { background: #00b8d4; }
  </style>
</head>
<body>
  <div id="app">
    <h1>Vexor Chat</h1>
    <div id="messages"></div>
    <form id="form">
      <input type="text" id="input" placeholder="Type a message..." autocomplete="off">
      <button type="submit">Send</button>
    </form>
  </div>
  <script>
    const room = 'general';
    const ws = new WebSocket(\`ws://\${location.host}/chat/\${room}\`);
    const messages = document.getElementById('messages');
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const username = 'User' + Math.floor(Math.random() * 1000);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const div = document.createElement('div');
      div.className = 'message' + (data.type === 'system' ? ' system' : '');
      div.textContent = data.type === 'system'
        ? data.content
        : \`\${data.username}: \${data.content}\`;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    };

    form.onsubmit = (e) => {
      e.preventDefault();
      if (input.value) {
        ws.send(JSON.stringify({
          type: 'message',
          content: input.value,
          username
        }));
        input.value = '';
      }
    };
  </script>
</body>
</html>
`,
      '.gitignore': `node_modules/
dist/
.env
*.log
`,
      'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}
`,
      'README.md': `# {{name}}

A real-time WebSocket application with Vexor.

## Features

- WebSocket rooms for chat
- Server-Sent Events for notifications
- Pub/Sub with event bus
- Client connection tracking

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:3000 to test the chat interface.

## Endpoints

- \`ws://localhost:3000/chat/:room\` - WebSocket chat
- \`GET /events\` - SSE stream
- \`POST /notify\` - Send notification
`,
    },
  },
};

export function getTemplateChoices() {
  return Object.entries(templates).map(([key, template]) => ({
    title: template.name,
    description: template.description,
    value: key,
  }));
}
