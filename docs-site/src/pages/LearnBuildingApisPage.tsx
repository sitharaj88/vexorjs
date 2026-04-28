import CodeBlock from '../components/CodeBlock';

const authCode = `import { Vexor, Type } from '@vexorjs/core';
import crypto from 'node:crypto';

const app = new Vexor();
const SECRET = 'your-secret-key'; // Use env vars in production!

// Simple JWT-like token (use a proper library in production)
function createToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 3600000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(\`\${header}.\${body}\`).digest('base64url');
  return \`\${header}.\${body}.\${signature}\`;
}

// Login endpoint
app.post('/auth/login', {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8 })
  })
}, async (ctx) => {
  const { email, password } = await ctx.body();

  // Validate credentials (check database in real app)
  const user = await findUserByEmail(email);
  if (!user || !await verifyPassword(password, user.passwordHash)) {
    return ctx.status(401).json({ error: 'Invalid credentials' });
  }

  const token = createToken({ userId: user.id, role: user.role });
  return ctx.json({ token, user: { id: user.id, email: user.email } });
});

// Auth middleware - protects routes
function authGuard() {
  return async (ctx: any, next: () => Promise<void>) => {
    const authHeader = ctx.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return ctx.status(401).json({ error: 'Missing authentication token' });
    }

    try {
      const token = authHeader.slice(7);
      const payload = verifyToken(token);
      ctx.state.user = payload; // Attach user to context
      await next();
    } catch {
      return ctx.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

// Protected route
app.get('/api/profile', authGuard(), async (ctx) => {
  const user = ctx.state.user;
  return ctx.json({ userId: user.userId, role: user.role });
});

// Role-based access control
function requireRole(...roles: string[]) {
  return async (ctx: any, next: () => Promise<void>) => {
    if (!roles.includes(ctx.state.user?.role)) {
      return ctx.status(403).json({ error: 'Insufficient permissions' });
    }
    await next();
  };
}

// Admin-only route
app.delete('/api/users/:id', authGuard(), requireRole('admin'), async (ctx) => {
  await deleteUser(ctx.params.id);
  return ctx.noContent();
});`;

const databasePatternsCode = `import { table, column, createDatabase, from, insert, update,
  deleteFrom, eq, and, select } from '@vexorjs/orm';
import { createPostgresDriver } from '@vexorjs/orm/postgres';

// Define your schema with table() and column()
const users = table('users', {
  id:        column.uuid().primaryKey().default('gen_random_uuid()'),
  name:      column.string().notNull(),
  email:     column.string().notNull().unique(),
  role:      column.enum(['admin', 'user', 'moderator']).default('user'),
  isActive:  column.boolean().default(true),
  createdAt: column.timestamp().default('now()'),
  updatedAt: column.timestamp().default('now()'),
});

const posts = table('posts', {
  id:        column.uuid().primaryKey().default('gen_random_uuid()'),
  title:     column.string().notNull(),
  content:   column.text(),
  authorId:  column.uuid().references('users', 'id'),
  status:    column.enum(['draft', 'published', 'archived']).default('draft'),
  views:     column.integer().default(0),
  createdAt: column.timestamp().default('now()'),
});

// Initialize database connection
const db = createDatabase({
  driver: createPostgresDriver({ connectionString: process.env.DATABASE_URL })
});

// CRUD Operations
// Create
const newUser = await insert(users)
  .values({ name: 'Jane Doe', email: 'jane@example.com' })
  .returning()
  .execute(db);

// Read with filters
const activeUsers = await from(users)
  .where(and(
    eq(users.columns.isActive, true),
    eq(users.columns.role, 'user')
  ))
  .orderBy('createdAt', 'desc')
  .limit(20)
  .execute(db);

// Update
await update(users)
  .set({ name: 'Jane Smith' })
  .where(eq(users.columns.id, newUser.id))
  .execute(db);

// Delete
await deleteFrom(users)
  .where(eq(users.columns.id, newUser.id))
  .execute(db);

// Select specific fields with joins
const postsWithAuthors = await from(posts)
  .innerJoin(users, eq(posts.columns.authorId, users.columns.id))
  .where(eq(posts.columns.status, 'published'))
  .select(posts.columns.title, posts.columns.createdAt, users.columns.name)
  .orderBy('createdAt', 'desc')
  .limit(10)
  .execute(db);`;

