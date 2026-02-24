import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const setupCode = `# Install testing dependencies
npm install -D vitest @vitest/coverage-v8 supertest @types/supertest`;

const vitestConfigCode = `// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/index.ts'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});`;

const setupFileCode = `// tests/setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest';
import { db } from '../src/db';

// Connect to the test database before all tests
beforeAll(async () => {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
    || 'postgres://postgres:test@localhost:5432/vexor_test';
  await db.connect();
});

// Clean up tables after each test
afterEach(async () => {
  await db.execute('TRUNCATE users, posts, sessions CASCADE');
});

// Disconnect after all tests
afterAll(async () => {
  await db.disconnect();
});`;

const unitTestRouteCode = `// tests/routes/users.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createMockContext } from '../helpers/mock-context';
import { getUserHandler, createUserHandler } from '../../src/routes/users';

describe('GET /users/:id handler', () => {
  it('should return a user when found', async () => {
    const ctx = createMockContext({
      params: { id: 'usr_123' },
    });

    // Mock the database call
    vi.spyOn(userService, 'findById').mockResolvedValue({
      id: 'usr_123',
      name: 'Alice',
      email: 'alice@example.com',
    });

    const response = await getUserHandler(ctx);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'usr_123',
      name: 'Alice',
      email: 'alice@example.com',
    });
  });

  it('should return 404 when user is not found', async () => {
    const ctx = createMockContext({
      params: { id: 'usr_nonexistent' },
    });

    vi.spyOn(userService, 'findById').mockResolvedValue(null);

    const response = await getUserHandler(ctx);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'NOT_FOUND',
      message: 'User not found',
    });
  });
});

describe('POST /users handler', () => {
  it('should create a user and return 201', async () => {
    const ctx = createMockContext({
      body: { name: 'Bob', email: 'bob@example.com' },
    });

    vi.spyOn(userService, 'create').mockResolvedValue({
      id: 'usr_456',
      name: 'Bob',
      email: 'bob@example.com',
    });

    const response = await createUserHandler(ctx);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(userService.create).toHaveBeenCalledWith({
      name: 'Bob',
      email: 'bob@example.com',
    });
  });
});`;

const mockContextCode = `// tests/helpers/mock-context.ts
import { Context } from '@vexorjs/core';

interface MockContextOptions {
  method?: string;
  path?: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: unknown;
}

export function createMockContext(options: MockContextOptions = {}): Context {
  const {
    method = 'GET',
    path = '/',
    params = {},
    query = {},
    headers = {},
    body = null,
  } = options;

  let statusCode = 200;
  let responseBody: unknown = null;
  const responseHeaders: Record<string, string> = {};
  const store = new Map<string, unknown>();

  return {
    req: {
      method,
      path,
      url: path,
      header: (name: string) => headers[name.toLowerCase()],
    },
    params,
    query,
    readJson: async () => body,
    status: (code: number) => {
      statusCode = code;
      return ctx;
    },
    json: (data: unknown) => {
      responseBody = data;
      return { status: statusCode, body: responseBody, headers: responseHeaders };
    },
    header: (name: string, value: string) => {
      responseHeaders[name] = value;
      return ctx;
    },
    set: (key: string, value: unknown) => store.set(key, value),
    get: (key: string) => store.get(key),
  } as unknown as Context;

  // Reference for method chaining
  const ctx = arguments[0];
}`;

