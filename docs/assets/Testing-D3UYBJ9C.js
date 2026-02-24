import{j as e,C as t,I as s,L as a,A as r}from"./index-BWrueqsD.js";const o=`# Install testing dependencies
npm install -D vitest @vitest/coverage-v8 supertest @types/supertest`,i=`// vitest.config.ts
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
});`,n=`// tests/setup.ts
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
});`,c=`// tests/routes/users.test.ts
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
});`,l=`// tests/helpers/mock-context.ts
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
}`,d=`// tests/middleware/auth.test.ts
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
});`,h=`// tests/integration/users.test.ts
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
});`,u=`// tests/integration/db.test.ts
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
});`,m=`// tests/factories/index.ts
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
}`,p=`{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ci": "vitest run --coverage --reporter=junit --outputFile=test-results.xml",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run tests/routes tests/middleware",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "vitest run tests/e2e"
  }
}`,x=`// vitest.config.ts - coverage thresholds
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
});`;function b(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"testing",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"Testing"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:"Testing is the practice of verifying that your application behaves correctly under known conditions, and it is one of the most important investments you can make in a Vexor project. A well-tested API gives you the confidence to refactor code, add features, and deploy to production without fear of breaking existing behavior. Without tests, every change becomes a gamble, and the cost of bugs compounds as your codebase grows."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Testing a web API framework like Vexor involves a specific set of concerns that differ from testing a frontend application or a CLI tool. You need to verify route handlers in isolation, ensure middleware functions correctly intercept and transform requests, confirm that validation schemas reject malformed input, and validate that the full request lifecycle, from HTTP connection to database query to serialized response, produces the expected output. Each of these concerns is best addressed by a different type of test, organized into what is commonly called the testing pyramid."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"At the base of the pyramid are unit tests: fast, isolated tests that verify individual functions and handlers by mocking their dependencies. In the middle are integration tests that start the full Vexor application and exercise multiple layers together, including routing, middleware, and database access. At the top are end-to-end tests that simulate real client behavior against a deployed instance. A healthy test suite has many unit tests, a moderate number of integration tests, and a small number of critical-path end-to-end tests."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"This guide covers the full testing lifecycle for Vexor applications, from configuring your test runner and writing your first unit test, through testing middleware in isolation, building integration tests with real HTTP requests, creating test data factories, and enforcing coverage thresholds in your CI pipeline."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"setup",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Setup"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Vexor recommends Vitest as the test runner for several reasons. Vitest provides native TypeScript support without requiring a separate compilation step, which means you write tests in TypeScript and they execute directly. It uses the same Vite transform pipeline for fast, parallelized test execution. Its API is Jest-compatible, so developers familiar with Jest can be productive immediately. And its built-in coverage provider uses V8's native code coverage instrumentation, which is faster and more accurate than Istanbul-based alternatives."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"supertest"})," library is used for integration tests. It wraps your HTTP server and provides a fluent API for sending requests and asserting responses, without requiring a running server on a specific port. This is important because it allows integration tests to run in parallel without port conflicts."]}),e.jsx(t,{code:o,language:"bash"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mt-4 mb-4",children:["The Vitest configuration below sets up the test environment with several important options. The ",e.jsx("code",{className:"prose-code",children:"globals: true"})," setting makes",e.jsx("code",{className:"prose-code",children:"describe"}),", ",e.jsx("code",{className:"prose-code",children:"it"}),", and",e.jsx("code",{className:"prose-code",children:"expect"})," available globally without explicit imports. The",e.jsx("code",{className:"prose-code",children:"setupFiles"})," array points to a file that runs before all test suites, which is where you establish database connections and configure cleanup logic. Coverage thresholds act as a ratchet: once you reach 80% statement coverage, the CI build fails if any change drops below that threshold."]}),e.jsx(t,{code:i,filename:"vitest.config.ts"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mt-4 mb-4",children:["The global setup file manages the test database lifecycle. It connects to a dedicated test database before any tests run, truncates all tables after each individual test to prevent state leakage between tests, and cleanly disconnects when all tests are complete. The",e.jsx("code",{className:"prose-code",children:"CASCADE"})," option in the TRUNCATE statement ensures that tables with foreign key relationships are cleaned correctly. This isolation guarantee is what makes it possible to run tests in any order and get consistent results."]}),e.jsx(t,{code:n,filename:"tests/setup.ts",showLineNumbers:!0}),e.jsx(s,{variant:"tip",children:"Use a dedicated test database that gets truncated between tests. This keeps your tests isolated and prevents state from leaking across test suites."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"how-it-works",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"How Vexor Testing Works Internally"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Understanding how Vexor's architecture supports testability will help you write better tests. In Vexor, route handlers are plain async functions that accept a",e.jsx("code",{className:"prose-code",children:"Context"})," object and return a response. Unlike Express, where handlers are tightly coupled to the HTTP server through",e.jsx("code",{className:"prose-code",children:"req"})," and ",e.jsx("code",{className:"prose-code",children:"res"}),"objects with complex internal state, Vexor's Context is a simple interface with well-defined methods. This means you can construct a mock Context, pass it to a handler function, and inspect the return value, all without starting an HTTP server."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Middleware in Vexor follows the same pattern. A middleware function receives a Context and either returns nothing (allowing the next middleware or handler to execute) or returns a response (short-circuiting the chain). This binary behavior is much easier to test than Express's ",e.jsx("code",{className:"prose-code",children:"next()"})," callback pattern, where you need to track whether ",e.jsx("code",{className:"prose-code",children:"next"})," was called, whether it was called with an error, and what side effects occurred on the ",e.jsx("code",{className:"prose-code",children:"res"}),"object."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The Context's ",e.jsx("code",{className:"prose-code",children:"set()"})," and",e.jsx("code",{className:"prose-code",children:"get()"})," methods provide a type-safe key-value store for passing data between middleware and handlers. In tests, you can pre-populate this store with the values that middleware would normally set (such as an authenticated user object), allowing you to test handlers independently of authentication middleware. This decoupling is one of the key architectural decisions that makes Vexor applications inherently testable."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"unit-testing-routes",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Unit Testing Routes"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Unit testing a route handler means testing it as an isolated function, independent of the HTTP server, routing layer, and real database. You create a mock Context with the inputs your handler expects (parameters, query strings, request bodies), mock any service-layer dependencies (database calls, external API clients), call the handler directly, and assert on the returned response."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"This approach is fast because no network I/O occurs. A suite of 100 unit tests for route handlers typically completes in under a second. It is also precise: when a unit test fails, you know exactly which handler has a bug and what input triggered it. The trade-off is that unit tests do not verify that routing, middleware, and handlers work together correctly. That is the job of integration tests, covered in a later section."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The key decision in unit testing is what to mock. As a rule of thumb, mock I/O boundaries (database queries, HTTP calls to external services, filesystem access) but do not mock business logic or utility functions. If you find yourself mocking everything, your handler is likely doing too much and should be refactored to delegate to a service layer. If you mock nothing, you are writing an integration test, not a unit test."}),e.jsx(t,{code:c,filename:"tests/routes/users.test.ts",showLineNumbers:!0}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mt-4 mb-4",children:["The mock Context helper is the foundation of unit testing in Vexor. It simulates the",e.jsx("code",{className:"prose-code",children:"Context"})," object that Vexor passes to handlers, providing stub implementations of ",e.jsx("code",{className:"prose-code",children:"params"}),",",e.jsx("code",{className:"prose-code",children:"query"}),", ",e.jsx("code",{className:"prose-code",children:"readJson()"}),",",e.jsx("code",{className:"prose-code",children:"status()"}),", ",e.jsx("code",{className:"prose-code",children:"json()"}),", and the ",e.jsx("code",{className:"prose-code",children:"set/get"})," store. The key design choice is that",e.jsx("code",{className:"prose-code",children:"json()"})," returns an object with the status code and body, which is what your test assertions inspect. This avoids the need to spy on method calls or track internal state."]}),e.jsx(t,{code:l,filename:"tests/helpers/mock-context.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"testing-middleware",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Testing Middleware"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Middleware functions are the cross-cutting concerns of your application: authentication, rate limiting, logging, CORS, request validation. Because middleware runs before your route handlers and can either pass through or short-circuit the entire request, testing it thoroughly is critical. A bug in authentication middleware affects every protected route. A bug in rate limiting can either lock out legitimate users or leave your API unprotected."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["In Vexor, middleware follows a simple contract: it receives a Context, and it either returns",e.jsx("code",{className:"prose-code",children:"undefined"}),' (meaning "continue to the next handler") or returns a response object (meaning "stop processing and send this response"). This binary contract makes testing straightforward. For the pass-through case, assert that the return value is ',e.jsx("code",{className:"prose-code",children:"undefined"})," and that the expected side effects occurred (such as setting a user on the Context store). For the short-circuit case, assert that the returned response has the correct status code and body."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When testing authentication middleware, you need to cover several paths: valid token, missing token, malformed token, expired token, and token with insufficient permissions. Each path represents a distinct security boundary. Use ",e.jsx("code",{className:"prose-code",children:"vi.mock()"}),"to replace the token verification library so you can control exactly what each test scenario returns without needing real JWT tokens or a signing key."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Rate limiting middleware is more complex to test because it has stateful behavior: the response depends on how many requests have been made previously. The test below demonstrates the pattern of exhausting the rate limit by making many requests in a loop, then verifying that the next request is rejected with a 429 status. In production, rate limiters use Redis for distributed state; in tests, an in-memory implementation is faster and avoids external dependencies."}),e.jsx(t,{code:d,filename:"tests/middleware/auth.test.ts",showLineNumbers:!0}),e.jsx(s,{variant:"info",children:"When middleware passes through without returning, the next middleware or route handler runs. When it returns a response, the chain stops. Your tests should verify both behaviors."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"integration-tests",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Integration Tests"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Integration tests exercise the full Vexor request lifecycle: an HTTP request arrives, passes through the routing layer, executes any registered hooks and middleware, reaches the handler, interacts with the database, and returns a serialized response. These tests catch a category of bugs that unit tests cannot: misconfigured routes, middleware ordering issues, schema validation mismatches, and serialization errors."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"supertest"})," library makes integration testing ergonomic. You call ",e.jsx("code",{className:"prose-code",children:"app.listen(0)"})," to start the server on a random available port (avoiding conflicts when tests run in parallel), then use supertest's fluent API to send requests and chain assertions. The",e.jsx("code",{className:"prose-code",children:".expect(200)"})," syntax asserts on the status code, while the callback provides the full response for deeper assertions on headers and body."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Integration tests should follow a realistic user flow. The example below registers a user, obtains an authentication token, and then uses that token to access protected endpoints. This mirrors how a real client would interact with your API and catches issues like token generation bugs, authentication middleware misconfiguration, and incorrect response formats that unit tests with mocked dependencies would miss."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The trade-off with integration tests is speed. Because they start a real HTTP server and execute real database queries, they are 10-100x slower than unit tests. A typical integration test takes 50-200ms, compared to 1-5ms for a unit test. This is why the testing pyramid recommends fewer integration tests than unit tests: use them to verify that the pieces fit together correctly, and rely on unit tests for exhaustive coverage of edge cases and error paths."}),e.jsx(t,{code:h,filename:"tests/integration/users.test.ts",showLineNumbers:!0}),e.jsxs(s,{variant:"warning",children:["Always call ",e.jsx("code",{className:"prose-code",children:"app.close()"})," in",e.jsx("code",{className:"prose-code",children:"afterAll"})," to release the port and close database connections. Leaking connections can cause tests to hang or fail intermittently."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"database-testing",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Database Testing"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Database tests verify that your queries, schema relationships, and transaction logic work correctly against a real database engine. This matters because ORMs and query builders generate SQL, and that generated SQL can behave differently than you expect, especially with edge cases like NULL handling, type coercion, constraint violations, and transaction isolation levels. Mocking the database in unit tests is appropriate for testing business logic, but it cannot catch SQL-level bugs."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The tests below exercise three fundamental database operations: basic CRUD with the query builder, relational joins between tables, and transaction rollback behavior. The transaction test is particularly important because it verifies that when an error occurs mid-transaction, all changes are rolled back atomically. Without this test, you might discover in production that a partial write left your data in an inconsistent state."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"A common question is whether to mock the database or use a real instance. The recommendation for Vexor projects is to use a real PostgreSQL instance for database tests (running locally via Docker or as a CI service container) and mock the database only in unit tests that focus on business logic. The overhead of a real database is modest (each query takes 1-5ms to a local instance), and the confidence it provides in your query layer is worth the cost. If your test suite becomes slow, optimize by running database tests in a separate parallel group rather than by replacing them with mocks."}),e.jsx(t,{code:u,filename:"tests/integration/db.test.ts",showLineNumbers:!0})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"test-utilities",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Test Factories and Data Generation"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Factory functions are a pattern for creating test data with sensible defaults while allowing individual tests to override specific fields. Without factories, every test that needs a user must specify all required fields (name, email, role, createdAt), which creates boilerplate that obscures the intent of the test. With factories, a test that is verifying email validation only needs to specify the email field; everything else gets reasonable defaults."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The factory pattern shown below uses a monotonically increasing counter to generate unique values for each call. This avoids the primary source of test flakiness in database tests: unique constraint violations caused by two tests creating entities with the same email or name. The counter ensures that ",e.jsx("code",{className:"prose-code",children:"createTestUser()"})," produces",e.jsx("code",{className:"prose-code",children:"user1@test.com"}),",",e.jsx("code",{className:"prose-code",children:"user2@test.com"}),", and so on, even when tests run in arbitrary order."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"seedTestData()"})," function builds on individual factories to create a complete dataset for complex integration scenarios. When you need to test pagination, search, filtering, or permission-based access control, seeding a realistic dataset is more expressive and maintainable than constructing it inline in each test. The seed function returns references to all created entities, so tests can make assertions about specific records without additional queries."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"A key design principle is that factories always insert into the database and return the persisted entity (with database-generated fields like IDs and timestamps). This means factory-created data is visible to the application when it queries the database during integration tests. If you need in-memory-only test objects for unit tests, create a separate set of builder functions that return plain objects without database interaction."}),e.jsx(t,{code:m,filename:"tests/factories/index.ts",showLineNumbers:!0}),e.jsx(s,{variant:"tip",children:"Factories make tests more readable by hiding boilerplate. Only specify the fields that matter for a given test case and let the factory provide sensible defaults for everything else."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"when-to-mock",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"When to Mock vs. Use Real Implementations"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Choosing when to mock is one of the most important decisions in test design. Mocking too much leads to tests that pass even when the real system is broken, because the mocks do not faithfully reproduce the behavior of the real dependency. Mocking too little leads to slow, flaky tests that fail due to network timeouts, database connection limits, or external service outages rather than actual bugs in your code."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The general principle is to mock at I/O boundaries and test everything else with real implementations. For Vexor applications, this translates to a clear set of guidelines. Mock external HTTP APIs (payment processors, email services, third-party data sources) because they are slow, unreliable, and may have side effects (like actually sending an email). Mock the database in unit tests where you are testing business logic, not query correctness. Use a real database in integration tests and database-specific tests. Never mock Vexor's own Context, routing, or hook system in integration tests, as that defeats the purpose."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"A useful litmus test: if your mock needs to replicate complex behavior (like database transaction semantics or SQL query parsing), you are better off using the real dependency. The mock will inevitably diverge from the real behavior, and your tests will give you false confidence. Reserve mocking for dependencies with simple interfaces and well-understood behavior."}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-left border-collapse",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"py-3 pr-4 text-slate-900 dark:text-white font-semibold",children:"Dependency"}),e.jsx("th",{className:"py-3 pr-4 text-slate-900 dark:text-white font-semibold",children:"Unit Tests"}),e.jsx("th",{className:"py-3 text-slate-900 dark:text-white font-semibold",children:"Integration Tests"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Database"}),e.jsx("td",{className:"py-3 pr-4",children:"Mock the service layer. You are testing handler logic, not SQL correctness."}),e.jsx("td",{className:"py-3",children:"Use a real test database. This validates queries, constraints, and transactions."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"External APIs"}),e.jsx("td",{className:"py-3 pr-4",children:"Always mock. External calls are slow, unreliable, and may have side effects."}),e.jsx("td",{className:"py-3",children:"Mock with realistic responses. Consider contract tests for critical integrations."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"JWT / crypto"}),e.jsx("td",{className:"py-3 pr-4",children:"Mock the verification function to control token validity per test case."}),e.jsx("td",{className:"py-3",children:"Use real tokens generated during test setup for end-to-end auth flow testing."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Cache (Redis)"}),e.jsx("td",{className:"py-3 pr-4",children:"Mock or use an in-memory implementation to avoid external dependency."}),e.jsx("td",{className:"py-3",children:"Use a real Redis instance if caching behavior is under test; otherwise mock."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Vexor Context"}),e.jsx("td",{className:"py-3 pr-4",children:"Use the mock context helper to simulate the Context interface."}),e.jsx("td",{className:"py-3",children:"Never mock. Let Vexor construct the real Context from HTTP requests."})]})]})]})})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"coverage",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Coverage Strategies"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Code coverage measures what percentage of your source code is executed during testing. It is a useful metric for identifying untested code paths, but it is not a measure of test quality. 100% line coverage does not mean your application is bug-free; it means every line was executed at least once, which says nothing about whether the assertions are meaningful or whether edge cases are covered. Use coverage as a floor (minimum threshold) rather than a ceiling (target to maximize)."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The recommended thresholds for a Vexor application are 80% for statements and lines, 75% for branches, and 80% for functions. These numbers are deliberately not 100%, because achieving full coverage on error handling paths, platform-specific code, and generated types often requires contortions that reduce code readability without improving confidence. The branch threshold is lower because every ",e.jsx("code",{className:"prose-code",children:"if"})," statement and ",e.jsx("code",{className:"prose-code",children:"switch"})," case doubles the paths you need to test, and some branches (like defensive null checks on values that should never be null) are not worth testing explicitly."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Separate your test scripts by scope so you can run the appropriate suite for your current task. During development, run unit tests in watch mode for instant feedback. Before pushing, run the full suite including integration tests. In CI, run everything with coverage reporting and the JUnit reporter so your CI platform can display test results and trends over time. The ",e.jsx("code",{className:"prose-code",children:"lcov"})," coverage format is understood by most coverage aggregation services like Codecov and Coveralls."]}),e.jsx(t,{code:p,language:"json",filename:"package.json"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mt-4 mb-4",children:["The coverage configuration below enables threshold enforcement with",e.jsx("code",{className:"prose-code",children:"check: true"}),", which causes the test run to fail if coverage drops below the configured minimums. This acts as a ratchet in your CI pipeline: once you reach a coverage level, it cannot regress without explicitly adjusting the thresholds. The exclusion list removes files that should not count toward coverage: TypeScript declaration files, the application entry point (which is mostly configuration), and type definition modules."]}),e.jsx(t,{code:x,filename:"vitest.config.ts"}),e.jsxs(s,{variant:"info",children:["Enable ",e.jsx("code",{className:"prose-code",children:"check: true"})," in your coverage configuration to fail the CI build when coverage drops below your thresholds. The",e.jsx("code",{className:"prose-code",children:"lcov"})," reporter produces output that most CI coverage tools (Codecov, Coveralls) can parse automatically."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"best-practices",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Best Practices"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Beyond the specific techniques covered above, a set of overarching principles will keep your test suite maintainable and trustworthy as your Vexor application grows."}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-left border-collapse",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"py-3 pr-4 text-slate-900 dark:text-white font-semibold",children:"Practice"}),e.jsx("th",{className:"py-3 text-slate-900 dark:text-white font-semibold",children:"Description"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Test behavior, not implementation"}),e.jsx("td",{className:"py-3",children:"Assert on the response status and body, not on which internal methods were called. This allows refactoring without rewriting tests."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"One assertion per concept"}),e.jsx("td",{className:"py-3",children:"Each test should verify one logical behavior. Multiple assertions are fine if they all relate to the same response (status, body, headers), but testing two different behaviors in one test makes failures ambiguous."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Descriptive test names"}),e.jsx("td",{className:"py-3",children:'Use names that describe the scenario and expected outcome: "should return 404 when user is not found" tells you exactly what broke when the test fails.'})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Isolate test state"}),e.jsx("td",{className:"py-3",children:"Truncate the database between tests and avoid shared mutable state. Tests that depend on execution order are the primary cause of flaky test suites."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Keep tests fast"}),e.jsx("td",{className:"py-3",children:"If your test suite takes more than 60 seconds, developers will stop running it locally. Profile slow tests and move expensive operations to fewer integration tests."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:"Test error paths"}),e.jsx("td",{className:"py-3",children:"Happy-path tests are necessary but insufficient. Every API endpoint should have tests for invalid input, missing authentication, insufficient permissions, and resource-not-found scenarios."})]})]})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(a,{to:"/advanced/migration",className:"btn-primary",children:["Migration from Express ",e.jsx(r,{className:"w-4 h-4 ml-2"})]}),e.jsx(a,{to:"/advanced/deployment",className:"btn-secondary",children:"Deployment Guide"})]})]})]})}export{b as default};
