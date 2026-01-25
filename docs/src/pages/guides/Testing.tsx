import CodeBlock from '../../components/CodeBlock';

const setupCode = `# Install testing dependencies
npm install -D vitest supertest @types/supertest

# vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});`;

const unitTestCode = `// tests/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, validateEmail } from '../src/utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15T12:00:00Z');
    expect(formatDate(date)).toBe('2024-01-15');
  });

  it('should handle invalid dates', () => {
    expect(() => formatDate(new Date('invalid'))).toThrow();
  });
});

describe('validateEmail', () => {
  it('should accept valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user@domain.co.uk')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
  });
});`;

const integrationTestCode = `// tests/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Users API', () => {
  let app: ReturnType<typeof createApp>;
  let server: any;

  beforeAll(async () => {
    app = createApp();
    server = await app.listen(0); // Random port
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users', () => {
    it('should return list of users', async () => {
      const res = await request(server)
        .get('/users')
        .expect(200);

      expect(res.body).toHaveProperty('users');
      expect(Array.isArray(res.body.users)).toBe(true);
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const res = await request(server)
        .post('/users')
        .send(userData)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(userData.name);
      expect(res.body.email).toBe(userData.email);
    });

    it('should validate required fields', async () => {
      const res = await request(server)
        .post('/users')
        .send({ name: 'Test' }) // Missing email
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      await request(server)
        .get('/users/non-existent-id')
        .expect(404);
    });
  });
});`;

const mockingCode = `// tests/services.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../src/services/user';

// Mock the database
vi.mock('../src/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

import { db } from '../src/db';

describe('UserService', () => {
  const userService = new UserService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should find user by id', async () => {
    const mockUser = { id: '1', name: 'Test', email: 'test@example.com' };

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(mockUser),
        }),
      }),
    } as any);

    const user = await userService.findById('1');

    expect(user).toEqual(mockUser);
    expect(db.select).toHaveBeenCalled();
  });

  it('should return null for non-existent user', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      }),
    } as any);

    const user = await userService.findById('non-existent');

    expect(user).toBeNull();
  });
});`;

const e2eTestCode = `// tests/e2e/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { db, users } from '../../src/db';

describe('Authentication E2E', () => {
  let app: any;
  let server: any;

  beforeAll(async () => {
    // Use test database
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

    app = createApp();
    server = await app.listen(0);

    // Seed test data
    await db.insert(users).values({
      name: 'Test User',
      email: 'test@example.com',
      password: await hashPassword('password123'),
    });
  });

  afterAll(async () => {
    // Clean up
    await db.delete(users);
    await app.close();
  });

  it('should complete full auth flow', async () => {
    // 1. Login
    const loginRes = await request(server)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(200);

    expect(loginRes.body).toHaveProperty('token');
    const { token } = loginRes.body;

    // 2. Access protected route
    const profileRes = await request(server)
      .get('/profile')
      .set('Authorization', \`Bearer \${token}\`)
      .expect(200);

    expect(profileRes.body.user.email).toBe('test@example.com');

    // 3. Logout
    await request(server)
      .post('/auth/logout')
      .set('Authorization', \`Bearer \${token}\`)
      .expect(200);
  });
});`;

export default function Testing() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="testing" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Testing Guide
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Learn how to write comprehensive tests for your Vexor application.
        </p>
      </div>

      <section>
        <h2 id="setup" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Setup
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Install testing dependencies and configure Vitest.
        </p>
        <CodeBlock code={setupCode} language="bash" />
      </section>

      <section>
        <h2 id="unit-tests" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Unit Tests
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Test individual functions and utilities in isolation.
        </p>
        <CodeBlock code={unitTestCode} showLineNumbers />
      </section>

      <section>
        <h2 id="integration-tests" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Integration Tests
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Test API endpoints with real HTTP requests.
        </p>
        <CodeBlock code={integrationTestCode} showLineNumbers />
      </section>

      <section>
        <h2 id="mocking" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Mocking
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Mock dependencies like databases and external services.
        </p>
        <CodeBlock code={mockingCode} showLineNumbers />
      </section>

      <section>
        <h2 id="e2e" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          End-to-End Tests
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Test complete user flows with real database.
        </p>
        <CodeBlock code={e2eTestCode} showLineNumbers />
      </section>
    </div>
  );
}