const middlewareTestCode = `// tests/middleware/auth.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createMockContext } from '../helpers/mock-context';
import { authMiddleware } from '../../src/middleware/auth';
import { verifyToken } from '../../src/lib/jwt';

vi.mock('../../src/lib/jwt');

describe('authMiddleware', () => {
  it('should set user on context when token is valid', async () => {
    const ctx = createMockContext({
      headers: {
        authorization: 'Bearer valid-token-123',
      },
    });

    vi.mocked(verifyToken).mockResolvedValue({
      userId: 'usr_123',
      email: 'alice@example.com',
      role: 'user',
    });

    await authMiddleware(ctx);

    expect(ctx.get('user')).toEqual({
      userId: 'usr_123',
      email: 'alice@example.com',
      role: 'user',
    });
  });

  it('should return 401 when no token is provided', async () => {
    const ctx = createMockContext({
      headers: {},
    });

    const response = await authMiddleware(ctx);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'UNAUTHORIZED',
      message: 'Missing authorization header',
    });
  });

  it('should return 401 when token is expired', async () => {
    const ctx = createMockContext({
      headers: {
        authorization: 'Bearer expired-token',
      },
    });

    vi.mocked(verifyToken).mockRejectedValue(new Error('Token expired'));

    const response = await authMiddleware(ctx);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
  });
});

describe('rateLimitMiddleware', () => {
  it('should allow requests within the limit', async () => {
    const ctx = createMockContext({
      headers: { 'x-forwarded-for': '192.168.1.1' },
    });

    const result = await rateLimitMiddleware(ctx);

    // No response means the middleware passed through
    expect(result).toBeUndefined();
  });

  it('should block requests exceeding the limit', async () => {
    const ctx = createMockContext({
      headers: { 'x-forwarded-for': '192.168.1.1' },
    });

    // Exhaust the rate limit
    for (let i = 0; i < 100; i++) {
      await rateLimitMiddleware(createMockContext({
        headers: { 'x-forwarded-for': '192.168.1.1' },
      }));
    }

    const response = await rateLimitMiddleware(ctx);

    expect(response.status).toBe(429);
    expect(response.body).toHaveProperty('retryAfter');
  });
});`;

const integrationTestCode = `// tests/integration/users.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

describe('Users API (integration)', () => {
  let app: ReturnType<typeof createApp>;
  let server: any;
  let authToken: string;

  beforeAll(async () => {
    app = createApp();
    server = await app.listen(0); // Random available port

    // Create a test user and get an auth token
    const res = await request(server)
      .post('/auth/register')
      .send({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
      });
    authToken = res.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users', () => {
    it('should return a paginated list of users', async () => {
      const res = await request(server)
        .get('/api/users?page=1&limit=10')
        .set('Authorization', \`Bearer \${authToken}\`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
      });
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(server)
        .get('/api/users')
        .expect(401);

      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'user',
      };

      const res = await request(server)
        .post('/api/users')
        .set('Authorization', \`Bearer \${authToken}\`)
        .send(userData)
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
    });

    it('should reject invalid email format', async () => {
      const res = await request(server)
        .post('/api/users')
        .set('Authorization', \`Bearer \${authToken}\`)
        .send({ name: 'Bad Email', email: 'not-an-email' })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('should reject duplicate email', async () => {
      await request(server)
        .post('/api/users')
        .set('Authorization', \`Bearer \${authToken}\`)
        .send({ name: 'Duplicate', email: 'dup@example.com', role: 'user' });

      const res = await request(server)
        .post('/api/users')
        .set('Authorization', \`Bearer \${authToken}\`)
        .send({ name: 'Duplicate', email: 'dup@example.com', role: 'user' })
        .expect(409);

      expect(res.body.error).toBe('CONFLICT');
    });
  });
});`;

const dbTestCode = `// tests/integration/db.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/db';
import { users, posts } from '@vexorjs/orm';
import { createTestUser, createTestPost } from '../factories';

describe('Database operations', () => {
  let testUser: { id: string; name: string; email: string };

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  it('should insert and retrieve a user', async () => {
    const found = await db
      .select()
      .from(users)
      .where(users.id.eq(testUser.id))
      .first();

    expect(found).toMatchObject({
      id: testUser.id,
      name: testUser.name,
      email: testUser.email,
    });
  });

  it('should handle relations correctly', async () => {
    const post = await createTestPost({ authorId: testUser.id });

    const result = await db
      .select()
      .from(posts)
      .where(posts.authorId.eq(testUser.id))
      .join(users, users.id.eq(posts.authorId))
      .first();

    expect(result.post.title).toBe(post.title);
    expect(result.user.name).toBe(testUser.name);
  });

  it('should rollback on transaction failure', async () => {
    try {
      await db.transaction(async (tx) => {
        await tx.insert(users).values({
          name: 'Transaction User',
          email: 'tx@example.com',
        });
        // Force a failure
        throw new Error('Rollback test');
      });
    } catch {
      // Expected error
    }

    const found = await db
      .select()
      .from(users)
      .where(users.email.eq('tx@example.com'))
      .first();

    expect(found).toBeNull();
  });
});`;