const errorHandlingCode = `import { Vexor } from '@vexorjs/core';

const app = new Vexor();

// Custom error classes for clean error handling
class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(404, \`\${resource} with id '\${id}' not found\`, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(public details: Record<string, string>) {
    super(422, 'Validation failed', 'VALIDATION_ERROR');
  }
}

// Global error handler
app.setErrorHandler(async (error, ctx) => {
  // Log all errors
  console.error(\`[\${new Date().toISOString()}] \${error.name}: \${error.message}\`);

  // Handle known errors
  if (error instanceof AppError) {
    return ctx.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error instanceof ValidationError && { details: error.details })
      }
    });
  }

  // Handle unknown errors (don't leak internals)
  return ctx.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});

// Usage in routes
app.get('/api/users/:id', async (ctx) => {
  const user = await db.users.findById(ctx.params.id);
  if (!user) throw new NotFoundError('User', ctx.params.id);
  return ctx.json(user);
});

app.post('/api/users', async (ctx) => {
  const { email } = await ctx.body();
  const exists = await db.users.findByEmail(email);
  if (exists) {
    throw new ValidationError({ email: 'Email already registered' });
  }
  // ... create user
});`;

const validationCode = `import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// Comprehensive validation schemas
const CreateUserSchema = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 50 }),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8, maxLength: 128 }),
  age: Type.Optional(Type.Integer({ minimum: 13, maximum: 150 })),
  preferences: Type.Optional(Type.Object({
    theme: Type.Union([Type.Literal('light'), Type.Literal('dark')]),
    language: Type.String({ minLength: 2, maxLength: 5 }),
    notifications: Type.Boolean()
  }))
});

// Query parameter validation
const PaginationSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
  sort: Type.Optional(Type.Union([
    Type.Literal('createdAt'),
    Type.Literal('name'),
    Type.Literal('email')
  ])),
  order: Type.Optional(Type.Union([
    Type.Literal('asc'),
    Type.Literal('desc')
  ]))
});

// Route with full validation
app.post('/api/users', {
  body: CreateUserSchema,
  // Vexor validates automatically and returns 422 with details
}, async (ctx) => {
  // ctx.body() is fully typed - TypeScript knows every field!
  const { name, email, password, age, preferences } = await ctx.body();
  const user = await createUser({ name, email, password, age, preferences });
  return ctx.status(201).json(user);
});

app.get('/api/users', {
  query: PaginationSchema
}, async (ctx) => {
  const { page, limit, sort, order } = ctx.query;
  const users = await db.users
    .orderBy(sort ?? 'createdAt', order ?? 'desc')
    .paginate(page ?? 1, limit ?? 20);
  return ctx.json(users);
});`;

const testingCode = `import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from '../src/app';

describe('User API', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    app = createApp(); // Your app factory function
  });

  // Helper to make test requests using app.fetch()
  async function request(method: string, path: string, body?: object) {
    return app.fetch(new Request(\`http://localhost\${path}\`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined
    }));
  }

  describe('POST /api/users', () => {
    it('should create a user with valid data', async () => {
      const res = await request('POST', '/api/users', {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'secure123!'
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toMatchObject({
        name: 'Jane Doe',
        email: 'jane@example.com'
      });
      expect(data).not.toHaveProperty('password');
    });

    it('should reject invalid email', async () => {
      const res = await request('POST', '/api/users', {
        name: 'Jane',
        email: 'not-an-email',
        password: 'secure123!'
      });

      expect(res.status).toBe(422);
      const data = await res.json();
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject duplicate email', async () => {
      // First create
      await request('POST', '/api/users', {
        name: 'Jane', email: 'dup@test.com', password: 'secure123!'
      });

      // Duplicate attempt
      const res = await request('POST', '/api/users', {
        name: 'Jane 2', email: 'dup@test.com', password: 'secure123!'
      });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const res = await request('GET', '/api/users/non-existent-id');
      expect(res.status).toBe(404);
    });
  });
});`;

const fileUploadCode = `import { Vexor } from '@vexorjs/core';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const app = new Vexor();

// Handle file uploads via FormData
app.post('/api/upload', async (ctx) => {
  const formData = await ctx.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return ctx.status(400).json({ error: 'No file provided' });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return ctx.status(422).json({ error: 'Only JPEG, PNG, and WebP images are allowed' });
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return ctx.status(422).json({ error: 'File size must be under 5MB' });
  }

  // Save to disk
  const uploadDir = join(process.cwd(), 'uploads');
  await mkdir(uploadDir, { recursive: true });

  const filename = \`\${Date.now()}-\${file.name}\`;
  await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  return ctx.status(201).json({
    filename,
    size: file.size,
    type: file.type,
    url: \`/uploads/\${filename}\`
  });
});`;

