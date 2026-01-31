import { CodeBlock } from '../components/CodeBlock';
import { TestTube, CheckCircle2, PlayCircle, FileCode } from 'lucide-react';

const runTestsCode = `# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- tests/auth.test.ts`;

const testSetupCode = `// tests/setup.ts
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { Vexor } from '@vexorjs/core';
import { initializeDatabase, closeDatabase } from '../src/db/index.js';

export let app: Vexor;
export let baseUrl: string;

// Setup before all tests
beforeAll(async () => {
  await initializeDatabase();
  app = createTestApp();
  await app.listen(0);  // Random available port
  baseUrl = \`http://localhost:\${app.address()?.port}\`;
});

// Reset data before each test
beforeEach(async () => {
  await seedTestData();
});

// Cleanup after all tests
afterAll(async () => {
  await app.close();
  await closeDatabase();
});`;

const exampleTestCode = `// tests/auth.test.ts
import { describe, it, expect } from 'vitest';
import { baseUrl, getAdminToken } from './setup.js';

describe('POST /auth/login', () => {
  it('should login with valid credentials', async () => {
    const response = await fetch(\`\${baseUrl}/auth/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'Admin123!',
      }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.tokens.accessToken).toBeDefined();
    expect(data.tokens.refreshToken).toBeDefined();
    expect(data.user.email).toBe('admin@test.com');
    expect(data.user.role).toBe('admin');
  });

  it('should reject invalid credentials', async () => {
    const response = await fetch(\`\${baseUrl}/auth/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'wrongpassword',
      }),
    });

    expect(response.status).toBe(401);
  });
});`;

const protectedRouteTestCode = `// Testing protected routes
describe('GET /users', () => {
  it('should list users for admin', async () => {
    const token = await getAdminToken();

    const response = await fetch(\`\${baseUrl}/users\`, {
      headers: { Authorization: \`Bearer \${token}\` },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toBeInstanceOf(Array);
    expect(data.pagination).toBeDefined();
  });

  it('should reject non-admin users', async () => {
    const token = await getUserToken();

    const response = await fetch(\`\${baseUrl}/users\`, {
      headers: { Authorization: \`Bearer \${token}\` },
    });

    expect(response.status).toBe(403);
  });
});`;

const testSuites = [
  { name: 'auth.test.ts', tests: 18, description: 'Authentication endpoints' },
  { name: 'users.test.ts', tests: 14, description: 'User management endpoints' },
  { name: 'products.test.ts', tests: 14, description: 'Product management endpoints' },
];

export function Testing() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Testing
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        Comprehensive test suite using Vitest with 46 tests covering all API endpoints.
      </p>

      {/* Test Coverage Overview */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Test Coverage
        </h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {testSuites.map((suite) => (
            <div
              key={suite.name}
              className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileCode className="text-primary-500" size={20} />
                <code className="font-semibold text-sm text-slate-900 dark:text-white">
                  {suite.name}
                </code>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="text-emerald-500" size={16} />
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {suite.tests} tests
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {suite.description}
              </p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <TestTube className="text-emerald-500" size={24} />
            <div>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">46</span>
              <span className="text-emerald-700 dark:text-emerald-300 ml-2">total tests passing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Running Tests */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Running Tests
        </h2>
        <CodeBlock code={runTestsCode} language="bash" />
      </section>

      {/* Test Setup */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Test Setup
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The test setup creates an isolated test environment with an in-memory SQLite database:
        </p>
        <CodeBlock code={testSetupCode} language="typescript" filename="tests/setup.ts" />

        <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Key Features</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• <strong>In-memory database</strong> for fast, isolated tests</li>
            <li>• <strong>Random port</strong> allocation to avoid conflicts</li>
            <li>• <strong>Data reset</strong> before each test for consistency</li>
            <li>• <strong>Proper cleanup</strong> after all tests complete</li>
          </ul>
        </div>
      </section>

      {/* Example Test */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Example: Authentication Test
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Testing the login endpoint with valid and invalid credentials:
        </p>
        <CodeBlock code={exampleTestCode} language="typescript" filename="tests/auth.test.ts" />
      </section>

      {/* Protected Route Test */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Testing Protected Routes
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use helper functions to get authentication tokens for protected endpoints:
        </p>
        <CodeBlock code={protectedRouteTestCode} language="typescript" />
      </section>

      {/* What's Tested */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          What's Tested
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-white">Authentication</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                User registration with validation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                Login with valid/invalid credentials
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                Token refresh flow
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                Logout and session invalidation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                Password change
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-white">Authorization</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                Role-based access control
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                Admin-only endpoints
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                Self-only profile access
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                Protected route rejection
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-white">CRUD Operations</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                Create with validation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                Read with pagination
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                Update with partial data
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                Soft delete behavior
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-white">Edge Cases</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                404 for non-existent resources
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                Validation error responses
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                Duplicate email prevention
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={14} />
                Negative stock prevention
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-4">
          <PlayCircle className="text-primary-500 flex-shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Testing Tips
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>• Use <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded">npm run test:watch</code> during development for instant feedback</li>
              <li>• Tests run sequentially to avoid database conflicts</li>
              <li>• Each test file gets a fresh database state</li>
              <li>• Helper functions like <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded">getAdminToken()</code> simplify auth testing</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