const factoryCode = `// tests/factories/index.ts
import { db } from '../../src/db';
import { users, posts } from '@vexorjs/orm';
import { randomUUID } from 'crypto';

let counter = 0;

export async function createTestUser(overrides: Partial<typeof users.$inferInsert> = {}) {
  const id = randomUUID();
  counter++;

  const data = {
    id,
    name: overrides.name ?? \`Test User \${counter}\`,
    email: overrides.email ?? \`user\${counter}@test.com\`,
    role: overrides.role ?? 'user',
    createdAt: new Date(),
    ...overrides,
  };

  const [user] = await db.insert(users).values(data).returning();
  return user;
}

export async function createTestPost(overrides: Partial<typeof posts.$inferInsert> = {}) {
  const id = randomUUID();
  counter++;

  const data = {
    id,
    title: overrides.title ?? \`Test Post \${counter}\`,
    content: overrides.content ?? 'Lorem ipsum dolor sit amet.',
    authorId: overrides.authorId ?? (await createTestUser()).id,
    published: overrides.published ?? false,
    createdAt: new Date(),
    ...overrides,
  };

  const [post] = await db.insert(posts).values(data).returning();
  return post;
}

// Seed a full set of test data
export async function seedTestData() {
  const alice = await createTestUser({ name: 'Alice', email: 'alice@test.com', role: 'admin' });
  const bob = await createTestUser({ name: 'Bob', email: 'bob@test.com' });

  const posts = await Promise.all([
    createTestPost({ authorId: alice.id, title: 'First Post', published: true }),
    createTestPost({ authorId: alice.id, title: 'Draft Post', published: false }),
    createTestPost({ authorId: bob.id, title: 'Bob\\'s Post', published: true }),
  ]);

  return { users: { alice, bob }, posts };
}`;

const coverageCode = `{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ci": "vitest run --coverage --reporter=junit --outputFile=test-results.xml",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run tests/routes tests/middleware",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "vitest run tests/e2e"
  }
}`;

const coverageConfigCode = `// vitest.config.ts - coverage thresholds
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/index.ts',
        'src/types/**',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
      // Fail CI if coverage drops below thresholds
      check: true,
    },
  },
});`;

