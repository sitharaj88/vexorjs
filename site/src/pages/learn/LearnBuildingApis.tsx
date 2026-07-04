import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const authCode = `import { Vexor, Type, type VexorContext } from '@vexorjs/core';
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

// Auth guard - a preHandler hook that protects routes.
// Hooks receive only the context. Returning a Response
// short-circuits the pipeline; returning nothing continues.
async function authGuard(ctx: VexorContext) {
  const authHeader = ctx.header('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return ctx.status(401).json({ error: 'Missing authentication token' });
  }

  try {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    ctx.set('user', payload); // Attach user to context state
  } catch {
    return ctx.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Protected route - attach the guard via route hooks
app.get('/api/profile', {
  hooks: { preHandler: [authGuard] }
}, async (ctx) => {
  const user = ctx.get<{ userId: string; role: string }>('user')!;
  return ctx.json({ userId: user.userId, role: user.role });
});

// Role-based access control
function requireRole(...roles: string[]) {
  return async (ctx: VexorContext) => {
    const user = ctx.get<{ role?: string }>('user');
    if (!user?.role || !roles.includes(user.role)) {
      return ctx.status(403).json({ error: 'Insufficient permissions' });
    }
  };
}

// Admin-only route - hooks run in order
app.delete('/api/users/:id', {
  hooks: { preHandler: [authGuard, requireRole('admin')] }
}, async (ctx) => {
  await deleteUser(ctx.params.id);
  return ctx.empty(); // 204 No Content
});`;

const databasePatternsCode = `import { table, column, createConnection, eq, and } from '@vexorjs/orm';

// Define your schema with table() and column()
const users = table('users', {
  id:        column.serial().primaryKey(),
  name:      column.varchar(255).notNull(),
  email:     column.varchar(255).notNull().unique(),
  role:      column.enum(['admin', 'user', 'moderator']).default('user'),
  isActive:  column.boolean().default(true),
  createdAt: column.timestamp().defaultNow(),
});

const posts = table('posts', {
  id:        column.serial().primaryKey(),
  title:     column.varchar(255).notNull(),
  content:   column.text(),
  authorId:  column.integer().references(() => ({ table: 'users', column: 'id' })),
  status:    column.enum(['draft', 'published', 'archived']).default('draft'),
  views:     column.integer().default(0),
  createdAt: column.timestamp().defaultNow(),
});

// Connect to the database
const db = await createConnection({
  driver: 'postgres',
  connectionString: process.env.DATABASE_URL,
});

// CRUD Operations
// Create
const newUser = await db
  .insert(users)
  .values({ name: 'Jane Doe', email: 'jane@example.com' })
  .returning();

// Read with filters
const activeUsers = await db
  .select()
  .from(users)
  .where(and(
    eq(users.isActive, true),
    eq(users.role, 'user')
  ))
  .orderBy(users.createdAt, 'desc')
  .limit(20);

// Update
await db
  .update(users)
  .set({ name: 'Jane Smith' })
  .where(eq(users.id, newUser.id));

// Delete
await db
  .delete(users)
  .where(eq(users.id, newUser.id));

// Find published posts, newest first
const published = await db
  .select()
  .from(posts)
  .where(eq(posts.status, 'published'))
  .orderBy(posts.createdAt, 'desc')
  .limit(10);`;

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

class ConflictError extends AppError {
  constructor(public details: Record<string, string>) {
    super(409, 'Resource conflict', 'CONFLICT');
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
        ...(error instanceof ConflictError && { details: error.details })
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
  const user = await findUserById(ctx.params.id);
  if (!user) throw new NotFoundError('User', ctx.params.id);
  return ctx.json(user);
});

app.post('/api/users', async (ctx) => {
  const { email } = await ctx.body<{ email: string }>();
  const exists = await findUserByEmail(email);
  if (exists) {
    throw new ConflictError({ email: 'Email already registered' });
  }
  // ... create user
});`;

const validationCode = `import { Vexor, Type } from '@vexorjs/core';