export default function LearnBuildingApisPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Intermediate
        </div>
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Building APIs</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
          Level up from basics to building production-grade APIs. Learn authentication, database patterns,
          error handling, validation, testing, and more.
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { num: '01', title: 'Authentication & JWT', desc: 'Secure your API with tokens and roles', color: 'from-red-500 to-orange-500' },
          { num: '02', title: 'Database Patterns', desc: 'ORM, schemas, queries, and joins', color: 'from-emerald-500 to-teal-500' },
          { num: '03', title: 'Error Handling', desc: 'Graceful errors and custom exceptions', color: 'from-yellow-500 to-amber-500' },
          { num: '04', title: 'Input Validation', desc: 'Schema-based validation with types', color: 'from-violet-500 to-purple-500' },
          { num: '05', title: 'File Uploads', desc: 'Handle files and streaming data', color: 'from-pink-500 to-rose-500' },
          { num: '06', title: 'Testing APIs', desc: 'Unit and integration testing patterns', color: 'from-cyan-500 to-blue-500' },
        ].map((item) => (
          <div key={item.num} className="relative p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-vexor-500/50 transition-colors">
            <span className={`text-xs font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
              CHAPTER {item.num}
            </span>
            <h3 className="font-semibold mt-1 text-slate-900 dark:text-white">{item.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Chapter 1: Authentication */}
      <section id="authentication">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          <span className="text-red-500 mr-2">01</span> Authentication & Authorization
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Authentication verifies <em>who</em> the user is. Authorization determines <em>what</em> they can do.
          Here's how to implement both using middleware and token-based auth.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Token Flow</h4>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <p>1. Client sends credentials to <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">/auth/login</code></p>
              <p>2. Server validates and returns a JWT token</p>
              <p>3. Client includes token in <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">Authorization: Bearer &lt;token&gt;</code></p>
              <p>4. Server verifies token on each request</p>
            </div>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Security Tips</h4>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <p>&#x2022; Always hash passwords (bcrypt/argon2)</p>
              <p>&#x2022; Set short token expiration times</p>
              <p>&#x2022; Use HTTPS in production</p>
              <p>&#x2022; Store secrets in environment variables</p>
            </div>
          </div>
        </div>

        <CodeBlock code={authCode} filename="auth.ts" showLineNumbers />
      </section>

      {/* Chapter 2: Database */}
      <section id="database">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          <span className="text-emerald-500 mr-2">02</span> Database Patterns with Vexor ORM
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor ORM provides a type-safe, fluent query builder. Define schemas, run queries, and manage
          relationships with full TypeScript inference.
        </p>
        <CodeBlock code={databasePatternsCode} filename="database.ts" showLineNumbers />
      </section>

      {/* Chapter 3: Error Handling */}
      <section id="error-handling">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          <span className="text-yellow-500 mr-2">03</span> Error Handling Strategies
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A well-designed error handling system makes your API predictable and debuggable. Use custom error
          classes and a centralized error handler for consistent responses.
        </p>
        <CodeBlock code={errorHandlingCode} filename="errors.ts" showLineNumbers />

        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <strong className="text-amber-600 dark:text-amber-400">Best Practice:</strong> Always return consistent error
            shapes. Clients should be able to rely on <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">error.code</code> and
            <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">error.message</code> being present in every error response.
          </p>
        </div>
      </section>

      {/* Chapter 4: Validation */}
      <section id="validation">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          <span className="text-violet-500 mr-2">04</span> Input Validation & Security
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Never trust user input. Vexor's schema system validates request bodies, query parameters, and route
          params at the framework level with zero extra code.
        </p>
        <CodeBlock code={validationCode} filename="validation.ts" showLineNumbers />
      </section>

      {/* Chapter 5: File Uploads */}
      <section id="file-uploads">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          <span className="text-pink-500 mr-2">05</span> File Uploads & Streaming
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Handle file uploads with validation for type, size, and content. Vexor parses multipart form data automatically.
        </p>
        <CodeBlock code={fileUploadCode} filename="upload.ts" showLineNumbers />
      </section>

      {/* Chapter 6: Testing */}
      <section id="testing">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
          <span className="text-cyan-500 mr-2">06</span> Testing Your APIs
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor provides a <code className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-sm">fetch</code> method
          for in-process HTTP testing. No need to start a real server — tests run fast and reliably.
        </p>
        <CodeBlock code={testingCode} filename="users.test.ts" showLineNumbers />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Unit Tests</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Test individual functions and utilities in isolation. Fast and focused.
            </p>
          </div>
          <div className="p-4 bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Integration Tests</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Test complete routes including middleware, validation, and database interaction.
            </p>
          </div>
          <div className="p-4 bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">E2E Tests</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Test the full application stack with a real server and database.
            </p>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="p-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl">
        <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Level Up to Architecture</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You can now build solid APIs. Next, learn system design, microservices, event-driven architecture,
          and patterns used at scale.
        </p>
        <a href="/learn/architecture" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium text-sm">
          Continue to Architecture &rarr;
        </a>
      </section>
    </div>
  );
}