export default function Testing() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="testing" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Testing
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          Testing is the practice of verifying that your application behaves correctly under known
          conditions, and it is one of the most important investments you can make in a Vexor project.
          A well-tested API gives you the confidence to refactor code, add features, and deploy to
          production without fear of breaking existing behavior. Without tests, every change becomes
          a gamble, and the cost of bugs compounds as your codebase grows.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Testing a web API framework like Vexor involves a specific set of concerns that differ from
          testing a frontend application or a CLI tool. You need to verify route handlers in isolation,
          ensure middleware functions correctly intercept and transform requests, confirm that validation
          schemas reject malformed input, and validate that the full request lifecycle, from HTTP
          connection to database query to serialized response, produces the expected output. Each of
          these concerns is best addressed by a different type of test, organized into what is commonly
          called the testing pyramid.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          At the base of the pyramid are unit tests: fast, isolated tests that verify individual
          functions and handlers by mocking their dependencies. In the middle are integration tests
          that start the full Vexor application and exercise multiple layers together, including
          routing, middleware, and database access. At the top are end-to-end tests that simulate
          real client behavior against a deployed instance. A healthy test suite has many unit tests,
          a moderate number of integration tests, and a small number of critical-path end-to-end tests.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          This guide covers the full testing lifecycle for Vexor applications, from configuring your
          test runner and writing your first unit test, through testing middleware in isolation,
          building integration tests with real HTTP requests, creating test data factories, and
          enforcing coverage thresholds in your CI pipeline.
        </p>
      </div>

      <section>
        <h2 id="setup" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Setup
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor recommends Vitest as the test runner for several reasons. Vitest provides native
          TypeScript support without requiring a separate compilation step, which means you write
          tests in TypeScript and they execute directly. It uses the same Vite transform pipeline
          for fast, parallelized test execution. Its API is Jest-compatible, so developers familiar
          with Jest can be productive immediately. And its built-in coverage provider uses V8's
          native code coverage instrumentation, which is faster and more accurate than Istanbul-based
          alternatives.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">supertest</code> library is used for integration tests.
          It wraps your HTTP server and provides a fluent API for sending requests and asserting
          responses, without requiring a running server on a specific port. This is important because
          it allows integration tests to run in parallel without port conflicts.
        </p>
        <CodeBlock code={setupCode} language="bash" />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          The Vitest configuration below sets up the test environment with several important options.
          The <code className="prose-code">globals: true</code> setting makes
          <code className="prose-code">describe</code>, <code className="prose-code">it</code>, and
          <code className="prose-code">expect</code> available globally without explicit imports. The
          <code className="prose-code">setupFiles</code> array points to a file that runs before all
          test suites, which is where you establish database connections and configure cleanup logic.
          Coverage thresholds act as a ratchet: once you reach 80% statement coverage, the CI build
          fails if any change drops below that threshold.
        </p>
        <CodeBlock code={vitestConfigCode} filename="vitest.config.ts" />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          The global setup file manages the test database lifecycle. It connects to a dedicated test
          database before any tests run, truncates all tables after each individual test to prevent
          state leakage between tests, and cleanly disconnects when all tests are complete. The
          <code className="prose-code">CASCADE</code> option in the TRUNCATE statement ensures that
          tables with foreign key relationships are cleaned correctly. This isolation guarantee is
          what makes it possible to run tests in any order and get consistent results.
        </p>
        <CodeBlock code={setupFileCode} filename="tests/setup.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Use a dedicated test database that gets truncated between tests. This keeps your
          tests isolated and prevents state from leaking across test suites.
        </InfoBlock>
      </section>

      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How Vexor Testing Works Internally
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Understanding how Vexor's architecture supports testability will help you write better
          tests. In Vexor, route handlers are plain async functions that accept a
          <code className="prose-code">Context</code> object and return a response. Unlike Express,
          where handlers are tightly coupled to the HTTP server through
          <code className="prose-code">req</code> and <code className="prose-code">res</code>
          objects with complex internal state, Vexor's Context is a simple interface with well-defined
          methods. This means you can construct a mock Context, pass it to a handler function, and
          inspect the return value, all without starting an HTTP server.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Middleware in Vexor follows the same pattern. A middleware function receives a Context and
          either returns nothing (allowing the next middleware or handler to execute) or returns a
          response (short-circuiting the chain). This binary behavior is much easier to test than
          Express's <code className="prose-code">next()</code> callback pattern, where you need to
          track whether <code className="prose-code">next</code> was called, whether it was called
          with an error, and what side effects occurred on the <code className="prose-code">res</code>
          object.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The Context's <code className="prose-code">set()</code> and
          <code className="prose-code">get()</code> methods provide a type-safe key-value store for
          passing data between middleware and handlers. In tests, you can pre-populate this store with
          the values that middleware would normally set (such as an authenticated user object), allowing
          you to test handlers independently of authentication middleware. This decoupling is one of
          the key architectural decisions that makes Vexor applications inherently testable.
        </p>
      </section>

      <section>
        <h2 id="unit-testing-routes" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Unit Testing Routes
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Unit testing a route handler means testing it as an isolated function, independent of the
          HTTP server, routing layer, and real database. You create a mock Context with the inputs
          your handler expects (parameters, query strings, request bodies), mock any service-layer
          dependencies (database calls, external API clients), call the handler directly, and assert
          on the returned response.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          This approach is fast because no network I/O occurs. A suite of 100 unit tests for route
          handlers typically completes in under a second. It is also precise: when a unit test fails,
          you know exactly which handler has a bug and what input triggered it. The trade-off is that
          unit tests do not verify that routing, middleware, and handlers work together correctly.
          That is the job of integration tests, covered in a later section.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The key decision in unit testing is what to mock. As a rule of thumb, mock I/O boundaries
          (database queries, HTTP calls to external services, filesystem access) but do not mock
          business logic or utility functions. If you find yourself mocking everything, your handler
          is likely doing too much and should be refactored to delegate to a service layer. If you
          mock nothing, you are writing an integration test, not a unit test.
        </p>
        <CodeBlock code={unitTestRouteCode} filename="tests/routes/users.test.ts" showLineNumbers />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          The mock Context helper is the foundation of unit testing in Vexor. It simulates the
          <code className="prose-code">Context</code> object that Vexor passes to handlers, providing
          stub implementations of <code className="prose-code">params</code>,
          <code className="prose-code">query</code>, <code className="prose-code">readJson()</code>,
          <code className="prose-code">status()</code>, <code className="prose-code">json()</code>,
          and the <code className="prose-code">set/get</code> store. The key design choice is that
          <code className="prose-code">json()</code> returns an object with the status code and body,
          which is what your test assertions inspect. This avoids the need to spy on method calls
          or track internal state.
        </p>
        <CodeBlock code={mockContextCode} filename="tests/helpers/mock-context.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="testing-middleware" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Testing Middleware
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Middleware functions are the cross-cutting concerns of your application: authentication,
          rate limiting, logging, CORS, request validation. Because middleware runs before your route
          handlers and can either pass through or short-circuit the entire request, testing it
          thoroughly is critical. A bug in authentication middleware affects every protected route. A
          bug in rate limiting can either lock out legitimate users or leave your API unprotected.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          In Vexor, middleware follows a simple contract: it receives a Context, and it either returns
          <code className="prose-code">undefined</code> (meaning "continue to the next handler") or
          returns a response object (meaning "stop processing and send this response"). This binary
          contract makes testing straightforward. For the pass-through case, assert that the return
          value is <code className="prose-code">undefined</code> and that the expected side effects
          occurred (such as setting a user on the Context store). For the short-circuit case, assert
          that the returned response has the correct status code and body.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When testing authentication middleware, you need to cover several paths: valid token, missing
          token, malformed token, expired token, and token with insufficient permissions. Each path
          represents a distinct security boundary. Use <code className="prose-code">vi.mock()</code>
          to replace the token verification library so you can control exactly what each test
          scenario returns without needing real JWT tokens or a signing key.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Rate limiting middleware is more complex to test because it has stateful behavior: the
          response depends on how many requests have been made previously. The test below demonstrates
          the pattern of exhausting the rate limit by making many requests in a loop, then verifying
          that the next request is rejected with a 429 status. In production, rate limiters use Redis
          for distributed state; in tests, an in-memory implementation is faster and avoids external
          dependencies.
        </p>
        <CodeBlock code={middlewareTestCode} filename="tests/middleware/auth.test.ts" showLineNumbers />
        <InfoBlock variant="info">
          When middleware passes through without returning, the next middleware or route handler
          runs. When it returns a response, the chain stops. Your tests should verify both
          behaviors.
        </InfoBlock>
      </section>

      <section>
        <h2 id="integration-tests" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Integration Tests
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Integration tests exercise the full Vexor request lifecycle: an HTTP request arrives, passes
          through the routing layer, executes any registered hooks and middleware, reaches the handler,
          interacts with the database, and returns a serialized response. These tests catch a category
          of bugs that unit tests cannot: misconfigured routes, middleware ordering issues, schema
          validation mismatches, and serialization errors.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">supertest</code> library makes integration testing
          ergonomic. You call <code className="prose-code">app.listen(0)</code> to start the server
          on a random available port (avoiding conflicts when tests run in parallel), then use
          supertest's fluent API to send requests and chain assertions. The
          <code className="prose-code">.expect(200)</code> syntax asserts on the status code, while
          the callback provides the full response for deeper assertions on headers and body.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Integration tests should follow a realistic user flow. The example below registers a user,
          obtains an authentication token, and then uses that token to access protected endpoints.
          This mirrors how a real client would interact with your API and catches issues like token
          generation bugs, authentication middleware misconfiguration, and incorrect response formats
          that unit tests with mocked dependencies would miss.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The trade-off with integration tests is speed. Because they start a real HTTP server and
          execute real database queries, they are 10-100x slower than unit tests. A typical integration
          test takes 50-200ms, compared to 1-5ms for a unit test. This is why the testing pyramid
          recommends fewer integration tests than unit tests: use them to verify that the pieces fit
          together correctly, and rely on unit tests for exhaustive coverage of edge cases and error
          paths.
        </p>
        <CodeBlock code={integrationTestCode} filename="tests/integration/users.test.ts" showLineNumbers />
        <InfoBlock variant="warning">
          Always call <code className="prose-code">app.close()</code> in
          <code className="prose-code">afterAll</code> to release the port and close database
          connections. Leaking connections can cause tests to hang or fail intermittently.
        </InfoBlock>
      </section>

      <section>
        <h2 id="database-testing" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Database Testing
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Database tests verify that your queries, schema relationships, and transaction logic work
          correctly against a real database engine. This matters because ORMs and query builders
          generate SQL, and that generated SQL can behave differently than you expect, especially
          with edge cases like NULL handling, type coercion, constraint violations, and transaction
          isolation levels. Mocking the database in unit tests is appropriate for testing business
          logic, but it cannot catch SQL-level bugs.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The tests below exercise three fundamental database operations: basic CRUD with the query
          builder, relational joins between tables, and transaction rollback behavior. The transaction
          test is particularly important because it verifies that when an error occurs mid-transaction,
          all changes are rolled back atomically. Without this test, you might discover in production
          that a partial write left your data in an inconsistent state.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A common question is whether to mock the database or use a real instance. The recommendation
          for Vexor projects is to use a real PostgreSQL instance for database tests (running locally
          via Docker or as a CI service container) and mock the database only in unit tests that focus
          on business logic. The overhead of a real database is modest (each query takes 1-5ms to a
          local instance), and the confidence it provides in your query layer is worth the cost. If
          your test suite becomes slow, optimize by running database tests in a separate parallel
          group rather than by replacing them with mocks.
        </p>
        <CodeBlock code={dbTestCode} filename="tests/integration/db.test.ts" showLineNumbers />
      </section>

      <section>
        <h2 id="test-utilities" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Test Factories and Data Generation
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Factory functions are a pattern for creating test data with sensible defaults while allowing
          individual tests to override specific fields. Without factories, every test that needs a
          user must specify all required fields (name, email, role, createdAt), which creates
          boilerplate that obscures the intent of the test. With factories, a test that is verifying
          email validation only needs to specify the email field; everything else gets reasonable
          defaults.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The factory pattern shown below uses a monotonically increasing counter to generate unique
          values for each call. This avoids the primary source of test flakiness in database tests:
          unique constraint violations caused by two tests creating entities with the same email or
          name. The counter ensures that <code className="prose-code">createTestUser()</code> produces
          <code className="prose-code">user1@test.com</code>,
          <code className="prose-code">user2@test.com</code>, and so on, even when tests run in
          arbitrary order.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">seedTestData()</code> function builds on individual
          factories to create a complete dataset for complex integration scenarios. When you need
          to test pagination, search, filtering, or permission-based access control, seeding a
          realistic dataset is more expressive and maintainable than constructing it inline in
          each test. The seed function returns references to all created entities, so tests can
          make assertions about specific records without additional queries.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A key design principle is that factories always insert into the database and return the
          persisted entity (with database-generated fields like IDs and timestamps). This means
          factory-created data is visible to the application when it queries the database during
          integration tests. If you need in-memory-only test objects for unit tests, create a
          separate set of builder functions that return plain objects without database interaction.
        </p>
        <CodeBlock code={factoryCode} filename="tests/factories/index.ts" showLineNumbers />
        <InfoBlock variant="tip">
          Factories make tests more readable by hiding boilerplate. Only specify the fields
          that matter for a given test case and let the factory provide sensible defaults
          for everything else.
        </InfoBlock>
      </section>

      <section>
        <h2 id="when-to-mock" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          When to Mock vs. Use Real Implementations
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Choosing when to mock is one of the most important decisions in test design. Mocking too
          much leads to tests that pass even when the real system is broken, because the mocks do
          not faithfully reproduce the behavior of the real dependency. Mocking too little leads to
          slow, flaky tests that fail due to network timeouts, database connection limits, or external
          service outages rather than actual bugs in your code.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The general principle is to mock at I/O boundaries and test everything else with real
          implementations. For Vexor applications, this translates to a clear set of guidelines.
          Mock external HTTP APIs (payment processors, email services, third-party data sources)
          because they are slow, unreliable, and may have side effects (like actually sending an
          email). Mock the database in unit tests where you are testing business logic, not query
          correctness. Use a real database in integration tests and database-specific tests.
          Never mock Vexor's own Context, routing, or hook system in integration tests, as that
          defeats the purpose.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A useful litmus test: if your mock needs to replicate complex behavior (like database
          transaction semantics or SQL query parsing), you are better off using the real dependency.
          The mock will inevitably diverge from the real behavior, and your tests will give you
          false confidence. Reserve mocking for dependencies with simple interfaces and
          well-understood behavior.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 pr-4 text-slate-900 dark:text-white font-semibold">Dependency</th>
                <th className="py-3 pr-4 text-slate-900 dark:text-white font-semibold">Unit Tests</th>
                <th className="py-3 text-slate-900 dark:text-white font-semibold">Integration Tests</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Database</td>
                <td className="py-3 pr-4">Mock the service layer. You are testing handler logic, not SQL correctness.</td>
                <td className="py-3">Use a real test database. This validates queries, constraints, and transactions.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">External APIs</td>
                <td className="py-3 pr-4">Always mock. External calls are slow, unreliable, and may have side effects.</td>
                <td className="py-3">Mock with realistic responses. Consider contract tests for critical integrations.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">JWT / crypto</td>
                <td className="py-3 pr-4">Mock the verification function to control token validity per test case.</td>
                <td className="py-3">Use real tokens generated during test setup for end-to-end auth flow testing.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Cache (Redis)</td>
                <td className="py-3 pr-4">Mock or use an in-memory implementation to avoid external dependency.</td>
                <td className="py-3">Use a real Redis instance if caching behavior is under test; otherwise mock.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Vexor Context</td>
                <td className="py-3 pr-4">Use the mock context helper to simulate the Context interface.</td>
                <td className="py-3">Never mock. Let Vexor construct the real Context from HTTP requests.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 id="coverage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Coverage Strategies
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Code coverage measures what percentage of your source code is executed during testing. It is
          a useful metric for identifying untested code paths, but it is not a measure of test quality.
          100% line coverage does not mean your application is bug-free; it means every line was
          executed at least once, which says nothing about whether the assertions are meaningful or
          whether edge cases are covered. Use coverage as a floor (minimum threshold) rather than a
          ceiling (target to maximize).
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The recommended thresholds for a Vexor application are 80% for statements and lines, 75%
          for branches, and 80% for functions. These numbers are deliberately not 100%, because
          achieving full coverage on error handling paths, platform-specific code, and generated types
          often requires contortions that reduce code readability without improving confidence. The
          branch threshold is lower because every <code className="prose-code">if</code> statement
          and <code className="prose-code">switch</code> case doubles the paths you need to test,
          and some branches (like defensive null checks on values that should never be null) are not
          worth testing explicitly.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Separate your test scripts by scope so you can run the appropriate suite for your current
          task. During development, run unit tests in watch mode for instant feedback. Before pushing,
          run the full suite including integration tests. In CI, run everything with coverage reporting
          and the JUnit reporter so your CI platform can display test results and trends over time.
          The <code className="prose-code">lcov</code> coverage format is understood by most coverage
          aggregation services like Codecov and Coveralls.
        </p>
        <CodeBlock code={coverageCode} language="json" filename="package.json" />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          The coverage configuration below enables threshold enforcement with
          <code className="prose-code">check: true</code>, which causes the test run to fail if
          coverage drops below the configured minimums. This acts as a ratchet in your CI pipeline:
          once you reach a coverage level, it cannot regress without explicitly adjusting the
          thresholds. The exclusion list removes files that should not count toward coverage:
          TypeScript declaration files, the application entry point (which is mostly configuration),
          and type definition modules.
        </p>
        <CodeBlock code={coverageConfigCode} filename="vitest.config.ts" />
        <InfoBlock variant="info">
          Enable <code className="prose-code">check: true</code> in your coverage configuration
          to fail the CI build when coverage drops below your thresholds. The
          <code className="prose-code">lcov</code> reporter produces output that most CI coverage
          tools (Codecov, Coveralls) can parse automatically.
        </InfoBlock>
      </section>

      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Beyond the specific techniques covered above, a set of overarching principles will keep your
          test suite maintainable and trustworthy as your Vexor application grows.
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
                <td className="py-3 pr-4 font-medium">Test behavior, not implementation</td>
                <td className="py-3">Assert on the response status and body, not on which internal methods were called. This allows refactoring without rewriting tests.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">One assertion per concept</td>
                <td className="py-3">Each test should verify one logical behavior. Multiple assertions are fine if they all relate to the same response (status, body, headers), but testing two different behaviors in one test makes failures ambiguous.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Descriptive test names</td>
                <td className="py-3">Use names that describe the scenario and expected outcome: "should return 404 when user is not found" tells you exactly what broke when the test fails.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Isolate test state</td>
                <td className="py-3">Truncate the database between tests and avoid shared mutable state. Tests that depend on execution order are the primary cause of flaky test suites.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 pr-4 font-medium">Keep tests fast</td>
                <td className="py-3">If your test suite takes more than 60 seconds, developers will stop running it locally. Profile slow tests and move expensive operations to fewer integration tests.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Test error paths</td>
                <td className="py-3">Happy-path tests are necessary but insufficient. Every API endpoint should have tests for invalid input, missing authentication, insufficient permissions, and resource-not-found scenarios.</td>
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
          <Link to="/advanced/migration" className="btn-primary">
            Migration from Express <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/advanced/deployment" className="btn-secondary">
            Deployment Guide
          </Link>
        </div>
      </section>
    </div>
  );
}