const app = new Vexor();

// Comprehensive validation schemas.
// Properties are REQUIRED by default - wrap them in
// Type.Optional(...) to make them optional.
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
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
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

// Route with full validation.
// If validation fails, Vexor responds with 400 and:
//   { error, code: 'VALIDATION_ERROR', issues: [...] }
app.post('/api/users', {
  body: CreateUserSchema,
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
  const users = await listUsers({
    page: page ?? 1,
    limit: limit ?? 20,
    sort: sort ?? 'createdAt',
    order: order ?? 'desc',
  });
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

    it('should reject invalid email with a schema validation error', async () => {
      const res = await request('POST', '/api/users', {
        name: 'Jane',
        email: 'not-an-email',
        password: 'secure123!'
      });

      // Vexor's schema validation responds with 400
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.code).toBe('VALIDATION_ERROR');
      expect(data.issues.length).toBeGreaterThan(0);
    });

    it('should reject duplicate email', async () => {
      // First create
      await request('POST', '/api/users', {
        name: 'Jane', email: 'dup@test.com', password: 'secure123!'
      });

      // Duplicate attempt - handled by our custom ConflictError (409)
      const res = await request('POST', '/api/users', {
        name: 'Jane 2', email: 'dup@test.com', password: 'secure123!'
      });

      expect(res.status).toBe(409);
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
  const formData = await ctx.readFormData();
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

const chapters = [
  { num: '01', title: 'Authentication & JWT', desc: 'Secure your API with tokens and roles', color: 'from-red-500 to-orange-500' },
  { num: '02', title: 'Database Patterns', desc: 'ORM, schemas, queries, and filters', color: 'from-emerald-500 to-teal-500' },
  { num: '03', title: 'Error Handling', desc: 'Graceful errors and custom exceptions', color: 'from-yellow-500 to-amber-500' },
  { num: '04', title: 'Input Validation', desc: 'Schema-based validation with types', color: 'from-violet-500 to-purple-500' },
  { num: '05', title: 'File Uploads', desc: 'Handle files and streaming data', color: 'from-pink-500 to-rose-500' },
  { num: '06', title: 'Testing APIs', desc: 'Unit and integration testing patterns', color: 'from-cyan-500 to-blue-500' },
];

export default function LearnBuildingApis() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Intermediate
        </div>
        <h1 id="building-apis" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Building APIs
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
          Level up from basics to building production-grade APIs. Learn authentication, database patterns,
          error handling, validation, testing, and more.
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

      {/* Chapter 1: Authentication */}
      <section id="authentication">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-red-500 mr-2">01</span> Authentication & Authorization
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Authentication verifies <em>who</em> the user is. Authorization determines <em>what</em> they can do.
          Here's how to implement both using Vexor's hook system and token-based auth. A hook receives the
          context and can <strong>return a Response to short-circuit</strong> the pipeline -- that's how the
          guard below rejects unauthenticated requests before the handler ever runs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl">
            <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Token Flow</h4>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <p>1. Client sends credentials to <code className="prose-code">/auth/login</code></p>
              <p>2. Server validates and returns a JWT token</p>
              <p>3. Client includes token in <code className="prose-code">Authorization: Bearer &lt;token&gt;</code></p>
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

        <InfoBlock variant="info" title="Route hooks">
          Per-route middleware is attached through the route options as{' '}
          <code className="prose-code">{'{ hooks: { preHandler: [...] } }'}</code>. Hooks run in order,
          and any hook that returns a <code className="prose-code">Response</code> stops the chain.
          Use <code className="prose-code">ctx.set()</code> / <code className="prose-code">ctx.get()</code>{' '}
          to pass data (like the authenticated user) from a hook to the handler. Vexor also ships a
          full-featured <Link to="/auth/authentication" className="underline">JWT auth module</Link> --
          the hand-rolled token here is for learning purposes.
        </InfoBlock>
      </section>

      {/* Chapter 2: Database */}
      <section id="database">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-emerald-500 mr-2">02</span> Database Patterns with Vexor ORM
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor ORM provides a type-safe, fluent query builder. Define schemas, run queries, and filter
          results with full TypeScript inference.
        </p>
        <CodeBlock code={databasePatternsCode} filename="database.ts" showLineNumbers />
        <InfoBlock variant="tip" title="Go deeper">
          This is just a taste. The <Link to="/orm" className="underline">Vexor ORM section</Link> covers{' '}
          <Link to="/orm/schema" className="underline">schema definition</Link>,{' '}
          <Link to="/orm/queries" className="underline">queries and joins</Link>,{' '}
          <Link to="/orm/migrations" className="underline">migrations</Link>, and{' '}
          <Link to="/orm/relations" className="underline">relations</Link> in depth.
        </InfoBlock>
      </section>

      {/* Chapter 3: Error Handling */}
      <section id="error-handling">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-yellow-500 mr-2">03</span> Error Handling Strategies
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A well-designed error handling system makes your API predictable and debuggable. Use custom error
          classes and a centralized error handler for consistent responses.
        </p>
        <CodeBlock code={errorHandlingCode} filename="errors.ts" showLineNumbers />

        <InfoBlock variant="warning" title="Best Practice">
          Always return consistent error shapes. Clients should be able to rely on{' '}
          <code className="prose-code">error.code</code> and{' '}
          <code className="prose-code">error.message</code> being present in every error response.
          Note that <strong>schema validation errors never reach your error handler</strong>: Vexor rejects
          them before the handler runs with a <code className="prose-code">400</code> response and the{' '}
          <code className="prose-code">VALIDATION_ERROR</code> code.
        </InfoBlock>
      </section>

      {/* Chapter 4: Validation */}
      <section id="validation">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-violet-500 mr-2">04</span> Input Validation & Security
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Never trust user input. Vexor's schema system validates request bodies, query parameters, and route
          params at the framework level with zero extra code. Schemas are compiled once at route registration
          into fast validators, so per-request validation stays cheap.
        </p>
        <CodeBlock code={validationCode} filename="validation.ts" showLineNumbers />
        <InfoBlock variant="info" title="Failure shape">
          A failed validation responds with status <code className="prose-code">400</code> and body{' '}
          <code className="prose-code">{"{ error: 'Validation Error', code: 'VALIDATION_ERROR', issues: [...] }"}</code>.
          Each issue includes the failing <code className="prose-code">path</code> (prefixed with{' '}
          <code className="prose-code">body</code>, <code className="prose-code">query</code>, or{' '}
          <code className="prose-code">params</code>) and a human-readable message.
        </InfoBlock>
      </section>

      {/* Chapter 5: File Uploads */}
      <section id="file-uploads">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-pink-500 mr-2">05</span> File Uploads & Streaming
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Handle file uploads with validation for type, size, and content. Read multipart form data with{' '}
          <code className="prose-code">await ctx.readFormData()</code>, which returns a standard{' '}
          <code className="prose-code">FormData</code> object.
        </p>
        <CodeBlock code={fileUploadCode} filename="upload.ts" showLineNumbers />
      </section>

      {/* Chapter 6: Testing */}
      <section id="testing">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          <span className="text-cyan-500 mr-2">06</span> Testing Your APIs
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor provides a <code className="prose-code">fetch</code> method
          for in-process HTTP testing. No need to start a real server -- tests run fast and reliably.
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
              Test complete routes including hooks, validation, and database interaction.
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
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next-steps" className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Level Up to Architecture
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          You can now build solid APIs. Next, learn system design, microservices, event-driven architecture,
          and patterns used at scale.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/learn/architecture" className="btn-primary">
            Continue to Architecture <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/learn" className="btn-secondary">
            Back to Learning Path
          </Link>
        </div>
      </section>
    </div>
  );
}
